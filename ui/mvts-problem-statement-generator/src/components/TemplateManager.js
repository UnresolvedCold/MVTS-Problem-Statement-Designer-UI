// src/components/TemplateManager.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TemplateManager = ({ schemaManager, localStateManager, onClose }) => {
  const { isDark } = useTheme();
  const [schemas, setSchemas] = useState(schemaManager.schemas);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [jsonError, setJsonError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { refreshSchemas, updateSchema } = schemaManager;
  const { setTemplates: setLocalTemplates } = localStateManager;

  useEffect(() => {
    // Update local schemas when schema manager changes
    setSchemas(schemaManager.schemas);
    setHasUnsavedChanges(false);
  }, [schemaManager.schemas]);

  const handleLoadSchemas = async () => {
    if (hasUnsavedChanges) {
      const confirmOverride = window.confirm(
        'Loading schemas from server will override your unsaved changes. Are you sure you want to continue?'
      );
      if (!confirmOverride) return;
    }

    setIsLoading(true);
    try {
      const newSchemas = await refreshSchemas();
      setSchemas(newSchemas);
      setLocalTemplates(newSchemas);
      setHasUnsavedChanges(false);
      setEditingSchema(null);
      setEditingType(null);
      console.log('Schemas refreshed successfully:', newSchemas);
    } catch (error) {
      console.error('Failed to refresh schemas:', error);
      alert('Failed to refresh schemas from server. Using cached/default schemas.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (type, schema) => {
    if (editingType && editingType !== type && hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Are you sure you want to switch to editing another schema?'
      );
      if (!confirmSwitch) return;
    }

    setEditingType(type);
    setEditingSchema(JSON.stringify(schema, null, 2));
    setJsonError(null);
  };

  const handleSchemaChange = (value) => {
    setEditingSchema(value);
    setHasUnsavedChanges(true);
    
    // Validate JSON in real-time
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message);
    }
  };

  const saveSchema = () => {
    if (!editingSchema || !editingType) return;

    try {
      const parsedSchema = JSON.parse(editingSchema);
      
      // Update schema in the manager
      updateSchema(editingType, parsedSchema);
      
      // Update local state
      setSchemas(prev => ({
        ...prev,
        [editingType]: parsedSchema
      }));
      
      // Update local templates
      setLocalTemplates(prev => ({
        ...prev,
        [editingType]: parsedSchema
      }));

      setHasUnsavedChanges(false);
      setEditingType(null);
      setEditingSchema(null);
      setJsonError(null);
      
      console.log(`Schema saved for ${editingType}:`, parsedSchema);
    } catch (error) {
      setJsonError(`Invalid JSON: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel editing?'
      );
      if (!confirmCancel) return;
    }

    setEditingType(null);
    setEditingSchema(null);
    setJsonError(null);
    setHasUnsavedChanges(false);
  };

  const resetToDefault = (type) => {
    const confirmReset = window.confirm(
      `Are you sure you want to reset the ${type} schema to default? This will lose any custom changes.`
    );
    if (!confirmReset) return;

    // You might want to define default schemas or fetch them from a defaults endpoint
    const defaultSchemas = {
      bot: { id: 1, coordinate: { x: 0, y: 0 } },
      pps: { id: 1, coordinate: { x: 0, y: 0 } },
      msu: { id: 1, coordinate: { x: 0, y: 0 } },
      task: { task_key: "task-1" },
      relay: { id: 1, coordinate: { x: 0, y: 0 } }
    };

    if (defaultSchemas[type]) {
      updateSchema(type, defaultSchemas[type]);
      setSchemas(prev => ({
        ...prev,
        [type]: defaultSchemas[type]
      }));
      console.log(`Reset ${type} schema to default`);
    }
  };

  const renderSchemaEditor = (type, schema) => {
    const isEditing = editingType === type;
    
    if (!schema) return <div className="text-gray-600 dark:text-gray-400">No schema available</div>;

    return (
      <div className={`p-4 border rounded mb-4 transition-colors ${
        isEditing 
          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
      }`}>
        <div className="flex justify-between items-center mb-2.5">
          <h4 className={`m-0 capitalize ${
            isEditing ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {type} Schema {isEditing && '(Editing)'}
          </h4>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => startEditing(type, schema)}
                  className="py-1 px-2 text-xs bg-green-500 dark:bg-green-600 text-white border-none rounded cursor-pointer hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => resetToDefault(type)}
                  className="py-1 px-2 text-xs bg-gray-500 dark:bg-gray-600 text-white border-none rounded cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  🔄 Reset
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveSchema}
                  disabled={!!jsonError}
                  className={`py-1 px-2 text-xs text-white border-none rounded cursor-pointer transition-colors ${
                    jsonError 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
                  }`}
                >
                  💾 Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="py-1 px-2 text-xs bg-red-500 dark:bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                >
                  ❌ Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col">
            <textarea
              value={editingSchema}
              onChange={(e) => handleSchemaChange(e.target.value)}
              className={`w-full min-h-[200px] max-h-[400px] p-2 font-mono text-xs rounded border resize-y bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors ${
                jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter valid JSON schema..."
              style={{ lineHeight: '1.4' }}
            />
            {jsonError && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-600 dark:text-red-400 text-xs">
                <strong>JSON Error:</strong> {jsonError}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <pre className="max-h-[300px] overflow-auto font-mono text-xs bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-gray-700 flex-shrink-0">
          <h2 className="m-0 text-gray-900 dark:text-gray-100 text-xl">🔧 Schema Manager</h2>
          <div className="flex gap-2.5 items-center">
            {hasUnsavedChanges && (
              <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                ⚠️ Unsaved Changes
              </span>
            )}
            <button
              onClick={handleLoadSchemas}
              disabled={isLoading}
              className={`py-2 px-4 text-white border-none rounded cursor-pointer transition-colors ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {isLoading ? '🔄 Loading...' : '↻ Refresh from Server'}
            </button>
            <button
              onClick={onClose}
              className="bg-none border-none text-xl cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-white dark:bg-gray-800">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-800 dark:text-blue-200">
            <strong>📋 Schema Management:</strong> Edit entity schemas to define the structure of objects that can be created in the grid.
            Changes are applied locally and used when creating new entities.
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">
              <div className="text-2xl mb-2">🔄</div>
              <div>Loading schemas from server...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(schemas).map(([type, schema]) => (
                <div key={type}>
                  {renderSchemaEditor(type, schema)}
                </div>
              ))}
            </div>
          )}

          {Object.keys(schemas).length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">
              <div className="text-2xl mb-2">📝</div>
              <div>No schemas available</div>
              <button
                onClick={handleLoadSchemas}
                className="mt-3 py-2 px-4 bg-blue-500 dark:bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                Load Schemas from Server
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
