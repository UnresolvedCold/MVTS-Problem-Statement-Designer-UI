import React, { useState } from 'react';
import ClearStorageButton from "./ClearStorageButton";

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
    <div className="w-50 p-2.5 border-r border-gray-300 dark:border-gray-600 overflow-auto bg-white dark:bg-gray-900">
      {/* Grid Settings */}
      <div className="mb-5">
        <h3 className="text-gray-900 dark:text-gray-100">Grid Settings</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Rows: </label>
            <input
              type="number"
              value={rows}
              onChange={(e) => onRowsChange(parseInt(e.target.value))}
              className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Cols: </label>
            <input
              type="number"
              value={cols}
              onChange={(e) => onColsChange(parseInt(e.target.value))}
              className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Cell Size: </label>
            <input
              type="number"
              value={cellSize}
              onChange={(e) => onCellSizeChange(parseInt(e.target.value))}
              className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Add Entities */}
      <div className="mb-5">
        <h3 className="text-gray-900 dark:text-gray-100">Add Entities</h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onAddObject("bot")}
            className="bg-blue-500 dark:bg-blue-600 text-white border-none rounded px-2.5 py-1.5 cursor-pointer text-xs font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            🤖 Add Bot
          </button>
          <button 
            onClick={() => onAddObject("pps")}
            className="bg-green-500 dark:bg-green-600 text-white border-none rounded px-2.5 py-1.5 cursor-pointer text-xs font-medium hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
          >
            🏠 Add PPS
          </button>
          <button 
            onClick={() => onAddObject("msu")}
            className="bg-yellow-400 dark:bg-yellow-500 text-gray-800 dark:text-gray-900 border-none rounded px-2.5 py-1.5 cursor-pointer text-xs font-medium hover:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors"
          >
            📦 Add MSU
          </button>
          
          {/* Task Form */}
          {!showTaskForm ? (
            <button 
              onClick={() => setShowTaskForm(true)}
              className="bg-cyan-500 dark:bg-cyan-600 text-white border-none rounded px-2.5 py-1.5 cursor-pointer text-xs font-medium hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors"
            >
              📋 Add Task
            </button>
          ) : (
            <div className="border-2 border-cyan-500 dark:border-cyan-400 rounded p-2 bg-white dark:bg-gray-800">
              <div className="text-xs font-bold mb-2 text-gray-900 dark:text-gray-100">
                Create New Task
              </div>
              
              <div className="mb-1.5">
                <label className="block text-xs mb-0.5 text-gray-700 dark:text-gray-300">PPS:</label>
                <select
                  value={taskFormData.destination_id}
                  onChange={(e) => setTaskFormData({ ...taskFormData, destination_id: e.target.value })}
                  className="w-full p-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select PPS</option>
                  {availablePPS.map(pps => (
                    <option key={pps.id} value={pps.id}>PPS-{pps.id}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-2">
                <label className="block text-xs mb-0.5 text-gray-700 dark:text-gray-300">MSU:</label>
                <select
                  value={taskFormData.transport_entity_id}
                  onChange={(e) => setTaskFormData({ ...taskFormData, transport_entity_id: e.target.value })}
                  className="w-full p-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select MSU</option>
                  {availableMSU.map(msu => (
                    <option key={msu.id} value={msu.id}>MSU-{msu.id}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={handleAddTask}
                  className="flex-1 p-1 bg-cyan-500 dark:bg-cyan-600 text-white border-none rounded text-xs cursor-pointer hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskFormData({ destination_id: '', transport_entity_id: '' });
                  }}
                  className="flex-1 p-1 bg-gray-500 dark:bg-gray-600 text-white border-none rounded text-xs cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
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
              className="bg-purple-600 dark:bg-purple-700 text-white border-none rounded px-2.5 py-1.5 cursor-pointer text-xs font-medium hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
            >
              🎯 Add Assignment
            </button>
          ) : (
            <div className="border-2 border-purple-600 dark:border-purple-500 rounded p-2 bg-white dark:bg-gray-800">
              <div className="text-xs font-bold mb-2 text-gray-900 dark:text-gray-100">
                Create New Assignment
              </div>
              
              <div className="mb-1.5">
                <label className="block text-xs mb-0.5 text-gray-700 dark:text-gray-300">PPS:</label>
                <select
                  value={assignmentFormData.pps_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, pps_id: e.target.value })}
                  className="w-full p-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select PPS</option>
                  {availablePPS.map(pps => (
                    <option key={pps.id} value={pps.id}>PPS-{pps.id}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-1.5">
                <label className="block text-xs mb-0.5 text-gray-700 dark:text-gray-300">MSU:</label>
                <select
                  value={assignmentFormData.msu_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, msu_id: e.target.value })}
                  className="w-full p-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select MSU</option>
                  {availableMSU.map(msu => (
                    <option key={msu.id} value={msu.id}>MSU-{msu.id}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-2">
                <label className="block text-xs mb-0.5 text-gray-700 dark:text-gray-300">Bot:</label>
                <select
                  value={assignmentFormData.bot_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, bot_id: e.target.value })}
                  className="w-full p-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Bot</option>
                  {availableBots.map(bot => (
                    <option key={bot.id} value={bot.id}>Bot-{bot.id}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={handleAddAssignment}
                  className="flex-1 p-1 bg-purple-600 dark:bg-purple-700 text-white border-none rounded text-xs cursor-pointer hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowAssignmentForm(false);
                    setAssignmentFormData({ pps_id: '', msu_id: '', bot_id: '' });
                  }}
                  className="flex-1 p-1 bg-gray-500 dark:bg-gray-600 text-white border-none rounded text-xs cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Server Actions */}
      <div className="mb-5">
        <h3 className="text-gray-900 dark:text-gray-100">Server Actions</h3>
        <div className="flex flex-col gap-2">
          <div className={`text-xs mb-1.5 font-bold ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <button
            onClick={onManageTemplates}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 cursor-pointer text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
          >
            🔧 Manage Schemas
          </button>
          
          <button
            onClick={onSolveProblem}
            disabled={isLoading}
            className={`p-2 border rounded text-white text-xs transition-colors ${
              isLoading 
                ? 'border-gray-500 dark:border-gray-600 bg-gray-500 dark:bg-gray-600 cursor-not-allowed' 
                : 'border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-600 cursor-pointer hover:bg-green-600 dark:hover:bg-green-700'
            }`}
          >
            {isLoading ? "🔄 Solving..." : "🚀 Solve Problem"}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-5">
        <h3 className="text-gray-900 dark:text-gray-100">Data Management</h3>
        <div className="flex flex-col gap-2">
          <ClearStorageButton />
        </div>
      </div>

      {/* Local Storage Info */}
      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <strong>💡 Local Mode</strong>
        <div className="mt-1.5">
          All changes are saved locally in your browser. Use templates to create new items and solve problems on the server.
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
