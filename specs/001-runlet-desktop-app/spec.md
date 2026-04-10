# Feature Specification: Runlet Desktop App

**Feature Branch**: `001-runlet-desktop-app`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "I want to build a desktop app that is called runlet it's basically the same as runjs but for free I want you to look at all the features and do it"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write and Instantly See Code Results (Priority: P1)

A developer opens Runlet and starts typing JavaScript or TypeScript code in the editor pane. As they type, the output pane on the right immediately displays the evaluated result of each expression, line by line. The developer can see what their code does without manually triggering execution.

**Why this priority**: This is the core value proposition of Runlet — instant feedback while writing code. Without this, there is no product.

**Independent Test**: Can be fully tested by opening the app, typing `const x = 2 + 2` and verifying `4` appears in the output pane. Delivers immediate value as a code playground.

**Acceptance Scenarios**:

1. **Given** the app is open with an empty editor, **When** a user types `1 + 1`, **Then** `2` is displayed in the output pane aligned with the corresponding line.
2. **Given** auto-run is enabled, **When** the user modifies existing code, **Then** the output updates automatically within a short delay after the user stops typing.
3. **Given** auto-run is disabled, **When** the user clicks the "Run" button, **Then** the code executes and results appear in the output pane.
4. **Given** code that produces an error, **When** it is executed, **Then** a clear, readable error message is shown in the output pane on the relevant line.

---

### User Story 2 - Work with Multiple Tabs (Priority: P1)

A developer works on multiple code experiments simultaneously by using tabs. They can create new tabs, switch between them, close tabs, and optionally rename them. Each tab maintains its own independent code and output state.

**Why this priority**: Tabs are fundamental to productivity — developers need to work on multiple snippets side by side without losing context.

**Independent Test**: Can be tested by creating 3 tabs with different code, switching between them and verifying each retains its code and output independently.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user clicks the "new tab" button, **Then** a new empty editor tab opens.
2. **Given** multiple tabs are open, **When** the user switches between tabs, **Then** each tab retains its own code and output.
3. **Given** a tab with code, **When** the user right-clicks the tab and selects "Edit Tab Title", **Then** they can provide a custom tab name.
4. **Given** the "Confirm close" setting is enabled, **When** the user closes a tab, **Then** a confirmation dialog appears before the tab is removed.

---

### User Story 3 - Write and Run TypeScript (Priority: P1)

A developer writes TypeScript code in the editor with full type support. The app transpiles TypeScript before execution. The developer gets type checking, autocomplete suggestions, hover info with type documentation, and inline error/warning indicators.

**Why this priority**: TypeScript support is a key differentiator from browser consoles and basic REPLs, and is expected by modern JavaScript developers.

**Independent Test**: Can be tested by typing `const greet = (name: string): string => 'Hello ' + name; greet('World')` and seeing `'Hello World'` in output, with autocomplete and type hover working.

**Acceptance Scenarios**:

1. **Given** TypeScript is enabled in settings, **When** the user writes TypeScript code, **Then** the code compiles and executes correctly.
2. **Given** TypeScript code with a type error, **When** linting is enabled, **Then** inline error indicators appear in the editor.
3. **Given** the user hovers over a symbol, **When** hover info is enabled, **Then** type information and documentation are shown in a tooltip.
4. **Given** the user is typing, **When** autocomplete is enabled, **Then** relevant code suggestions appear.

---

### User Story 4 - Access Node.js and Browser APIs (Priority: P1)

A developer can use both Node.js built-in modules (e.g., `fs`, `path`, `crypto`) and browser/web APIs (e.g., DOM, Fetch, Web Audio) in the same environment. This hybrid runtime gives maximum flexibility for prototyping.

**Why this priority**: The hybrid Node.js + browser API environment is what makes Runlet more versatile than either the Node REPL or Chrome console alone.

**Independent Test**: Can be tested by running `require('os').hostname()` (Node.js) and `fetch('https://api.github.com')` (browser API) in the same tab.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the user writes `require('path').join('a', 'b')`, **Then** the output shows the joined path.
2. **Given** the editor is open, **When** the user uses the Fetch API, **Then** the request executes and the response is shown.
3. **Given** the editor is open, **When** the user accesses DOM APIs, **Then** the APIs are available and functional.

