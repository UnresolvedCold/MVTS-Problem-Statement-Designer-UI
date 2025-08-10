// src/hooks/useGridState.js
import { useState, useCallback } from 'react';
import { getGridCfg } from '../utils/constants';

export const useGridState = (localStateManager) => {
  const GRID_CONFIG = getGridCfg();
  
  const [rows, setRows] = useState(GRID_CONFIG.DEFAULT_ROWS);
  const [cols, setCols] = useState(GRID_CONFIG.DEFAULT_COLS);
  const [cellSize, setCellSize] = useState(GRID_CONFIG.DEFAULT_CELL_SIZE);
  
  const { updateGridSizeInLocal } = localStateManager;

  const handleRowsChange = useCallback((newRows) => {
    if (newRows <= 0) {
      alert('Rows must be greater than 0');
      return;
    }
    setRows(newRows);
    updateGridSizeInLocal(cols, newRows);
  }, [cols, updateGridSizeInLocal]);

  const handleColsChange = useCallback((newCols) => {
    if (newCols <= 0) {
      alert('Columns must be greater than 0');
      return;
    }
    setCols(newCols);
    updateGridSizeInLocal(newCols, rows);
  }, [rows, updateGridSizeInLocal]);

  return {
    rows,
    cols,
    cellSize,
    setCellSize,
    handleRowsChange,
    handleColsChange,
    setRows,
    setCols
  };
};
