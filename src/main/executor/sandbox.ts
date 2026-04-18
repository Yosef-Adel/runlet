import { createContext, Context } from 'vm';

export interface SandboxOptions {
  envVars?: Record<string, string>;
  modulePaths?: string[];
}

export function createSandbox(options: SandboxOptions = {}): Context {
  const consoleOutput: { method: string; args: unknown[]; line: number | null }[] = [];

  // Will be set by transformed code before each console call
  const lineTracker = { current: null as number | null };

  const makeConsoleMethod = (method: string) => {
    return (...args: unknown[]) => {
      consoleOutput.push({ method, args, line: lineTracker.current });
      lineTracker.current = null;
    };
  };

  const sandboxGlobals: Record<string, unknown> = {
    // Console
    console: {
      log: makeConsoleMethod('log'),
      error: makeConsoleMethod('error'),
      warn: makeConsoleMethod('warn'),
      info: makeConsoleMethod('info'),
      debug: makeConsoleMethod('debug'),
      dir: makeConsoleMethod('dir'),
      table: makeConsoleMethod('table'),
      clear: () => { consoleOutput.length = 0; },
      time: makeConsoleMethod('time'),
      timeEnd: makeConsoleMethod('timeEnd'),
    },

    // Timers
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
    queueMicrotask,

    // Web APIs
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    AbortController,
    AbortSignal,
    fetch,
    Headers,
    Request,
    Response,
    FormData,
    Blob,
    Event,
    EventTarget,
    structuredClone,
    atob,
    btoa,

    // Standard globals
    JSON,
    Math,
    Date,
    RegExp,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Symbol,
    BigInt,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Proxy,
    Reflect,
    Error,
    TypeError,
    RangeError,
    ReferenceError,
    SyntaxError,
    URIError,
    EvalError,
    AggregateError,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array,
    ArrayBuffer,
    SharedArrayBuffer,
    DataView,
    WeakRef,
    FinalizationRegistry,
    encodeURI,
    decodeURI,
    encodeURIComponent,
    decodeURIComponent,
    isFinite,
    isNaN,
    parseFloat,
    parseInt,
    undefined,
    NaN,
    Infinity,

    // Environment
    process: {
      env: { ...process.env, ...(options.envVars ?? {}) },
      argv: [],
      cwd: () => process.cwd(),
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      versions: process.versions,
      pid: process.pid,
      nextTick: process.nextTick,
      hrtime: process.hrtime,
    },

    // Buffer
    Buffer,

    // Internal: console output collector
    __CONSOLE_OUTPUT__: consoleOutput,
  };

  // Node.js require
  const Module = require('module');
  const _require = Module.createRequire(process.cwd());

  sandboxGlobals.require = (id: string) => {
    // Try module paths first (e.g. ~/.runlet/node_modules/)
    if (options.modulePaths) {
      for (const modulePath of options.modulePaths) {
        try {
          const customRequire = Module.createRequire(modulePath + '/');
          return customRequire(id);
        } catch {
          // try next path
        }
      }
    }
    // Fall back to built-in modules
    return _require(id);
  };

  const context = createContext(sandboxGlobals);

  // Define __CONSOLE_LINE__ on the context with getter/setter
  // (must be done after createContext to preserve the descriptor)
  Object.defineProperty(context, '__CONSOLE_LINE__', {
    get: () => lineTracker.current,
    set: (v: number | null) => { lineTracker.current = v; },
    enumerable: true,
    configurable: true,
  });

  return context;
}
