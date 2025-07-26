import React, { useState } from "react";
import { Stage, Layer, Rect, Image } from "react-konva";
import useImage from "use-image";

// Component for object (tree/house)
const ObjectImage = ({ x, y, src, onDragEnd }) => {
  const [image] = useImage(src);
  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={50}
      height={50}
      draggable
      onDragEnd={(e) => {
        const snappedX = Math.floor(e.target.x() / 50) * 50;
        const snappedY = Math.floor(e.target.y() / 50) * 50;
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
        <button onClick={() => addObject("tree")}>Add Tree</button>
        <button onClick={() => addObject("house")}>Add House</button>
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
        </Layer>

        {/* Objects Layer */}
        <Layer>
          {objects.map((obj) => (
            <ObjectImage
              key={obj.id}
              x={obj.x}
              y={obj.y}
              src={obj.type === "tree" ? "/tree.png" : "/house.png"}
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
