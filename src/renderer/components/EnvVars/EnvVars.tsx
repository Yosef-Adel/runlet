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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          fontSize: 'var(--text-xs)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-sm)',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>
          Environment Variables
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="KEY"
              style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', textTransform: 'uppercase' }}
            />
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1, minWidth: 0 }}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              width: '100%',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            Add Variable
          </button>
        </div>
      </div>

      {/* Variables list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {envVars.length === 0 ? (
          <div style={{
            padding: 'var(--space-xl)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            No environment variables set
          </div>
        ) : (
          envVars.map((v) => (
            <div
              key={v.key}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-xs)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-subtle)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  color: 'var(--syntax-type)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {v.key}
                </span>
                <button
                  onClick={() => handleDelete(v.key)}
                  style={{
                    color: 'var(--text-muted)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <input
                value={v.value}
                onChange={(e) => handleUpdate(v.key, e.target.value)}
                style={{ width: '100%', fontSize: 'var(--text-sm)', minWidth: 0 }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
