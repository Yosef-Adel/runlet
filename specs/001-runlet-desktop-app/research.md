# Research: Runlet Desktop App

**Feature**: 001-runlet-desktop-app  
**Date**: 2026-04-10  
**Status**: Complete

---

## 1. Desktop Framework

**Decision**: Electron  
**Rationale**: Runlet requires a hybrid runtime where user code accesses both Node.js built-in modules (`fs`, `path`, `crypto`) and browser/web APIs (DOM, Fetch, Web Audio) in the same environment. Electron natively provides both runtimes — its renderer process has Chromium (browser APIs) and Node.js integration. No other framework provides this without significant architectural overhead.  
**Alternatives considered**:
- **Tauri**: Much smaller bundle (~20-60MB vs ~160-200MB) but uses a Rust backend with a system webview. Would require spawning separate Node.js child processes for Node API access, adding IPC complexity. Does not satisfy the "single hybrid runtime" requirement naturally.
- **NW.js**: Similar capability to Electron but smaller ecosystem, fewer TypeScript tools, and less active maintenance.

**Gotchas**:
- Use context isolation + preload bridge pattern (not deprecated `nodeIntegration: true`).
- Code execution must run in a separate process/context from the editor UI for safety.
- macOS distribution requires code signing.
- Bundle size ~160-200MB is acceptable for a desktop app.

---

## 2. Code Editor

**Decision**: Monaco Editor  
**Rationale**: Monaco provides built-in TypeScript language services (autocomplete, hover info, diagnostics, function signatures) out of the box — matching FR-016 through FR-019. Its VS Code-derived theme system supports custom themes. Vim mode is available via an extension. This eliminates weeks of custom LSP integration that CodeMirror 6 would require.  
**Alternatives considered**:
- **CodeMirror 6**: Lighter (~2-3MB vs ~6-8MB gzipped), more elegant API, excellent performance. However, TypeScript support requires manual integration with a language server or custom plugins for hover, autocomplete, and diagnostics — significant effort for the initial release.

**Gotchas**:
- Monaco language services should run in a Web Worker to avoid blocking the UI thread.
- Monaco bundle is ~6-8MB gzipped — acceptable one-time cost in an Electron app.
- CSS style isolation may be needed if Monaco styles conflict with app styles.

---

## 3. TypeScript Compilation & Type Checking

**Decision**: Two-layer approach — TypeScript Compiler API for editor diagnostics + esbuild for execution transpilation  
**Rationale**: The TypeScript Compiler API provides full type checking, hover info, and diagnostic information required for the editor experience (FR-005, FR-017, FR-018). esbuild provides extremely fast transpilation (1-10ms) for the execution pipeline where type information is not needed — only stripping type annotations.  
**Alternatives considered**:
- **Babel with TypeScript preset**: Slower transpilation (50-100ms) but would unify with the AST transformation pipeline. Rejected for MVP because esbuild's speed matters for auto-run (<1 second response target SC-001).
- **SWC**: Fastest transpilation (1-5ms) but native binary can cause Electron Node.js version mismatches. Rejected for compatibility.

**Gotchas**:
- TypeScript type checking should be debounced to 300-500ms after last keystroke to avoid UI lag.
- Use incremental compilation mode for performance.
- JSX/TSX handling: esbuild handles JSX natively; TS Compiler API respects `jsx: react` config.

---

## 4. Code Execution & Per-Line Results

**Decision**: Babel AST transformation for instrumentation + Node.js `vm` module for isolated execution  
**Rationale**: To display per-line expression results (FR-002, FR-038), user code must be instrumented at the AST level to capture each top-level expression's value. Babel's parser and traversal API is the standard tool for JavaScript AST transformation. The `vm` module provides context isolation for executing transformed code safely.  
**Alternatives considered**:
- **Child process execution**: Provides OS-level isolation but adds IPC overhead that would harm auto-run latency. Reserved for future hardening.
- **Regex-based instrumentation**: Fragile and breaks with complex code (template literals, nested expressions). Rejected.
- **V8 inspector API**: Real breakpoints but requires complex V8 modifications. Overkill for a playground.

**Implementation approach**:
1. Parse user code with `@babel/parser`
2. Traverse AST and wrap each top-level statement to capture its result into a `__RESULTS__` array with line number
3. Execute transformed code in `vm.runInNewContext()` with controlled globals
4. Return `{line, value, type}` tuples to the renderer for display

**Gotchas**:
- Handle `var` hoisting correctly using Babel's scope plugin.
- Async/await results need careful line mapping.
- Use a JSON replacer function to handle circular references.
- Set execution timeout to prevent runaway code.

---

## 5. Loop Protection

**Decision**: Babel plugin that injects iteration counters into all loop constructs  
**Rationale**: Injecting a counter variable before each loop and a guard check at the top of each loop body is the standard approach used by code playgrounds. This integrates naturally with the existing Babel transformation pipeline (same pass as per-line instrumentation). Configurable threshold (default: 2000 per FR-035).  
**Alternatives considered**:
- **Timeout-based (setTimeout wrapper)**: Simple but doesn't catch CPU-intensive loops; kills entire execution context rather than specific loops.
- **V8 inspection API**: Complex, requires V8 binary modifications.

