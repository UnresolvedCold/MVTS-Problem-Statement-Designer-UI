import React from 'react';

const ObjectsList = ({ objects, selectedObject, onSelectObject, onRemoveObject, cellSize }) => {
  return (
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
                backgroundColor: selectedObject?.id === obj.id ? "#e3f2fd" : "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
              onClick={() => onSelectObject(obj)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveObject(obj.id);
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
  );
};

export default ObjectsList;
