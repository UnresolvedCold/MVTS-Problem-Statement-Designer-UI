import React from 'react';

const ObjectsList = ({ objects, selectedObject, onObjectSelect, onRemoveObject, onAddObject, cellSize }) => {
  return (
    <div style={{ width: 250, padding: 10, borderLeft: "1px solid #ccc", backgroundColor: "#f8f9fa" }}>
      <h3>Objects ({objects.length})</h3>
      
      {/* Add Object Buttons */}
      <div style={{ marginBottom: 15, display: "flex", flexDirection: "column", gap: "8px" }}>
        <button 
          onClick={() => onAddObject("bot")}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Add Bot
        </button>
        <button 
          onClick={() => onAddObject("pps")}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#1e7e34"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
        >
          Add PPS
        </button>
        <button 
          onClick={() => onAddObject("msu")}
          style={{
            backgroundColor: "#ffc107",
            color: "#212529",
            border: "none",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#e0a800"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#ffc107"}
        >
          Add MSU
        </button>
      </div>
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
              onClick={() => onObjectSelect(obj)}
            >
              <div>
                <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                  {obj.type} #{obj.properties?.id || 'Unknown'}
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
