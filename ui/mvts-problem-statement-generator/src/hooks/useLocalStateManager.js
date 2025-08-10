// src/hooks/useLocalStateManager.js
import { useState, useEffect, useCallback } from 'react';
import { getGridCfg } from '../utils/constants';

// Default problem statement template
const DEFAULT_PROBLEM_STATEMENT = {
  task_list: [],
  start_time: 0,
  request_id: 'PSG',
  pps_list: [],
  planning_duration_seconds: 5,
  transport_entity_list: [],
  maximizing_picks: false,
  ranger_list: [],
  conveyor_list: [],
  relay_point_list: []
};

export const useLocalStateManager = (schemaManager = null) => {
  const GRID_CONFIG = getGridCfg();
  
  // Local warehouse data state
  const [localWarehouseData, setLocalWarehouseData] = useState(() => {
    // Try to load from localStorage on initialization
    const saved = localStorage.getItem('mvts-warehouse-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved warehouse data:', e);
      }
    }
    
    // Return default structure
    return {
      warehouse: {
        width: GRID_CONFIG.DEFAULT_COLS,
        height: GRID_CONFIG.DEFAULT_ROWS,
        problem_statement: { ...DEFAULT_PROBLEM_STATEMENT }
      }
    };
  });

  // Templates from server
  const [templates, setTemplates] = useState({
    bot: null,
    pps: null,
    msu: null,
    task: null,
    relay: null,
    problemStatement: null
  });

  // Save to localStorage whenever localWarehouseData changes
  useEffect(() => {
    localStorage.setItem('mvts-warehouse-data', JSON.stringify(localWarehouseData));
  }, [localWarehouseData]);

  // Update local warehouse data
  const updateLocalWarehouseData = useCallback((updateFn) => {
    setLocalWarehouseData(prevData => {
      const newData = typeof updateFn === 'function' ? updateFn(prevData) : updateFn;
      return newData;
    });
  }, []);

  // Add object to problem statement
  const addObjectToLocal = useCallback((objectType, objectData) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      let listKey;
      
      switch (objectType) {
        case 'bot':
          listKey = 'ranger_list';
          break;
        case 'pps':
          listKey = 'pps_list';
          break;
        case 'msu':
          listKey = 'transport_entity_list';
          break;
        case 'task':
          listKey = 'task_list';
          break;
        case 'relay':
          listKey = 'relay_point_list';
          break;
        case 'assignment':
          listKey = 'assignment_list';
          break;
        default:
          console.warn('Unknown object type:', objectType);
          return prevData;
      }

      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: {
            ...problemStatement,
            [listKey]: [
              ...(problemStatement[listKey] || []),
              objectData
            ]
          }
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

  // Remove object from problem statement
  const removeObjectFromLocal = useCallback((objectType, objectId) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      let listKey;
      
      switch (objectType) {
        case 'bot':
          listKey = 'ranger_list';
          break;
        case 'pps':
          listKey = 'pps_list';
          break;
        case 'msu':
          listKey = 'transport_entity_list';
          break;
        case 'task':
          listKey = 'task_list';
          break;
        case 'relay':
          listKey = 'relay_point_list';
          break;
        case 'assignment':
          listKey = 'assignment_list';
          break;
        default:
          console.warn('Unknown object type:', objectType);
          return prevData;
      }

      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: {
            ...problemStatement,
            [listKey]: (problemStatement[listKey] || []).filter(
              item => {
                if (objectType === 'task') {
                  return (item.task_key || item.id) !== objectId;
                } else {
                  return item.id !== objectId;
                }
              }
            )
          }
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

  // Update object in problem statement
  const updateObjectInLocal = useCallback((objectType, objectId, newProperties) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      let listKey;
      
      switch (objectType) {
        case 'bot':
          listKey = 'ranger_list';
          break;
        case 'pps':
          listKey = 'pps_list';
          break;
        case 'msu':
          listKey = 'transport_entity_list';
          break;
        case 'task':
          listKey = 'task_list';
          break;
        case 'relay':
          listKey = 'relay_point_list';
          break;
        case 'assignment':
          listKey = 'assignment_list';
          break;
        default:
          console.warn('Unknown object type:', objectType);
          return prevData;
      }

      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: {
            ...problemStatement,
            [listKey]: (problemStatement[listKey] || []).map(item => {
              if (objectType === 'task') {
                return (item.task_key || item.id) === objectId ? { ...item, ...newProperties } : item;
              } else {
                return item.id === objectId ? { ...item, ...newProperties } : item;
              }
            })
          }
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

  // Add task to local state
  const addTaskToLocal = useCallback((taskData) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: {
            ...problemStatement,
            task_list: [
              ...(problemStatement.task_list || []),
              taskData
            ]
          }
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

  // Remove task from local state
  const removeTaskFromLocal = useCallback((taskId) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: {
            ...problemStatement,
            task_list: (problemStatement.task_list || []).filter(
              task => (task.task_key || task.id) !== taskId
            )
          }
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

  // Update task in local state
  const updateTaskInLocal = useCallback((taskId, newProperties) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: {
            ...problemStatement,
            task_list: (problemStatement.task_list || []).map(task =>
              (task.task_key || task.id) === taskId ? { ...task, ...newProperties } : task
            )
          }
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

  // Update grid size in local state
  const updateGridSizeInLocal = useCallback((width, height) => {
    setLocalWarehouseData(prevData => {
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          width,
          height
        }
      };

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedData.warehouse.problem_statement));
      
      return updatedData;
    });
  }, []);

    // Update entire problem statement in local state
  const updateProblemStatementInLocal = useCallback((newProblemStatement) => {
    setLocalWarehouseData(prevData => {
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: newProblemStatement
        }
      };
      
      // Save to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(newProblemStatement));
      
      return updatedData;
    });
  }, []);

  // Add assignment to PPS current_schedule
  // Generate unique task key for assignments
  const generateAssignmentTaskKey = useCallback((problemStatement) => {
    const allAssignments = [];
    
    // Collect all assignments from all PPS
    if (problemStatement.pps_list) {
      problemStatement.pps_list.forEach(pps => {
        if (pps.current_schedule?.assignments) {
          allAssignments.push(...pps.current_schedule.assignments);
        }
      });
    }
    
    // Find the highest number in existing task_keys with pattern a-{number}
    const maxNum = allAssignments.reduce((max, assignment) => {
      const match = (assignment.task_key || '').match(/a-(\d+)/);
      return Math.max(max, match ? parseInt(match[1]) : 0);
    }, 0);
    
    return `a-${maxNum + 1}`;
  }, []);

  const addAssignmentToPPS = useCallback((assignmentData) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      const ppsList = problemStatement.pps_list || [];
      
      // Find the target PPS
      const ppsIndex = ppsList.findIndex(pps => pps.id === parseInt(assignmentData.pps_id));
      
      if (ppsIndex === -1) {
        console.error('PPS not found with ID:', assignmentData.pps_id);
        throw new Error(`PPS with ID ${assignmentData.pps_id} not found`);
      }
      
      // Get assignment template from schema manager if available
      let assignmentTemplate = null;
      if (schemaManager && schemaManager.getTemplate) {
        try {
          assignmentTemplate = schemaManager.getTemplate('assignment');
          console.log('Using assignment template from server:', assignmentTemplate);
        } catch (error) {
          console.warn('Failed to get assignment template from server:', error);
        }
      }
      
      // Generate new task key automatically
      const newTaskKey = generateAssignmentTaskKey(problemStatement);
      console.log('Generated new task key for assignment:', newTaskKey);
      
      // Create the assignment object using server schema if available
      const assignment = assignmentTemplate ? {
        ...assignmentTemplate,
        // Override with provided data
        task_key: newTaskKey,
        assigned_ranger_id: parseInt(assignmentData.bot_id),
        dock_pps_id: parseInt(assignmentData.pps_id),
        transport_entity_id: parseInt(assignmentData.msu_id)
      } : {
        // Fallback assignment structure when no schema is available
        task_key: newTaskKey,
        assigned_ranger_id: parseInt(assignmentData.bot_id),
        dock_pps_id: parseInt(assignmentData.pps_id),
        transport_entity_id: parseInt(assignmentData.msu_id)
      };
      
      console.log('Created assignment:', assignment);
      
      // Update the PPS with the new assignment
      const updatedPpsList = [...ppsList];
      updatedPpsList[ppsIndex] = {
        ...updatedPpsList[ppsIndex],
        current_schedule: {
          ...updatedPpsList[ppsIndex].current_schedule,
          assignments: [
            ...(updatedPpsList[ppsIndex].current_schedule?.assignments || []),
            assignment
          ]
        }
      };
      
      const updatedProblemStatement = {
        ...problemStatement,
        pps_list: updatedPpsList
      };
      
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: updatedProblemStatement
        }
      };
      
      // Save to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedProblemStatement));
      
      return updatedData;
    });
  }, [schemaManager]);

  // Remove assignment from PPS current_schedule
  const removeAssignmentFromPPS = useCallback((ppsId, assignmentId) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      const ppsList = problemStatement.pps_list || [];
      
      // Find the target PPS
      const ppsIndex = ppsList.findIndex(pps => pps.id === parseInt(ppsId));
      
      if (ppsIndex === -1) {
        console.error('PPS not found with ID:', ppsId);
        return prevData;
      }
      
      // Remove the assignment from the PPS
      const updatedPpsList = [...ppsList];
      const currentAssignments = updatedPpsList[ppsIndex].current_schedule?.assignments || [];
      const filteredAssignments = currentAssignments.filter(assignment => assignment.id !== assignmentId);
      
      updatedPpsList[ppsIndex] = {
        ...updatedPpsList[ppsIndex],
        current_schedule: {
          ...updatedPpsList[ppsIndex].current_schedule,
          assignments: filteredAssignments
        }
      };
      
      const updatedProblemStatement = {
        ...problemStatement,
        pps_list: updatedPpsList
      };
      
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: updatedProblemStatement
        }
      };
      
      // Save to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedProblemStatement));
      
      return updatedData;
    });
  }, []);

  // Update assignment in PPS current_schedule
  const updateAssignmentInPPS = useCallback((ppsId, assignmentId, updatedProperties) => {
    setLocalWarehouseData(prevData => {
      const problemStatement = prevData.warehouse.problem_statement;
      const ppsList = problemStatement.pps_list || [];
      
      // Find the target PPS
      const ppsIndex = ppsList.findIndex(pps => pps.id === parseInt(ppsId));
      
      if (ppsIndex === -1) {
        console.error('PPS not found with ID:', ppsId);
        return prevData;
      }
      
      // Update the assignment in the PPS
      const updatedPpsList = [...ppsList];
      const currentAssignments = updatedPpsList[ppsIndex].current_schedule?.assignments || [];
      const updatedAssignments = currentAssignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, ...updatedProperties }
          : assignment
      );
      
      updatedPpsList[ppsIndex] = {
        ...updatedPpsList[ppsIndex],
        current_schedule: {
          ...updatedPpsList[ppsIndex].current_schedule,
          assignments: updatedAssignments
        }
      };
      
      const updatedProblemStatement = {
        ...problemStatement,
        pps_list: updatedPpsList
      };
      
      const updatedData = {
        ...prevData,
        warehouse: {
          ...prevData.warehouse,
          problem_statement: updatedProblemStatement
        }
      };
      
      // Save to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(updatedProblemStatement));
      
      return updatedData;
    });
  }, []);

  // Clear all local data
  const clearLocalData = useCallback(() => {
    const defaultData = {
      warehouse: {
        width: GRID_CONFIG.DEFAULT_COLS,
        height: GRID_CONFIG.DEFAULT_ROWS,
        problem_statement: { ...DEFAULT_PROBLEM_STATEMENT }
      }
    };
    setLocalWarehouseData(defaultData);
    localStorage.removeItem('mvts-warehouse-data');
    localStorage.removeItem('mvts-problem-statement');
  }, []);

  return {
    localWarehouseData,
    templates,
    setTemplates,
    updateLocalWarehouseData,
    addObjectToLocal,
    removeObjectFromLocal,
    updateObjectInLocal,
    addTaskToLocal,
    removeTaskFromLocal,
    updateTaskInLocal,
    updateGridSizeInLocal,
    updateProblemStatementInLocal,
    addAssignmentToPPS,
    removeAssignmentFromPPS,
    updateAssignmentInPPS,
    clearLocalData
  };
};
