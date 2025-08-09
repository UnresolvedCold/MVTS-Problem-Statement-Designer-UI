// src/components/LogViewer.js
import React, { useState, useRef, useEffect } from 'react';

const LogViewer = ({ logs, isStreaming, onClearLogs }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Get log level color
  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return '#dc3545';
      case 'warn':
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#17a2b8';
      case 'debug':
        return '#6c757d';
      default:
        return '#333';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      return timestamp.toString();
    }
  };

  // Handle log container scroll to detect if user is scrolling up
  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      setAutoScroll(isAtBottom);
    }
  };

  if (logs.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div style={{
      marginTop: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '12px 16px',
          backgroundColor: isStreaming ? '#e8f5e8' : '#f8f9fa',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>
            {isCollapsed ? '▶️' : '▼️'}
          </span>
          <h4 style={{ 
            margin: 0, 
            fontSize: '16px', 
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Processing Logs
            {isStreaming && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: '#28a745',
                fontWeight: 'normal'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#28a745', 
                  borderRadius: '50%',
                  animation: 'pulse 1s ease-in-out infinite'
                }}></span>
                Streaming...
              </span>
            )}
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {logs.length} log{logs.length !== 1 ? 's' : ''}
          </span>
          {logs.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: '1px solid #dc3545',
                borderRadius: '3px',
                backgroundColor: '#fff',
                color: '#dc3545',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div>
          {/* Controls */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '12px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll
            </label>
            <span style={{ color: '#666' }}>
              {isStreaming ? 'Receiving logs...' : `${logs.length} logs received`}
            </span>
          </div>

          {/* Logs Container */}
          <div
            ref={logContainerRef}
            onScroll={handleScroll}
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            {logs.length === 0 && isStreaming && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                padding: '20px'
              }}>
                Waiting for logs...
              </div>
            )}
            
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${getLogLevelColor(log.level)}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '2px 6px',
                      fontSize: '10px',
                      borderRadius: '3px',
                      backgroundColor: getLogLevelColor(log.level),
                      color: '#fff',
                      fontWeight: 'bold'
                    }}>
                      {log.level}
                    </span>
                    <span style={{ color: '#666', fontSize: '10px' }}>
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <span style={{ color: '#999', fontSize: '10px' }}>
                    {log.receivedAt}
                  </span>
                </div>
                
                {log.logger && (
                  <div style={{
                    fontSize: '10px',
                    color: '#666',
                    marginBottom: '4px',
                    fontStyle: 'italic'
                  }}>
                    {log.logger}
                  </div>
                )}
                
                <div style={{ 
                  color: '#333',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LogViewer;
