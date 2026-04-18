import React from 'react';
import type { ActivePanel } from '../../shared/types';

export interface ActivityBarProps {
  activePanel: ActivePanel;
  onTogglePanel: (panel: ActivePanel) => void;
  autoRun: boolean;
  onRun?: () => void;
  isRunning?: boolean;
}

interface ActivityBarButton {
  panel: ActivePanel;
  icon: string;
  title: string;
}

const buttons: ActivityBarButton[] = [
  { panel: 'npm-packages', icon: '📦', title: 'NPM Packages' },
  { panel: 'snippets', icon: '✂️', title: 'Snippets' },
  { panel: 'env-vars', icon: '🔑', title: 'Environment Variables' },
  { panel: 'settings', icon: '⚙️', title: 'Settings' },
];

export default function ActivityBar({
  activePanel,
  onTogglePanel,
  autoRun,
  onRun,
  isRunning,
}: ActivityBarProps): React.ReactElement {
  return (
    <div
      style={{
        width: 48,
        background: '#252526',
        borderRight: '1px solid #3c3c3c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        gap: 2,
      }}
    >
      {/* Run button (only when autoRun is off) */}
      {!autoRun && onRun && (
        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            width: 36,
            height: 36,
            border: 'none',
            borderRadius: 4,
            background: isRunning ? '#3c3c3c' : '#0e639c',
            color: '#fff',
            cursor: isRunning ? 'default' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
          title="Run Code"
        >
          ▶
        </button>
      )}

      {/* Panel toggle buttons */}
      {buttons.map((btn) => (
        <button
          key={btn.panel}
          onClick={() => onTogglePanel(btn.panel)}
          style={{
            width: 36,
            height: 36,
            border: 'none',
            borderRadius: 4,
            background: activePanel === btn.panel ? '#37373d' : 'transparent',
            color: activePanel === btn.panel ? '#fff' : '#969696',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: activePanel === btn.panel ? '2px solid #007acc' : '2px solid transparent',
          }}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
