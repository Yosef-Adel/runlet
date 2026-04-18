# Tasks: Runlet Desktop App

**Input**: Design documents from `/specs/001-runlet-desktop-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Electron project initialization with electron-vite, React, and core dependencies

- [x] T001 Initialize electron-vite project with React + TypeScript template in package.json, tsconfig.json, vite.config.ts
- [x] T002 Install core dependencies: electron, react, react-dom, zustand, monaco-editor, @babel/parser, @babel/traverse, @babel/generator, esbuild, prettier in package.json
- [x] T003 [P] Configure ESLint and Prettier for the codebase in .eslintrc.cjs, .prettierrc
- [x] T004 [P] Configure electron-builder packaging for macOS, Windows, Linux in electron-builder.yml
- [x] T005 [P] Define shared TypeScript types for Tab, OutputResult, Snippet, InstalledPackage, EnvironmentVariable, Settings, Theme in src/shared/types.ts
- [x] T006 [P] Define shared IPC channel constants and default settings values in src/shared/constants.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Electron main process shell, preload bridge, storage service, and base Zustand store that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Electron main process entry with BrowserWindow creation, context isolation, and preload script loading in src/main/main.ts
- [x] T008 Create preload script exposing IPC bridge via contextBridge.exposeInMainWorld in src/main/preload.ts
- [x] T009 [P] Implement JSON file persistence service (read/write/ensure-dir for ~/.runlet/) in src/main/services/storage.ts
- [x] T010 [P] Create renderer entry HTML in src/renderer/index.html
- [x] T011 Create root React App component with basic layout shell (activity bar, tab bar, editor area, output area) in src/renderer/App.tsx
- [x] T012 Create Zustand store with tab state, settings state, and UI state slices in src/renderer/store/index.ts
- [x] T013 Implement settings IPC handlers (settings-load, settings-save) using storage service in src/main/ipc/settings.ts
- [x] T014 Implement useSettings hook that loads settings on mount and persists on change via IPC in src/renderer/hooks/useSettings.ts

**Checkpoint**: Foundation ready — Electron app launches with empty shell, settings persist to ~/.runlet/settings.json

---

## Phase 3: User Story 1 — Write and Instantly See Code Results (Priority: P1) 🎯 MVP

**Goal**: Developer types JavaScript code and sees per-line expression results instantly in the output pane

**Independent Test**: Open app, type `const x = 2 + 2`, verify `4` appears in output pane

### Implementation for User Story 1

- [x] T015 [US1] Implement Babel AST transformer for per-line result capture — parse code, wrap top-level statements to push results into __RESULTS__ array with line numbers in src/main/executor/transformer.ts
- [x] T016 [US1] Implement execution sandbox with controlled globals (console, require, setTimeout, etc.) in src/main/executor/sandbox.ts
- [x] T017 [US1] Implement code runner using vm.runInNewContext with timeout, executing transformed code and returning OutputResult[] in src/main/executor/runner.ts
- [x] T018 [US1] Implement execute-code and cancel-execution IPC handlers connecting renderer requests to executor pipeline in src/main/ipc/execute.ts
- [x] T019 [US1] Create Monaco editor wrapper component with basic JavaScript language support in src/renderer/components/Editor.tsx
- [x] T020 [US1] Create Output pane component that displays per-line results aligned with source lines in src/renderer/components/Output.tsx
- [x] T021 [US1] Implement useExecution hook with debounced auto-run (triggers execute-code IPC on code change) and manual run support in src/renderer/hooks/useExecution.ts
- [x] T022 [US1] Wire Editor + Output + useExecution together in App.tsx with split-pane layout (editor left, output right) in src/renderer/App.tsx
- [x] T023 [US1] Implement resizable pane divider component (drag to resize editor/output widths) in src/renderer/components/Divider.tsx

**Checkpoint**: App shows live per-line JavaScript results. Auto-run fires on keystroke with debounce. Manual "Run" button works when auto-run is off.

---

## Phase 4: User Story 2 — Work with Multiple Tabs (Priority: P1)

**Goal**: Developer manages multiple independent code tabs with create, switch, close, and rename

**Independent Test**: Create 3 tabs with different code, switch between them, verify each retains its own code and output

### Implementation for User Story 2

- [x] T024 [US2] Implement useTabs hook for tab CRUD (create, close, switch, reorder, rename) backed by Zustand store in src/renderer/hooks/useTabs.ts
- [x] T025 [US2] Create TabBar component with tab list, active tab indicator, new-tab button, close button, and right-click "Edit Tab Title" context menu in src/renderer/components/TabBar.tsx
- [x] T026 [US2] Implement tab state persistence — save open tabs to ~/.runlet/tabs.json on change, restore on app launch via tabs-load/tabs-save IPC in src/main/ipc/settings.ts
- [x] T027 [US2] Integrate TabBar with Editor and Output — switching tabs swaps editor content and output results independently in src/renderer/App.tsx
- [x] T028 [US2] Implement tab title derivation — display first line of code as title when no custom title is set in src/renderer/components/TabBar.tsx
- [x] T029 [US2] Implement confirm-close dialog when confirmClose setting is enabled in src/renderer/components/TabBar.tsx

**Checkpoint**: Multiple tabs work independently. State persists across app restarts.

---

## Phase 5: User Story 3 — Write and Run TypeScript (Priority: P1)

**Goal**: Developer writes TypeScript with autocomplete, hover info, linting, and executes it

**Independent Test**: Type `const greet = (name: string): string => 'Hello ' + name; greet('World')` and see `'Hello World'` in output with working autocomplete/hover

### Implementation for User Story 3

- [x] T030 [US3] Add esbuild TypeScript-to-JavaScript transpilation step in the execution pipeline (before Babel transformation) in src/main/executor/runner.ts
- [x] T031 [US3] Configure Monaco editor TypeScript language service with compiler options, type acquisition, and diagnostics in src/renderer/components/Editor.tsx
- [x] T032 [US3] Enable Monaco autocomplete, hover info tooltips, inline diagnostics (errors/warnings), and function signature help in src/renderer/components/Editor.tsx
- [x] T033 [US3] Add language toggle per tab (JavaScript/TypeScript) stored in tab state, reflected in Monaco editor mode in src/renderer/hooks/useTabs.ts

**Checkpoint**: TypeScript code compiles and executes. Monaco provides autocomplete, hover, linting, and signatures.

---

## Phase 6: User Story 4 — Access Node.js and Browser APIs (Priority: P1)

**Goal**: User code can use both Node.js built-in modules and browser/web APIs in the same execution context

**Independent Test**: Run `require('os').hostname()` and `fetch('https://httpbin.org/get')` in the same tab

### Implementation for User Story 4

- [x] T034 [US4] Expose Node.js built-in modules (fs, path, os, crypto, http, etc.) in execution sandbox globals in src/main/executor/sandbox.ts
- [x] T035 [US4] Expose browser/web APIs (fetch, URL, TextEncoder/TextDecoder, AbortController, etc.) in execution sandbox globals in src/main/executor/sandbox.ts
- [x] T036 [US4] Implement console capture (console.log, console.error, console.warn) in sandbox, forwarding output with line numbers to results in src/main/executor/sandbox.ts
- [x] T037 [US4] Handle async/await execution — detect async code and await top-level promises before returning results in src/main/executor/runner.ts

**Checkpoint**: Both Node.js require() and browser fetch/DOM APIs work in user code. Console output captured.

---

## Phase 7: User Story 5 — Install and Use NPM Packages (Priority: P2)

**Goal**: Developer can search, install, remove NPM packages and use them in code via require/import

**Independent Test**: Search for `lodash`, install it, run `require('lodash').chunk([1,2,3,4], 2)` and see `[[1,2],[3,4]]`

### Implementation for User Story 5

- [x] T038 [P] [US5] Implement NPM registry search client using registry.npmjs.org API in src/main/services/npm-registry.ts
- [x] T039 [P] [US5] Implement npm-search IPC handler in src/main/ipc/npm.ts
- [x] T040 [US5] Implement npm-install IPC handler — run npm install to ~/.runlet/node_modules/, update packages.json manifest, emit progress events in src/main/ipc/npm.ts
- [x] T041 [US5] Implement npm-uninstall and npm-list IPC handlers in src/main/ipc/npm.ts
- [x] T042 [US5] Configure execution sandbox to resolve require/import from ~/.runlet/node_modules/ in src/main/executor/sandbox.ts
- [x] T043 [US5] Create NpmPackages panel UI with search input, results list with "Add" button, installed packages list with "Remove" button, and install progress indicator in src/renderer/components/NpmPackages/NpmPackages.tsx
- [x] T044 [US5] Wire NpmPackages panel to activity bar toggle in src/renderer/components/ActivityBar.tsx

**Checkpoint**: NPM packages can be searched, installed, removed, and used in user code.

---

## Phase 8: User Story 6 — Save and Reuse Code Snippets (Priority: P2)

**Goal**: Developer creates named snippets, inserts them via autocomplete or snippets window, imports/exports as JSON

**Independent Test**: Create snippet "fetchTemplate", type "fetchTemplate" in editor, see autocomplete suggestion that inserts snippet body

### Implementation for User Story 6

- [x] T045 [P] [US6] Implement snippets-load, snippets-save, snippets-export, snippets-import IPC handlers using storage service and native file dialogs in src/main/ipc/snippets.ts
- [x] T046 [US6] Create Snippets panel UI with snippet list, create/edit/delete forms (name, description, body), insert buttons, and import/export buttons in src/renderer/components/Snippets/Snippets.tsx
- [x] T047 [US6] Register snippets as Monaco completion items for autocomplete insertion in src/renderer/components/Editor.tsx
- [x] T048 [US6] Add "Create Snippet from Selection" to editor context menu in src/renderer/components/Editor.tsx
- [x] T049 [US6] Wire Snippets panel to activity bar toggle in src/renderer/components/ActivityBar.tsx

**Checkpoint**: Snippets CRUD works. Autocomplete inserts snippets. Import/export as JSON works.

---

## Phase 9: User Story 7 — Customize Appearance and Themes (Priority: P2)

**Goal**: Developer changes themes, fonts, and visual preferences with immediate effect

**Independent Test**: Open Settings > Appearance, change theme to "monokai", verify editor updates immediately

### Implementation for User Story 7

- [ ] T050 [P] [US7] Define Monaco theme definitions for dark, light, monokai, solarized-dark, solarized-light, dracula, nord in src/renderer/themes/dark.ts, light.ts, and src/renderer/themes/index.ts
- [ ] T051 [US7] Create Settings panel with tabbed interface (General, Build, Formatting, Appearance, Advanced) in src/renderer/components/Settings/Settings.tsx
- [ ] T052 [US7] Implement Appearance settings tab with theme selector, font family, font size, line numbers, invisibles, active line, tab bar, output highlighting, activity bar toggles in src/renderer/components/Settings/AppearanceSettings.tsx
- [ ] T053 [US7] Apply appearance settings reactively — theme changes update Monaco editor and output pane immediately via Zustand subscription in src/renderer/components/Editor.tsx and src/renderer/components/Output.tsx
- [ ] T054 [US7] Wire Settings panel to activity bar toggle in src/renderer/components/ActivityBar.tsx

**Checkpoint**: Theme switching, font changes, and all visual toggles applied immediately.

---

## Phase 10: User Story 8 — Use Magic Comments to Inspect Values (Priority: P2)

**Goal**: Developer uses `/*?*/` comment markers to see expression values inline

**Independent Test**: Write `[1,2,3].map(x => x * 2) /*?*/` and see the mapped array displayed inline

### Implementation for User Story 8

- [ ] T055 [US8] Extend Babel AST transformer to detect `/*?*/` comment markers, find preceding expression, instrument it to capture value with isMagic flag in src/main/executor/transformer.ts
- [ ] T056 [US8] Render magic comment results as inline decorations in the editor (distinct from output pane results) in src/renderer/components/Editor.tsx
- [ ] T057 [US8] Render magic comment results in the output pane with visual distinction (e.g., different styling) in src/renderer/components/Output.tsx

**Checkpoint**: Magic comments display inline values for annotated expressions.

---

## Phase 11: User Story 9 — Configure Editor Behavior (Priority: P3)

**Goal**: Developer adjusts editor settings: auto-run, line wrap, Vim keys, brackets, scrolling, autocomplete, linting, hover, signatures

**Independent Test**: Toggle Vim keys on, verify Vim keybindings work; toggle auto-run off, verify Run button appears

### Implementation for User Story 9

- [ ] T058 [US9] Implement General settings tab with all toggles (autoRun, lineWrap, vimKeys, closeBrackets, matchLines, scrolling, confirmClose, autocomplete, linting, hoverInfo, signatures) in src/renderer/components/Settings/GeneralSettings.tsx
- [ ] T059 [US9] Apply general settings reactively to Monaco editor (wordWrap, vim extension, autoClosingBrackets, quickSuggestions, diagnostics, hover, parameterHints) in src/renderer/components/Editor.tsx
- [ ] T060 [US9] Implement synchronous scrolling mode — link editor and output scroll positions when scrolling setting is "synchronous" in src/renderer/components/Editor.tsx and src/renderer/components/Output.tsx
- [ ] T061 [US9] Implement automatic scrolling mode — auto-scroll output pane to bottom as results appear when scrolling setting is "automatic" in src/renderer/components/Output.tsx
- [ ] T062 [US9] Toggle Run button visibility based on autoRun setting in src/renderer/components/ActivityBar.tsx

**Checkpoint**: All general editor settings take effect immediately.

---

## Phase 12: User Story 10 — Configure Code Formatting (Priority: P3)

**Goal**: Developer formats code on-demand or auto-formats on run with configurable Prettier options

**Independent Test**: Write poorly formatted code, trigger "Format Code", verify code reformats

### Implementation for User Story 10

- [ ] T063 [P] [US10] Implement Prettier wrapper service in src/main/services/prettier.ts
- [ ] T064 [US10] Implement format-code IPC handler in src/main/ipc/format.ts
- [ ] T065 [US10] Implement Formatting settings tab with auto-format toggle, tabWidth, useTabs, semi, singleQuote, trailingComma in src/renderer/components/Settings/FormattingSettings.tsx
- [ ] T066 [US10] Add "Format Code" action to activity bar/action menu and wire to format-code IPC in src/renderer/components/ActivityBar.tsx
- [ ] T067 [US10] Implement auto-format-on-run — when autoFormat setting is enabled, format code before manual execution in src/renderer/hooks/useExecution.ts

**Checkpoint**: Format button works. Auto-format on run works. Formatting settings applied.

---

## Phase 13: User Story 11 — Set Environment Variables (Priority: P3)

**Goal**: Developer defines environment variables accessible via `process.env` in user code

**Independent Test**: Add `API_KEY=test123`, write `process.env.API_KEY`, see `'test123'` in output

### Implementation for User Story 11

- [ ] T068 [P] [US11] Implement env-vars-load and env-vars-save IPC handlers using storage service in src/main/ipc/env-vars.ts
- [ ] T069 [US11] Inject saved environment variables into execution sandbox process.env in src/main/executor/sandbox.ts
- [ ] T070 [US11] Create EnvVars panel UI with key-value input, add/edit/delete/save controls in src/renderer/components/EnvVars/EnvVars.tsx
- [ ] T071 [US11] Wire EnvVars panel to activity bar toggle in src/renderer/components/ActivityBar.tsx

**Checkpoint**: Environment variables persist and are accessible in user code via process.env.

---

## Phase 14: User Story 12 — Enable Experimental JavaScript Proposals (Priority: P3)

**Goal**: Developer enables Babel proposal plugins (pipeline, decorators, etc.) via build settings

**Independent Test**: Enable pipeline operator, write code with `|>` syntax, see correct output

### Implementation for User Story 12

- [ ] T072 [US12] Extend Babel transformer to conditionally load proposal plugins (pipeline, decorators, partialApplication, throwExpressions, doExpressions, functionSent, regexpModifiers) based on settings in src/main/executor/transformer.ts
- [ ] T073 [US12] Install Babel proposal plugin packages: @babel/plugin-proposal-pipeline-operator, @babel/plugin-proposal-decorators, @babel/plugin-proposal-partial-application, @babel/plugin-proposal-throw-expressions, @babel/plugin-proposal-do-expressions, @babel/plugin-proposal-function-sent in package.json
- [ ] T074 [US12] Implement Build settings tab with TypeScript toggle, JSX toggle, and individual proposal toggles in src/renderer/components/Settings/BuildSettings.tsx

**Checkpoint**: Enabling a proposal in settings allows using that syntax in code.

---

## Phase 15: User Story 13 — Adjust Layout and View Options (Priority: P3)

**Goal**: Developer switches layout orientation, toggles pane/bar visibility, resizes panes

**Independent Test**: Switch from horizontal to vertical layout, verify panes reorient

### Implementation for User Story 13

- [ ] T075 [US13] Add layout orientation state (horizontal/vertical) to Zustand store and persist in settings in src/renderer/store/index.ts
- [ ] T076 [US13] Update App.tsx split-pane layout to support vertical orientation (editor top, output bottom) based on layout setting in src/renderer/App.tsx
- [ ] T077 [US13] Implement View menu or toolbar with layout toggle (horizontal/vertical), output pane visibility toggle, activity bar toggle, tab bar visibility toggle in src/renderer/App.tsx
- [ ] T078 [US13] Implement output pane show/hide based on visibility setting in src/renderer/App.tsx

**Checkpoint**: Layout toggles work. Pane visibility toggleable. Horizontal/vertical switch works.

---

## Phase 16: User Story 14 — Loop Protection (Priority: P3)

**Goal**: Infinite loops are halted after configurable iteration threshold

**Independent Test**: Write `while(true) {}`, verify execution halts with message rather than freezing

### Implementation for User Story 14

- [ ] T079 [US14] Extend Babel transformer to inject loop counter variables and guard checks into while, for, do-while, for-in, for-of loops in src/main/executor/transformer.ts
- [ ] T080 [US14] Implement Advanced settings tab with expressionResults toggle, showUndefined toggle, loopProtection toggle, loopThreshold input in src/renderer/components/Settings/AdvancedSettings.tsx
- [ ] T081 [US14] Pass loopProtection and loopThreshold from settings through execute-code IPC to transformer in src/main/ipc/execute.ts

**Checkpoint**: Infinite loops halt at threshold. Loop protection can be toggled and threshold configured.

---

## Phase 17: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T082 [P] Add application menu (File, Edit, View, Action, Tools, Help) with keyboard shortcuts for common actions in src/main/main.ts
- [ ] T083 [P] Implement session restore — reopen last-used tabs and settings on app launch in src/main/main.ts
- [ ] T084 Handle large output gracefully — truncate or virtualize output results exceeding a threshold in src/renderer/components/Output.tsx
- [ ] T085 Add error boundaries to React component tree to prevent full-app crashes in src/renderer/App.tsx
- [ ] T086 [P] Add JSX syntax transformation support in the execution pipeline (esbuild jsx option + Babel) in src/main/executor/runner.ts
- [ ] T087 Run quickstart.md validation — verify npm run dev, npm run build, and npm run package work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundation — core execution + UI
- **US2 (Phase 4)**: Depends on Foundation + US1 (needs editor/output wired)
- **US3 (Phase 5)**: Depends on US1 (extends execution pipeline + editor)
- **US4 (Phase 6)**: Depends on US1 (extends sandbox globals)
- **US5 (Phase 7)**: Depends on US1 + US4 (needs execution sandbox with require support)
- **US6 (Phase 8)**: Depends on Foundation + US1 (needs editor for autocomplete)
- **US7 (Phase 9)**: Depends on Foundation + US1 (needs editor + settings panel)
- **US8 (Phase 10)**: Depends on US1 (extends transformer + output)
- **US9 (Phase 11)**: Depends on US7 (needs settings panel created)
- **US10 (Phase 12)**: Depends on Foundation (independent execution pipeline feature)
- **US11 (Phase 13)**: Depends on US1 + US4 (needs sandbox with process.env)
- **US12 (Phase 14)**: Depends on US1 (extends transformer)
- **US13 (Phase 15)**: Depends on Foundation + US1 (extends layout)
- **US14 (Phase 16)**: Depends on US1 (extends transformer)
- **Polish (Phase 17)**: Depends on all desired user stories being complete

### User Story Independence

- **US1**: Foundational — all other stories build on this
- **US5, US6, US7, US8, US10, US11, US12, US13, US14**: Can be implemented in any order after their dependencies are met
- **US9**: Requires US7's settings panel creation

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:
- **Phase 1**: T003, T004, T005, T006 all parallel
- **Phase 2**: T009, T010 parallel
- **Phase 7**: T038, T039 parallel
- **Phase 8**: T045 parallel with other story work
- **Phase 9**: T050 parallel with other story work
- **Phase 12**: T063 parallel with other story work
- **Phase 13**: T068 parallel with other story work
- **Phase 17**: T082, T083, T086 parallel

After Phase 6 (US4) completes, US5 through US14 can proceed largely in parallel (respecting individual dependencies above).

---

## Parallel Example: Post-Foundation

```bash
# After Phase 6 (US4) completes, these can run in parallel:
Stream A: US5 (NPM Packages) — T038..T044
Stream B: US6 (Snippets) — T045..T049
Stream C: US7 (Themes) + US9 (Editor Settings) — T050..T062
Stream D: US8 (Magic Comments) + US14 (Loop Protection) — T055..T057, T079..T081
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundation (T007-T014)
3. Complete Phase 3: US1 — Core execution (T015-T023)
4. Complete Phase 4: US2 — Tabs (T024-T029)
5. Complete Phase 5: US3 — TypeScript (T030-T033)
6. Complete Phase 6: US4 — Node.js + Browser APIs (T034-T037)
7. **STOP and VALIDATE**: Basic playground is fully functional
8. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundation → Shell ready
2. US1 → Core playground works (MVP!)
3. US2 → Multi-tab support
4. US3 → TypeScript support
5. US4 → Full API access
6. US5-US8 → P2 features (NPM, snippets, themes, magic comments)
7. US9-US14 → P3 features (settings, formatting, env vars, proposals, layout, loop protection)
8. Polish → Menu, session restore, hardening

Each story adds value without breaking previous stories.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable after its dependencies
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 87 tasks across 17 phases
