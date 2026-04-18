import React, { useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { initVimMode, VimMode } from 'monaco-vim';
import type { Snippet, OutputResult } from '../../shared/types';

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
  vimKeys?: boolean;
  snippets?: Snippet[];
  onCreateSnippet?: (code: string) => void;
  magicResults?: OutputResult[];
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
  vimKeys = false,
  snippets = [],
  onCreateSnippet,
  magicResults = [],
}: EditorProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<VimMode | null>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);
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

  // Vim mode
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (vimKeys) {
      if (!vimModeRef.current) {
        // Create status bar element if not present
        if (!vimStatusRef.current) {
          vimStatusRef.current = document.createElement('div');
          vimStatusRef.current.style.cssText =
            'position:absolute;bottom:0;left:0;right:0;height:20px;background:var(--bg-surface);color:var(--text-secondary);font-family:var(--font-mono);font-size:11px;padding:0 8px;display:flex;align-items:center;z-index:10;border-top:1px solid var(--border-subtle);';
          containerRef.current?.style.setProperty('padding-bottom', '20px');
          containerRef.current?.appendChild(vimStatusRef.current);
        }
        vimModeRef.current = initVimMode(editor, vimStatusRef.current);
      }
    } else {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
      if (vimStatusRef.current) {
        vimStatusRef.current.remove();
        vimStatusRef.current = null;
        containerRef.current?.style.removeProperty('padding-bottom');
      }
    }

    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
      if (vimStatusRef.current) {
        vimStatusRef.current.remove();
        vimStatusRef.current = null;
      }
    };
  }, [vimKeys]);

  // Update theme
  useEffect(() => {
    monaco.editor.setTheme(theme);
  }, [theme]);

  // Render magic comment results as inline decorations
  const decorationsRef = useRef<string[]>([]);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const magicItems = magicResults.filter((r) => r.isMagic);
    if (magicItems.length === 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    const decorations: monaco.editor.IModelDeltaDecoration[] = magicItems.map((r) => ({
      range: new monaco.Range(r.line, 1, r.line, 1),
      options: {
        after: {
          content: ` => ${r.displayValue}`,
          inlineClassName: 'magic-comment-decoration',
        },
        isWholeLine: true,
      },
    }));

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
  }, [magicResults]);

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
