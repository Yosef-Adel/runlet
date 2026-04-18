import React from 'react';

export default function TitleBar(): React.ReactElement {
  return (
    <div
      style={{
        height: 'var(--title-bar-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        WebkitAppRegion: 'drag' as unknown as string,
        position: 'relative',
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          userSelect: 'none',
          textTransform: 'lowercase',
        }}
      >
        runlet
      </span>
    </div>
  );
}