---

### User Story 5 - Install and Use NPM Packages (Priority: P2)

A developer opens the NPM Packages tool, searches for a package by name, installs it, and then imports it in their code. They can also specify a particular package version and remove packages they no longer need.

**Why this priority**: Being able to experiment with third-party libraries is a major use case for a playground app, enabling rapid prototyping with real libraries.

**Independent Test**: Can be tested by opening NPM packages, searching for `lodash`, installing it, then running `const _ = require('lodash'); _.chunk([1,2,3,4], 2)` and seeing `[[1,2],[3,4]]`.

**Acceptance Scenarios**:

1. **Given** the NPM Packages window is open, **When** the user types a package name in the search box, **Then** matching packages from the NPM registry are listed.
2. **Given** search results are shown, **When** the user clicks "Add" next to a package, **Then** the package is installed and available for import.
3. **Given** an installed package, **When** the user writes an import/require statement, **Then** the package is usable in code.
4. **Given** an installed package, **When** the user chooses to remove it, **Then** the package is uninstalled and no longer available.
5. **Given** the user searches with a version specifier (e.g., `lodash@4.17.0`), **When** they install it, **Then** that specific version is installed.

---

### User Story 6 - Save and Reuse Code Snippets (Priority: P2)

A developer saves commonly used code as named snippets with descriptions. They can later insert snippets into the editor via the snippets window or through autocomplete. They can also import/export snippets as JSON files for sharing.

**Why this priority**: A snippet library improves long-term productivity, letting developers build up a personal code reference over time.

**Independent Test**: Can be tested by creating a snippet called "fetchTemplate" with body code, then typing "fetchTemplate" in the editor and seeing it as an autocomplete suggestion that inserts the full snippet.

**Acceptance Scenarios**:

1. **Given** the Snippets window is open, **When** the user clicks the "create snippet" button, **Then** a form appears for snippet name, description, and body.
2. **Given** code is selected in the editor, **When** the user creates a snippet from the context menu, **Then** the selected code becomes the snippet body.
3. **Given** a saved snippet exists, **When** the user types the snippet name in the editor, **Then** it appears as an autocomplete suggestion.
4. **Given** saved snippets, **When** the user exports them, **Then** a JSON file is saved to disk.
5. **Given** a snippets JSON file, **When** the user imports it, **Then** the snippets are added to their library.

---

### User Story 7 - Customize Appearance and Themes (Priority: P2)

A developer personalizes the app's visual appearance including theme (color palette), font family, font size, line numbers, active line highlighting, invisible characters, and output syntax highlighting.

**Why this priority**: Visual customization is important for developer comfort and extended use, especially given individual preferences around dark/light themes and fonts.

**Independent Test**: Can be tested by opening settings, changing the theme, font, and font size, and verifying the editor updates immediately.

**Acceptance Scenarios**:

1. **Given** the Settings > Appearance tab is open, **When** the user selects a different theme, **Then** the editor and output pane color scheme updates immediately.
2. **Given** the Appearance settings, **When** the user changes the font or font size, **Then** the editor text reflects the new font/size.
3. **Given** the "Line Numbers" toggle, **When** toggled on, **Then** line numbers appear in both editor and output panes.
4. **Given** the "Output Highlighting" toggle, **When** toggled on, **Then** output results have syntax highlighting.

---

### User Story 8 - Use Magic Comments to Inspect Values (Priority: P2)

A developer places a special comment marker (magic comment) next to any expression in their code to see its evaluated value inline. This enables inspecting intermediate values anywhere in the code, not just top-level expression results.

**Why this priority**: Magic comments provide fine-grained inspection capabilities beyond just line-by-line output, which is valuable for debugging and learning.

**Independent Test**: Can be tested by writing `const arr = [1,2,3]; arr.map(x => x * 2); /*?*/` and seeing the mapped array value displayed inline.

**Acceptance Scenarios**:

