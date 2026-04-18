import React, { useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import type { Snippet } from '../../shared/types';

// Configure Monaco workers for electron-vite
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    switch (label) {
      case 'typescript':
      case 'javascript':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
          { type: 'module' }
        );
      case 'css':
      case 'scss':
      case 'less':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url),
          { type: 'module' }
        );
      case 'html':
      case 'handlebars':
      case 'razor':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url),
          { type: 'module' }
        );
      case 'json':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
          { type: 'module' }
        );
      default:
        return new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          { type: 'module' }
        );
    }
  },
};

// Configure TypeScript/JavaScript language defaults
const tsCompilerOptions: monaco.languages.typescript.CompilerOptions = {
  target: monaco.languages.typescript.ScriptTarget.ES2022,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  allowNonTsExtensions: true,
  allowJs: true,
  checkJs: false,
  strict: false,
  noEmit: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  esModuleInterop: true,
  lib: ['es2022', 'dom', 'dom.iterable'],
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsCompilerOptions);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(tsCompilerOptions);

// Enable diagnostics
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
  noSuggestionDiagnostics: false,
});
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
  noSuggestionDiagnostics: false,
});

// Enable type acquisition for better IntelliSense
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

export interface EditorProps {
  value: string;
  language: 'javascript' | 'typescript';
  onChange: (value: string) => void;
  fontSize?: number;
  fontFamily?: string;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  theme?: string;
  activeLine?: boolean;
  invisibles?: boolean;
  closeBrackets?: boolean;
  autocomplete?: boolean;
  hover?: boolean;
  signatures?: boolean;
  snippets?: Snippet[];
  onCreateSnippet?: (code: string) => void;
}

export default function Editor({
  value,
  language,
  onChange,
  fontSize = 14,
  fontFamily = 'Fira Code, monospace',
  lineNumbers = true,
  wordWrap = false,
  theme = 'vs-dark',
  activeLine = true,
  invisibles = false,
  closeBrackets = true,
  autocomplete = true,
  hover = true,
  signatures = true,
  snippets = [],
  onCreateSnippet,
}: EditorProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Track if value change came from user typing vs external prop change
  const isExternalChange = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme,
      fontSize,
      fontFamily,
      lineNumbers: lineNumbers ? 'on' : 'off',
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: activeLine ? 'all' : 'none',
      renderWhitespace: invisibles ? 'all' : 'none',
      autoClosingBrackets: closeBrackets ? 'always' : 'never',
      quickSuggestions: autocomplete,
      hover: { enabled: hover },
      parameterHints: { enabled: signatures },
      automaticLayout: true,
      tabSize: 2,
      padding: { top: 8, bottom: 8 },
    });

    editor.onDidChangeModelContent(() => {
      if (!isExternalChange.current) {
        onChangeRef.current(editor.getValue());
      }
    });

    // Add "Create Snippet from Selection" context menu action
    if (onCreateSnippet) {
      editor.addAction({
        id: 'create-snippet-from-selection',
        label: 'Create Snippet from Selection',
        contextMenuGroupId: '9_cutcopypaste',
        contextMenuOrder: 10,
        run: (ed) => {
          const selection = ed.getSelection();
          if (selection) {
            const selectedText = ed.getModel()?.getValueInRange(selection);
            if (selectedText) {
              onCreateSnippet(selectedText);
            }
          }
        },
      });
    }

    editorRef.current = editor;

    return () => {
      editor.dispose();
      editorRef.current = null;
    };
    // Only create the editor once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update value from outside
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getValue() !== value) {
      isExternalChange.current = true;
      editor.setValue(value);
      isExternalChange.current = false;
    }
  }, [value]);

  // Update language
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Register snippet completion provider
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);
  useEffect(() => {
    completionDisposableRef.current?.dispose();
    if (snippets.length === 0) return;

    completionDisposableRef.current = monaco.languages.registerCompletionItemProvider(
      language,
      {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: snippets.map((s) => ({
              label: s.name,
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: s.description,
              insertText: s.body,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            })),
          };
        },
      }
    );

    return () => {
      completionDisposableRef.current?.dispose();
    };
  }, [snippets, language]);

  // Update options
  useEffect(() => {
    editorRef.current?.updateOptions({
      fontSize,
      fontFamily,
      lineNumbers: lineNumbers ? 'on' : 'off',
      wordWrap: wordWrap ? 'on' : 'off',
      renderLineHighlight: activeLine ? 'all' : 'none',
      renderWhitespace: invisibles ? 'all' : 'none',
      autoClosingBrackets: closeBrackets ? 'always' : 'never',
      quickSuggestions: autocomplete,
      hover: { enabled: hover },
      parameterHints: { enabled: signatures },
    });
  }, [fontSize, fontFamily, lineNumbers, wordWrap, activeLine, invisibles, closeBrackets, autocomplete, hover, signatures]);

  // Update theme
  useEffect(() => {
    monaco.editor.setTheme(theme);
  }, [theme]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Export for external reference to the editor instance
export function getMonacoInstance(): typeof monaco {
  return monaco;
}
