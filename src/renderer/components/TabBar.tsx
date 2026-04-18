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
        height: 36,
        background: '#2d2d2d',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
      onClick={() => setContextMenu(null)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          flex: 1,
          gap: 0,
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 12px',
              height: 36,
              background: tab.id === activeTabId ? '#1e1e1e' : 'transparent',
              color: tab.id === activeTabId ? '#fff' : '#969696',
              cursor: 'pointer',
              fontSize: 13,
              borderTop:
                tab.id === activeTabId
                  ? '1px solid #007acc'
                  : '1px solid transparent',
              borderRight: '1px solid #252526',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
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
                  background: '#3c3c3c',
                  border: '1px solid #007acc',
                  color: '#fff',
                  fontSize: 13,
                  padding: '1px 4px',
                  outline: 'none',
                  width: 120,
                }}
              />
            ) : (
              <>
                <span>{getTabTitle(tab)}</span>
                {tab.isRunning && <span>⏳</span>}
                {tabs.length > 1 && (
                  <span
                    onClick={(e) => handleClose(e, tab.id)}
                    style={{
                      fontSize: 14,
                      opacity: 0.6,
                      padding: '0 2px',
                      borderRadius: 3,
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.opacity = '1';
                      (e.target as HTMLElement).style.background = '#3c3c3c';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.6';
                      (e.target as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    ×
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Tab Button */}
      <button
        onClick={onAdd}
        style={{
          width: 28,
          height: 28,
          border: 'none',
          background: 'transparent',
          color: '#969696',
          cursor: 'pointer',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 4px',
          borderRadius: 4,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = '#3c3c3c';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.background = 'transparent';
        }}
        title="New Tab"
      >
        +
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: '#252526',
            border: '1px solid #3c3c3c',
            borderRadius: 4,
            padding: '4px 0',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <div
            onClick={() => startEditing(contextMenu.tabId)}
            style={{
              padding: '6px 24px',
              cursor: 'pointer',
              fontSize: 13,
              color: '#d4d4d4',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#094771';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            Edit Tab Title
          </div>
          {tabs.length > 1 && (
            <div
              onClick={() => {
                onClose(contextMenu.tabId);
                setContextMenu(null);
              }}
              style={{
                padding: '6px 24px',
                cursor: 'pointer',
                fontSize: 13,
                color: '#d4d4d4',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = '#094771';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
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