1. **Given** code with a magic comment marker next to an expression, **When** the code runs, **Then** the evaluated value of that expression is displayed inline.
2. **Given** multiple magic comments in different locations, **When** the code runs, **Then** each expression with a magic comment shows its value independently.

---

### User Story 9 - Configure Editor Behavior (Priority: P3)

A developer adjusts editor behavior settings such as auto-run toggle, line wrapping, Vim keybindings, auto-close brackets, matched line output alignment, scrolling mode (standard/synchronous/automatic), autocomplete, linting, hover info, and function signatures.

**Why this priority**: Power users need fine-grained control over editor behavior, but reasonable defaults allow the app to be usable without changing any settings.

**Independent Test**: Can be tested by toggling individual settings (e.g., Vim keys, line wrap) and verifying each takes effect immediately.

**Acceptance Scenarios**:

1. **Given** Settings > General is open, **When** the user toggles "Auto-Run" off, **Then** a "Run" button appears and code no longer executes on keystroke.
2. **Given** Settings > General, **When** the user enables "Vim Keys", **Then** the editor uses Vim keybindings.
3. **Given** Settings > General, **When** the user changes scrolling mode to "Synchronous", **Then** editor and output panes scroll together.
4. **Given** Settings > General, **When** the user toggles "Linting" on, **Then** TypeScript analysis errors and warnings appear inline.
5. **Given** Settings > General, **When** the user enables "Signatures", **Then** function signature tooltips appear while writing function calls.

---

### User Story 10 - Configure Code Formatting (Priority: P3)

A developer formats their code automatically or on-demand using an integrated code formatter. They can configure formatting options (e.g., indentation, semicolons, quotes) and toggle auto-format on run.

**Why this priority**: Code formatting improves readability, and auto-formatting on run keeps code tidy automatically.

**Independent Test**: Can be tested by writing poorly formatted code, triggering "Format Code", and verifying the code is reformatted using the configured style.

**Acceptance Scenarios**:

1. **Given** unformatted code in the editor, **When** the user triggers "Format Code" from the action menu, **Then** the code is formatted according to the configured options.
2. **Given** auto-format is enabled, **When** the user manually runs the code, **Then** the code is formatted before execution.
3. **Given** the Formatting settings, **When** the user changes formatting options, **Then** subsequent formatting operations use the new settings.

---

### User Story 11 - Set Environment Variables (Priority: P3)

A developer defines environment variables through a dedicated tool window. These variables are then accessible in code via `process.env`.

**Why this priority**: Environment variables allow developers to simulate real-world configurations and keep sensitive values out of code.

**Independent Test**: Can be tested by adding an environment variable `API_KEY=test123`, writing `process.env.API_KEY`, and seeing `'test123'` in output.

**Acceptance Scenarios**:

1. **Given** the Environment Variables window is open, **When** the user enters a key-value pair and clicks "Add", **Then** the variable is saved.
2. **Given** a saved environment variable, **When** the user writes `process.env.MY_VAR` in code, **Then** the stored value is returned.
3. **Given** existing environment variables, **When** the user edits a value and clicks "Save", **Then** the updated value is used in subsequent code runs.

---

### User Story 12 - Enable Experimental JavaScript Proposals (Priority: P3)

A developer enables support for experimental JavaScript syntax proposals such as pipeline operator, decorators, partial application, throw expressions, do expressions, function.sent, and regexp modifiers through build settings.

**Why this priority**: Supporting cutting-edge syntax proposals appeals to advanced users and educators exploring future JavaScript features.

**Independent Test**: Can be tested by enabling the pipeline operator proposal, writing code with `|>` syntax, and seeing correct output.

**Acceptance Scenarios**:

1. **Given** Settings > Build > Proposals, **When** the user enables "Pipeline Operator", **Then** code using `|>` syntax compiles and runs correctly.
2. **Given** Settings > Build > Proposals, **When** the user enables "Decorators", **Then** decorator syntax is supported in code.
3. **Given** an experimental proposal is disabled, **When** the user writes code using that syntax, **Then** a clear error message indicates the feature is not enabled.

---

### User Story 13 - Adjust Layout and View Options (Priority: P3)

