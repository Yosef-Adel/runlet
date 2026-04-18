import React, { useCallback, useState } from 'react';
import { useAppStore } from './store';
import { useSettings } from './hooks/useSettings';
import { useExecution } from './hooks/useExecution';
import { useTabs } from './hooks/useTabs';
import Editor from './components/Editor';
import Output from './components/Output';
import Divider from './components/Divider';
import TabBar from './components/TabBar';
import ActivityBar from './components/ActivityBar';
import NpmPackages from './components/NpmPackages/NpmPackages';
import Snippets from './components/Snippets/Snippets';
import SettingsPanel from './components/Settings/Settings';
import EnvVars from './components/EnvVars/EnvVars';
import { registerThemes, getMonacoThemeId } from './themes';

// Register custom themes once
registerThemes();

export default function App(): React.ReactElement {
  const outputVisible = useAppStore((s) => s.outputVisible);
  const layout = useAppStore((s) => s.layout);
  const updateTabContent = useAppStore((s) => s.updateTabContent);
  const activePanel = useAppStore((s) => s.activePanel);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const snippets = useAppStore((s) => s.snippets);

  const { tabs, activeTabId, addTab, closeTab, setActiveTab, updateTabTitle } = useTabs();
  const { settings } = useSettings();
  const { execute } = useExecution();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const execState = useAppStore((s) => activeTabId ? s.executionStates[activeTabId] : null) ?? {
    consoleOutput: [],
    error: null,
    executionTime: null,
  };

  const [editorSize, setEditorSize] = useState(50); // percentage

  const handleResize = useCallback((delta: number) => {
    setEditorSize((prev) => {
      const containerSize =
        layout === 'horizontal'
          ? window.innerWidth - 48 // subtract activity bar
          : window.innerHeight - 36; // subtract tab bar
      const percentage = (delta / containerSize) * 100;
      return Math.min(80, Math.max(20, prev + percentage));
    });
  }, [layout]);

  const handleCodeChange = useCallback(
    (value: string) => {
      if (activeTab) {
        updateTabContent(activeTab.id, value);
      }
    },
    [activeTab, updateTabContent]
  );

  const handleRunClick = useCallback(() => {
    execute();
  }, [execute]);

  const handleFormatClick = useCallback(async () => {
    if (!activeTab) return;
    const result = (await window.api.formatCode({
      code: activeTab.content,
      language: activeTab.language,
      options: {
        tabWidth: settings.formatting.tabWidth,
        useTabs: settings.formatting.useTabs,
        semi: settings.formatting.semi,
        singleQuote: settings.formatting.singleQuote,
        trailingComma: settings.formatting.trailingComma,
      },
    })) as { success: boolean; formatted?: string };
    if (result.success && result.formatted) {
      updateTabContent(activeTab.id, result.formatted);
    }
  }, [activeTab, settings.formatting, updateTabContent]);

  const isHorizontal = layout === 'horizontal';
  const flexDirection = isHorizontal ? 'row' as const : 'column' as const;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--bg-base)' }}>
      {/* Activity Bar */}
      <ActivityBar
        activePanel={activePanel}
        onTogglePanel={setActivePanel}
        autoRun={settings.general.autoRun}
        onRun={handleRunClick}
        onFormat={handleFormatClick}
        isRunning={activeTab?.isRunning}
      />

      {/* Side Panel */}
      {activePanel !== 'none' && (
        <div
          style={{
            width: 300,
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          {activePanel === 'npm-packages' && <NpmPackages />}
          {activePanel === 'settings' && <SettingsPanel />}
          {activePanel === 'snippets' && <Snippets />}
          {activePanel === 'env-vars' && <EnvVars />}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tab Bar */}
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelect={setActiveTab}
          onClose={closeTab}
          onAdd={addTab}
          onRename={(id, title) => updateTabTitle(id, title || null)}
          confirmClose={settings.general.confirmClose}
        />

        {/* Editor + Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection, overflow: 'hidden' }}>
          {/* Editor Pane */}
          <div
            style={{
              [isHorizontal ? 'width' : 'height']: `${editorSize}%`,
              overflow: 'hidden',
            }}
          >
            {activeTab && (
              <Editor
                value={activeTab.content}
                language={activeTab.language}
                onChange={handleCodeChange}
                fontSize={settings.appearance.fontSize}
                fontFamily={settings.appearance.fontFamily}
                lineNumbers={settings.appearance.lineNumbers}
                wordWrap={settings.general.lineWrap}
                activeLine={settings.appearance.activeLine}
                invisibles={settings.appearance.invisibles}
                closeBrackets={settings.general.closeBrackets}
                autocomplete={settings.general.autocomplete}
                hover={settings.general.hoverInfo}
                signatures={settings.general.signatures}
                snippets={snippets}
                theme={getMonacoThemeId(settings.appearance.theme)}
                magicResults={activeTab?.output}
              />
            )}
          </div>

          {/* Divider */}
          {outputVisible && (
            <Divider
              direction={isHorizontal ? 'horizontal' : 'vertical'}
              onResize={handleResize}
            />
          )}

          {/* Output Pane */}
          {outputVisible && (
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
              }}
            >
              <Output
                results={activeTab?.output ?? []}
                consoleOutput={execState?.consoleOutput}
                error={execState?.error}
                matchLines={settings.general.matchLines}
                showUndefined={settings.advanced.showUndefined}
                fontSize={settings.appearance.fontSize}
                fontFamily={settings.appearance.fontFamily}
                executionTime={execState?.executionTime ?? undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
