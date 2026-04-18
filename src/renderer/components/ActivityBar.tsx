import React from 'react';
import type { ActivePanel } from '../../shared/types';

export interface ActivityBarProps {
  activePanel: ActivePanel;
  onTogglePanel: (panel: ActivePanel) => void;
  autoRun: boolean;
  onRun?: () => void;
  onFormat?: () => void;
  isRunning?: boolean;
}

// SVG icon components — clean 20×20 line icons
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const FormatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.79 0l-8-4A2 2 0 012 16.76V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z" />
    <polyline points="2.32 6.16 12 11 21.68 6.16" /><line x1="12" y1="22.76" x2="12" y2="11" />
  </svg>
);

const SnippetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const EnvVarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LoadingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const panelButtons: { panel: ActivePanel; icon: React.FC; title: string }[] = [
  { panel: 'npm-packages', icon: PackageIcon, title: 'Packages' },
  { panel: 'snippets', icon: SnippetIcon, title: 'Snippets' },
  { panel: 'env-vars', icon: EnvVarIcon, title: 'Variables' },
  { panel: 'settings', icon: SettingsIcon, title: 'Settings' },
];

function IconButton({
  onClick,
  active,
  title,
  children,
  variant = 'default',
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: variant === 'primary'
          ? 'var(--accent)'
          : active
            ? 'var(--accent-muted)'
            : 'transparent',
        transition: 'all var(--transition-fast)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          const el = e.currentTarget;
          if (variant !== 'primary' && !active) {
            el.style.background = 'var(--border-default)';
            el.style.color = 'var(--text-primary)';
          }
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (variant !== 'primary' && !active) {
          el.style.background = 'transparent';
          el.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {active && variant !== 'primary' && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2,
            height: 20,
            borderRadius: 1,
            background: 'var(--accent)',
          }}
        />
      )}
      {children}
    </button>
  );
}

export default function ActivityBar({
  activePanel,
  onTogglePanel,
  autoRun,
  onRun,
  onFormat,
  isRunning,
}: ActivityBarProps): React.ReactElement {
  return (
    <div
      style={{
        width: 'var(--activity-bar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'var(--space-sm)',
        gap: 'var(--space-xs)',
        flexShrink: 0,
      }}
    >
      {/* Action buttons */}
      {!autoRun && onRun && (
        <IconButton
          onClick={onRun}
          title="Run Code (Ctrl+Enter)"
          variant="primary"
          disabled={isRunning}
        >
          {isRunning ? <LoadingIcon /> : <PlayIcon />}
        </IconButton>
      )}

      {onFormat && (
        <IconButton onClick={onFormat} title="Format Code (Ctrl+Shift+F)">
          <FormatIcon />
        </IconButton>
      )}

      {(onRun || onFormat) && (
        <div style={{
          width: 24,
          height: 1,
          background: 'var(--border-default)',
          margin: '4px 0',
        }} />
      )}

      {/* Panel buttons */}
      {panelButtons.map((btn) => {
        const Icon = btn.icon;
        return (
          <IconButton
            key={btn.panel}
            onClick={() => onTogglePanel(btn.panel)}
            active={activePanel === btn.panel}
            title={btn.title}
          >
            <Icon />
          </IconButton>
        );
      })}
    </div>
  );
}