A developer customizes the window layout — switching between horizontal and vertical pane orientation, toggling the output pane visibility, hiding/showing the activity bar and tab bar, and resizing panes by dragging the divider.

**Why this priority**: Layout flexibility allows the app to work well on different screen sizes and developer preferences.

**Independent Test**: Can be tested by switching layout from horizontal to vertical via the View menu and verifying pane orientation changes.

**Acceptance Scenarios**:

1. **Given** the View menu, **When** the user switches layout to "Vertical", **Then** the editor and output panes stack vertically.
2. **Given** the View menu, **When** the user toggles the output pane off, **Then** only the editor pane is visible.
3. **Given** the divider between panes, **When** the user drags it, **Then** the pane widths/heights adjust accordingly.

---

### User Story 14 - Loop Protection (Priority: P3)

A developer accidentally writes an infinite loop. The app detects the loop after a configurable iteration threshold and halts execution, preventing the app from freezing.

**Why this priority**: Loop protection prevents common mistakes from hanging the entire application, which is critical for a good user experience.

**Independent Test**: Can be tested by writing `while(true) {}` and verifying execution is halted with an appropriate message rather than freezing.

**Acceptance Scenarios**:

1. **Given** loop protection is enabled with default threshold, **When** a loop exceeds 2000 iterations, **Then** execution is halted with a clear message.
2. **Given** loop protection is disabled, **When** an infinite loop runs, **Then** the user can still stop execution manually.

---

### Edge Cases

- What happens when code execution takes a very long time? The app should remain responsive and allow cancellation.
- What happens when an NPM package installation fails due to network issues? A clear error message should be shown.
- What happens when the user closes the app with unsaved tabs? The app should restore open tabs on next launch.
- What happens when code produces extremely large output? The output should be truncated or virtualized to prevent performance degradation.
- What happens when multiple tabs run code simultaneously? Each tab's execution should be independent and not interfere with others.
- What happens when the user tries to import an uninstalled package? A clear error message should guide the user to install it first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a split-pane interface with a code editor pane and an output/results pane.
- **FR-002**: System MUST execute JavaScript code and display per-line results in the output pane.
- **FR-003**: System MUST support auto-run mode where code executes automatically as the user types, with a debounce delay.
- **FR-004**: System MUST support manual-run mode where code executes only when a "Run" button is clicked.
- **FR-005**: System MUST support TypeScript compilation and execution.
- **FR-006**: System MUST support JSX syntax transformation.
- **FR-007**: System MUST provide a tabbed interface for working with multiple independent code documents.
- **FR-008**: System MUST allow users to create, close, rename, and switch between tabs.
- **FR-009**: System MUST provide access to Node.js built-in modules and APIs.
- **FR-010**: System MUST provide access to browser/web APIs including DOM, Fetch, and Web Audio.
- **FR-011**: System MUST provide an NPM package manager that allows searching, installing, version-pinning, and removing packages.
- **FR-012**: System MUST allow importing installed NPM packages in code via `require` or `import`.
- **FR-013**: System MUST provide a snippet library where users can create, edit, delete, and organize code snippets with name, description, and body.
- **FR-014**: System MUST support inserting snippets via the snippets window and via editor autocomplete.
- **FR-015**: System MUST support importing and exporting snippets as JSON files.
- **FR-016**: System MUST provide code autocomplete suggestions while typing.
- **FR-017**: System MUST provide hover info showing type information and documentation for symbols.
- **FR-018**: System MUST provide inline linting with error and warning indicators.
- **FR-019**: System MUST provide function signature help tooltips.
- **FR-020**: System MUST support magic comments that display inline evaluation results for any expression.
- **FR-021**: System MUST provide a preferences/settings interface with tabs for General, Build, Formatting, Appearance, and Advanced.
- **FR-022**: System MUST support multiple color themes.
- **FR-023**: System MUST support configurable font family and font size.
- **FR-024**: System MUST support toggleable line numbers, invisible characters, active line highlighting, tab bar visibility, output syntax highlighting, and activity bar visibility.
- **FR-025**: System MUST provide code formatting with configurable options (indentation, semicolons, quote style, etc.).
- **FR-026**: System MUST support auto-format triggered on manual code execution.
- **FR-027**: System MUST support environment variables that are accessible via `process.env` in user code.
- **FR-028**: System MUST provide an environment variable management interface for adding, editing, and deleting variables.
- **FR-029**: System MUST support experimental JavaScript proposal syntax including pipeline operator, decorators, partial application, throw expressions, do expressions, function.sent, and regexp modifiers.
- **FR-030**: System MUST support configurable editor behavior: line wrap, Vim keybindings, auto-close brackets, and matched line output.
- **FR-031**: System MUST support configurable scrolling modes: standard, synchronous (editor and output scroll together), and automatic (output auto-scrolls).
- **FR-032**: System MUST provide switchable horizontal and vertical pane layouts.
- **FR-033**: System MUST allow resizing panes by dragging the divider.
- **FR-034**: System MUST provide toggleable output pane visibility.
- **FR-035**: System MUST provide loop protection that halts execution when a loop exceeds a configurable iteration threshold (default: 2000).
- **FR-036**: System MUST display the first line of code (or a custom title) as the tab title.
- **FR-037**: System MUST provide an activity bar with quick access to run/stop code, snippets, settings, and other tools.
- **FR-038**: System MUST support expression results mode where per-line top-level expression values are shown.
- **FR-039**: System MUST support a "Show Undefined" toggle to control whether undefined results are displayed.
- **FR-040**: System MUST support a confirm-close dialog for tabs to prevent accidental data loss.
- **FR-041**: System MUST be a cross-platform desktop application available on macOS, Windows, and Linux.
- **FR-042**: System MUST be free to use with no license fees or paywalls.

