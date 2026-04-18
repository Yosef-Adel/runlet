import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../../store';
import type { Snippet } from '../../../shared/types';

export default function Snippets(): React.ReactElement {
  const snippets = useAppStore((s) => s.snippets);
  const setSnippets = useAppStore((s) => s.setSnippets);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const updateTabContent = useAppStore((s) => s.updateTabContent);
  const tabs = useAppStore((s) => s.tabs);

  const [editing, setEditing] = useState<Snippet | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    window.api.loadSnippets().then((result) => {
      const data = result as { snippets: Snippet[] };
      setSnippets(data.snippets);
    });
  }, [setSnippets]);

  const save = useCallback(async (updated: Snippet[]) => {
    setSnippets(updated);
    await window.api.saveSnippets({ snippets: updated });
  }, [setSnippets]);

  const handleCreate = useCallback(() => {
    if (!name.trim() || !body.trim()) return;
    const now = Date.now();
    const newSnippet: Snippet = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      body,
      createdAt: now,
      updatedAt: now,
    };
    save([...snippets, newSnippet]);
    setName('');
    setDescription('');
    setBody('');
  }, [name, description, body, snippets, save]);

  const handleUpdate = useCallback(() => {
    if (!editing || !name.trim() || !body.trim()) return;
    const updated = snippets.map((s) =>
      s.id === editing.id
        ? { ...s, name: name.trim(), description: description.trim(), body, updatedAt: Date.now() }
        : s
    );
    save(updated);
    setEditing(null);
    setName('');
    setDescription('');
    setBody('');
  }, [editing, name, description, body, snippets, save]);

  const handleDelete = useCallback((id: string) => {
    save(snippets.filter((s) => s.id !== id));
  }, [snippets, save]);

  const handleEdit = useCallback((snippet: Snippet) => {
    setEditing(snippet);
    setName(snippet.name);
    setDescription(snippet.description);
    setBody(snippet.body);
  }, []);

  const handleInsert = useCallback((snippet: Snippet) => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab) {
      updateTabContent(activeTabId, tab.content + snippet.body);
    }
  }, [activeTabId, tabs, updateTabContent]);

  const handleExport = useCallback(async () => {
    await window.api.exportSnippets({ snippets });
  }, [snippets]);

  const handleImport = useCallback(async () => {
    const result = (await window.api.importSnippets()) as {
      success: boolean;
      snippets: Array<{ name: string; description: string; body: string }>;
    };
    if (result.success && result.snippets.length > 0) {
      const now = Date.now();
      const imported: Snippet[] = result.snippets.map((s) => ({
        id: uuidv4(),
        name: s.name,
        description: s.description,
        body: s.body,
        createdAt: now,
        updatedAt: now,
      }));
      save([...snippets, ...imported]);
    }
  }, [snippets, save]);

  const smallBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-secondary)',
    background: 'transparent',
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600 }}>
            Snippets
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button onClick={handleImport} style={smallBtnStyle}>Import</button>
            <button onClick={handleExport} style={smallBtnStyle}>Export</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Snippet name" style={{ width: '100%' }} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" style={{ width: '100%' }} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Code body..."
            rows={3}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button
              onClick={editing ? handleUpdate : handleCreate}
              disabled={!name.trim() || !body.trim()}
              style={{
                flex: 1,
                background: 'var(--accent)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(null); setName(''); setDescription(''); setBody(''); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snippet list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {snippets.length === 0 ? (
          <div style={{
            padding: 'var(--space-xl)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            No snippets yet
          </div>
        ) : (
          snippets.map((s) => (
            <div
              key={s.id}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-subtle)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--syntax-type)', fontWeight: 500 }}>{s.name}</span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  <button
                    onClick={() => handleInsert(s)}
                    style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 500, transition: 'opacity var(--transition-fast)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Insert
                  </button>
                  <button
                    onClick={() => handleEdit(s)}
                    style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {s.description && (
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: 2, lineHeight: 1.4 }}>
                  {s.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
