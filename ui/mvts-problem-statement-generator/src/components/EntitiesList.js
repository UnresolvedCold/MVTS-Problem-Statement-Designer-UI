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
  const [filter, setFilter] = useState('all');

  // Get entity color and icon based on type
  const getEntityStyle = (type) => {
    const styles = {
      bot: { colorClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-900/20', borderClass: 'border-l-blue-600 dark:border-l-blue-400', icon: '🤖', label: 'Bot' },
      pps: { colorClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-50 dark:bg-green-900/20', borderClass: 'border-l-green-600 dark:border-l-green-400', icon: '🏠', label: 'PPS' },
      msu: { colorClass: 'text-yellow-600 dark:text-yellow-400', bgClass: 'bg-yellow-50 dark:bg-yellow-900/20', borderClass: 'border-l-yellow-600 dark:border-l-yellow-400', icon: '📦', label: 'MSU' },
      task: { colorClass: 'text-cyan-600 dark:text-cyan-400', bgClass: 'bg-cyan-50 dark:bg-cyan-900/20', borderClass: 'border-l-cyan-600 dark:border-l-cyan-400', icon: '📋', label: 'Task' },
      assignment: { colorClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-50 dark:bg-purple-900/20', borderClass: 'border-l-purple-600 dark:border-l-purple-400', icon: '🎯', label: 'Assignment' }
    };
    return styles[type] || styles.bot;
  };

  // Combine and filter entities
  const getAllEntities = () => {
    const entities = [];
    
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
          const ppsId = obj.properties.id || 'N/A';
          const coordinate = obj.properties.coordinate || {};
          details = `ID: ${ppsId}, Pos: (${coordinate.x || 0}, ${coordinate.y || 0})`;
        } else if (obj.type === 'msu' && obj.properties) {
          const msuId = obj.properties.id || 'N/A';
          const coordinate = obj.properties.coordinate || {};
          details = `ID: ${msuId}, Pos: (${coordinate.x || 0}, ${coordinate.y || 0})`;
        } else if (obj.type === 'bot' && obj.properties) {
          const botId = obj.properties.id || 'N/A';
          const coordinate = obj.properties.coordinate || {};
          details = `ID: ${botId}, Pos: (${coordinate.x || 0}, ${coordinate.y || 0})`;
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

    return entities;
  };

  const entities = getAllEntities();
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
    <div className="w-62 p-2.5 border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 h-full overflow-y-auto">
      {/* Header with collapse toggle */}
      <div 
        className="flex justify-between items-center mb-2.5 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="m-0 text-gray-900 dark:text-gray-100">Entities ({entities.length})</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>

      {!isCollapsed && (
        <>
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-1 mb-4">
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`py-1 px-2 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium cursor-pointer transition-colors ${
                  filter === btn.key 
                    ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          {/* Entities list */}
          <div className="max-h-96 overflow-y-auto">
            {entities.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-xs p-5">
                No {filter === 'all' ? 'entities' : filter} found
              </div>
            ) : (
              entities.map((entity) => {
                const style = getEntityStyle(entity.type);
                return (
                  <div
                    key={`${entity.type}-${entity.id}`}
                    onClick={entity.onSelect}
                    className={`p-2 mb-1 border rounded cursor-pointer text-xs border-l-4 transition-colors ${
                      entity.isSelected 
                        ? `border-2 ${style.bgClass} ${style.borderClass}` 
                        : `border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${style.borderClass}`
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className={`font-bold ${style.colorClass} flex items-center gap-1`}>
                        <span>{style.icon}</span>
                        <span className="text-gray-900 dark:text-gray-100">{entity.displayName}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          entity.onRemove();
                        }}
                        className="py-0.5 px-1 bg-red-500 dark:bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                    
                    {entity.details && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
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
