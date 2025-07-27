import React from 'react';

const Toolbar = ({ 
  onAddObject, 
  rows, 
  cols, 
  cellSize, 
  onRowsChange, 
  onColsChange, 
  onCellSizeChange 
}) => {
  return (
    <div style={{ width: 200, padding: 10, borderRight: "1px solid #ccc" }}>
      <h3>Toolbar</h3>
      <button onClick={() => onAddObject("bot")}>Add Bot</button>
      <button onClick={() => onAddObject("pps")}>Add PPS</button>
      <button onClick={() => onAddObject("msu")}>Add MSU</button>
      <hr />
      <div>
        <label>Rows: </label>
        <input
          type="number"
          value={rows}
          onChange={(e) => onRowsChange(parseInt(e.target.value))}
        />
      </div>
      <div>
        <label>Cols: </label>
        <input
          type="number"
          value={cols}
          onChange={(e) => onColsChange(parseInt(e.target.value))}
        />
      </div>
      <div>
        <label>Cell Size: </label>
        <input
          type="number"
          value={cellSize}
          onChange={(e) => onCellSizeChange(parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Toolbar;
