// src/components/AssignmentsSummary.js
import React, { useState } from 'react';

const AssignmentsSummary = ({ warehouseData, onRemoveAssignment, onSelectAssignment, selectedAssignment }) => {
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
                onClick={() => onSelectAssignment && onSelectAssignment(assignment)}
                style={{
                  padding: '8px',
                  marginBottom: '5px',
                  backgroundColor: selectedAssignment?.id === assignment.id ? '#e3f2fd' : 'white',
                  border: selectedAssignment?.id === assignment.id ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: onSelectAssignment ? 'pointer' : 'default',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {assignment.task_key || `Assignment #${index + 1}`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', display: 'flex', gap: '8px' }}>
                    <span>DockPPS: {assignment.dock_pps_id}</span>
                    <span>Bot: {assignment.assigned_ranger_id}</span>
                    <span>MSU: {assignment.transport_entity_id}</span>
                  </div>
                </div>
                
                {/* Assignment Actions */}
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'flex-end'
                }}>
                  {onRemoveAssignment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAssignment(assignment.pps_id, assignment.id);
                      }}
                      style={{
                        padding: '2px 6px',
                        border: 'none',
                        borderRadius: '2px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                      title="Remove Assignment"
                    >
                      Remove
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
