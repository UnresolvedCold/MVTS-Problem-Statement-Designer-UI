// src/hooks/useLocalTaskManager.js
import { useState, useCallback } from 'react';

export const useLocalTaskManager = (localStateManager, schemaManager) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const {
    localWarehouseData,
    addTaskToLocal,
    removeTaskFromLocal,
    updateTaskInLocal,
    templates
  } = localStateManager;

  const { getTemplate } = schemaManager;

  // Generate unique task key
  const generateTaskKey = useCallback(() => {
    const existing = localWarehouseData.warehouse.problem_statement.task_list || [];
    const maxNum = existing.reduce((max, task) => {
      const match = (task.task_key || '').match(/task-(\d+)/);
      return Math.max(max, match ? parseInt(match[1]) : 0);
    }, 0);
    return `task-${maxNum + 1}`;
  }, [localWarehouseData]);

  // Add a new task
  const addTask = useCallback(async (taskData = {}) => {
    try {
      // Get template from schema manager (unified for all types)
      let template = templates.task;
      if (!template) {
        console.log('Getting task template from schema manager...');
        template = getTemplate('task');
        
        if (!template) {
          throw new Error('No task template available. Please load schemas first.');
        }
      }

      // Generate new task key
      const newTaskKey = generateTaskKey();
      
      // Create task data
      const newTask = {
        ...template,
        ...taskData,
        task_key: newTaskKey
      };

      // Add to local warehouse data
      addTaskToLocal(newTask);

      // Add to visual tasks
      setTasks(prev => [...prev, newTask]);

      console.log('Added task to local state:', newTask);
      return newTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  }, [templates, getTemplate, generateTaskKey, addTaskToLocal]);

  // Remove a task
  const removeTask = useCallback((taskId) => {
    // Clear selection if the removed task was selected
    if (selectedTask?.task_key === taskId || selectedTask?.id === taskId) {
      setSelectedTask(null);
    }

    // Remove from local warehouse data
    removeTaskFromLocal(taskId);

    // Remove from visual tasks
    setTasks(prev => prev.filter(task => 
      (task.task_key !== taskId && task.id !== taskId)
    ));

    console.log('Removed task from local state:', taskId);
  }, [selectedTask, removeTaskFromLocal]);

  // Update task properties
  const updateTaskProperties = useCallback((taskId, newProperties) => {
    // Update local tasks state
    setTasks(currentTasks => {
      const updatedTasks = currentTasks.map((task) =>
        (task.task_key === taskId || task.id === taskId)
          ? { ...task, ...newProperties } 
          : task
      );
      
      // Update selected task if it's the one being edited
      if (selectedTask?.task_key === taskId || selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, ...newProperties });
      }
      
      return updatedTasks;
    });

    // Update in local warehouse data
    updateTaskInLocal(taskId, newProperties);

    console.log('Updated task in local state:', taskId, newProperties);
  }, [selectedTask, updateTaskInLocal]);

  // Load tasks from warehouse data
  const loadTasksFromWarehouse = useCallback((warehouseData) => {
    const loadedTasks = [];
    
    // Load tasks from task_list
    if (warehouseData.warehouse.problem_statement?.task_list) {
      warehouseData.warehouse.problem_statement.task_list.forEach((task) => {
        loadedTasks.push({ ...task });
      });
    }
    
    console.log('Loaded tasks from warehouse data:', loadedTasks);
    setTasks(loadedTasks);
  }, []);

  return {
    tasks,
    selectedTask,
    setSelectedTask,
    addTask,
    removeTask,
    updateTaskProperties,
    loadTasksFromWarehouse,
    setTasks
  };
};
