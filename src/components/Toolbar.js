import React from 'react';

const Toolbar = ({ 
  rows, 
  cols, 
  cellSize, 
  onRowsChange, 
  onColsChange, 
  onCellSizeChange 
}) => {
  return (
    <div style={{ width: 200, padding: 10, borderRight: "1px solid #ccc" }}>
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
  );
};

export default Toolbar;
