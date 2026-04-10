# Quickstart: Runlet Desktop App

**Feature**: 001-runlet-desktop-app  
**Date**: 2026-04-10

---

## Prerequisites

- Node.js >= 20.x (LTS)
- npm >= 10.x
- Git

## Setup

```bash
# Clone the repository
git clone https://github.com/Yosef-Adel/runlet.git
cd runlet

# Install dependencies
npm install

# Start in development mode (hot-reload)
npm run dev
```

## Project Structure

```
runlet/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── main.ts            # App entry point, window creation
│   │   ├── preload.ts         # Context bridge (IPC exposed to renderer)
│   │   ├── ipc/               # IPC handlers
│   │   │   ├── execute.ts     # Code execution handler
│   │   │   ├── npm.ts         # NPM package management handler
│   │   │   ├── format.ts      # Prettier formatting handler
│   │   │   ├── settings.ts    # Settings persistence handler
│   │   │   ├── snippets.ts    # Snippets persistence handler
│   │   │   └── env-vars.ts    # Environment variables handler
│   │   ├── executor/          # Code execution engine
│   │   │   ├── transformer.ts # Babel AST transformation (per-line results, loop protection, magic comments)
│   │   │   ├── runner.ts      # vm module execution
│   │   │   └── sandbox.ts     # Execution context globals
│   │   └── services/          # Shared main-process services
│   │       ├── npm-registry.ts # NPM registry API client
│   │       ├── storage.ts     # File-based persistence (JSON read/write)
│   │       └── prettier.ts    # Prettier wrapper
│   ├── renderer/              # Electron renderer process (UI)
│   │   ├── index.html         # Entry HTML
│   │   ├── App.tsx            # Root React component
│   │   ├── components/        # UI components
│   │   │   ├── Editor.tsx     # Monaco editor wrapper
│   │   │   ├── Output.tsx     # Output pane
│   │   │   ├── TabBar.tsx     # Tab bar management
│   │   │   ├── ActivityBar.tsx # Side activity bar
│   │   │   ├── Divider.tsx    # Resizable pane divider
│   │   │   ├── Settings/      # Settings panel components
│   │   │   ├── Snippets/      # Snippet management UI
│   │   │   ├── NpmPackages/   # NPM package search/install UI
│   │   │   └── EnvVars/       # Environment variables UI
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useExecution.ts  # Code execution hook
│   │   │   ├── useTabs.ts      # Tab state management
│   │   │   └── useSettings.ts  # Settings state hook
│   │   ├── store/             # State management
│   │   │   └── index.ts       # Zustand store
│   │   └── themes/            # Monaco theme definitions
│   │       ├── dark.ts
│   │       ├── light.ts
│   │       └── index.ts
│   └── shared/                # Types shared between main & renderer
│       ├── types.ts           # TypeScript type definitions
│       └── constants.ts       # Shared constants (IPC channels, defaults)
├── tests/
│   ├── unit/                  # Unit tests
│   │   ├── transformer.test.ts
│   │   ├── runner.test.ts
│   │   └── storage.test.ts
│   ├── integration/           # Integration tests
│   │   ├── execution.test.ts
│   │   └── npm.test.ts
│   └── e2e/                   # End-to-end tests (Playwright)
│       └── app.test.ts
├── package.json
├── tsconfig.json
├── electron-builder.yml       # Packaging configuration
├── vite.config.ts             # Vite bundler config (renderer)
└── README.md
```

## Key Commands

```bash
# Development
npm run dev              # Start with hot-reload
npm run dev:main         # Start main process only
npm run dev:renderer     # Start renderer only

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # End-to-end tests

# Building
npm run build            # Build for production
npm run package          # Package for current platform
npm run package:all      # Package for macOS, Windows, Linux

# Linting
npm run lint             # ESLint + TypeScript checks
npm run format           # Format codebase with Prettier
```

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ Renderer Process (Chromium)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ Monaco   │ │ Output   │ │ Settings / Tools ││
│  │ Editor   │ │ Pane     │ │ (Snippets, NPM,  ││
│  │          │ │          │ │  Env Vars)        ││
│  └──────────┘ └──────────┘ └──────────────────┘│
│              ↕ IPC via preload bridge            │
├─────────────────────────────────────────────────┤
│ Main Process (Node.js)                           │
│  ┌──────────────────┐ ┌──────────────────┐      │
│  │ Code Executor    │ │ Services         │      │
│  │ (Babel transform │ │ (NPM CLI,        │      │
│  │  + vm.runIn....) │ │  Prettier,       │      │
│  │                  │ │  Storage)        │      │
│  └──────────────────┘ └──────────────────┘      │
│              ↕ File System                       │
│  ┌──────────────────────────────────────────┐   │
│  │ ~/.runlet/ (settings, tabs, snippets,    │   │
│  │            packages, env-vars)           │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Desktop framework | Electron |
| Code editor | Monaco Editor |
| UI framework | React + TypeScript |
| State management | Zustand |
| Bundler | Vite (electron-vite) |
| TS type checking | TypeScript Compiler API |
| TS transpilation | esbuild |
| AST transformation | Babel |
| Code execution | Node.js vm module |
| Code formatting | Prettier |
| Testing | Vitest + Playwright |
| Packaging | electron-builder |
