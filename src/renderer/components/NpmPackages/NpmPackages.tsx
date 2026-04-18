import React, { useState, useCallback, useEffect } from 'react';
import type { NpmSearchResult, InstalledPackage } from '../../../shared/types';

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
        // Refresh installed list
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
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #3c3c3c' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#969696', marginBottom: 6 }}>
          NPM Packages
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search packages..."
            style={{
              flex: 1,
              background: '#3c3c3c',
              border: '1px solid #555',
              color: '#d4d4d4',
              padding: '4px 8px',
              fontSize: 13,
              outline: 'none',
              borderRadius: 3,
            }}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
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
            {searching ? '...' : 'Search'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 11, color: '#969696', padding: '4px 12px', textTransform: 'uppercase' }}>
              Search Results
            </div>
            {searchResults.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid #2a2a2a',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#4ec9b0' }}>{pkg.name}</span>
                    <span style={{ color: '#6a737d', marginLeft: 6 }}>@{pkg.version}</span>
                  </div>
                  <button
                    onClick={() => handleInstall(pkg.name, pkg.version)}
                    disabled={installing === pkg.name || installed.some((i) => i.name === pkg.name)}
                    style={{
                      background: installed.some((i) => i.name === pkg.name) ? '#3c3c3c' : '#0e639c',
                      border: 'none',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    {installed.some((i) => i.name === pkg.name)
                      ? 'Installed'
                      : installing === pkg.name
                        ? 'Installing...'
                        : 'Add'}
                  </button>
                </div>
                {pkg.description && (
                  <div style={{ color: '#969696', fontSize: 12, marginTop: 2 }}>
                    {pkg.description.slice(0, 100)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Installed Packages */}
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontSize: 11, color: '#969696', padding: '4px 12px', textTransform: 'uppercase' }}>
            Installed ({installed.length})
          </div>
          {installed.length === 0 ? (
            <div style={{ padding: '8px 12px', color: '#6a737d', fontSize: 12, fontStyle: 'italic' }}>
              No packages installed
            </div>
          ) : (
            installed.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid #2a2a2a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ color: '#4ec9b0' }}>{pkg.name}</span>
                  <span style={{ color: '#6a737d', marginLeft: 6 }}>@{pkg.version}</span>
                </div>
                <button
                  onClick={() => handleUninstall(pkg.name)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #f44747',
                    color: '#f44747',
                    padding: '2px 8px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
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
