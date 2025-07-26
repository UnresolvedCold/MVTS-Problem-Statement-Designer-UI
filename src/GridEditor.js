import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Image, Text } from "react-konva";
import useImage from "use-image";
import useWebSocket from "./hooks/useWebSocket";

// Component for object (tree/house)
const ObjectImage = ({ x, y, src, onDragEnd, gridWidth, gridHeight, cellSize, isSelected, onClick }) => {
  const [image] = useImage(src);
  const objectSize = 50; // Size of the object image
  
  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={objectSize}
      height={objectSize}
      draggable
      stroke={isSelected ? "#007bff" : "transparent"}
      strokeWidth={isSelected ? 3 : 0}
      onClick={onClick}
      dragBoundFunc={(pos) => {
        // Restrict dragging to within grid boundaries
        const newX = Math.max(0, Math.min(pos.x, gridWidth - objectSize));
        const newY = Math.max(0, Math.min(pos.y, gridHeight - objectSize));
        return { x: newX, y: newY };
      }}
      onDragEnd={(e) => {
        let snappedX = Math.floor(e.target.x() / cellSize) * cellSize;
        let snappedY = Math.floor(e.target.y() / cellSize) * cellSize;
        
        // Restrict position to be within grid boundaries
        // Make sure the object doesn't go outside the canvas
        snappedX = Math.max(0, Math.min(snappedX, gridWidth - objectSize));
        snappedY = Math.max(0, Math.min(snappedY, gridHeight - objectSize));
        
        onDragEnd(snappedX, snappedY);
      }}
    />
  );
};

