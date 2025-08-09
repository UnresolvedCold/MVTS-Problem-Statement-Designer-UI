// src/hooks/useLocalStateManager.js
import { useState, useCallback, useEffect } from 'react';
import { GRID_CONFIG } from '../utils/constants';

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

export const useLocalStateManager = () => {
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

      // Save entire problem statement to localStorage
      localStorage.setItem('mvts-problem-statement', JSON.stringify(newProblemStatement));
      
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
    clearLocalData
  };
};
