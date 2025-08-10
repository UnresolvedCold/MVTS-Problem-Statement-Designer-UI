// src/components/LogViewer.js
import React, { useState, useRef, useEffect, useMemo } from 'react';

const LogViewer = ({ logs, isStreaming, onClearLogs, embedded = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs based on search term and level
  const filteredLogs = useMemo(() => {
    let filtered = logs;
    
    // Filter by level
    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => 
        log.level?.toLowerCase() === levelFilter.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(searchLower) ||
        log.logger?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [logs, searchTerm, levelFilter]);

  // Get unique log levels for filter dropdown
  const availableLevels = useMemo(() => {
    const levels = new Set(logs.map(log => log.level).filter(Boolean));
    return ['ALL', ...Array.from(levels).sort()];
  }, [logs]);

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

  // Handle scroll to bottom manually
  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      setAutoScroll(true);
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
      marginTop: embedded ? '0' : '20px',
      border: embedded ? 'none' : '1px solid #ddd',
      borderRadius: embedded ? '0' : '8px',
      backgroundColor: '#fff',
      overflow: 'hidden'
    }}>
      {/* Header - only show when not embedded */}
      {!embedded && (
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
            {filteredLogs.length} of {logs.length} log{logs.length !== 1 ? 's' : ''}
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
      )}

      {/* Content */}
      {(!embedded || !isCollapsed) && (
        <div>
          {/* Search and Filter Controls */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '200px' }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '12px',
                  minWidth: '150px'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    padding: '2px 6px',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                style={{
                  padding: '2px 6px',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  fontSize: '11px',
                  backgroundColor: '#fff'
                }}
              >
                {availableLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-scroll Control */}
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
            <button
              onClick={scrollToBottom}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                backgroundColor: '#fff',
                color: '#007bff',
                cursor: 'pointer'
              }}
            >
              ⬇ Bottom
            </button>
            <span style={{ color: '#666' }}>
              {isStreaming ? 'Receiving logs...' : `${filteredLogs.length} logs displayed`}
            </span>
            {searchTerm && (
              <span style={{ color: '#007bff', fontStyle: 'italic' }}>
                Filtered by: "{searchTerm}"
              </span>
            )}
          </div>

          {/* Logs Container */}
          <div
            ref={logContainerRef}
            onScroll={handleScroll}
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            {filteredLogs.length === 0 && logs.length === 0 && isStreaming && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                padding: '20px'
              }}>
                Waiting for logs...
              </div>
            )}

            {filteredLogs.length === 0 && logs.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                padding: '20px'
              }}>
                No logs match the current filters.
                <br />
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLevelFilter('ALL');
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '4px 8px',
                    border: '1px solid #007bff',
                    borderRadius: '3px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {filteredLogs.map((log) => (
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
      <style>{`
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