### Key Entities

- **Tab**: Represents a single code document with its own editor content, output results, execution state, and optional custom title.
- **Snippet**: A reusable code template with a name, description, and body. Can be inserted into the editor and shared via import/export.
- **NPM Package**: A third-party library installed from the NPM registry, available for import in user code. Includes name and version.
- **Environment Variable**: A key-value pair configured by the user, accessible in code via `process.env`.
- **Settings/Preferences**: The collection of all user-configurable options spanning general behavior, build configuration, formatting, appearance, and advanced features.
- **Theme**: A named color palette that controls the visual appearance of the editor and output panes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can write JavaScript or TypeScript and see output results within 1 second of typing (in auto-run mode).
- **SC-002**: Users can install an NPM package and use it in code within 30 seconds from search to first import.
- **SC-003**: The app launches and is ready for input within 5 seconds on standard hardware.
- **SC-004**: Users can create, save, and reuse 50+ snippets without noticeable performance impact.
- **SC-005**: The app runs stably on macOS, Windows, and Linux without platform-specific crashes.
- **SC-006**: Users can work with 20+ simultaneous tabs without significant memory degradation.
- **SC-007**: Code formatting completes within 1 second for files up to 1000 lines.
- **SC-008**: Loop protection triggers and halts execution without freezing the app.
- **SC-009**: The app remains fully functional with no license costs or feature restrictions — all features are free and open.
- **SC-010**: 90% of users familiar with code editors can use core features (write code, see output, manage tabs) on first use without documentation.

## Assumptions

- The app will be built as a cross-platform desktop application (macOS, Windows, Linux).
- The app will be open-source and completely free to use — no freemium model, no paid tiers.
- JavaScript/TypeScript execution will use a Node.js runtime embedded or bundled with the application.
- The code editor component will leverage an existing open-source editor library for syntax highlighting, autocomplete, and editing features.
- Code formatting will be powered by an embedded code formatter.
- NPM packages will be installed to a local directory managed by the application, not the user's global npm config.
- Users are developers or students with basic familiarity with JavaScript.
- Internet connectivity is required for NPM package installation and search, but the app works offline for all other features.
- Tab state and settings will be persisted between app sessions (auto-saved to local storage/filesystem).
- Initial release targets x64 and ARM64 architectures.
- AI chat is out of scope for the initial release (RunJS offers this as a paid feature tied to OpenAI API keys).
