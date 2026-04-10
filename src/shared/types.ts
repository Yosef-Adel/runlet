export interface Tab {
  id: string;
  title: string | null;
  content: string;
  language: 'javascript' | 'typescript';
  output: OutputResult[];
  isRunning: boolean;
  createdAt: number;
  order: number;
}

export interface OutputResult {
  line: number;
  value: string;
  type: string;
  displayValue: string;
  isMagic: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export interface ConsoleEntry {
  method: 'log' | 'error' | 'warn' | 'info' | 'debug';
  args: unknown[];
  line: number | null;
}

export interface ExecutionRequest {
  code: string;
  language: 'javascript' | 'typescript';
  settings: ExecutionSettings;
}

export interface ExecutionSettings {
  loopProtection: boolean;
  loopThreshold: number;
  expressionResults: boolean;
  showUndefined: boolean;
  proposals: ProposalSettings;
}

export interface ProposalSettings {
  pipeline: boolean;
  decorators: boolean;
  partialApplication: boolean;
  throwExpressions: boolean;
  doExpressions: boolean;
  functionSent: boolean;
  regexpModifiers: boolean;
}

export interface ExecutionResponse {
  success: boolean;
  results: OutputResult[];
  consoleOutput: ConsoleEntry[];
  executionTime: number;
}

export interface ExecutionError {
  success: false;
  error: {
    message: string;
    line: number | null;
    column: number | null;
    stack: string;
  };
}

export interface NpmSearchResult {
  name: string;
  version: string;
  description: string;
  keywords: string[];
}

export interface InstalledPackage {
  name: string;
  version: string;
  installedAt: number;
  size: number;
}

export interface NpmInstallProgress {
  name: string;
  status: 'downloading' | 'installing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface Snippet {
  id: string;
  name: string;
  description: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
}

export interface GeneralSettings {
  autoRun: boolean;
  lineWrap: boolean;
  vimKeys: boolean;
  closeBrackets: boolean;
  matchLines: boolean;
  scrolling: 'standard' | 'synchronous' | 'automatic';
  confirmClose: boolean;
  autocomplete: boolean;
  linting: boolean;
  hoverInfo: boolean;
  signatures: boolean;
}

export interface BuildSettings {
  typescript: boolean;
  jsx: boolean;
  proposalPipeline: boolean;
  proposalDecorators: boolean;
  proposalPartialApplication: boolean;
  proposalThrowExpressions: boolean;
  proposalDoExpressions: boolean;
  proposalFunctionSent: boolean;
  proposalRegexpModifiers: boolean;
}

export interface FormattingSettings {
  autoFormat: boolean;
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: 'all' | 'es5' | 'none';
}

export interface AppearanceSettings {
  theme: string;
  fontFamily: string;
  fontSize: number;
  lineNumbers: boolean;
  invisibles: boolean;
  activeLine: boolean;
  tabBar: boolean;
  outputHighlighting: boolean;
  activityBar: boolean;
}

export interface AdvancedSettings {
  expressionResults: boolean;
  showUndefined: boolean;
  loopProtection: boolean;
  loopThreshold: number;
}

export interface Settings {
  general: GeneralSettings;
  build: BuildSettings;
  formatting: FormattingSettings;
  appearance: AppearanceSettings;
  advanced: AdvancedSettings;
}

export type LayoutOrientation = 'horizontal' | 'vertical';

export type ActivePanel = 'none' | 'settings' | 'snippets' | 'npm-packages' | 'env-vars';
