# Implementation Plan: Runlet Desktop App

**Branch**: `001-runlet-desktop-app` | **Date**: 2026-04-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-runlet-desktop-app/spec.md`

## Summary

Runlet is a free, open-source cross-platform desktop JavaScript/TypeScript playground — a feature-complete alternative to RunJS. Built with Electron + Monaco Editor + React, it provides instant code execution with per-line results via Babel AST instrumentation and Node.js vm module isolation. Supports NPM packages, snippets, magic comments, code formatting with Prettier, experimental JS proposals, and extensive editor customization.

## Technical Context

**Language/Version**: TypeScript 5.x (application code), JavaScript/TypeScript (user code execution)  
**Primary Dependencies**: Electron, Monaco Editor, React, Zustand, Babel, esbuild, Prettier, Vite (electron-vite)  
**Storage**: JSON files in `~/.runlet/` (settings, tabs, snippets, env vars, package manifest)  
**Testing**: Vitest (unit/integration), Playwright (end-to-end)  
**Target Platform**: macOS, Windows, Linux (x64 and ARM64)  
**Project Type**: desktop-app  
**Performance Goals**: <1s code execution feedback (auto-run), <5s cold launch, <1s formatting for ≤1000 lines  
**Constraints**: Offline-capable except for NPM search/install; ~200MB bundle size (Electron baseline)  
**Scale/Scope**: Single-user desktop app, 20+ simultaneous tabs, 50+ snippets, unlimited NPM packages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution file found (`/.specify/memory/constitution.md` does not exist). Gate passes by default — no constraints to evaluate.

**Post-design re-check**: No constitution violations. Design uses a single Electron project with clear separation between main process (execution, services) and renderer process (UI). No unnecessary abstractions.

## Project Structure

### Documentation (this feature)

```text
specs/001-runlet-desktop-app/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — entity definitions
├── quickstart.md        # Phase 1 output — setup and architecture
├── contracts/           # Phase 1 output — IPC contracts
│   └── ipc-contracts.md # Main ↔ Renderer IPC interface definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/                      # Electron main process
│   ├── main.ts                # App entry point, window creation
│   ├── preload.ts             # Context bridge (IPC exposed to renderer)
│   ├── ipc/                   # IPC handlers (one per domain)
│   │   ├── execute.ts         # Code execution
│   │   ├── npm.ts             # NPM package management
│   │   ├── format.ts          # Prettier formatting
│   │   ├── settings.ts        # Settings persistence
│   │   ├── snippets.ts        # Snippets persistence
│   │   └── env-vars.ts        # Environment variables
│   ├── executor/              # Code execution engine
│   │   ├── transformer.ts     # Babel AST (per-line results, loop protection, magic comments)
│   │   ├── runner.ts          # vm module execution
│   │   └── sandbox.ts         # Execution context globals
│   └── services/              # Shared main-process services
│       ├── npm-registry.ts    # NPM registry API client
│       ├── storage.ts         # JSON file persistence
│       └── prettier.ts        # Prettier wrapper
├── renderer/                  # Electron renderer (React UI)
│   ├── index.html
│   ├── App.tsx
│   ├── components/
│   │   ├── Editor.tsx         # Monaco editor wrapper
│   │   ├── Output.tsx         # Output pane
│   │   ├── TabBar.tsx         # Tab management
│   │   ├── ActivityBar.tsx    # Side activity bar
│   │   ├── Divider.tsx        # Resizable pane divider
│   │   ├── Settings/          # Settings panel components
│   │   ├── Snippets/          # Snippet management UI
│   │   ├── NpmPackages/       # NPM package search/install UI
│   │   └── EnvVars/           # Environment variables UI
│   ├── hooks/
│   │   ├── useExecution.ts
│   │   ├── useTabs.ts
│   │   └── useSettings.ts
│   ├── store/
│   │   └── index.ts           # Zustand store
│   └── themes/                # Monaco theme definitions
│       ├── dark.ts
│       ├── light.ts
│       └── index.ts
└── shared/                    # Types shared between main & renderer
    ├── types.ts
    └── constants.ts

tests/
├── unit/
│   ├── transformer.test.ts
│   ├── runner.test.ts
│   └── storage.test.ts
├── integration/
│   ├── execution.test.ts
│   └── npm.test.ts
└── e2e/
    └── app.test.ts
```

**Structure Decision**: Single Electron project with `src/main/` (Node.js main process), `src/renderer/` (React UI), and `src/shared/` (shared types). This mirrors standard electron-vite project layout. The main process handles code execution, NPM management, formatting, and file I/O. The renderer handles all UI. Communication via IPC preload bridge.
