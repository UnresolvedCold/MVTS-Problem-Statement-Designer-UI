import React, { useState } from 'react';

const PerformancePanel = ({ onToggleOptimizations, useOptimizedGrid }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      minWidth: '250px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
        Grid Performance
      </h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useOptimizedGrid}
            onChange={(e) => onToggleOptimizations(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontSize: '14px' }}>
            Use Optimized Grid (Recommended for large grids)
          </span>
        </label>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
        {useOptimizedGrid ? (
          <div>
            <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ Optimizations Active</div>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              <li>Viewport culling enabled</li>
              <li>Level-of-detail rendering</li>
              <li>Spatial indexing for objects</li>
              <li>Adaptive grid line rendering</li>
            </ul>
          </div>
        ) : (
          <div>
            <div style={{ color: '#ff9800', fontWeight: 'bold' }}>⚠ Basic Rendering</div>
            <div style={{ fontSize: '11px', marginTop: '5px' }}>
              May experience performance issues with grids larger than 100x100
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          background: 'none',
          border: 'none',
          color: '#007bff',
          cursor: 'pointer',
          fontSize: '12px',
          textDecoration: 'underline'
        }}
      >
        {showAdvanced ? 'Hide' : 'Show'} Technical Details
      </button>

      {showAdvanced && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#666'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Performance Optimizations:</h4>
          <ul style={{ margin: 0, paddingLeft: '15px' }}>
            <li><strong>Viewport Culling:</strong> Only renders visible grid cells</li>
            <li><strong>Level-of-Detail:</strong> Reduces detail when zoomed out</li>
            <li><strong>Spatial Indexing:</strong> Fast object lookup for 500+ objects</li>
            <li><strong>Adaptive Rendering:</strong> Automatically adjusts based on grid size</li>
            <li><strong>Memoization:</strong> Prevents unnecessary re-renders</li>
          </ul>
          <div style={{ marginTop: '8px', fontSize: '10px' }}>
            <strong>Performance Levels:</strong><br/>
            • High: &lt;100k cells<br/>
            • Medium: 100k-500k cells<br/>
            • Low: &gt;500k cells (1000x1000+ grids)
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;
