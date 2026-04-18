import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { themes } from '../../themes';
import type { Settings } from '../../../shared/types';

type SettingsTab = 'general' | 'build' | 'formatting' | 'appearance' | 'advanced';

export default function SettingsPanel(): React.ReactElement {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabStyle = (tab: SettingsTab): React.CSSProperties => ({
    padding: '6px 12px',
    background: activeTab === tab ? '#1e1e1e' : 'transparent',
    color: activeTab === tab ? '#fff' : '#969696',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    borderBottom: activeTab === tab ? '2px solid #007acc' : '2px solid transparent',
  });

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: 13,
    color: '#d4d4d4',
  };

  const selectStyle: React.CSSProperties = {
    background: '#3c3c3c',
    border: '1px solid #555',
    color: '#d4d4d4',
    padding: '3px 6px',
    fontSize: 13,
    borderRadius: 3,
    outline: 'none',
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
    width: 60,
    textAlign: 'right' as const,
  };

  const updateGeneral = (key: string, value: unknown) => {
    updateSettings({ general: { ...settings.general, [key]: value } } as Partial<Settings>);
  };

  const updateBuild = (key: string, value: unknown) => {
    updateSettings({ build: { ...settings.build, [key]: value } } as Partial<Settings>);
  };

  const updateFormatting = (key: string, value: unknown) => {
    updateSettings({ formatting: { ...settings.formatting, [key]: value } } as Partial<Settings>);
  };

  const updateAppearance = (key: string, value: unknown) => {
    updateSettings({ appearance: { ...settings.appearance, [key]: value } } as Partial<Settings>);
  };

  const updateAdvanced = (key: string, value: unknown) => {
    updateSettings({ advanced: { ...settings.advanced, [key]: value } } as Partial<Settings>);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 'none',
        background: checked ? '#0e639c' : '#555',
        cursor: 'pointer',
        position: 'relative',
        padding: 0,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: '#fff',
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          transition: 'left 0.15s',
        }}
      />
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px 0', borderBottom: '1px solid #3c3c3c' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#969696', marginBottom: 6 }}>
          Settings
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['general', 'build', 'formatting', 'appearance', 'advanced'] as SettingsTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div>
            <div style={labelStyle}><span>Auto Run</span><Toggle checked={settings.general.autoRun} onChange={(v) => updateGeneral('autoRun', v)} /></div>
            <div style={labelStyle}><span>Line Wrap</span><Toggle checked={settings.general.lineWrap} onChange={(v) => updateGeneral('lineWrap', v)} /></div>
            <div style={labelStyle}><span>Vim Keys</span><Toggle checked={settings.general.vimKeys} onChange={(v) => updateGeneral('vimKeys', v)} /></div>
            <div style={labelStyle}><span>Close Brackets</span><Toggle checked={settings.general.closeBrackets} onChange={(v) => updateGeneral('closeBrackets', v)} /></div>
            <div style={labelStyle}><span>Match Lines</span><Toggle checked={settings.general.matchLines} onChange={(v) => updateGeneral('matchLines', v)} /></div>
            <div style={labelStyle}>
              <span>Scrolling</span>
              <select value={settings.general.scrolling} onChange={(e) => updateGeneral('scrolling', e.target.value)} style={selectStyle}>
                <option value="standard">Standard</option>
                <option value="synchronous">Synchronous</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div style={labelStyle}><span>Confirm Close</span><Toggle checked={settings.general.confirmClose} onChange={(v) => updateGeneral('confirmClose', v)} /></div>
            <div style={labelStyle}><span>Autocomplete</span><Toggle checked={settings.general.autocomplete} onChange={(v) => updateGeneral('autocomplete', v)} /></div>
            <div style={labelStyle}><span>Linting</span><Toggle checked={settings.general.linting} onChange={(v) => updateGeneral('linting', v)} /></div>
            <div style={labelStyle}><span>Hover Info</span><Toggle checked={settings.general.hoverInfo} onChange={(v) => updateGeneral('hoverInfo', v)} /></div>
            <div style={labelStyle}><span>Signatures</span><Toggle checked={settings.general.signatures} onChange={(v) => updateGeneral('signatures', v)} /></div>
          </div>
        )}

        {/* Build Tab */}
        {activeTab === 'build' && (
          <div>
            <div style={labelStyle}><span>TypeScript</span><Toggle checked={settings.build.typescript} onChange={(v) => updateBuild('typescript', v)} /></div>
            <div style={labelStyle}><span>JSX</span><Toggle checked={settings.build.jsx} onChange={(v) => updateBuild('jsx', v)} /></div>
            <div style={{ fontSize: 11, color: '#969696', padding: '8px 0 4px', textTransform: 'uppercase' }}>Proposals</div>
            <div style={labelStyle}><span>Pipeline Operator</span><Toggle checked={settings.build.proposalPipeline} onChange={(v) => updateBuild('proposalPipeline', v)} /></div>
            <div style={labelStyle}><span>Decorators</span><Toggle checked={settings.build.proposalDecorators} onChange={(v) => updateBuild('proposalDecorators', v)} /></div>
            <div style={labelStyle}><span>Partial Application</span><Toggle checked={settings.build.proposalPartialApplication} onChange={(v) => updateBuild('proposalPartialApplication', v)} /></div>
            <div style={labelStyle}><span>Throw Expressions</span><Toggle checked={settings.build.proposalThrowExpressions} onChange={(v) => updateBuild('proposalThrowExpressions', v)} /></div>
            <div style={labelStyle}><span>Do Expressions</span><Toggle checked={settings.build.proposalDoExpressions} onChange={(v) => updateBuild('proposalDoExpressions', v)} /></div>
            <div style={labelStyle}><span>Function Sent</span><Toggle checked={settings.build.proposalFunctionSent} onChange={(v) => updateBuild('proposalFunctionSent', v)} /></div>
            <div style={labelStyle}><span>Regexp Modifiers</span><Toggle checked={settings.build.proposalRegexpModifiers} onChange={(v) => updateBuild('proposalRegexpModifiers', v)} /></div>
          </div>
        )}

        {/* Formatting Tab */}
        {activeTab === 'formatting' && (
          <div>
            <div style={labelStyle}><span>Auto Format on Run</span><Toggle checked={settings.formatting.autoFormat} onChange={(v) => updateFormatting('autoFormat', v)} /></div>
            <div style={labelStyle}>
              <span>Tab Width</span>
              <input type="number" min={1} max={8} value={settings.formatting.tabWidth} onChange={(e) => updateFormatting('tabWidth', parseInt(e.target.value) || 2)} style={inputStyle} />
            </div>
            <div style={labelStyle}><span>Use Tabs</span><Toggle checked={settings.formatting.useTabs} onChange={(v) => updateFormatting('useTabs', v)} /></div>
            <div style={labelStyle}><span>Semicolons</span><Toggle checked={settings.formatting.semi} onChange={(v) => updateFormatting('semi', v)} /></div>
            <div style={labelStyle}><span>Single Quotes</span><Toggle checked={settings.formatting.singleQuote} onChange={(v) => updateFormatting('singleQuote', v)} /></div>
            <div style={labelStyle}>
              <span>Trailing Comma</span>
              <select value={settings.formatting.trailingComma} onChange={(e) => updateFormatting('trailingComma', e.target.value)} style={selectStyle}>
                <option value="all">All</option>
                <option value="es5">ES5</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div>
            <div style={labelStyle}>
              <span>Theme</span>
              <select value={settings.appearance.theme} onChange={(e) => updateAppearance('theme', e.target.value)} style={selectStyle}>
                {themes.map((t) => (
                  <option key={t.id} value={t.id.replace('runlet-', '')}>{t.name}</option>
                ))}
              </select>
            </div>
            <div style={labelStyle}>
              <span>Font Family</span>
              <input type="text" value={settings.appearance.fontFamily} onChange={(e) => updateAppearance('fontFamily', e.target.value)} style={{ ...inputStyle, width: 140 }} />
            </div>
            <div style={labelStyle}>
              <span>Font Size</span>
              <input type="number" min={8} max={32} value={settings.appearance.fontSize} onChange={(e) => updateAppearance('fontSize', parseInt(e.target.value) || 14)} style={inputStyle} />
            </div>
            <div style={labelStyle}><span>Line Numbers</span><Toggle checked={settings.appearance.lineNumbers} onChange={(v) => updateAppearance('lineNumbers', v)} /></div>
            <div style={labelStyle}><span>Invisibles</span><Toggle checked={settings.appearance.invisibles} onChange={(v) => updateAppearance('invisibles', v)} /></div>
            <div style={labelStyle}><span>Active Line</span><Toggle checked={settings.appearance.activeLine} onChange={(v) => updateAppearance('activeLine', v)} /></div>
            <div style={labelStyle}><span>Tab Bar</span><Toggle checked={settings.appearance.tabBar} onChange={(v) => updateAppearance('tabBar', v)} /></div>
            <div style={labelStyle}><span>Output Highlighting</span><Toggle checked={settings.appearance.outputHighlighting} onChange={(v) => updateAppearance('outputHighlighting', v)} /></div>
            <div style={labelStyle}><span>Activity Bar</span><Toggle checked={settings.appearance.activityBar} onChange={(v) => updateAppearance('activityBar', v)} /></div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div>
            <div style={labelStyle}><span>Expression Results</span><Toggle checked={settings.advanced.expressionResults} onChange={(v) => updateAdvanced('expressionResults', v)} /></div>
            <div style={labelStyle}><span>Show Undefined</span><Toggle checked={settings.advanced.showUndefined} onChange={(v) => updateAdvanced('showUndefined', v)} /></div>
            <div style={labelStyle}><span>Loop Protection</span><Toggle checked={settings.advanced.loopProtection} onChange={(v) => updateAdvanced('loopProtection', v)} /></div>
            <div style={labelStyle}>
              <span>Loop Threshold</span>
              <input type="number" min={100} max={100000} value={settings.advanced.loopThreshold} onChange={(e) => updateAdvanced('loopThreshold', parseInt(e.target.value) || 2000)} style={inputStyle} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
