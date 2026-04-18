import React, { useState, useCallback, useEffect } from 'react';
import type { NpmSearchResult, InstalledPackage } from '../../../shared/types';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function NpmPackages(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NpmSearchResult[]>([]);
  const [installed, setInstalled] = useState<InstalledPackage[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    window.api.npmList().then((result) => {
      const data = result as { packages: InstalledPackage[] };
      setInstalled(data.packages);
    });

    const unsubscribe = window.api.onNpmInstallProgress((data) => {
      const progress = data as { name: string; status: string; message: string };
      if (progress.status === 'complete' || progress.status === 'error') {
        setInstalling(null);
        window.api.npmList().then((result) => {
          const d = result as { packages: InstalledPackage[] };
          setInstalled(d.packages);
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = (await window.api.npmSearch({
        query: searchQuery,
        limit: 20,
      })) as { results: NpmSearchResult[] };
      setSearchResults(result.results);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleInstall = useCallback(async (name: string, version: string) => {
    setInstalling(name);
    await window.api.npmInstall({ name, version });
  }, []);

  const handleUninstall = useCallback(async (name: string) => {
    await window.api.npmUninstall({ name });
    setInstalled((prev) => prev.filter((p) => p.name !== name));
  }, []);

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
          Packages
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search npm..."
              style={{ width: '100%', paddingLeft: 32 }}
            />
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
            }}>
              <SearchIcon />
            </span>
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {searchResults.length > 0 && (
          <div style={{ padding: 'var(--space-xs) 0' }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              padding: 'var(--space-xs) var(--space-lg)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}>
              Results
            </div>
            {searchResults.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  padding: 'var(--space-sm) var(--space-lg)',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-subtle)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--syntax-type)', fontWeight: 500, fontSize: 'var(--text-base)' }}>{pkg.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 'var(--text-xs)' }}>v{pkg.version}</span>
                  </div>
                  <button
                    onClick={() => handleInstall(pkg.name, pkg.version)}
                    disabled={installing === pkg.name || installed.some((i) => i.name === pkg.name)}
                    style={{
                      background: installed.some((i) => i.name === pkg.name) ? 'var(--bg-elevated)' : 'var(--accent)',
                      color: installed.some((i) => i.name === pkg.name) ? 'var(--text-muted)' : '#fff',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                    }}
                  >
                    {installed.some((i) => i.name === pkg.name)
                      ? 'Added'
                      : installing === pkg.name
                        ? '...'
                        : 'Install'}
                  </button>
                </div>
                {pkg.description && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: 3, lineHeight: 1.4 }}>
                    {pkg.description.slice(0, 120)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: 'var(--space-xs) 0' }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            padding: 'var(--space-xs) var(--space-lg)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}>
            Installed ({installed.length})
          </div>
          {installed.length === 0 ? (
            <div style={{
              padding: 'var(--space-lg)',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              fontStyle: 'italic',
              textAlign: 'center',
            }}>
              No packages installed
            </div>
          ) : (
            installed.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  padding: 'var(--space-sm) var(--space-lg)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-subtle)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div>
                  <span style={{ color: 'var(--syntax-type)', fontWeight: 500 }}>{pkg.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 'var(--text-xs)' }}>v{pkg.version}</span>
                </div>
                <button
                  onClick={() => handleUninstall(pkg.name)}
                  style={{
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
