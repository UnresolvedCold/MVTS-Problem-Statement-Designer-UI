import { useState, useCallback } from 'react';

// Default properties for new tasks
const getDefaultTaskProperties = () => {
  return {
    id: Date.now(),
    destination_id: null,
    transport_entity_id: null,
    priority: "medium",
    status: "pending",
    created_at: new Date().toISOString(),
    deadline: null,
    task_type: "transport",
    description: "",
    requirements: []
  };
};

export const useTaskManager = (onWarehouseUpdate, loadingHandlers = {}) => {
  const { setIsLoading, setLoadingMessage } = loadingHandlers;
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const addTask = useCallback((taskCreationData) => {
    // Set loading state
    if (setIsLoading && setLoadingMessage) {
      setIsLoading(true);
      setLoadingMessage('Adding task...');
    }
    
    // Send ADD_TASK event to server with PPS and MSU IDs
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: 'ADD_TASK',
        taskData: {
          pps_id: taskCreationData.pps_id,
          msu_id: taskCreationData.msu_id
        }
      });
    }
  }, [onWarehouseUpdate, setIsLoading, setLoadingMessage]);

  const removeTask = useCallback((taskId) => {
    // Set loading state
    if (setIsLoading && setLoadingMessage) {
      setIsLoading(true);
      setLoadingMessage('Removing task...');
    }

    // Clear selection if the removed task was selected
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    
    // Send remove request to server
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: 'REMOVE_TASK',
        taskId: taskId
      });
    }
  }, [selectedTask, onWarehouseUpdate, setIsLoading, setLoadingMessage]);

  const updateTaskProperties = useCallback((taskId, newProperties) => {
    // Update local tasks state
    setTasks(currentTasks => {
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId 
          ? { ...task, ...newProperties } 
          : task
      );
      
      // Update selected task if it's the one being edited
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, ...newProperties });
      }
      
      // Send update to server
      if (onWarehouseUpdate) {
        onWarehouseUpdate({
          type: 'UPDATE_WAREHOUSE_DATA',
          data: {
            task_list: updatedTasks
          }
        });
      }
      
      return updatedTasks;
    });
  }, [selectedTask, onWarehouseUpdate]);

  const loadTasksFromWarehouse = useCallback((warehouseData) => {
    const loadedTasks = [];
    
    // Load tasks from task_list
    if (warehouseData.warehouse.problem_statement?.task_list) {
      warehouseData.warehouse.problem_statement.task_list.forEach((task) => {
        loadedTasks.push({ ...task });
      });
    }
    
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
