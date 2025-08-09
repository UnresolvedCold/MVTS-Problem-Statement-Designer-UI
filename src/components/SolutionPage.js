// src/components/SolutionPage.js
import React, { useState, useMemo } from 'react';
import LogViewer from './LogViewer';

const SolutionPage = ({ solutionData, logs, isStreaming, onClearLogs, onClear }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'gantt'
  
  // Process assignments for Gantt chart - must be before any conditional returns
  const ganttData = useMemo(() => {
    if (!solutionData) return [];
    
    const assignments = solutionData.schedule?.assignments || solutionData.assignments || [];
    
    // Calculate time scale with 5-second buffer at the end
    const allTimes = assignments.flatMap(a => [
      a.startTime || a.operator_start_time || 0,
      a.endTime || a.operator_end_time || 0
    ]);
    const minTime = Math.min(...allTimes, 0);
    const maxTime = Math.max(...allTimes, 1) + 5000; // Add 5-second (5000ms) buffer
    const timeRange = maxTime - minTime;
    
    return assignments.map(assignment => ({
      taskKey: assignment.task_key,
      botId: assignment.assigned_ranger_id,
      startTime: assignment.startTime || assignment.operator_start_time || 0,
      endTime: assignment.endTime || assignment.operator_end_time || 0,
      duration: (assignment.endTime || assignment.operator_end_time || 0) - (assignment.startTime || assignment.operator_start_time || 0),
      ppsId: assignment.dock_pps_id,
      msuId: assignment.transport_entity_id,
      // Calculate position for visual representation
      startPercent: timeRange > 0 ? ((assignment.startTime || assignment.operator_start_time || 0) - minTime) / timeRange * 100 : 0,
      durationPercent: timeRange > 0 ? ((assignment.endTime || assignment.operator_end_time || 0) - (assignment.startTime || assignment.operator_start_time || 0)) / timeRange * 100 : 100
    }));
  }, [solutionData]);
  
  // Show empty state if no data and not streaming
  if (!solutionData && (!logs || logs.length === 0) && !isStreaming) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666',
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>No Solution Available</h2>
        <p style={{ margin: '0 0 20px 0', maxWidth: '400px' }}>
          Run a problem statement to see the solution and processing logs here.
        </p>
        <div style={{
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '14px',
          maxWidth: '500px',
          border: '1px solid #bbdefb'
        }}>
          <strong>💡 Tip:</strong> Go to the Grid Editor tab, set up your warehouse with bots, PPS, MSUs, and tasks, then click "🚀 Run" to solve the problem.
        </div>
      </div>
    );
  }
  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(solutionData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "solution.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(solutionData, null, 2)).then(() => {
      console.log('Solution copied to clipboard');
    });
  };

  // Render Gantt Chart
  const renderGanttChart = () => {
    if (ganttData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No assignment data available for Gantt chart
        </div>
      );
    }

    // Group by bot
    const tasksByBot = ganttData.reduce((acc, task) => {
      if (!acc[task.botId]) {
        acc[task.botId] = [];
      }
      acc[task.botId].push(task);
      return acc;
    }, {});

    // Sort tasks by start time within each bot
    Object.keys(tasksByBot).forEach(botId => {
      tasksByBot[botId].sort((a, b) => a.startTime - b.startTime);
    });

    const allTimes = ganttData.flatMap(a => [a.startTime, a.endTime]);
    const minTime = Math.min(...allTimes, 0);
    const maxTime = Math.max(...allTimes, 1);

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
          {/* Time axis header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '2px solid #ddd',
            backgroundColor: '#f8f9fa',
            position: 'sticky',
            top: 0,
            zIndex: 2
          }}>
            <div style={{ width: '120px', fontWeight: 'bold', paddingLeft: '10px' }}>
              Bot ID
            </div>
            <div style={{ flex: 1, position: 'relative', height: '30px' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#666'
              }}>
                <span>{minTime}ms</span>
                <span>{Math.floor((minTime + maxTime) / 2)}ms</span>
                <span>{maxTime}ms</span>
              </div>
            </div>
          </div>

          {/* Gantt rows */}
          {Object.entries(tasksByBot).map(([botId, tasks]) => (
            <div key={botId} style={{
              display: 'flex',
              alignItems: 'center',
              minHeight: '50px',
              borderBottom: '1px solid #eee',
              backgroundColor: 'white'
            }}>
              <div style={{
                width: '120px',
                padding: '10px',
                fontWeight: 'bold',
                color: '#333',
                borderRight: '1px solid #eee'
              }}>
                Bot {botId}
              </div>
              <div style={{ flex: 1, position: 'relative', height: '40px', margin: '5px 0' }}>
                {tasks.map((task, index) => (
                  <div
                    key={`${task.taskKey}-${index}`}
                    style={{
                      position: 'absolute',
                      left: `${task.startPercent}%`,
                      width: `${Math.max(task.durationPercent, 2)}%`, // Minimum 2% width for visibility
                      height: '30px',
                      backgroundColor: '#28a745',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: '1px solid #1e7e34',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                    title={`Task: ${task.taskKey}\nBot: ${task.botId}\nStart: ${task.startTime}ms\nEnd: ${task.endTime}ms\nDuration: ${task.duration}ms\nPPS: ${task.ppsId}\nMSU: ${task.msuId}`}
                  >
                    <div style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      padding: '0 4px'
                    }}>
                      {task.taskKey}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Gantt Legend */}
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <strong>📊 Gantt Chart Legend:</strong>
          <div style={{ display: 'flex', gap: '20px', marginTop: '5px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ 
                width: '20px', 
                height: '15px', 
                backgroundColor: '#28a745', 
                borderRadius: '2px',
                border: '1px solid #1e7e34'
              }}></div>
              <span>Task Assignment</span>
            </div>
            <div>• Hover over bars for detailed information</div>
            <div>• Time scale shows start to end time range</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '100%',
      height: 'calc(100vh - 60px)', // Account for tab navigation
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #28a745',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: solutionData ? '#28a745' : isStreaming ? '#17a2b8' : '#ffc107',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {solutionData ? '🎉 Problem Solved!' : isStreaming ? '⚡ Solving Problem...' : '📊 Processing Logs'}
          {isStreaming && (
            <div style={{
              fontSize: '14px',
              color: '#17a2b8',
              fontWeight: 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#17a2b8', 
                borderRadius: '50%',
                animation: 'pulse 1s ease-in-out infinite'
              }}></span>
              Processing...
            </div>
          )}
        </h1>
        {onClear && (solutionData || logs.length > 0) && (
          <button
            onClick={onClear}
            style={{
              padding: '8px 16px',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              backgroundColor: '#dc3545',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Clear Results
          </button>
        )}
      </div>

      {/* Content Container */}
      <div style={{
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: solutionData && logs.length > 0 ? '1fr 1fr' : '1fr'
      }}>
        {/* Solution Section */}
        {solutionData && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #ddd',
            height: 'fit-content'
          }}>
            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <button
                onClick={handleCopyToClipboard}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📋 Copy Solution
              </button>
              
              <button
                onClick={handleDownload}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #28a745',
                  borderRadius: '4px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                💾 Download Solution
              </button>

              {/* View Mode Toggle */}
              {(solutionData.schedule?.assignments || solutionData.assignments) && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>View:</span>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #6c757d',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'list' ? '#6c757d' : 'white',
                      color: viewMode === 'list' ? 'white' : '#6c757d',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setViewMode('gantt')}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #6c757d',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'gantt' ? '#6c757d' : 'white',
                      color: viewMode === 'gantt' ? 'white' : '#6c757d',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📊 Gantt
                  </button>
                </div>
              )}
            </div>

            {/* Solution Summary */}
            {(solutionData.schedule?.assignments || solutionData.assignments) && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#e8f5e8',
                borderRadius: '5px',
                border: '1px solid #c3e6c3'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>📊 Solution Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <strong>Total Assignments:</strong> {(solutionData.schedule?.assignments || solutionData.assignments)?.length || 0}
                  </div>
                  <div>
                    <strong>Request ID:</strong> {solutionData.request_id || 'N/A'}
                  </div>
                  {(solutionData.schedule?.cost || solutionData.cost) && (
                    <>
                      <div>
                        <strong>Feasible:</strong> {(solutionData.schedule?.cost || solutionData.cost).feasible ? '✅ Yes' : '❌ No'}
                      </div>
                      <div>
                        <strong>Hard Score:</strong> {(solutionData.schedule?.cost || solutionData.cost).hard_score || 0}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Assignments Details */}
            {(solutionData.schedule?.assignments || solutionData.assignments) && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>🎯 Assignments</h3>
                
                {viewMode === 'list' ? (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {(solutionData.schedule?.assignments || solutionData.assignments).map((assignment, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        borderLeft: '4px solid #28a745'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '14px' }}>
                          <div><strong>Task:</strong> {assignment.task_key}</div>
                          <div><strong>Bot:</strong> {assignment.assigned_ranger_id}</div>
                          <div><strong>Start:</strong> {assignment.startTime || assignment.operator_start_time}ms</div>
                          <div><strong>End:</strong> {assignment.endTime || assignment.operator_end_time}ms</div>
                          <div><strong>PPS:</strong> {assignment.dock_pps_id}</div>
                          <div><strong>MSU:</strong> {assignment.transport_entity_id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderGanttChart()
                )}
              </div>
            )}

            {/* Complete Solution */}
            <div style={{
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>📄 Complete Solution</h3>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '12px',
                fontFamily: 'monospace',
                margin: 0
              }}>
                {JSON.stringify(solutionData, null, 2)}
              </pre>
            </div>

            {/* Next Steps */}
            <div style={{
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '5px',
              fontSize: '14px',
              border: '1px solid #bbdefb'
            }}>
              <strong>ℹ️ Next Steps:</strong>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Review the solution assignments above</li>
                <li>Copy or download the solution for further analysis</li>
                <li>Modify your problem statement and solve again if needed</li>
                <li>Use the assignment data to visualize the solution</li>
              </ul>
            </div>
          </div>
        )}

        {/* Log Viewer Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #ddd',
          overflow: 'hidden',
          height: 'fit-content'
        }}>
          <LogViewer
            logs={logs || []}
            isStreaming={isStreaming || false}
            onClearLogs={onClearLogs || (() => {})}
          />
        </div>
      </div>

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

export default SolutionPage;
