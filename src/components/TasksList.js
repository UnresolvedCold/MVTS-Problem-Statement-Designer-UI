import React, { useState } from 'react';

const TasksList = ({ 
  tasks = [], 
  selectedTask, 
  onSelectTask, 
  onRemoveTask,
  onAddTask,
  onAddAssignment,
  onSolveProblem,
  availablePPS = [],
  availableMSU = [],
  availableBots = []
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    pps_id: '',
    msu_id: ''
  });
  const [newAssignmentData, setNewAssignmentData] = useState({
    pps_id: '',
    msu_id: '',
    task_id: '',
    bot_id: ''
  });

  const handleAddTask = () => {
    if (newTaskData.pps_id && newTaskData.msu_id) {
      onAddTask({
        destination_id: newTaskData.pps_id,
        transport_entity_id: newTaskData.msu_id
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

  const handleAddAssignment = () => {
    if (newAssignmentData.pps_id && newAssignmentData.msu_id && newAssignmentData.bot_id) {
      onAddAssignment({
        pps_id: newAssignmentData.pps_id,
        msu_id: newAssignmentData.msu_id,
        bot_id: newAssignmentData.bot_id
      });
      setNewAssignmentData({ pps_id: '', msu_id: '', bot_id: '' });
      setShowAssignmentForm(false);
    } else {
      alert('Please select PPS, MSU, and Bot');
    }
  };

  const cancelAddAssignment = () => {
    setNewAssignmentData({ pps_id: '', msu_id: '', bot_id: '' });
    setShowAssignmentForm(false);
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
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {!showAddForm && !showAssignmentForm && (
            <>
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
              <button 
                onClick={() => setShowAssignmentForm(true)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                + Add Assignment
              </button>
            </>
          )}      
        </div>
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
              <option value="">Select PPS ({availablePPS.length} available)</option>
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
      
      {/* Add Assignment Form */}
      {showAssignmentForm && (
        <div style={{
          padding: "10px",
          border: "2px solid #17a2b8",
          borderRadius: "5px",
          marginBottom: "10px",
          backgroundColor: "white"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Create New Assignment</h4>
          
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
              PPS:
            </label>
            <select
              value={newAssignmentData.pps_id}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, pps_id: e.target.value })}
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

          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
              MSU:
            </label>
            <select
              value={newAssignmentData.msu_id}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, msu_id: e.target.value })}
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

          {/* <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
              Task ID:
            </label>
            <input
              type="text"
              value={newAssignmentData.task_id}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, task_id: e.target.value })}
              placeholder="Enter task ID"
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                fontSize: "12px"
              }}
            />
          </div> */}

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
              Bot:
            </label>
            <select
              value={newAssignmentData.bot_id}
              onChange={(e) => setNewAssignmentData({ ...newAssignmentData, bot_id: e.target.value })}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                fontSize: "12px"
              }}
            >
              <option value="">Select Bot</option>
              {availableBots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  Bot-{bot.id}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={handleAddAssignment}
              style={{
                flex: 1,
                padding: "5px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              Create Assignment
            </button>
            <button
              onClick={cancelAddAssignment}
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
                fontSize: "12px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {task.task_key || `Task: ${index + 1}`}
              </div>
              
              <div style={{ marginBottom: "2px" }}>
                <strong>Pps:</strong> {JSON.stringify(task.properties.destination_id) || 'N/A'}
              </div>
              
              <div style={{ marginBottom: "2px" }}>
                <strong>Msu:</strong> {JSON.stringify(task.properties.transport_entity_id) || 'N/A'}
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
              }}>              
                
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