const GridEditor = () => {
  // Grid settings
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [cellSize, setCellSize] = useState(50);

  // Objects placed on grid
  const [objects, setObjects] = useState([]);
  
  // Selected object for property editing
  const [selectedObject, setSelectedObject] = useState(null);
  
  // Warehouse data
  const [warehouseData, setWarehouseData] = useState(null);

  // WebSocket message handler
  const handleWebSocketMessage = (data) => {
    console.log('Received WebSocket message:', data);
    console.log('Type of received data:', typeof data);
    console.log('Data keys:', Object.keys(data || {}));
    
    // Validate the data structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid data received:', data);
      return;
    }
    
    // Handle different message types
    if (data.type === 'WAREHOUSE_DATA_RESPONSE' && data.warehouse) {
      console.log('Processing warehouse data response...');
      setWarehouseData(data);
      
      // Set grid dimensions from warehouse data
      if (data.warehouse.width && data.warehouse.height) {
        console.log('Setting grid dimensions:', data.warehouse.width, 'x', data.warehouse.height);
        setCols(data.warehouse.width);
        setRows(data.warehouse.height);
      }
      
      // Load objects from warehouse data
      const loadedObjects = [];
      
      // Add bots from ranger_list
      if (data.warehouse.problem_statement?.ranger_list) {
        console.log('Loading rangers:', data.warehouse.problem_statement.ranger_list.length);
        data.warehouse.problem_statement.ranger_list.forEach((ranger, index) => {
          if (ranger.coordinate?.x !== undefined && ranger.coordinate?.y !== undefined) {
            loadedObjects.push({
              id: `bot-${ranger.id || index}-${Date.now()}`,
              type: 'bot',
              x: ranger.coordinate.x * cellSize,
              y: ranger.coordinate.y * cellSize,
              properties: { ...ranger }
            });
          }
        });
      }
      
      // Add PPS from pps_list
      if (data.warehouse.problem_statement?.pps_list) {
        console.log('Loading PPS:', data.warehouse.problem_statement.pps_list.length);
        data.warehouse.problem_statement.pps_list.forEach((pps, index) => {
          if (pps.coordinate?.x !== undefined && pps.coordinate?.y !== undefined) {
            loadedObjects.push({
              id: `pps-${pps.id || index}-${Date.now()}`,
              type: 'pps',
              x: pps.coordinate.x * cellSize,
              y: pps.coordinate.y * cellSize,
              properties: { ...pps }
            });
          }
        });
      }
      
      console.log('Loaded objects:', loadedObjects);
      setObjects(loadedObjects);
    } else if (data.type === 'CONNECTION_ESTABLISHED') {
      console.log('Connection established:', data.message);
    } else if (data.type === 'ERROR') {
      console.error('Server error:', data.message);
    } else {
      console.warn('Unknown message type or format:', data);
    }
  };

  // Initialize WebSocket connection
  const { sendMessage } = useWebSocket(handleWebSocketMessage);

  // Send warehouse data update when objects change
  const sendWarehouseUpdate = (updatedObjects) => {
    if (!warehouseData) return;

    const updatedWarehouseData = {
      ...warehouseData,
      warehouse: {
        ...warehouseData.warehouse,
        problem_statement: {
          ...warehouseData.warehouse.problem_statement,
          ranger_list: updatedObjects
            .filter(obj => obj.type === 'bot')
            .map(obj => ({
              ...obj.properties,
              coordinate: {
                x: Math.floor(obj.x / cellSize),
                y: Math.floor(obj.y / cellSize)
              }
            })),
          pps_list: updatedObjects
            .filter(obj => obj.type === 'pps')
            .map(obj => ({
              ...obj.properties,
              coordinate: {
                x: Math.floor(obj.x / cellSize),
                y: Math.floor(obj.y / cellSize)
              }
            }))
        }
      }
    };

    sendMessage({
      type: 'UPDATE_WAREHOUSE_DATA',
      data: updatedWarehouseData
    });
  };

  // Add new object
  const addObject = (type) => {
    const defaultProperties = type === 'bot' ? {
      id: Date.now(),
      coordinate: { x: 0, y: 0 },
      paused: false,
      available_at_time: null,
      available_at_coordinate: null,
      total_capacity: 0,
      available_capacity: 0,
      is_paused: false,
      status: null,
      version: null,
      ranger_schedule: [],
      current_aisle_info: null
    } : {
      id: Date.now(),
      coordinate: { x: 0, y: 0 },
      bin_details: [],
      queue_length: 0,
      ranger_dock_coordinates: null,
      mode: null,
      pps_type: null,
      current_schedule: {
        cost: null,
        assignments: [],
        reserved_ranger_list: []
      },
      connected_pps_list: null,
      can_assign_task: false,
      ranger_exit_coordinates: null,
      msio_bins: [],
      pps_status: "open",
      pps_logged_in: true,
      pps_login_time: 0
    };

    const newObj = { 
      id: Date.now(), 
      type, 
      x: 0, 
      y: 0, 
      properties: defaultProperties 
    };
    const updatedObjects = [...objects, newObj];
    setObjects(updatedObjects);
    
    // Send update to server via WebSocket
    sendWarehouseUpdate(updatedObjects);
  };

  // Remove object
  const removeObject = (id) => {
    const updatedObjects = objects.filter((obj) => obj.id !== id);
    setObjects(updatedObjects);
    
    // Clear selection if the removed object was selected
    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }
    
    // Send update to server via WebSocket
    sendWarehouseUpdate(updatedObjects);
  };

  // Update object properties
  const updateObjectProperties = (objectId, newProperties) => {
    const updatedObjects = objects.map((obj) =>
      obj.id === objectId 
        ? { 
            ...obj, 
            properties: newProperties,
            // Update visual position if coordinates changed
            x: newProperties.coordinate?.x !== undefined ? newProperties.coordinate.x * cellSize : obj.x,
            y: newProperties.coordinate?.y !== undefined ? newProperties.coordinate.y * cellSize : obj.y
          } 
        : obj
    );
    
    setObjects(updatedObjects);
    
    // Update selected object as well
    if (selectedObject?.id === objectId) {
      setSelectedObject({ 
        ...selectedObject, 
        properties: newProperties,
        x: newProperties.coordinate?.x !== undefined ? newProperties.coordinate.x * cellSize : selectedObject.x,
        y: newProperties.coordinate?.y !== undefined ? newProperties.coordinate.y * cellSize : selectedObject.y
      });
    }
    
    // Send update to server via WebSocket
    sendWarehouseUpdate(updatedObjects);
  };

  // State for JSON editing
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // Update jsonEditValue when selectedObject changes
  useEffect(() => {
    if (selectedObject) {
      setJsonEditValue(JSON.stringify(selectedObject.properties, null, 2));
      setJsonError(null);
    }
  }, [selectedObject]);

  // Handle JSON text change
  const handleJsonChange = (value) => {
    setJsonEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      
      // Update object properties and position
      setObjects((prev) =>
        prev.map((obj) =>
          obj.id === selectedObject.id 
            ? { 
                ...obj, 
                properties: parsed,
                // Update visual position if coordinates changed
                x: parsed.coordinate?.x !== undefined ? parsed.coordinate.x * cellSize : obj.x,
                y: parsed.coordinate?.y !== undefined ? parsed.coordinate.y * cellSize : obj.y
              } 
            : obj
        )
      );
      
      // Update selected object as well
      if (selectedObject?.id) {
        setSelectedObject({ 
          ...selectedObject, 
          properties: parsed,
          x: parsed.coordinate?.x !== undefined ? parsed.coordinate.x * cellSize : selectedObject.x,
          y: parsed.coordinate?.y !== undefined ? parsed.coordinate.y * cellSize : selectedObject.y
        });
      }
    } catch (error) {
      setJsonError(error.message);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Toolbar */}
      <div style={{ width: 200, padding: 10, borderRight: "1px solid #ccc" }}>
        <h3>Toolbar</h3>
        <button onClick={() => addObject("bot")}>Add Bot</button>
        <button onClick={() => addObject("pps")}>Add PPS</button>
        <hr />
        <div>
          <label>Rows: </label>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Cols: </label>
          <input
            type="number"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Cell Size: </label>
          <input
            type="number"
            value={cellSize}
            onChange={(e) => setCellSize(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Canvas Area */}
      <Stage
        width={cols * cellSize}
        height={rows * cellSize}
        style={{ border: "1px solid black" }}
      >
        <Layer>
          {/* Draw grid */}
          {[...Array(cols)].map((_, i) => (
            <Rect
              key={`v${i}`}
              x={i * cellSize}
              y={0}
              width={1}
              height={rows * cellSize}
              fill="grey"
            />
          ))}
          {[...Array(rows)].map((_, j) => (
            <Rect
              key={`h${j}`}
              x={0}
              y={j * cellSize}
              width={cols * cellSize}
              height={1}
              fill="grey"
            />
          ))}
          
          {/* Draw grid coordinates */}
          {[...Array(cols)].map((_, i) => 
            [...Array(rows)].map((_, j) => (
              <Text
                key={`coord-${i}-${j}`}
                x={i * cellSize + 5}
                y={j * cellSize + 5}
                text={`(${i},${j})`}
                fontSize={Math.min(cellSize / 4, 10)}
                fill="lightgray"
                fontFamily="Arial"
              />
            ))
          )}
        </Layer>

        {/* Objects Layer */}
        <Layer>
          {objects.map((obj) => (
            <ObjectImage
              key={obj.id}
              x={obj.x}
              y={obj.y}
              src={obj.type === "bot" ? "/tree.png" : "/house.png"}
              gridWidth={cols * cellSize}
              gridHeight={rows * cellSize}
              cellSize={cellSize}
              isSelected={selectedObject?.id === obj.id}
              onClick={() => setSelectedObject(obj)}
              onDragEnd={(x, y) => {
                const gridX = Math.floor(x / cellSize);
                const gridY = Math.floor(y / cellSize);
                
                const updatedObjects = objects.map((o) => 
                  o.id === obj.id 
                    ? { 
                        ...o, 
                        x, 
                        y,
                        properties: {
                          ...o.properties,
                          coordinate: { x: gridX, y: gridY }
                        }
                      } 
                    : o
                );
                
                setObjects(updatedObjects);
                
                // Update selected object position and properties as well
                if (selectedObject?.id === obj.id) {
                  setSelectedObject({
                    ...selectedObject, 
                    x, 
                    y,
                    properties: {
                      ...selectedObject.properties,
                      coordinate: { x: gridX, y: gridY }
                    }
                  });
                }
                
                // Send update to server via WebSocket
                sendWarehouseUpdate(updatedObjects);
              }}
            />
          ))}
        </Layer>
      </Stage>

      {/* Right Sidebar - Objects List */}
      <div style={{ width: 250, padding: 10, borderLeft: "1px solid #ccc", backgroundColor: "#f8f9fa" }}>
        <h3>Objects ({objects.length})</h3>
        {objects.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>No objects created yet</p>
        ) : (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {objects.map((obj, index) => (
              <div
                key={obj.id}
                style={{
                  padding: "8px",
                  margin: "5px 0",
                  border: selectedObject?.id === obj.id ? "2px solid #007bff" : "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: selectedObject?.id === obj.id ? "#e3f2fd" : "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedObject(obj)}
              >
                <div>
                  <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                    {obj.type} #{index + 1}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Position: ({Math.floor(obj.x / cellSize)}, {Math.floor(obj.y / cellSize)})
                  </div>
                  {obj.properties?.id && (
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      ID: {obj.properties.id}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeObject(obj.id);
                    if (selectedObject?.id === obj.id) {
                      setSelectedObject(null);
                    }
                  }}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#c82333"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Editor Panel */}
      <div style={{ width: 350, padding: 10, borderLeft: "1px solid #ccc", backgroundColor: "#f0f8ff", overflowY: "auto" }}>
        <h3>Property Editor</h3>
        {selectedObject ? (
          <div>
            <div style={{ marginBottom: "10px", padding: "8px", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
              <strong>Selected: {selectedObject.type} (ID: {selectedObject.properties?.id || 'N/A'})</strong>
            </div>
            
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Properties (JSON):
              </label>
              {jsonError && (
                <div style={{ 
                  color: "#dc3545", 
                  fontSize: "12px", 
                  marginBottom: "5px",
                  padding: "4px",
                  backgroundColor: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "3px"
                }}>
                  ❌ JSON Error: {jsonError}
                </div>
              )}
              <textarea
                value={jsonEditValue}
                onChange={(e) => handleJsonChange(e.target.value)}
                style={{
                  width: "100%",
                  height: "400px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  border: jsonError ? "2px solid #dc3545" : "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                  resize: "vertical",
                  backgroundColor: jsonError ? "#fff5f5" : "white"
                }}
                placeholder="Edit JSON properties here..."
              />
            </div>
            
            <div style={{ 
              fontSize: "12px", 
              color: jsonError ? "#dc3545" : "#666", 
              fontStyle: "italic",
              marginBottom: "10px"
            }}>
              💡 Tip: Edit the JSON above to modify object properties. {jsonError ? "Fix the JSON syntax to save changes." : "Changes are saved automatically."}
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <button
                onClick={() => {
                  if (selectedObject) {
                    setJsonEditValue(JSON.stringify(selectedObject.properties, null, 2));
                    setJsonError(null);
                  }
                }}
                style={{
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  flex: 1
                }}
              >
                Reset JSON
              </button>
              
              <button
                onClick={() => {
                  const formatted = JSON.stringify(selectedObject.properties, null, 2);
                  setJsonEditValue(formatted);
                  setJsonError(null);
                }}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  flex: 1
                }}
              >
                Format JSON
              </button>
            </div>
            
            <button
              onClick={() => setSelectedObject(null)}
              style={{
                marginTop: "10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Clear Selection
            </button>
          </div>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Select an object to edit its properties
          </p>
        )}
      </div>
    </div>
  );
};

export default GridEditor;
