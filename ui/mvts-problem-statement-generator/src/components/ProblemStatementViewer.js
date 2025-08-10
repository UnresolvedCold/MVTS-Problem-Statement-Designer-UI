import React, { useState } from 'react';

const ProblemStatementViewer = ({ warehouseData, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // Get the problem statement JSON
  const problemStatementJson = warehouseData?.warehouse?.problem_statement 
    ? JSON.stringify(warehouseData.warehouse.problem_statement, null, 2)
    : '{}';

  // Initialize edit value when entering edit mode
  const handleEditToggle = () => {
    if (!isEditing) {
      setEditValue(problemStatementJson);
      setJsonError(null);
    }
    setIsEditing(!isEditing);
  };

  // Handle JSON text change
  const handleJsonChange = (value) => {
    setEditValue(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(problemStatementJson).then(() => {
      // You could add a toast notification here
      console.log('JSON copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Download as file
  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(problemStatementJson);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "problem_statement.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      padding: 20, 
      backgroundColor: "#f8f9fa",
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 15,
        flexShrink: 0
      }}>
        <h3 style={{ margin: 0 }}>Problem Statement JSON</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleCopyToClipboard}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "3px",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            📋 Copy
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "3px",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            💾 Download
          </button>
          {isEditing && (
            <button
              onClick={() => {
                if (!jsonError) {
                  try {
                    const parsedJson = JSON.parse(editValue);
                    // Call the onSave callback to update the warehouse data
                    if (onSave) {
                      onSave(parsedJson);
                    }
                    setIsEditing(false);
                  } catch (error) {
                    setJsonError(error.message);
                  }
                }
              }}
              disabled={!!jsonError}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                backgroundColor: jsonError ? "#6c757d" : "#28a745",
                color: "#fff",
                cursor: jsonError ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                minWidth: "120px"
              }}
            >
              💾 Save Changes
            </button>
          )}
          <button
            onClick={handleEditToggle}
            style={{
              padding: "8px 16px",
              border: isEditing ? "2px solid #dc3545" : "2px solid #28a745",
              borderRadius: "5px",
              backgroundColor: isEditing ? "#dc3545" : "#28a745",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              minWidth: "120px"
            }}
          >
            {isEditing ? "❌ Cancel Edit" : "✏️ Edit JSON"}
          </button>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ 
        marginBottom: 10, 
        fontSize: "14px", 
        color: "#666",
        flexShrink: 0
      }}>
        {warehouseData ? (
          <div>
            <div style={{ marginBottom: "5px" }}>
              <strong>Warehouse:</strong> {warehouseData.warehouse.width}×{warehouseData.warehouse.height} | 
              <strong> Bots:</strong> {warehouseData.warehouse.problem_statement?.ranger_list?.length || 0} | 
              <strong> PPS:</strong> {warehouseData.warehouse.problem_statement?.pps_list?.length || 0} | 
              <strong> MSU:</strong> {warehouseData.warehouse.problem_statement?.transport_entity_list?.length || 0}
            </div>
            {!isEditing && (
              <div style={{ 
                fontSize: "12px", 
                color: "#007bff",
                fontStyle: "italic"
              }}>
                💡 Click "✏️ Edit JSON" button above to modify the problem statement
              </div>
            )}
          </div>
        ) : (
          "No warehouse data available"
        )}
      </div>

      {/* JSON Content */}
      <div style={{ 
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isEditing ? (
          <>
            <textarea
              value={editValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              style={{
                width: "100%",
                flex: 1,
                fontFamily: "monospace",
                fontSize: "12px",
                border: jsonError ? "2px solid red" : "1px solid #ccc",
                borderRadius: "4px",
                padding: "12px",
                resize: "none",
                outline: "none"
              }}
              placeholder="Enter valid JSON..."
            />
            {jsonError && (
              <div style={{ 
                color: "red", 
                fontSize: "12px", 
                marginTop: "5px",
                padding: "8px",
                backgroundColor: "#ffe6e6",
                border: "1px solid red",
                borderRadius: "3px"
              }}>
                <strong>JSON Error:</strong> {jsonError}
              </div>
            )}
          </>
        ) : (
          <pre style={{
            flex: 1,
            overflow: "auto",
            fontFamily: "monospace",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "12px",
            backgroundColor: "#fff",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {problemStatementJson}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ProblemStatementViewer;
