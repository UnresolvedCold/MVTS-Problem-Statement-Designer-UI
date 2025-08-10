// src/components/TemplateManager.js
import React, { useState, useEffect } from 'react';

const TemplateManager = ({ schemaManager, localStateManager, onClose }) => {
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
    
    if (!schema) return <div>No schema available</div>;
    
    return (
      <div style={{
        padding: '15px',
        border: isEditing ? '2px solid #007bff' : '1px solid #ddd',
        borderRadius: '6px',
        marginBottom: '15px',
        backgroundColor: isEditing ? '#f8f9ff' : '#f9f9f9'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h4 style={{ margin: 0, textTransform: 'capitalize', color: isEditing ? '#007bff' : '#333' }}>
            {type} Schema {isEditing && '(Editing)'}
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isEditing ? (
              <>
                <button
                  onClick={() => startEditing(type, schema)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => resetToDefault(type)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Reset
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveSchema}
                  disabled={!!jsonError}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: jsonError ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: jsonError ? 'not-allowed' : 'pointer'
                  }}
                >
                  💾 Save
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div>
            <textarea
              value={editingSchema}
              onChange={(e) => handleSchemaChange(e.target.value)}
              style={{
                width: '100%',
                height: '300px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: '12px',
                padding: '10px',
                border: jsonError ? '2px solid #dc3545' : '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                resize: 'vertical'
              }}
              placeholder="Enter valid JSON schema..."
            />
            {jsonError && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <strong>JSON Error:</strong> {jsonError}
              </div>
            )}
            {hasUnsavedChanges && !jsonError && (
              <div style={{
                marginTop: '8px',
                padding: '6px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                ⚠️ You have unsaved changes
              </div>
            )}
          </div>
        ) : (
          <pre style={{
            fontSize: '12px',
            maxHeight: '200px',
            overflow: 'auto',
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            margin: 0,
            border: '1px solid #e9ecef'
          }}>
            {JSON.stringify(schema, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '95%'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Schema Manager</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Warning for unsaved changes */}
        {hasUnsavedChanges && (
          <div style={{
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '5px',
            color: '#856404'
          }}>
            <strong>⚠️ Warning:</strong> You have unsaved changes. Make sure to save them before loading new schemas from the server.
          </div>
        )}

        {/* REST API Status and Controls */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>REST API Status: </strong>
            <span style={{
              color: 'green',
              fontWeight: 'bold'
            }}>
              READY
            </span>
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
              (No persistent connection required)
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleLoadSchemas}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Loading...' : '📥 Load Schemas from Server'}
            </button>
            
            {hasUnsavedChanges && (
              <span style={{
                fontSize: '12px',
                color: '#856404',
                fontStyle: 'italic'
              }}>
                (This will override your changes)
              </span>
            )}
          </div>
        </div>

        {/* Schemas Display */}
        <div>
          <h3>Current Schemas</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            Edit schemas directly below to customize how objects are created. 
            Click "Edit" to modify a schema, or "Load from Server" to get the latest versions.
          </p>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {Object.entries(schemas).map(([type, schema]) => (
              <div key={type}>
                {renderSchemaEditor(type, schema)}
              </div>
            ))}
          </div>
          
          {Object.keys(schemas).length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              border: '1px dashed #ccc'
            }}>
              No schemas available. Click "Load Schemas from Server" to fetch them.
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>ℹ️ How schema editing works:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>Edit:</strong> Click the edit button to modify any schema in JSON format</li>
            <li><strong>Real-time validation:</strong> JSON syntax errors are highlighted as you type</li>
            <li><strong>Save locally:</strong> Changes are saved to your browser's local storage</li>
            <li><strong>Load from server:</strong> Fetches latest schemas from server (overrides local changes)</li>
            <li><strong>Reset:</strong> Restores schema to default values</li>
            <li><strong>Used for creation:</strong> Modified schemas affect new objects and tasks you create</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
