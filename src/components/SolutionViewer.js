import React, { useState } from 'react';

const SolutionViewer = ({ solutionData, onClose }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'assignment', 'all'

  // Parse assignments data
  const parseAssignments = () => {
    if (!solutionData) {
      return { assignments: [], schedule: null };
    }

    try {
      // Handle new format from PROBLEM_STATEMENT_SOLVED
      if (solutionData.schedule) {
        return {
          assignments: solutionData.schedule.assignments || [],
          schedule: solutionData.schedule,
          requestId: solutionData.request_id
        };
      }

      // Handle legacy format or string assignments
      if (solutionData.assignments) {
        const parsed = typeof solutionData.assignments === 'string' 
          ? JSON.parse(solutionData.assignments)
          : solutionData.assignments;
        
        return {
          assignments: parsed.schedule?.assignments || parsed.assignments || [],
          schedule: parsed.schedule || null,
          requestId: parsed.request_id || null
        };
      }

      return { assignments: [], schedule: null, requestId: null };
    } catch (error) {
      console.error('Error parsing assignments:', error);
      return { assignments: [], schedule: null, requestId: null };
    }
  };

  const { assignments, schedule, requestId } = parseAssignments();

  // Handle assignment selection
  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setViewMode('assignment');
  };

  // Format JSON as pretty string
  const formatJsonString = (data) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div style={{
      width: 400,
      minWidth: 350,
      maxWidth: 500,
      padding: 15,
      borderLeft: "1px solid #ccc",
      backgroundColor: "#f8f9fa",
      height: "100%",
      overflowY: "auto",
      fontFamily: "Arial, sans-serif",
      position: "relative"
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 15
      }}>
        <h4 style={{ margin: 0, color: "#333" }}>🎯 Solution</h4>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {solutionData && (
            <button
              onClick={() => {
                setSelectedAssignment(null);
                setViewMode('list');
              }}
              style={{
                background: "none",
                border: "1px solid #28a745",
                borderRadius: "3px",
                fontSize: "10px",
                cursor: "pointer",
                color: "#28a745",
                padding: "2px 6px"
              }}
              title="Refresh view"
            >
              🔄
            </button>
          )}
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div style={{ 
        display: "flex", 
        marginBottom: 15,
        borderBottom: "1px solid #ddd"
      }}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderBottom: viewMode === 'list' ? "2px solid #28a745" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: viewMode === 'list' ? "bold" : "normal",
            color: viewMode === 'list' ? "#28a745" : "#666",
            fontSize: "12px"
          }}
        >
          Assignments
        </button>
        <button
          onClick={() => setViewMode('all')}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderBottom: viewMode === 'all' ? "2px solid #28a745" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: viewMode === 'all' ? "bold" : "normal",
            color: viewMode === 'all' ? "#28a745" : "#666",
            fontSize: "12px"
          }}
        >
          Full Solution
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <div>
          {/* Assignment Summary */}
          <div style={{ 
            backgroundColor: "#e8f5e8", 
            padding: "10px", 
            borderRadius: "5px", 
            marginBottom: "15px",
            border: "1px solid #c3e6c3"
          }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
              📊 Summary
            </div>
            <div style={{ fontSize: "12px", color: "#555" }}>
              Total Assignments: <strong>{assignments.length}</strong>
            </div>
            {schedule?.cost && (
              <div style={{ fontSize: "12px", color: "#555" }}>
                Feasible: <strong>{schedule.cost.feasible ? '✅ Yes' : '❌ No'}</strong>
              </div>
            )}
          </div>

          {/* Assignments List */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "bold", 
              marginBottom: "10px",
              color: "#333"
            }}>
              📋 Assignments ({assignments.length})
            </div>
            
            {assignments.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                color: "#666", 
                fontSize: "12px",
                padding: "20px",
                fontStyle: "italic"
              }}>
                No assignments available
              </div>
            ) : (
              assignments.map((assignment, index) => (
                <div
                  key={index}
                  onClick={() => handleAssignmentClick(assignment)}
                  style={{
                    padding: "10px",
                    marginBottom: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    fontSize: "12px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#f0f8f0";
                    e.target.style.borderColor = "#28a745";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.borderColor = "#ddd";
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px"
                  }}>
                    <div style={{ fontWeight: "bold", color: "#333" }}>
                      🎯 {assignment.task_key || `Assignment ${index + 1}`}
                    </div>
                    <div style={{ 
                      fontSize: "10px", 
                      color: "#666",
                      backgroundColor: "#f8f9fa",
                      padding: "2px 6px",
                      borderRadius: "3px"
                    }}>
                      {assignment.task_type || 'N/A'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "3px" }}>
                    <strong>🤖 Bot ID:</strong> {assignment.assigned_ranger_id || 'N/A'}
                  </div>
                  
                  {assignment.transport_entity_id && (
                    <div style={{ marginBottom: "3px" }}>
                      <strong>📦 Msu ID:</strong> {assignment.transport_entity_type}-{assignment.transport_entity_id}
                    </div>
                  )}
                  
                  {assignment.dock_pps_id && (
                    <div>
                      <strong>🏭 PPS ID:</strong> {assignment.dock_pps_id}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {viewMode === 'assignment' && selectedAssignment && (
        <div>
          {/* Assignment Detail Header */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "15px"
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: "#28a745",
                marginRight: "10px"
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
              Assignment Details
            </div>
          </div>

          {/* Assignment JSON */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ 
              fontSize: "12px", 
              fontWeight: "bold", 
              marginBottom: "8px",
              color: "#333"
            }}>
              JSON Data:
            </div>
            <pre
              style={{
                width: "100%",
                height: "400px",
                fontFamily: "monospace",
                fontSize: "11px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                margin: 0
              }}
            >
              {formatJsonString(selectedAssignment)}
            </pre>
          </div>
        </div>
      )}

      {viewMode === 'all' && (
        <div>
          {/* Full Solution View */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ 
              fontSize: "12px", 
              fontWeight: "bold", 
              marginBottom: "8px",
              color: "#333"
            }}>
              Complete Solution Data:
            </div>
            <pre
              style={{
                width: "100%",
                height: "500px",
                fontFamily: "monospace",
                fontSize: "10px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                margin: 0
              }}
            >
              {formatJsonString(solutionData)}
            </pre>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!solutionData && (
        <div style={{ 
          textAlign: "center", 
          color: "#666", 
          fontSize: "14px",
          marginTop: "50px",
          fontStyle: "italic"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🤔</div>
          <div>No solution data available</div>
          <div style={{ fontSize: "12px", marginTop: "5px" }}>
            Run the problem solver to generate assignments
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionViewer;
