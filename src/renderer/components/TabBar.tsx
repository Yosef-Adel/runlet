import React, { useState, useRef, useCallback } from 'react';
import type { Tab } from '../../shared/types';

export interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, title: string) => void;
  confirmClose?: boolean;
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const JSIcon = () => (
  <span style={{ fontSize: 10, fontWeight: 700, color: '#f7df1e', background: '#323232', borderRadius: 2, padding: '0 3px', lineHeight: '16px', fontFamily: 'var(--font-mono)' }}>JS</span>
);

const TSIcon = () => (
  <span style={{ fontSize: 10, fontWeight: 700, color: '#3178c6', background: '#323232', borderRadius: 2, padding: '0 3px', lineHeight: '16px', fontFamily: 'var(--font-mono)' }}>TS</span>
);

export default function TabBar({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onAdd,
  onRename,
  confirmClose = false,
}: TabBarProps): React.ReactElement {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getTabTitle = (tab: Tab): string => {
    if (tab.title) return tab.title;
    const firstLine = tab.content.split('\n')[0]?.trim();
    return firstLine?.slice(0, 30) || 'Untitled';
  };

  const handleClose = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (tabs.length <= 1) return;
      if (confirmClose) {
        const confirmed = window.confirm('Close this tab?');
        if (!confirmed) return;
      }
      onClose(id);
    },
    [onClose, confirmClose, tabs.length]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  }, []);

  const startEditing = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;
      setEditingTabId(tabId);
      setEditValue(tab.title ?? '');
      setContextMenu(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [tabs]
  );

  const finishEditing = useCallback(() => {
    if (editingTabId) {
      onRename(editingTabId, editValue || '');
      setEditingTabId(null);
    }
  }, [editingTabId, editValue, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') finishEditing();
      if (e.key === 'Escape') setEditingTabId(null);
    },
    [finishEditing]
  );

  return (
    <div
      style={{
        height: 'var(--tab-bar-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        WebkitAppRegion: 'drag' as unknown as string,
      }}
      onClick={() => setContextMenu(null)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
          flex: 1,
          WebkitAppRegion: 'no-drag' as unknown as string,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              onDoubleClick={() => startEditing(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 14px',
                height: '100%',
                background: isActive ? 'var(--bg-base)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                borderBottom: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                borderRight: '1px solid var(--border-subtle)',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {editingTabId === tab.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={finishEditing}
                  onKeyDown={handleKeyDown}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--accent)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    padding: '2px 6px',
                    outline: 'none',
                    width: 120,
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              ) : (
                <>
                  {tab.language === 'typescript' ? <TSIcon /> : <JSIcon />}
                  <span style={{ letterSpacing: '0.01em' }}>{getTabTitle(tab)}</span>
                  {tab.isRunning && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  )}
                  {tabs.length > 1 && (
                    <span
                      onClick={(e) => handleClose(e, tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        padding: 2,
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all var(--transition-fast)',
                        color: 'var(--text-muted)',
                        marginLeft: -2,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.background = 'var(--border-strong)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <CloseIcon />
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Tab Button */}
      <button
        onClick={onAdd}
        style={{
          width: 36,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          flexShrink: 0,
          transition: 'all var(--transition-fast)',
          WebkitAppRegion: 'no-drag' as unknown as string,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--border-default)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        title="New Tab"
      >
        <PlusIcon />
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 0',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 100ms ease',
            minWidth: 160,
          }}
        >
          <div
            onClick={() => startEditing(contextMenu.tabId)}
            style={{
              padding: '7px 16px',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Rename Tab
          </div>
          {tabs.length > 1 && (
            <div
              onClick={() => {
                onClose(contextMenu.tabId);
                setContextMenu(null);
              }}
              style={{
                padding: '7px 16px',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Close Tab
            </div>
          )}
        </div>
      )}
    </div>
  );
}
