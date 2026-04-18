import * as monaco from 'monaco-editor';

export interface ThemeDef {
  id: string;
  name: string;
  type: 'dark' | 'light';
  data: monaco.editor.IStandaloneThemeData;
}

const darkTheme: ThemeDef = {
  id: 'runlet-dark',
  name: 'Dark',
  type: 'dark',
  data: {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
    },
  },
};

const lightTheme: ThemeDef = {
  id: 'runlet-light',
  name: 'Light',
  type: 'light',
  data: {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#000000',
    },
  },
};

const monokaiTheme: ThemeDef = {
  id: 'runlet-monokai',
  name: 'Monokai',
  type: 'dark',
  data: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
      { token: 'identifier', foreground: 'a6e22e' },
      { token: 'delimiter', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editor.selectionBackground': '#49483e',
      'editorCursor.foreground': '#f8f8f0',
    },
  },
};

const solarizedDarkTheme: ThemeDef = {
  id: 'runlet-solarized-dark',
  name: 'Solarized Dark',
  type: 'dark',
  data: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'keyword', foreground: '859900' },
      { token: 'type', foreground: 'b58900' },
    ],
    colors: {
      'editor.background': '#002b36',
      'editor.foreground': '#839496',
      'editor.lineHighlightBackground': '#073642',
      'editor.selectionBackground': '#073642',
    },
  },
};

const solarizedLightTheme: ThemeDef = {
  id: 'runlet-solarized-light',
  name: 'Solarized Light',
  type: 'light',
  data: {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'keyword', foreground: '859900' },
      { token: 'type', foreground: 'b58900' },
    ],
    colors: {
      'editor.background': '#fdf6e3',
      'editor.foreground': '#657b83',
      'editor.lineHighlightBackground': '#eee8d5',
      'editor.selectionBackground': '#eee8d5',
    },
  },
};

const draculaTheme: ThemeDef = {
  id: 'runlet-dracula',
  name: 'Dracula',
  type: 'dark',
  data: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
      { token: 'identifier', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editor.selectionBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f0',
    },
  },
};

const nordTheme: ThemeDef = {
  id: 'runlet-nord',
  name: 'Nord',
  type: 'dark',
  data: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'keyword', foreground: '81a1c1' },
      { token: 'type', foreground: '8fbcbb' },
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#d8dee9',
      'editor.lineHighlightBackground': '#3b4252',
      'editor.selectionBackground': '#434c5e',
    },
  },
};

export const themes: ThemeDef[] = [
  darkTheme,
  lightTheme,
  monokaiTheme,
  solarizedDarkTheme,
  solarizedLightTheme,
  draculaTheme,
  nordTheme,
];

// Map from settings theme name to Monaco theme id
const themeNameMap: Record<string, string> = {
  dark: 'runlet-dark',
  light: 'runlet-light',
  monokai: 'runlet-monokai',
  'solarized-dark': 'runlet-solarized-dark',
  'solarized-light': 'runlet-solarized-light',
  dracula: 'runlet-dracula',
  nord: 'runlet-nord',
};

let registered = false;

export function registerThemes(): void {
  if (registered) return;
  registered = true;
  for (const theme of themes) {
    monaco.editor.defineTheme(theme.id, theme.data);
  }
}

export function getMonacoThemeId(settingsTheme: string): string {
  return themeNameMap[settingsTheme] ?? 'vs-dark';
}

export function getThemeBackgroundColor(settingsTheme: string): string {
  const theme = themes.find((t) => themeNameMap[settingsTheme] === t.id);
  return theme?.data.colors?.['editor.background'] ?? '#1e1e1e';
}
