import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ProblemStatementViewer = ({ warehouseData, onClose, onSave }) => {
  const { isDark } = useTheme();
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
    <div className="w-full h-screen p-5 bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="m-0 text-gray-900 dark:text-gray-100">Problem Statement JSON</h3>
        <div className="flex gap-2.5 items-center">
          <button
            onClick={handleCopyToClipboard}
            className="py-1.5 px-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 cursor-pointer text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            📋 Copy
          </button>
          <button
            onClick={handleDownload}
            className="py-1.5 px-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 cursor-pointer text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            💾 Download
          </button>
          {isEditing && (
            <button
              onClick={() => {
                if (!jsonError) {
                  try {
                    const parsedJson = JSON.parse(editValue);
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
              className={`py-2 px-4 border-none rounded text-white cursor-pointer text-sm font-bold min-w-30 transition-colors ${
                jsonError 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
              }`}
            >
              💾 Save Changes
            </button>
          )}
          <button
            onClick={handleEditToggle}
            className={`py-2 px-4 border-2 rounded text-white cursor-pointer text-sm font-bold min-w-30 transition-colors ${
              isEditing 
                ? 'border-red-500 bg-red-500 hover:bg-red-600' 
                : 'border-green-500 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
            }`}
          >
            {isEditing ? "❌ Cancel Edit" : "✏️ Edit JSON"}
          </button>
          <button 
            onClick={onClose}
            className="bg-none border-none text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mb-2.5 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
        {warehouseData ? (
          <div>
            <div className="mb-1.5">
              <strong>Warehouse:</strong> {warehouseData.warehouse.width}×{warehouseData.warehouse.height} |
              <strong> Bots:</strong> {warehouseData.warehouse.problem_statement?.ranger_list?.length || 0} | 
              <strong> PPS:</strong> {warehouseData.warehouse.problem_statement?.pps_list?.length || 0} | 
              <strong> MSU:</strong> {warehouseData.warehouse.problem_statement?.transport_entity_list?.length || 0}
            </div>
            {!isEditing && (
              <div className="text-xs text-blue-600 dark:text-blue-400 italic">
                💡 Click "✏️ Edit JSON" button above to modify the problem statement
              </div>
            )}
          </div>
        ) : (
          "No warehouse data available"
        )}
      </div>

      {/* JSON Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isEditing ? (
          <>
            <textarea
              value={editValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full flex-1 font-mono text-xs rounded p-3 resize-none outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors ${
                jsonError 
                  ? 'border-2 border-red-500' 
                  : 'border border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter valid JSON..."
            />
            {jsonError && (
              <div className="text-red-600 dark:text-red-400 text-xs mt-1.5 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                <strong>JSON Error:</strong> {jsonError}
              </div>
            )}
          </>
        ) : (
          <pre className="flex-1 overflow-auto font-mono text-xs border border-gray-300 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 m-0 whitespace-pre-wrap break-words">
            {problemStatementJson}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ProblemStatementViewer;
