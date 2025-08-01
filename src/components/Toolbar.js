import React, { useState } from 'react';

const Toolbar = ({ 
  rows, 
  cols, 
  cellSize, 
  onRowsChange, 
  onColsChange, 
  onCellSizeChange,
  onManageTemplates,
  onSolveProblem,
  onClearData,
  serverAPI
}) => {
  const { isConnected, isLoading } = serverAPI;

  return (
    <div style={{ width: 200, padding: 10, borderRight: "1px solid #ccc", overflow: 'auto' }}>
      {/* Grid Settings */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Grid Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Rows: </label>
            <input
              type="number"
              value={rows}
              onChange={(e) => onRowsChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Cols: </label>
            <input
              type="number"
              value={cols}
              onChange={(e) => onColsChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Cell Size: </label>
            <input
              type="number"
              value={cellSize}
              onChange={(e) => onCellSizeChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>
      </div>

      {/* Server Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Server Actions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ 
            fontSize: '12px', 
            color: isConnected ? 'green' : 'orange',
            marginBottom: '5px',
            fontWeight: 'bold'
          }}>
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <button
            onClick={onManageTemplates}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#f8f9fa",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            🔧 Manage Schemas
          </button>
          
          <button
            onClick={onSolveProblem}
            disabled={isLoading}
            style={{
              padding: "8px",
              border: "1px solid #28a745",
              borderRadius: "4px",
              backgroundColor: isLoading ? "#6c757d" : "#28a745",
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "12px"
            }}
          >
            {isLoading ? "🔄 Solving..." : "🚀 Solve Problem"}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Data Management</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={onClearData}
            style={{
              padding: "8px",
              border: "1px solid #dc3545",
              borderRadius: "4px",
              backgroundColor: "#dc3545",
              color: "white",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      {/* Local Storage Info */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '4px',
        fontSize: '11px',
        color: '#1565c0'
      }}>
        <strong>💡 Local Mode</strong>
        <div style={{ marginTop: '5px' }}>
          All changes are saved locally in your browser. Use templates to create new items and solve problems on the server.
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
