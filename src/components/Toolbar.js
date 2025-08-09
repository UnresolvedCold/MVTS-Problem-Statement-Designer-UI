import React, { useState } from 'react';

const Toolbar = ({ 
  rows, 
  cols, 
  cellSize, 
  onRowsChange, 
  onColsChange, 
  onCellSizeChange,
  onManageTemplates,
  onSolveProblem,
  onClearData,
  serverAPI,
  onAddObject,
  onAddTask,
  onAddAssignment,
  availablePPS,
  availableMSU,
  availableBots
}) => {
  const { isConnected, isLoading } = serverAPI;
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    destination_id: '',
    transport_entity_id: ''
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    pps_id: '',
    msu_id: '',
    bot_id: ''
  });

  const handleAddTask = () => {
    if (!taskFormData.destination_id || !taskFormData.transport_entity_id) {
      alert('Please select both PPS and MSU');
      return;
    }
    onAddTask({
      destination_id: parseInt(taskFormData.destination_id),
      transport_entity_id: parseInt(taskFormData.transport_entity_id)
    });
    setTaskFormData({ destination_id: '', transport_entity_id: '' });
    setShowTaskForm(false);
  };

  const handleAddAssignment = () => {
    if (!assignmentFormData.pps_id || !assignmentFormData.msu_id || !assignmentFormData.bot_id) {
      alert('Please select PPS, MSU, and Bot');
      return;
    }
    onAddAssignment({
      pps_id: parseInt(assignmentFormData.pps_id),
      msu_id: parseInt(assignmentFormData.msu_id),
      bot_id: parseInt(assignmentFormData.bot_id)
    });
    setAssignmentFormData({ pps_id: '', msu_id: '', bot_id: '' });
    setShowAssignmentForm(false);
  };

  return (
    <div style={{ width: 200, padding: 10, borderRight: "1px solid #ccc", overflow: 'auto' }}>
      {/* Grid Settings */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Grid Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Rows: </label>
            <input
              type="number"
              value={rows}
              onChange={(e) => onRowsChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Cols: </label>
            <input
              type="number"
              value={cols}
              onChange={(e) => onColsChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Cell Size: </label>
            <input
              type="number"
              value={cellSize}
              onChange={(e) => onCellSizeChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>
      </div>

      {/* Add Entities */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Add Entities</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button 
            onClick={() => onAddObject("bot")}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            🤖 Add Bot
          </button>
          <button 
            onClick={() => onAddObject("pps")}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            🏠 Add PPS
          </button>
          <button 
            onClick={() => onAddObject("msu")}
            style={{
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            📦 Add MSU
          </button>
          
          {/* Task Form */}
          {!showTaskForm ? (
            <button 
              onClick={() => setShowTaskForm(true)}
              style={{
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500"
              }}
            >
              📋 Add Task
            </button>
          ) : (
            <div style={{
              border: "2px solid #17a2b8",
              borderRadius: "4px",
              padding: "8px",
              backgroundColor: "white"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>
                Create New Task
              </div>
              
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "2px" }}>PPS:</label>
                <select
                  value={taskFormData.destination_id}
                  onChange={(e) => setTaskFormData({ ...taskFormData, destination_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "3px",
                    fontSize: "11px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                >
                  <option value="">Select PPS</option>
                  {availablePPS.map(pps => (
                    <option key={pps.id} value={pps.id}>PPS-{pps.id}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: "8px" }}>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "2px" }}>MSU:</label>
                <select
                  value={taskFormData.transport_entity_id}
                  onChange={(e) => setTaskFormData({ ...taskFormData, transport_entity_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "3px",
                    fontSize: "11px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                >
                  <option value="">Select MSU</option>
                  {availableMSU.map(msu => (
                    <option key={msu.id} value={msu.id}>MSU-{msu.id}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={handleAddTask}
                  style={{
                    flex: 1,
                    padding: "4px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "10px",
                    cursor: "pointer"
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskFormData({ destination_id: '', transport_entity_id: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: "4px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "10px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Assignment Form */}
          {!showAssignmentForm ? (
            <button 
              onClick={() => setShowAssignmentForm(true)}
              style={{
                backgroundColor: "#6610f2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500"
              }}
            >
              🎯 Add Assignment
            </button>
          ) : (
            <div style={{
              border: "2px solid #6610f2",
              borderRadius: "4px",
              padding: "8px",
              backgroundColor: "white"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>
                Create New Assignment
              </div>
              
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "2px" }}>PPS:</label>
                <select
                  value={assignmentFormData.pps_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, pps_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "3px",
                    fontSize: "11px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                >
                  <option value="">Select PPS</option>
                  {availablePPS.map(pps => (
                    <option key={pps.id} value={pps.id}>PPS-{pps.id}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "2px" }}>MSU:</label>
                <select
                  value={assignmentFormData.msu_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, msu_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "3px",
                    fontSize: "11px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                >
                  <option value="">Select MSU</option>
                  {availableMSU.map(msu => (
                    <option key={msu.id} value={msu.id}>MSU-{msu.id}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: "8px" }}>
                <label style={{ display: "block", fontSize: "11px", marginBottom: "2px" }}>Bot:</label>
                <select
                  value={assignmentFormData.bot_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, bot_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "3px",
                    fontSize: "11px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                >
                  <option value="">Select Bot</option>
                  {availableBots.map(bot => (
                    <option key={bot.id} value={bot.id}>Bot-{bot.id}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={handleAddAssignment}
                  style={{
                    flex: 1,
                    padding: "4px",
                    backgroundColor: "#6610f2",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "10px",
                    cursor: "pointer"
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowAssignmentForm(false);
                    setAssignmentFormData({ pps_id: '', msu_id: '', bot_id: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: "4px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "10px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Server Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Server Actions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ 
            fontSize: '12px', 
            color: isConnected ? 'green' : 'orange',
            marginBottom: '5px',
            fontWeight: 'bold'
          }}>
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <button
            onClick={onManageTemplates}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#f8f9fa",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            🔧 Manage Schemas
          </button>
          
          <button
            onClick={onSolveProblem}
            disabled={isLoading}
            style={{
              padding: "8px",
              border: "1px solid #28a745",
              borderRadius: "4px",
              backgroundColor: isLoading ? "#6c757d" : "#28a745",
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "12px"
            }}
          >
            {isLoading ? "🔄 Solving..." : "🚀 Solve Problem"}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Data Management</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={onClearData}
            style={{
              padding: "8px",
              border: "1px solid #dc3545",
              borderRadius: "4px",
              backgroundColor: "#dc3545",
              color: "white",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      {/* Local Storage Info */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '4px',
        fontSize: '11px',
        color: '#1565c0'
      }}>
        <strong>💡 Local Mode</strong>
        <div style={{ marginTop: '5px' }}>
          All changes are saved locally in your browser. Use templates to create new items and solve problems on the server.
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
