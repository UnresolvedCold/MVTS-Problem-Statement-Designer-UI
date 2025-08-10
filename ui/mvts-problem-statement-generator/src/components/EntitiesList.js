// src/components/EntitiesList.js
import React, { useState } from 'react';

const EntitiesList = ({ 
  objects, 
  tasks, 
  assignments,
  selectedObject, 
  selectedTask, 
  selectedAssignment,
  onObjectSelect, 
  onTaskSelect,
  onAssignmentSelect,
  onRemoveObject,
  onRemoveTask,
  onRemoveAssignment,
  warehouseData 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'bots', 'pps', 'msu', 'tasks', 'assignments'

  console.log('EntitiesList - Component rendered with props:', {
    objects: objects,
    objectsLength: objects?.length,
    objectsStructure: objects?.map(o => ({ id: o.id, type: o.type, properties: o.properties })),
    tasks: tasks,
    tasksLength: tasks?.length,
    filter: filter
  });

  // Get entity color and icon based on type
  const getEntityStyle = (type) => {
    const styles = {
      bot: { color: '#007bff', bgColor: '#e3f2fd', icon: '🤖', label: 'Bot' },
      pps: { color: '#28a745', bgColor: '#e8f5e9', icon: '🏠', label: 'PPS' },
      msu: { color: '#ffc107', bgColor: '#fff8e1', icon: '📦', label: 'MSU' },
      task: { color: '#17a2b8', bgColor: '#e0f7fa', icon: '📋', label: 'Task' },
      assignment: { color: '#6610f2', bgColor: '#f3e5f5', icon: '🎯', label: 'Assignment' }
    };
    return styles[type] || styles.bot;
  };

  // Combine and filter entities
  const getAllEntities = () => {
    const entities = [];
    
    console.log('EntitiesList - getAllEntities called with:', {
      objects: objects,
      objectsLength: objects?.length,
      filter: filter,
      objectTypes: objects?.map(o => o.type)
    });
    
    // Add objects (bots, pps, msu)
    objects.forEach(obj => {
      // Fix the filtering logic - need to handle pluralization correctly
      let shouldInclude = false;
      if (filter === 'all') {
        shouldInclude = true;
      } else if (filter === 'bots' && obj.type === 'bot') {
        shouldInclude = true;
      } else if (filter === 'pps' && obj.type === 'pps') {
        shouldInclude = true;
      } else if (filter === 'msu' && obj.type === 'msu') {
        shouldInclude = true;
      }
      
      console.log('EntitiesList - Processing object:', {
        objType: obj.type,
        objId: obj.id,
        objProperties: obj.properties,
        filter: filter,
        shouldInclude: shouldInclude,
        oldLogic: filter === 'all' || filter === `${obj.type}s`,
        newLogic: shouldInclude
      });
      
      if (shouldInclude) {
        // Create a more robust display name
        let displayName = `${getEntityStyle(obj.type).label}`;
        if (obj.properties?.id) {
          displayName += `-${obj.properties.id}`;
        } else if (obj.id) {
          displayName += `-${obj.id}`;
        } else {
          displayName += `-${objects.filter(o => o.type === obj.type).indexOf(obj) + 1}`;
        }

        // Add details for better identification
        let details = '';
        if (obj.type === 'pps' && obj.properties) {
          details = `Position: (${obj.properties.x || obj.x || 0}, ${obj.properties.y || obj.y || 0})`;
        } else if (obj.type === 'msu' && obj.properties) {
          details = `ID: ${obj.properties.msu_id || obj.properties.id || 'N/A'}`;
        } else if (obj.type === 'bot' && obj.properties) {
          details = `ID: ${obj.properties.ranger_id || obj.properties.id || 'N/A'}`;
        }

        const entityItem = {
          id: obj.id,
          type: obj.type,
          data: obj,
          displayName: displayName,
          details: details,
          onSelect: () => onObjectSelect(obj),
          onRemove: () => onRemoveObject(obj.id),
          isSelected: selectedObject?.id === obj.id
        };
        
        console.log('EntitiesList - Adding entity to list:', entityItem);
        entities.push(entityItem);
      }
    });

    // Add tasks
    if (filter === 'all' || filter === 'tasks') {
      tasks.forEach(task => {
        entities.push({
          id: task.task_key || task.id,
          type: 'task',
          data: task,
          displayName: task.task_key || `Task #${tasks.indexOf(task) + 1}`,
          details: `Dest: PPS-${task.properties?.destination_id}, MSU: ${task.properties?.transport_entity_id}`,
          onSelect: () => onTaskSelect(task),
          onRemove: () => onRemoveTask(task.task_key || task.id),
          isSelected: selectedTask?.task_key === task.task_key || selectedTask?.id === task.id
        });
      });
    }

    // Add assignments
    if (filter === 'all' || filter === 'assignments') {
      // Extract all assignments from all PPS
      if (warehouseData?.warehouse?.problem_statement?.pps_list) {
        warehouseData.warehouse.problem_statement.pps_list.forEach(pps => {
          if (pps.current_schedule?.assignments) {
            pps.current_schedule.assignments.forEach(assignment => {
              entities.push({
                id: assignment.id || assignment.task_key,
                type: 'assignment',
                data: assignment,
                displayName: assignment.task_key || `Assignment`,
                details: `PPS: ${assignment.dock_pps_id}, Bot: ${assignment.assigned_ranger_id}, MSU: ${assignment.transport_entity_id}`,
                onSelect: () => onAssignmentSelect(assignment),
                onRemove: () => onRemoveAssignment(pps.id, assignment.id || assignment.task_key),
                isSelected: selectedAssignment?.id === assignment.id || selectedAssignment?.task_key === assignment.task_key
              });
            });
          }
        });
      }
    }

    console.log('EntitiesList - Final entities array:', entities);
    console.log('EntitiesList - Entities length:', entities.length);
    return entities;
  };

  const entities = getAllEntities();
  console.log('EntitiesList - Rendered entities:', entities);
  const totalCounts = {
    bots: objects.filter(o => o.type === 'bot').length,
    pps: objects.filter(o => o.type === 'pps').length,
    msu: objects.filter(o => o.type === 'msu').length,
    tasks: tasks.length,
    assignments: warehouseData?.warehouse?.problem_statement?.pps_list?.reduce((total, pps) => 
      total + (pps.current_schedule?.assignments?.length || 0), 0) || 0
  };

  const filterButtons = [
    { key: 'all', label: 'All', count: entities.length },
    { key: 'bots', label: '🤖 Bots', count: totalCounts.bots },
    { key: 'pps', label: '🏠 PPS', count: totalCounts.pps },
    { key: 'msu', label: '📦 MSU', count: totalCounts.msu },
    { key: 'tasks', label: '📋 Tasks', count: totalCounts.tasks },
    { key: 'assignments', label: '🎯 Assignments', count: totalCounts.assignments }
  ];

  return (
    <div style={{ 
      width: 250, 
      padding: 10, 
      borderLeft: "1px solid #ccc", 
      backgroundColor: "#f8f9fa",
      height: "100%",
      overflowY: "auto"
    }}>
      {/* Header with collapse toggle */}
      <div 
        style={{
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 10,
          cursor: "pointer"
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 style={{ margin: 0 }}>Entities ({entities.length})</h3>
        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>

      {!isCollapsed && (
        <>
          {/* Filter buttons */}
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "4px", 
            marginBottom: "15px" 
          }}>
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  backgroundColor: filter === btn.key ? "#007bff" : "white",
                  color: filter === btn.key ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "500"
                }}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          {/* Entities list */}
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto'
          }}>
            {console.log('EntitiesList - Rendering entities list with:', {
              entitiesLength: entities.length,
              entities: entities.map(e => ({ id: e.id, type: e.type, displayName: e.displayName })),
              filter: filter
            })}
            {entities.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '12px',
                padding: '20px'
              }}>
                No {filter === 'all' ? 'entities' : filter} found
                {console.log('EntitiesList - Showing no entities message for filter:', filter)}
              </div>
            ) : (
              entities.map((entity) => {
                console.log('EntitiesList - Rendering entity:', {
                  id: entity.id,
                  type: entity.type,
                  displayName: entity.displayName,
                  details: entity.details
                });
                const style = getEntityStyle(entity.type);
                return (
                  <div
                    key={`${entity.type}-${entity.id}`}
                    onClick={entity.onSelect}
                    style={{
                      padding: "8px",
                      marginBottom: "4px",
                      border: entity.isSelected ? `2px solid ${style.color}` : "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: entity.isSelected ? style.bgColor : "white",
                      fontSize: "12px",
                      borderLeft: `4px solid ${style.color}`
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <div style={{ 
                        fontWeight: "bold", 
                        color: style.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{style.icon}</span>
                        {entity.displayName}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          entity.onRemove();
                        }}
                        style={{
                          padding: "2px 4px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "2px",
                          cursor: "pointer",
                          fontSize: "9px"
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                    
                    {entity.details && (
                      <div style={{ 
                        fontSize: "10px", 
                        color: "#666",
                        marginTop: "2px"
                      }}>
                        {entity.details}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EntitiesList;
