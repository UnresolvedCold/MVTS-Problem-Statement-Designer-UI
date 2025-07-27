import React, { useState } from 'react';

const TasksList = ({ 
  tasks = [], 
  selectedTask, 
  onSelectTask, 
  onRemoveTask,
  onAddTask,
  availablePPS = [],
  availableMSU = []
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    pps_id: '',
    msu_id: ''
  });

  const handleAddTask = () => {
    if (newTaskData.pps_id && newTaskData.msu_id) {
      onAddTask({
        pps_id: newTaskData.pps_id,
        msu_id: newTaskData.msu_id
      });
      setNewTaskData({ pps_id: '', msu_id: '' });
      setShowAddForm(false);
    } else {
      alert('Please select both PPS and MSU');
    }
  };

  const cancelAdd = () => {
    setNewTaskData({ pps_id: '', msu_id: '' });
    setShowAddForm(false);
  };

  return (
    <div style={{ 
      width: 250, 
      padding: 10, 
      borderRight: "1px solid #ccc",
      backgroundColor: "#f8f9fa",
      height: "100%",
      overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Tasks</h3>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              padding: "5px 10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            + Add Task
          </button>
        )}
      </div>
      
      {/* Add Task Form */}
      {showAddForm && (
        <div style={{
          padding: "10px",
          border: "2px solid #28a745",
          borderRadius: "5px",
          marginBottom: "10px",
          backgroundColor: "white"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Create New Task</h4>
          
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
              Destination PPS:
            </label>
            <select
              value={newTaskData.pps_id}
              onChange={(e) => setNewTaskData({ ...newTaskData, pps_id: e.target.value })}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                fontSize: "12px"
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

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
              Transport MSU:
            </label>
            <select
              value={newTaskData.msu_id}
              onChange={(e) => setNewTaskData({ ...newTaskData, msu_id: e.target.value })}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                fontSize: "12px"
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

          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={handleAddTask}
              style={{
                flex: 1,
                padding: "5px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              Create
            </button>
            <button
              onClick={cancelAdd}
              style={{
                flex: 1,
                padding: "5px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {tasks.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          color: "#666", 
          fontSize: "14px",
          marginTop: "20px"
        }}>
          No tasks available
        </div>
      ) : (
        <div>
          {tasks.map((task, index) => (
            <div
              key={task.task_key || task.id || index}
              onClick={() => onSelectTask(task)}
              style={{
                padding: "8px",
                marginBottom: "5px",
                border: selectedTask?.task_key === task.task_key ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: selectedTask?.task_key === task.task_key ? "#e3f2fd" : "white",
                fontSize: "12px"
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {task.task_key || `Task #${index + 1}`}
              </div>
              
              <div style={{ marginBottom: "2px" }}>
                <strong>Destination:</strong> PPS-{task.destination_id || 'N/A'}
              </div>
              
              <div style={{ marginBottom: "2px" }}>
                <strong>Transport Entity:</strong> MSU-{task.transport_entity_id || 'N/A'}
              </div>
              
              {task.task_subtype && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Subtype:</strong> {task.task_subtype}
                </div>
              )}
              
              {task.status && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Status:</strong> {task.status}
                </div>
              )}
              
              {task.assigned_ranger_id && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Assigned Ranger:</strong> {task.assigned_ranger_id}
                </div>
              )}
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginTop: "8px"
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask(task);
                  }}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontSize: "10px"
                  }}
                >
                  Edit
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTask(task.task_key || task.id || index);
                  }}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontSize: "10px"
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksList;
