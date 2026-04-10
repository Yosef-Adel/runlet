# IPC Contracts: Main Process ↔ Renderer Process

**Feature**: 001-runlet-desktop-app  
**Date**: 2026-04-10

Runlet is an Electron desktop app. All communication between the renderer (UI) and main (Node.js) processes uses Electron's IPC mechanism via a preload bridge. These contracts define the interface.

---

## Code Execution

### `execute-code`

Run user code and return per-line results.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "execute-code",
  "payload": {
    "code": "string",
    "language": "javascript | typescript",
    "settings": {
      "loopProtection": true,
      "loopThreshold": 2000,
      "expressionResults": true,
      "showUndefined": false,
      "proposals": {
        "pipeline": false,
        "decorators": false,
        "partialApplication": false,
        "throwExpressions": false,
        "doExpressions": false,
        "functionSent": false,
        "regexpModifiers": false
      }
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "line": 1,
      "value": "4",
      "type": "number",
      "displayValue": "4",
      "isMagic": false,
      "isError": false,
      "errorMessage": null
    }
  ],
  "consoleOutput": [
    { "method": "log", "args": ["hello"], "line": 3 }
  ],
  "executionTime": 12
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "message": "ReferenceError: x is not defined",
    "line": 5,
    "column": 3,
    "stack": "..."
  }
}
```

### `cancel-execution`

Cancel a running code execution.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "cancel-execution"
}
```

**Response**:
```json
{
  "cancelled": true
}
```

---

## NPM Package Management

### `npm-search`

Search the NPM registry for packages.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "npm-search",
  "payload": {
    "query": "lodash",
    "limit": 20
  }
}
```

**Response**:
```json
{
  "results": [
    {
      "name": "lodash",
      "version": "4.17.21",
      "description": "Lodash modular utilities.",
      "keywords": ["utility"]
    }
  ]
}
```

### `npm-install`

Install an NPM package to the local cache.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "npm-install",
  "payload": {
    "name": "lodash",
    "version": "4.17.21"
  }
}
```

**Progress event** (streamed):
```json
{
  "channel": "npm-install-progress",
  "payload": {
    "name": "lodash",
    "status": "downloading | installing | complete | error",
    "progress": 0.75,
    "message": "Installing lodash@4.17.21..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "package": {
    "name": "lodash",
    "version": "4.17.21",
    "size": 1453200
  }
}
```

### `npm-uninstall`

Remove an installed NPM package.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "npm-uninstall",
  "payload": {
    "name": "lodash"
  }
}
```

**Response**:
```json
{
  "success": true
}
```

### `npm-list`

List all installed packages.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "npm-list"
}
```

**Response**:
```json
{
  "packages": [
    {
      "name": "lodash",
      "version": "4.17.21",
      "installedAt": "2026-04-10T12:00:00Z",
      "size": 1453200
    }
  ]
}
```

---

## Code Formatting

### `format-code`

Format code using Prettier.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "format-code",
  "payload": {
    "code": "const x=1+2",
    "language": "typescript",
    "options": {
      "tabWidth": 2,
      "useTabs": false,
      "semi": true,
      "singleQuote": false,
      "trailingComma": "es5"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "formatted": "const x = 1 + 2;\n"
}
```

---

## Settings & Persistence

### `settings-load`

Load all settings from disk.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "settings-load" }`  
**Response**: Full settings object (see data-model.md Settings entity).

### `settings-save`

Persist settings to disk.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "settings-save",
  "payload": { "...full settings object..." }
}
```

**Response**: `{ "success": true }`

### `tabs-load`

Load saved tab state (session restore).

**Direction**: Renderer → Main  
**Request**: `{ "channel": "tabs-load" }`  
**Response**: Array of Tab objects (see data-model.md).

### `tabs-save`

Persist current tab state.

**Direction**: Renderer → Main  
**Request**:
```json
{
  "channel": "tabs-save",
  "payload": { "tabs": [ "...array of tab objects..." ] }
}
```

**Response**: `{ "success": true }`

---

## Snippets

### `snippets-load`

Load all snippets from disk.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "snippets-load" }`  
**Response**: `{ "snippets": [ ...Snippet objects... ] }`

### `snippets-save`

Persist all snippets to disk.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "snippets-save", "payload": { "snippets": [...] } }`  
**Response**: `{ "success": true }`

### `snippets-export`

Export snippets to a user-chosen file location.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "snippets-export", "payload": { "snippets": [...] } }`  
**Response**: `{ "success": true, "path": "/Users/.../snippets.json" }` (after native file dialog)

### `snippets-import`

Import snippets from a user-chosen file.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "snippets-import" }`  
**Response**: `{ "success": true, "snippets": [...] }` (after native file dialog)

---

## Environment Variables

### `env-vars-load`

Load environment variables from disk.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "env-vars-load" }`  
**Response**: `{ "variables": [ { "key": "API_KEY", "value": "..." } ] }`

### `env-vars-save`

Persist environment variables to disk.

**Direction**: Renderer → Main  
**Request**: `{ "channel": "env-vars-save", "payload": { "variables": [...] } }`  
**Response**: `{ "success": true }`
