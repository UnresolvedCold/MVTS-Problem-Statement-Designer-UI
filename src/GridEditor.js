import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Image, Text } from "react-konva";
import useImage from "use-image";

// Component for object (tree/house)
const ObjectImage = ({ x, y, src, onDragEnd, gridWidth, gridHeight, cellSize }) => {
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
  
  // Warehouse data
  const [warehouseData, setWarehouseData] = useState(null);

  // Load warehouse data on component mount
  useEffect(() => {
    const loadWarehouseData = async () => {
      try {
        const response = await fetch('/warehouse.json');
        const data = await response.json();
        setWarehouseData(data);
        
        // Set grid dimensions from warehouse data
        if (data.warehouse?.width && data.warehouse?.height) {
          setCols(data.warehouse.width);
          setRows(data.warehouse.height);
        }
        
        // Load objects from warehouse data
        const loadedObjects = [];
        
        // Add bots from ranger_list (if exists)
        if (data.warehouse?.problem_statement?.ranger_list) {
          data.warehouse.problem_statement.ranger_list.forEach((ranger, index) => {
            if (ranger.coordinate?.x !== undefined && ranger.coordinate?.y !== undefined) {
              loadedObjects.push({
                id: `bot-${ranger.id || index}-${Date.now()}`,
                type: 'bot',
                x: ranger.coordinate.x * cellSize,
                y: ranger.coordinate.y * cellSize
              });
            }
          });
        }
        
        // Add PPS from pps_list (if exists)
        if (data.warehouse?.problem_statement?.pps_list) {
          data.warehouse.problem_statement.pps_list.forEach((pps, index) => {
            if (pps.coordinate?.x !== undefined && pps.coordinate?.y !== undefined) {
              loadedObjects.push({
                id: `pps-${pps.id || index}-${Date.now()}`,
                type: 'pps',
                x: pps.coordinate.x * cellSize,
                y: pps.coordinate.y * cellSize
              });
            }
          });
        }
        
        setObjects(loadedObjects);
      } catch (error) {
        console.error('Error loading warehouse data:', error);
      }
    };

    loadWarehouseData();
  }, [cellSize]);

  // Add new object
  const addObject = (type) => {
    const newObj = { id: Date.now(), type, x: 0, y: 0 };
    setObjects([...objects, newObj]);
  };

  // Remove object
  const removeObject = (id) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
  };

  return (
    <div style={{ display: "flex" }}>
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
              onDragEnd={(x, y) => {
                setObjects((prev) =>
                  prev.map((o) => (o.id === obj.id ? { ...o, x, y } : o))
                );
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
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                    {obj.type} #{index + 1}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Position: ({Math.floor(obj.x / cellSize)}, {Math.floor(obj.y / cellSize)})
                  </div>
                </div>
                <button
                  onClick={() => removeObject(obj.id)}
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
    </div>
  );
};

export default GridEditor;
