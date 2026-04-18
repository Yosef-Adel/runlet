import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';

// Handle ESM/CJS interop — these modules export { default } when consumed as CJS
const traverse = (typeof _traverse === 'function' ? _traverse : (_traverse as any).default) as typeof _traverse;
const generate = (typeof _generate === 'function' ? _generate : (_generate as any).default) as typeof _generate;

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

      // Skip console.* calls — they are captured by the sandbox's console proxy
      const expr = path.node.expression;
      if (
        t.isCallExpression(expr) &&
        t.isMemberExpression(expr.callee) &&
        t.isIdentifier(expr.callee.object) &&
        expr.callee.object.name === 'console'
      ) {
        return;
      }

      const line = path.node.loc?.start.line ?? 0;

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

  // Second pass: handle magic comments /*?*/
  // Find /*?*/ in comments and instrument the preceding expression
  let result = output.code;
  const magicRegex = /\/\*\?\*\//g;
  let match: RegExpExecArray | null;
  const magicInserts: { index: number; line: number }[] = [];

  // Work on the source to find magic comment positions
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineStr = lines[i];
    if (lineStr.includes('/*?*/')) {
      magicInserts.push({ index: i, line: i + 1 });
    }
  }

  // For each magic comment, inject a result capture after the line in the transformed code
  if (magicInserts.length > 0) {
    const transformedLines = result.split('\n');
    // Process in reverse so line indices don't shift
    for (let i = magicInserts.length - 1; i >= 0; i--) {
      const { line } = magicInserts[i];
      // Find the corresponding line in transformed code and add a magic result capture
      // We insert after the line that contains the magic comment
      const insertIdx = Math.min(line, transformedLines.length);
      const captureCode = `${RESULTS_VAR}.push({ line: ${line}, value: (() => { try { return eval(${JSON.stringify(lines[line - 1].replace('/*?*/', '').trim())}); } catch(e) { return e.message; } })(), type: 'magic', isMagic: true });`;
      transformedLines.splice(insertIdx, 0, captureCode);
    }
    result = transformedLines.join('\n');
  }

  return result;
}
