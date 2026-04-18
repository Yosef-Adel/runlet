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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#3c3c3c',
    border: '1px solid #555',
    color: '#d4d4d4',
    padding: '4px 8px',
    fontSize: 13,
    outline: 'none',
    borderRadius: 3,
    marginBottom: 4,
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #3c3c3c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#969696' }}>Snippets</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleImport} style={{ background: 'transparent', border: '1px solid #555', color: '#969696', padding: '2px 6px', borderRadius: 3, cursor: 'pointer', fontSize: 11 }}>
              Import
            </button>
            <button onClick={handleExport} style={{ background: 'transparent', border: '1px solid #555', color: '#969696', padding: '2px 6px', borderRadius: 3, cursor: 'pointer', fontSize: 11 }}>
              Export
            </button>
          </div>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inputStyle} />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={inputStyle} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Code body..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }}
        />
        <button
          onClick={editing ? handleUpdate : handleCreate}
          disabled={!name.trim() || !body.trim()}
          style={{
            width: '100%',
            background: '#0e639c',
            border: 'none',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && (
          <button
            onClick={() => { setEditing(null); setName(''); setDescription(''); setBody(''); }}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid #555',
              color: '#969696',
              padding: '4px 8px',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {snippets.length === 0 ? (
          <div style={{ padding: 12, color: '#6a737d', fontSize: 12, fontStyle: 'italic' }}>
            No snippets yet
          </div>
        ) : (
          snippets.map((s) => (
            <div key={s.id} style={{ padding: '6px 12px', borderBottom: '1px solid #2a2a2a', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4ec9b0' }}>{s.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleInsert(s)} style={{ background: 'transparent', border: 'none', color: '#0e639c', cursor: 'pointer', fontSize: 11 }}>
                    Insert
                  </button>
                  <button onClick={() => handleEdit(s)} style={{ background: 'transparent', border: 'none', color: '#969696', cursor: 'pointer', fontSize: 11 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: 'none', color: '#f44747', cursor: 'pointer', fontSize: 11 }}>
                    Delete
                  </button>
                </div>
              </div>
              {s.description && <div style={{ color: '#6a737d', fontSize: 12, marginTop: 2 }}>{s.description}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
