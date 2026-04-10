import type { Settings } from './types';

export const IPC_CHANNELS = {
  EXECUTE_CODE: 'execute-code',
  CANCEL_EXECUTION: 'cancel-execution',
  NPM_SEARCH: 'npm-search',
  NPM_INSTALL: 'npm-install',
  NPM_INSTALL_PROGRESS: 'npm-install-progress',
  NPM_UNINSTALL: 'npm-uninstall',
  NPM_LIST: 'npm-list',
  FORMAT_CODE: 'format-code',
  SETTINGS_LOAD: 'settings-load',
  SETTINGS_SAVE: 'settings-save',
  TABS_LOAD: 'tabs-load',
  TABS_SAVE: 'tabs-save',
  SNIPPETS_LOAD: 'snippets-load',
  SNIPPETS_SAVE: 'snippets-save',
  SNIPPETS_EXPORT: 'snippets-export',
  SNIPPETS_IMPORT: 'snippets-import',
  ENV_VARS_LOAD: 'env-vars-load',
  ENV_VARS_SAVE: 'env-vars-save',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  general: {
    autoRun: true,
    lineWrap: false,
    vimKeys: false,
    closeBrackets: true,
    matchLines: true,
    scrolling: 'standard',
    confirmClose: false,
    autocomplete: true,
    linting: true,
    hoverInfo: true,
    signatures: true,
  },
  build: {
    typescript: true,
    jsx: false,
    proposalPipeline: false,
    proposalDecorators: false,
    proposalPartialApplication: false,
    proposalThrowExpressions: false,
    proposalDoExpressions: false,
    proposalFunctionSent: false,
    proposalRegexpModifiers: false,
  },
  formatting: {
    autoFormat: false,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: 'es5',
  },
  appearance: {
    theme: 'dark',
    fontFamily: 'Fira Code, monospace',
    fontSize: 14,
    lineNumbers: true,
    invisibles: false,
    activeLine: true,
    tabBar: true,
    outputHighlighting: true,
    activityBar: true,
  },
  advanced: {
    expressionResults: true,
    showUndefined: false,
    loopProtection: true,
    loopThreshold: 2000,
  },
};

export const APP_DATA_DIR = '.runlet';
export const SETTINGS_FILE = 'settings.json';
export const TABS_FILE = 'tabs.json';
export const SNIPPETS_FILE = 'snippets.json';
export const ENV_VARS_FILE = 'env-vars.json';
export const PACKAGES_FILE = 'packages.json';
export const PACKAGES_DIR = 'node_modules';

export const EXECUTION_TIMEOUT_MS = 30000;
export const AUTO_RUN_DEBOUNCE_MS = 500;
export const MAX_OUTPUT_LINES = 10000;
