import { runInContext, Script } from 'vm';
import { transformCode, TransformOptions } from './transformer';
import { createSandbox, SandboxOptions } from './sandbox';
import type { OutputResult, ConsoleEntry, ExecutionResponse, ExecutionError } from '../../shared/types';
import { EXECUTION_TIMEOUT_MS } from '../../shared/constants';

export interface RunOptions {
  code: string;
  language: 'javascript' | 'typescript';
  transformOptions: TransformOptions;
  sandboxOptions?: SandboxOptions;
}

function serializeValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return value.toString();
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'bigint') return `${value}n`;
  try {
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === 'bigint') return `${val}n`;
      if (typeof val === 'function') return val.toString();
      if (typeof val === 'symbol') return val.toString();
      if (typeof val === 'undefined') return 'undefined';
      return val;
    }, 2);
  } catch {
    return String(value);
  }
}

async function transpileTypeScript(code: string): Promise<string> {
  const esbuild = await import('esbuild');
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    target: 'es2022',
    format: 'cjs',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  });
  return result.code;
}

export async function runCode(options: RunOptions): Promise<ExecutionResponse | ExecutionError> {
  const startTime = Date.now();

  try {
    let code = options.code;

    // Step 1: Transpile TypeScript if needed
    if (options.language === 'typescript') {
      code = await transpileTypeScript(code);
    }

    // Step 2: Transform code with Babel (per-line results, loop protection)
    const transformedCode = transformCode(code, options.transformOptions);

    // Step 3: Detect if code contains async/await
    const isAsync = /\bawait\b/.test(transformedCode);

    // Step 4: Wrap in async if needed
    const executableCode = isAsync
      ? `(async () => { ${transformedCode}; return __RESULTS__; })()`
      : `${transformedCode}; __RESULTS__`;

    // Step 5: Create sandbox and execute
    const sandbox = createSandbox(options.sandboxOptions ?? {});
    const script = new Script(executableCode, {
      filename: 'runlet-user-code.js',
    });

    let rawResults: unknown[];
    if (isAsync) {
      const promise = script.runInContext(sandbox, {
        timeout: EXECUTION_TIMEOUT_MS,
      }) as Promise<unknown[]>;
      rawResults = await promise;
    } else {
      rawResults = script.runInContext(sandbox, {
        timeout: EXECUTION_TIMEOUT_MS,
      }) as unknown[];
    }

    // Step 6: Process results
    const results: OutputResult[] = (rawResults ?? []).map((r: unknown) => {
      const raw = r as { line: number; value: unknown; type: string; isMagic?: boolean };
      return {
        line: raw.line,
        value: serializeValue(raw.value),
        type: raw.type,
        displayValue: serializeValue(raw.value),
        isMagic: raw.isMagic ?? false,
        isError: false,
        errorMessage: null,
      };
    });

    // Step 7: Collect console output
    const consoleOutput = (sandbox.__CONSOLE_OUTPUT__ as ConsoleEntry[]) ?? [];

    return {
      success: true,
      results,
      consoleOutput,
      executionTime: Date.now() - startTime,
    };
  } catch (err) {
    const error = err as Error & { loc?: { line: number; column: number } };
    const lineMatch = error.stack?.match(/runlet-user-code\.js:(\d+)/);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : error.loc?.line ?? null;

    return {
      success: false,
      error: {
        message: error.message,
        line,
        column: error.loc?.column ?? null,
        stack: error.stack ?? '',
      },
    };
  }
}
