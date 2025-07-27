import React, { useState, useEffect } from 'react';

const TaskPropertyEditor = ({ 
  selectedTask, 
  onUpdateProperties,
  onClose,
  availablePPS = [],
  availableMSU = []
}) => {
  const [formValues, setFormValues] = useState({});

  // Update values when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setFormValues({ ...selectedTask });
    } else {
      setFormValues({});
    }
  }, [selectedTask]);

  // Handle form field changes
  const handleFormChange = (key, value) => {
    const updatedValues = { ...formValues, [key]: value };
    setFormValues(updatedValues);
    onUpdateProperties(selectedTask.task_key || selectedTask.id, updatedValues);
  };

  if (!selectedTask) {
    return null;
  }

  return (
    <div style={{
      width: 300,
      padding: 15,
      borderLeft: "1px solid #ccc",
      backgroundColor: "#f8f9fa",
      height: "100%",
      overflowY: "auto"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 15
      }}>
        <h4 style={{ margin: 0 }}>Task Properties</h4>
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

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Task Key:
        </label>
        <input
          type="text"
          value={formValues.task_key || ''}
          onChange={(e) => handleFormChange('task_key', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Destination ID (PPS ID):
        </label>
        <select
          value={formValues.destination_id || ''}
          onChange={(e) => handleFormChange('destination_id', parseInt(e.target.value) || null)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="">Select PPS</option>
          {availablePPS.map((pps) => (
            <option key={pps.id} value={pps.id}>
              PPS-{pps.id}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Transport Entity ID (MSU ID):
        </label>
        <select
          value={formValues.transport_entity_id || ''}
          onChange={(e) => handleFormChange('transport_entity_id', parseInt(e.target.value) || null)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="">Select MSU</option>
          {availableMSU.map((msu) => (
            <option key={msu.id} value={msu.id}>
              MSU-{msu.id}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Transport Entity Type:
        </label>
        <input
          type="text"
          value={formValues.transport_entity_type || ''}
          onChange={(e) => handleFormChange('transport_entity_type', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Task Type:
        </label>
        <input
          type="text"
          value={formValues.task_type || ''}
          onChange={(e) => handleFormChange('task_type', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Status:
        </label>
        <input
          type="text"
          value={formValues.status || ''}
          onChange={(e) => handleFormChange('status', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Task Subtype:
        </label>
        <select
          value={formValues.task_subtype || 'unknown'}
          onChange={(e) => handleFormChange('task_subtype', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="unknown">Unknown</option>
          <option value="pick">Pick</option>
          <option value="place">Place</option>
          <option value="transport">Transport</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Assigned Ranger ID:
        </label>
        <input
          type="number"
          value={formValues.assigned_ranger_id || ''}
          onChange={(e) => handleFormChange('assigned_ranger_id', parseInt(e.target.value) || null)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Destination:
        </label>
        <input
          type="text"
          value={formValues.destination || ''}
          onChange={(e) => handleFormChange('destination', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Aisle Info:
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>Aisle ID:</label>
            <input
              type="number"
              value={formValues.aisle_info?.aisle_id || 0}
              onChange={(e) => handleFormChange('aisle_info', {
                ...formValues.aisle_info,
                aisle_id: parseInt(e.target.value) || 0
              })}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px"
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>X Coord:</label>
            <input
              type="number"
              value={formValues.aisle_info?.aisle_coordinate?.[0] || 0}
              onChange={(e) => {
                const currentCoord = formValues.aisle_info?.aisle_coordinate || [0, 0];
                handleFormChange('aisle_info', {
                  ...formValues.aisle_info,
                  aisle_coordinate: [parseInt(e.target.value) || 0, currentCoord[1]]
                });
              }}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px"
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>Y Coord:</label>
            <input
              type="number"
              value={formValues.aisle_info?.aisle_coordinate?.[1] || 0}
              onChange={(e) => {
                const currentCoord = formValues.aisle_info?.aisle_coordinate || [0, 0];
                handleFormChange('aisle_info', {
                  ...formValues.aisle_info,
                  aisle_coordinate: [currentCoord[0], parseInt(e.target.value) || 0]
                });
              }}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPropertyEditor;
