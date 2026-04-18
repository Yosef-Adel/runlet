import React, { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../../store';
import type { EnvironmentVariable } from '../../../shared/types';

export default function EnvVars(): React.ReactElement {
  const envVars = useAppStore((s) => s.envVars);
  const setEnvVars = useAppStore((s) => s.setEnvVars);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    window.api.loadEnvVars().then((result) => {
      const data = result as { variables: EnvironmentVariable[] };
      setEnvVars(data.variables);
    });
  }, [setEnvVars]);

  const save = useCallback(
    async (updated: EnvironmentVariable[]) => {
      setEnvVars(updated);
      await window.api.saveEnvVars({ variables: updated });
    },
    [setEnvVars]
  );

  const handleAdd = useCallback(() => {
    if (!newKey.trim()) return;
    if (envVars.some((v) => v.key === newKey.trim())) return;
    save([...envVars, { key: newKey.trim(), value: newValue }]);
    setNewKey('');
    setNewValue('');
  }, [newKey, newValue, envVars, save]);

  const handleDelete = useCallback(
    (key: string) => {
      save(envVars.filter((v) => v.key !== key));
    },
    [envVars, save]
  );

  const handleUpdate = useCallback(
    (key: string, value: string) => {
      save(envVars.map((v) => (v.key === key ? { ...v, value } : v)));
    },
    [envVars, save]
  );

  const inputStyle: React.CSSProperties = {
    background: '#3c3c3c',
    border: '1px solid #555',
    color: '#d4d4d4',
    padding: '4px 8px',
    fontSize: 13,
    outline: 'none',
    borderRadius: 3,
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #3c3c3c' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#969696', marginBottom: 6 }}>
          Environment Variables
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="KEY"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            style={{
              background: '#0e639c',
              border: 'none',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {envVars.length === 0 ? (
          <div style={{ padding: 12, color: '#6a737d', fontSize: 12, fontStyle: 'italic' }}>
            No environment variables set
          </div>
        ) : (
          envVars.map((v) => (
            <div
              key={v.key}
              style={{
                padding: '6px 12px',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
              }}
            >
              <span style={{ color: '#4ec9b0', minWidth: 80, flexShrink: 0 }}>{v.key}</span>
              <input
                value={v.value}
                onChange={(e) => handleUpdate(v.key, e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => handleDelete(v.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f44747',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
