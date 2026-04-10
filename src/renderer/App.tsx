import React from 'react';

export default function App(): React.ReactElement {
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: 48, background: '#252526', borderRight: '1px solid #3c3c3c' }}>
        {/* Activity Bar placeholder */}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 36, background: '#2d2d2d', borderBottom: '1px solid #3c3c3c' }}>
          {/* Tab Bar placeholder */}
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ flex: 1, background: '#1e1e1e' }}>
            {/* Editor placeholder */}
          </div>
          <div style={{ width: 4, background: '#3c3c3c', cursor: 'col-resize' }} />
          <div style={{ flex: 1, background: '#1e1e1e' }}>
            {/* Output placeholder */}
          </div>
        </div>
      </div>
    </div>
  );
}
