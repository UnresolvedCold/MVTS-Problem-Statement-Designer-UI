import React, { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import { useObjectManager } from "./hooks/useObjectManager";
import { useWarehouseData } from "./hooks/useWarehouseData";
import Toolbar from "./components/Toolbar";
import GridCanvas from "./components/GridCanvas";
import ObjectsList from "./components/ObjectsList";
import PropertyEditor from "./components/PropertyEditor";
import { GRID_CONFIG } from "./utils/constants";

const GridEditor = () => {
  // Grid settings
  const [rows, setRows] = useState(GRID_CONFIG.DEFAULT_ROWS);
  const [cols, setCols] = useState(GRID_CONFIG.DEFAULT_COLS);
  const [cellSize, setCellSize] = useState(GRID_CONFIG.DEFAULT_CELL_SIZE);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // WebSocket message handler
  const handleWebSocketMessage = (data) => {
    console.log('Received WebSocket message:', data);
    
    if (data.type === 'WAREHOUSE_DATA_RESPONSE' && data.warehouse) {
      setLoadingMessage('Loading warehouse data...');
      setWarehouseData(data);
      
      // Update grid dimensions if provided
      if (data.warehouse.width && data.warehouse.height) {
        setCols(data.warehouse.width);
        setRows(data.warehouse.height);
      }
      
      // Load objects from warehouse data
      loadObjectsFromWarehouse(data);
      setIsLoading(false);
      setLoadingMessage('');
    } else if (data.type === 'WAREHOUSE_DATA_UPDATED') {
      console.log('Warehouse data updated successfully');
      
      // Server sends the updated warehouse data, reload objects
      if (data.warehouse) {
        setLoadingMessage('Updating warehouse data...');
        setWarehouseData(data);
        loadObjectsFromWarehouse(data);
        setIsLoading(false);
        setLoadingMessage('');
      }
    } else if (data.type === 'CONNECTION_ESTABLISHED') {
      console.log('WebSocket connection established');
      setIsLoading(false);
      setLoadingMessage('');
    } else if (data.type === 'ERROR') {
      console.error('Server error:', data.message);
      setIsLoading(false);
      setLoadingMessage('');
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
  } = useObjectManager(cellSize, sendWarehouseUpdate, { setIsLoading, setLoadingMessage });

  return (
    <div style={{ display: "flex", position: "relative" }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          color: "white",
          fontSize: "18px",
          fontWeight: "bold"
        }}>
          <div style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div>⏳ {loadingMessage || 'Loading...'}</div>
            <div style={{ fontSize: "14px", marginTop: "10px", fontWeight: "normal" }}>
              Please wait while the operation completes...
            </div>
          </div>
        </div>
      )}
      
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

export default GridEditor;
