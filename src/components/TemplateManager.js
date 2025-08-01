// src/components/TemplateManager.js
import React, { useState, useEffect } from 'react';

const TemplateManager = ({ schemaManager, localStateManager, onClose }) => {
  const [schemas, setSchemas] = useState(schemaManager.schemas);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('ready');

  const { refreshSchemas, hasSchemas } = schemaManager;
  const { setTemplates: setLocalTemplates } = localStateManager;

  useEffect(() => {
    // Update local schemas when schema manager changes
    setSchemas(schemaManager.schemas);
  }, [schemaManager.schemas]);

  const handleLoadSchemas = async () => {
    setIsLoading(true);
    try {
      const newSchemas = await refreshSchemas();
      setSchemas(newSchemas);
      setLocalTemplates(newSchemas);
      console.log('Schemas refreshed successfully:', newSchemas);
    } catch (error) {
      console.error('Failed to refresh schemas:', error);
      alert('Failed to refresh schemas from server. Using cached/default schemas.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSchema = (type, schema) => {
    if (!schema) return <div>No schema available</div>;
    
    return (
      <div style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
          {type} Schema
        </h4>
        <pre style={{
          fontSize: '12px',
          maxHeight: '200px',
          overflow: 'auto',
          backgroundColor: '#fff',
          padding: '8px',
          borderRadius: '3px',
          margin: 0
        }}>
          {JSON.stringify(schema, null, 2)}
        </pre>
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
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
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
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleLoadSchemas}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Loading...' : 'Load Schemas from Server'}
            </button>
          </div>
        </div>

        {/* Schemas Display */}
        <div>
          <h3>Current Schemas</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            These schemas will be used when creating new objects and tasks. 
            Load from server to get the latest schemas, or use the defaults below.
          </p>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {Object.entries(schemas).map(([type, schema]) => (
              <div key={type}>
                {renderSchema(type, schema)}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>ℹ️ How it works:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>The app now maintains all state locally in your browser</li>
            <li>Schemas are fetched from the server via REST API and cached</li>
            <li>You can work offline after loading schemas</li>
            <li>Only the final problem statement is sent to the server for solving (via WebSocket)</li>
            <li>Your work is automatically saved to browser storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
