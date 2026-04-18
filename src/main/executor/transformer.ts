import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export interface TransformOptions {
  loopProtection: boolean;
  loopThreshold: number;
  expressionResults: boolean;
}

const RESULTS_VAR = '__RESULTS__';
const LOOP_PREFIX = '__LOOP_';

export function transformCode(code: string, options: TransformOptions): string {
  const ast = parse(code, {
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    plugins: ['typescript', 'jsx'],
  });

  let loopCounter = 0;

  traverse(ast, {
    Program(path) {
      // Inject results array declaration at the top
      const resultsDecl = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier(RESULTS_VAR),
          t.arrayExpression([])
        ),
      ]);
      path.unshiftContainer('body', resultsDecl);
    },

    // Wrap top-level expression statements to capture results
    ExpressionStatement(path) {
      if (!options.expressionResults) return;
      if (!path.parentPath?.isProgram()) return;
      // Skip the results array declaration itself
      if (
        t.isVariableDeclaration(path.node) ||
        (t.isExpressionStatement(path.node) &&
          t.isIdentifier((path.node as t.ExpressionStatement).expression) &&
          ((path.node as t.ExpressionStatement).expression as t.Identifier).name === RESULTS_VAR)
      ) {
        return;
      }

      const line = path.node.loc?.start.line ?? 0;
      const expr = path.node.expression;

      // Replace with: __RESULTS__.push({ line, value: <expr>, type: typeof <expr> })
      const captureExpr = t.callExpression(
        t.memberExpression(t.identifier(RESULTS_VAR), t.identifier('push')),
        [
          t.objectExpression([
            t.objectProperty(t.identifier('line'), t.numericLiteral(line)),
            t.objectProperty(t.identifier('value'), expr),
            t.objectProperty(
              t.identifier('type'),
              t.unaryExpression('typeof', t.cloneNode(expr))
            ),
          ]),
        ]
      );

      path.replaceWith(t.expressionStatement(captureExpr));
      path.skip();
    },

    // Wrap top-level variable declarations to capture their values
    VariableDeclaration(path) {
      if (!options.expressionResults) return;
      if (!path.parentPath?.isProgram()) return;

      const line = path.node.loc?.start.line ?? 0;
      const declarations = path.node.declarations;

      const captureStatements: t.Statement[] = [];
      for (const decl of declarations) {
        if (t.isIdentifier(decl.id) && decl.init) {
          captureStatements.push(
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.identifier(RESULTS_VAR), t.identifier('push')),
                [
                  t.objectExpression([
                    t.objectProperty(t.identifier('line'), t.numericLiteral(line)),
                    t.objectProperty(t.identifier('value'), t.identifier(decl.id.name)),
                    t.objectProperty(
                      t.identifier('type'),
                      t.unaryExpression('typeof', t.identifier(decl.id.name))
                    ),
                  ]),
                ]
              )
            )
          );
        }
      }

      if (captureStatements.length > 0) {
        path.insertAfter(captureStatements);
      }
    },

    // Loop protection: inject counters into loops
    'WhileStatement|ForStatement|DoWhileStatement|ForInStatement|ForOfStatement'(path) {
      if (!options.loopProtection) return;

      const counterName = `${LOOP_PREFIX}${loopCounter++}`;
      const line = path.node.loc?.start.line ?? 0;

      // Insert counter declaration before the loop
      const counterDecl = t.variableDeclaration('let', [
        t.variableDeclarator(t.identifier(counterName), t.numericLiteral(0)),
      ]);

      // Guard statement at the top of the loop body
      const guardStatement = t.ifStatement(
        t.binaryExpression(
          '>',
          t.updateExpression('++', t.identifier(counterName), true),
          t.numericLiteral(options.loopThreshold)
        ),
        t.throwStatement(
          t.newExpression(t.identifier('Error'), [
            t.stringLiteral(`Loop limit exceeded (line ${line})`),
          ])
        )
      );

      // Ensure the loop body is a block statement
      const node = path.node as t.WhileStatement | t.ForStatement | t.DoWhileStatement | t.ForInStatement | t.ForOfStatement;
      if (t.isBlockStatement(node.body)) {
        node.body.body.unshift(guardStatement);
      } else {
        node.body = t.blockStatement([guardStatement, node.body as t.Statement]);
      }

      path.insertBefore(counterDecl);
    },
  });

  const output = generate(ast, { retainLines: true });
  return output.code;
}