**Implementation**: Transform `while(true) { x++ }` into:
```javascript
let __LOOP_0 = 0;
while(true) {
  if (++__LOOP_0 > 2000) throw new Error("Loop limit exceeded (line 1)");
  x++;
}
```

**Gotchas**:
- Each loop gets its own counter (nested loops are independent).
- Intentional large loops (e.g., `for (let i = 0; i < 1000000; i++)`) will halt at threshold. Document this behavior.
- Counter increment overhead per iteration is negligible (<1% performance impact).

---

## 6. Magic Comments

**Decision**: Babel AST walker that parses `/*?*/` comment markers and instruments the preceding expression  
**Rationale**: Magic comments (FR-020) require identifying comment nodes in the AST and linking them to the expression they annotate. Babel's parser includes comment nodes with source locations, making this reliable. This is implemented as part of the same Babel transformation pass as per-line results and loop protection.  
**Alternatives considered**:
- **Regex-based comment detection**: Breaks with template literals containing `/*?*/`. Rejected.

**Implementation**: When `/*?*/` is found, look backward in AST for the preceding expression/statement, wrap it to capture the value, tag the result with `isMagic: true` for the UI to render inline.

**Gotchas**:
- Comment on the next line should annotate the previous statement.
- Multi-line statements need careful source location tracking via Babel's `loc` data.
- Support `/*?*/` only (not `// ?` or `/** ? */`) for clarity.

---

## 7. NPM Package Management

**Decision**: npm CLI for installation + npm registry JSON API for search + app-managed local cache directory  
**Rationale**: Using the npm CLI (bundled with Node.js in Electron) avoids reimplementing package resolution. A local cache directory isolates packages from the user's global npm configuration (spec assumption). The registry API at `https://registry.npmjs.org/-/search?text={query}` provides search functionality for the NPM packages UI (FR-011).  
**Alternatives considered**:
- **pnpm**: Faster and smaller disk footprint, but adds a dependency. Reserved for future optimization.
- **yarn**: More resilient but slower than pnpm and not significantly better than npm for this use case.

**Architecture**:
- Packages installed to `~/.runlet/packages/` (or app data directory)
- Manifest file tracks installed packages (name, version)
- Override `require.resolve()` in execution context to add the packages directory to the module resolution path

**Gotchas**:
- Packages with native bindings may fail on some platforms. Consider warning users.
- Heavy package installations (e.g., webpack) can take 30-60s+. Show progress indicator.
- Scoped packages (`@babel/core`) need URL encoding (`@babel%2Fcore`) in registry API calls.
- Cache can grow large. Provide UI to view cache size and clear it.

---

## 8. Code Formatting

**Decision**: Bundled Prettier, invoked in-process, triggered by explicit user action  
**Rationale**: Prettier is the standard JavaScript/TypeScript code formatter. Bundling it (~4MB, ~1.5MB gzipped) is acceptable in an Electron app. In-process invocation is fast enough for playground-sized files (<1000 lines). Format on explicit button click or auto-format-on-run (FR-025, FR-026).  
**Alternatives considered**:
- **Worker thread Prettier**: Non-blocking but adds IPC latency. Overkill for <1000 line files.
- **Download on first use**: Saves bundle size but adds network dependency and complexity.

**Implementation**:
- `require('prettier').format(code, options)` in the main or renderer process
- Auto-detect parser based on TypeScript/JavaScript toggle
- Formatting options exposed in Settings > Formatting tab (FR-025)

**Gotchas**:
- Never auto-format while the user is typing (disrupts flow).
- Support `parser: 'typescript'` as default (covers both JS and TS).
- No `.prettierrc` support for MVP — use app settings only.

---

## 9. Experimental JavaScript Proposals (Build Settings)

**Decision**: Babel with proposal plugins for experimental syntax support  
**Rationale**: Babel has official plugins for all the proposals listed in FR-029 (pipeline operator, decorators, partial application, throw expressions, do expressions, function.sent, regexp modifiers). These plugins integrate into the existing Babel transformation pipeline.  
**Alternatives considered**:
- **esbuild**: Does not support most experimental proposals. Cannot be used here.
- **SWC**: Supports decorators but not all proposals. Incomplete coverage.

**Implementation**: Enable/disable Babel plugins based on user settings. Each proposal maps to a specific `@babel/plugin-proposal-*` package.

---

## Technology Stack Summary

| Component | Technology | Bundle Impact |
|-----------|-----------|--------------|
| Desktop framework | Electron | ~160-200MB base |
| Code editor | Monaco Editor | ~6-8MB gzipped |
| TS type checking | TypeScript Compiler API | ~3MB |
| TS transpilation | esbuild | ~1MB |
| AST transformation | Babel (@babel/parser + traverse) | ~4MB |
| Code execution | Node.js vm module | Built-in |
| Code formatting | Prettier | ~4MB (~1.5MB gzip) |
| JS proposals | Babel proposal plugins | ~1MB total |
| NPM management | npm CLI + registry API | Built-in |
| State persistence | electron-store or JSON files | <0.1MB |
