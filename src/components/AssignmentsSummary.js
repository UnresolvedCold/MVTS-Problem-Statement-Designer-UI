// src/components/AssignmentsSummary.js
import React, { useState } from 'react';

const AssignmentsSummary = ({ warehouseData, onRemoveAssignment }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract all assignments from all PPS
  const getAllAssignments = () => {
    if (!warehouseData?.warehouse?.problem_statement?.pps_list) {
      return [];
    }

    const allAssignments = [];
    warehouseData.warehouse.problem_statement.pps_list.forEach(pps => {
      if (pps.current_schedule?.assignments) {
        pps.current_schedule.assignments.forEach(assignment => {
          allAssignments.push({
            ...assignment,
            pps_name: `PPS-${pps.id}`,
            pps_id: pps.id
          });
        });
      }
    });

    return allAssignments;
  };

  const assignments = getAllAssignments();

  if (assignments.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📋</div>
        <h4 style={{ margin: '0 0 5px 0' }}>No Assignments Yet</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Create assignments by selecting a task and clicking "Add Assignment"
        </p>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: '5px',
      margin: '10px 0',
      backgroundColor: 'white'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderBottom: isCollapsed ? 'none' : '1px solid #dee2e6',
          borderRadius: isCollapsed ? '5px' : '5px 5px 0 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h4 style={{ margin: 0, color: '#495057' }}>
          📋 Assignments Summary ({assignments.length})
        </h4>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div style={{ padding: '15px' }}>
          <div style={{
            display: 'grid',
            gap: '10px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {assignments.map((assignment, index) => (
              <div
                key={assignment.id || index}
                style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  borderLeft: '4px solid #007bff'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <div>
                    <strong>PPS:</strong> {assignment.pps_name}
                  </div>
                  <div>
                    <strong>Task:</strong> {assignment.task_key}
                  </div>
                  <div>
                    <strong>Bot:</strong> Bot-{assignment.assigned_ranger_id}
                  </div>
                  <div>
                    <strong>MSU:</strong> MSU-{assignment.transport_entity_id}
                  </div>
                  <div>
                    <strong>Start:</strong> {assignment.operator_start_time}ms
                  </div>
                  <div>
                    <strong>End:</strong> {assignment.operator_end_time}ms
                  </div>
                </div>
                
                {/* Assignment Actions */}
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'flex-end'
                }}>
                  {onRemoveAssignment && (
                    <button
                      onClick={() => onRemoveAssignment(assignment.pps_id, assignment.id)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #dc3545',
                        borderRadius: '3px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Remove Assignment"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#495057'
          }}>
            <strong>Summary:</strong> {assignments.length} assignments across {
              new Set(assignments.map(a => a.pps_id)).size
            } PPS stations
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsSummary;
