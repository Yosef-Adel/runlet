# Data Model: Runlet Desktop App

**Feature**: 001-runlet-desktop-app  
**Date**: 2026-04-10

---

## Entities

### Tab

Represents a single code document with independent editor and execution state.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string (UUID) | Unique identifier | Required, immutable |
| title | string \| null | Custom user-defined title | Optional; if null, derived from first line of code |
| content | string | Source code in the editor | Default: empty string |
| language | enum: "javascript" \| "typescript" | Code language mode | Default: "javascript" |
| output | OutputResult[] | Execution results per line | Regenerated on each run |
| isRunning | boolean | Whether code is currently executing | Default: false |
| createdAt | timestamp | Tab creation time | Auto-set |
| order | number | Position in the tab bar | Unique per session |

**Relationships**: A Tab has many OutputResults. A Tab has one active language mode.

**State transitions**:
- `idle` → `running` (user triggers execution or auto-run fires)
- `running` → `idle` (execution completes or is cancelled)
- `running` → `error` (execution throws an error)
- `error` → `idle` (user modifies code)

---

### OutputResult

Represents the result of a single line/expression evaluation.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| line | number | Source line number (1-based) | Required |
| value | any (serialized) | Evaluated result | Required |
| type | string | JavaScript typeof the value | Required |
| displayValue | string | Formatted string for display | Required |
| isMagic | boolean | Whether triggered by a magic comment | Default: false |
| isError | boolean | Whether this is an error result | Default: false |
| errorMessage | string \| null | Error message if isError | Null unless isError |

---

### Snippet

A reusable code template saved by the user.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string (UUID) | Unique identifier | Required, immutable |
| name | string | Snippet name (used for autocomplete matching) | Required, unique |
| description | string | Human-readable description | Default: empty string |
| body | string | Code content of the snippet | Required |
| createdAt | timestamp | Creation time | Auto-set |
| updatedAt | timestamp | Last modification time | Auto-set on edit |

**Validation rules**:
- `name` must be non-empty and unique across all snippets.
- `body` must be non-empty.

**Import/Export format**: JSON array of `{name, description, body}` objects (without `id` or timestamps).

---

### InstalledPackage

An NPM package installed to the app-managed local directory.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| name | string | Package name (e.g., "lodash") | Required |
| version | string | Installed version (e.g., "4.17.21") | Required |
| installedAt | timestamp | Installation time | Auto-set |
| size | number | Disk size in bytes | Computed after install |

**Validation rules**:
- `name` + `version` is a unique pair.
- Scoped packages (e.g., `@babel/core`) are supported.

---

### EnvironmentVariable

A user-defined key-value pair accessible via `process.env` in code.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| key | string | Variable name | Required, unique, non-empty |
| value | string | Variable value | Required (can be empty string) |

**Validation rules**:
- `key` must be a valid environment variable name (alphanumeric + underscore, cannot start with digit).

---

### Settings

The complete set of user preferences. Persisted as a single JSON file.

#### General Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| autoRun | boolean | true | Execute code automatically on keystroke |
| lineWrap | boolean | false | Wrap long lines in editor |
| vimKeys | boolean | false | Use Vim keybindings |
| closeBrackets | boolean | true | Auto-close brackets |
| matchLines | boolean | true | Align output with corresponding source lines |
| scrolling | enum: "standard" \| "synchronous" \| "automatic" | "standard" | Scrolling behavior between panes |
| confirmClose | boolean | false | Show confirmation dialog before closing a tab |
| autocomplete | boolean | true | Show code suggestions while typing |
| linting | boolean | true | Show inline errors and warnings |
| hoverInfo | boolean | true | Show type info on hover |
| signatures | boolean | true | Show function signature tooltips |

#### Build Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| typescript | boolean | true | Enable TypeScript support |
| jsx | boolean | false | Enable JSX syntax transformation |
| proposalPipeline | boolean | false | Pipeline operator (`\|>`) |
| proposalDecorators | boolean | false | Decorators |
| proposalPartialApplication | boolean | false | Partial application |
| proposalThrowExpressions | boolean | false | Throw expressions |
| proposalDoExpressions | boolean | false | Do expressions |
| proposalFunctionSent | boolean | false | function.sent |
| proposalRegexpModifiers | boolean | false | Regexp modifiers |

#### Formatting Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| autoFormat | boolean | false | Format code on manual run |
| tabWidth | number | 2 | Indentation width |
| useTabs | boolean | false | Use tabs instead of spaces |
| semi | boolean | true | Add semicolons |
| singleQuote | boolean | false | Use single quotes |
| trailingComma | enum: "all" \| "es5" \| "none" | "es5" | Trailing comma style |

#### Appearance Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| theme | string | "dark" | Active theme identifier |
| fontFamily | string | "Fira Code" | Editor font family |
| fontSize | number | 14 | Editor font size in pixels |
| lineNumbers | boolean | true | Show line numbers |
| invisibles | boolean | false | Show invisible characters |
| activeLine | boolean | true | Highlight active line |
| tabBar | boolean | true | Show tab bar always |
| outputHighlighting | boolean | true | Syntax highlight output |
| activityBar | boolean | true | Show activity bar |

#### Advanced Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| expressionResults | boolean | true | Show per-line expression results |
| showUndefined | boolean | false | Display undefined results |
| loopProtection | boolean | true | Halt loops exceeding threshold |
| loopThreshold | number | 2000 | Max loop iterations before halt |

---

### Theme

A named color palette for the editor and output panes.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Theme identifier (e.g., "dark", "light", "monokai") |
| name | string | Display name |
| type | enum: "dark" \| "light" | Base theme type |
| colors | object | Color definitions for editor tokens, background, foreground, etc. |

**Bundled themes**: dark (default), light, monokai, solarized-dark, solarized-light, dracula, nord.

---

## Persistence Strategy

| Data | Storage | Location |
|------|---------|----------|
| Settings | JSON file | `~/.runlet/settings.json` |
| Tabs (session restore) | JSON file | `~/.runlet/tabs.json` |
| Snippets | JSON file | `~/.runlet/snippets.json` |
| Environment variables | JSON file | `~/.runlet/env-vars.json` |
| Installed packages manifest | JSON file | `~/.runlet/packages.json` |
| Installed packages (files) | Directory | `~/.runlet/node_modules/` |
