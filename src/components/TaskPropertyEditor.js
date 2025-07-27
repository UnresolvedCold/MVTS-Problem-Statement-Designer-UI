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
    onUpdateProperties(selectedTask.id, updatedValues);
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
          Task ID:
        </label>
        <input
          type="text"
          value={formValues.id || ''}
          onChange={(e) => handleFormChange('id', e.target.value)}
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
          Destination (PPS ID):
        </label>
        <select
          value={formValues.destination_id || ''}
          onChange={(e) => handleFormChange('destination_id', e.target.value)}
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
          Transport Entity (MSU ID):
        </label>
        <select
          value={formValues.transport_entity_id || ''}
          onChange={(e) => handleFormChange('transport_entity_id', e.target.value)}
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
          Priority:
        </label>
        <select
          value={formValues.priority || 'medium'}
          onChange={(e) => handleFormChange('priority', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Status:
        </label>
        <select
          value={formValues.status || 'pending'}
          onChange={(e) => handleFormChange('status', e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
          Description:
        </label>
        <textarea
          value={formValues.description || ''}
          onChange={(e) => handleFormChange('description', e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            resize: "vertical"
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
          Deadline:
        </label>
        <input
          type="datetime-local"
          value={formValues.deadline ? new Date(formValues.deadline).toISOString().slice(0, 16) : ''}
          onChange={(e) => handleFormChange('deadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
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
          Created At:
        </label>
        <input
          type="text"
          value={formValues.created_at ? new Date(formValues.created_at).toLocaleString() : ''}
          disabled
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f5f5f5"
          }}
        />
      </div>
    </div>
  );
};

export default TaskPropertyEditor;
