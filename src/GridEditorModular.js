import React, { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import { useObjectManager } from "./hooks/useObjectManager";
import { useWarehouseData } from "./hooks/useWarehouseData";
import Toolbar from "./components/Toolbar";
import GridCanvas from "./components/GridCanvas";
import ObjectsList from "./components/ObjectsList";
import PropertyEditor from "./components/PropertyEditor";
import { GRID_CONFIG } from "./utils/constants";

const GridEditorModular = () => {
  // Grid settings
  const [rows, setRows] = useState(GRID_CONFIG.DEFAULT_ROWS);
  const [cols, setCols] = useState(GRID_CONFIG.DEFAULT_COLS);
  const [cellSize, setCellSize] = useState(GRID_CONFIG.DEFAULT_CELL_SIZE);

  // WebSocket message handler
  const handleWebSocketMessage = (data) => {
    console.log('Received WebSocket message:', data);
    
    if (data.type === 'WAREHOUSE_DATA_RESPONSE' && data.warehouse) {
      setWarehouseData(data);
      
      // Update grid dimensions if provided
      if (data.warehouse.width && data.warehouse.height) {
        setCols(data.warehouse.width);
        setRows(data.warehouse.height);
      }
      
      // Load objects from warehouse data
      loadObjectsFromWarehouse(data);
    } else if (data.type === 'WAREHOUSE_DATA_UPDATED') {
      console.log('Warehouse data updated successfully');
      
      // Server sends the updated warehouse data, reload objects
      if (data.warehouse) {
        setWarehouseData(data);
        loadObjectsFromWarehouse(data);
      }
    } else if (data.type === 'CONNECTION_ESTABLISHED') {
      console.log('WebSocket connection established');
    } else if (data.type === 'ERROR') {
      console.error('Server error:', data.message);
    }
  };

  // Initialize WebSocket connection
  const { sendMessage } = useWebSocket(handleWebSocketMessage);
  
  // Initialize warehouse data management
  const { warehouseData, setWarehouseData, sendWarehouseUpdate } = useWarehouseData(sendMessage);
  
  // Initialize object management
  const {
    objects,
    selectedObject,
    setSelectedObject,
    addObject,
    removeObject,
    updateObjectPosition,
    updateObjectProperties,
    loadObjectsFromWarehouse
  } = useObjectManager(cellSize, sendWarehouseUpdate);

  return (
    <div style={{ display: "flex" }}>
      <Toolbar
        onAddObject={addObject}
        rows={rows}
        cols={cols}
        cellSize={cellSize}
        onRowsChange={setRows}
        onColsChange={setCols}
        onCellSizeChange={setCellSize}
      />

      <GridCanvas
        rows={rows}
        cols={cols}
        cellSize={cellSize}
        objects={objects}
        selectedObject={selectedObject}
        onObjectClick={setSelectedObject}
        onObjectDragEnd={updateObjectPosition}
      />

      <ObjectsList
        objects={objects}
        selectedObject={selectedObject}
        onSelectObject={setSelectedObject}
        onRemoveObject={removeObject}
        cellSize={cellSize}
      />

      <PropertyEditor
        selectedObject={selectedObject}
        onUpdateProperties={updateObjectProperties}
        onClose={() => setSelectedObject(null)}
      />
    </div>
  );
};

export default GridEditorModular;
