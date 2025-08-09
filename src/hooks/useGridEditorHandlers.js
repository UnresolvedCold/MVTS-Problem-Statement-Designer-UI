// src/hooks/useGridEditorHandlers.js
import { useCallback } from 'react';

export const useGridEditorHandlers = (
  objectManager, 
  localStateManager, 
  serverAPI,
  configManager,
  setSolutionData,
  setSelectedObject,
  cols,
  cellSize
) => {
  const { addObject } = objectManager;
  const { solveProblemStatement } = serverAPI;
  const { getConfigForProblemStatement } = configManager;

  const handleObjectSelect = useCallback((obj) => {
    setSelectedObject(obj);
  }, [setSelectedObject]);

  const handleTaskSelect = useCallback((task) => {
    setSelectedObject(task);
  }, [setSelectedObject]);

  const handleAddObjectFromList = useCallback((type) => {
    const defaultX = Math.floor(cols / 2) * cellSize;
    const defaultY = Math.floor(cols / 2) * cellSize;
    addObject(type, defaultX, defaultY);
  }, [addObject, cols, cellSize]);

  const handleJsonSave = useCallback((updatedProblemStatement) => {
    localStateManager.updateProblemStatementInLocal(updatedProblemStatement);
    console.log('Problem statement updated in local state');
  }, [localStateManager]);

  const handleSolveProblem = useCallback(async (localWarehouseData) => {
    if (!localWarehouseData?.warehouse?.problem_statement) {
      alert('No problem statement to solve. Please create some objects and tasks first.');
      return;
    }

    try {
      console.log('Sending problem statement to server for solving...');
      
      // Get local config to send with problem statement
      const localConfig = getConfigForProblemStatement();
      
      // Prepare problem statement with required default fields
      const problemStatement = {
        ...localWarehouseData.warehouse.problem_statement,
        // Add default values if not already present
        planning_duration_seconds: localWarehouseData.warehouse.problem_statement.planning_duration_seconds ?? 5,
        maximizing_picks: localWarehouseData.warehouse.problem_statement.maximizing_picks ?? false,
        start_time: localWarehouseData.warehouse.problem_statement.start_time ?? 0,
        request_id: localWarehouseData.warehouse.problem_statement.request_id ?? 'PSG'
      };
      
      // Include config in the solve request
      const solution = await solveProblemStatement(
        problemStatement, 
        localConfig
      );
      
      console.log('Received solution from server:', solution);
      setSolutionData(solution);
    } catch (error) {
      console.error('Failed to solve problem statement:', error);
      alert(`Failed to solve problem statement: ${error.message}`);
    }
  }, [solveProblemStatement, setSolutionData, getConfigForProblemStatement]);

  const handleAddTask = useCallback(async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      
      const taskProperties = {
        destination_id: parseInt(taskData.destination_id),
        transport_entity_id: parseInt(taskData.transport_entity_id),
        transport_entity_type: "rack",
        task_type: "picktask",
        task_subtype: "storable_to_conveyor",
      };

      await addObject('task', null, null, taskProperties);
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please check the console for details.');
    }
  }, [addObject]);

  const handleAddAssignment = useCallback(async (assignmentData) => {
    try {
      console.log('Creating assignment with data:', assignmentData);
      
      const assignmentProperties = {
        task_id: assignmentData.task_id,
        bot_id: parseInt(assignmentData.bot_id),
        pps_id: parseInt(assignmentData.pps_id),
        msu_id: parseInt(assignmentData.msu_id),
      };

      await addObject('assignment', null, null, assignmentProperties);
      console.log('Assignment added successfully');
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Failed to add assignment. Please check the console for details.');
    }
  }, [addObject]);

  const handleClearData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStateManager.clearLocalData();
      setSelectedObject(null);
    }
  }, [localStateManager, setSelectedObject]);

  return {
    handleObjectSelect,
    handleTaskSelect,
    handleAddObjectFromList,
    handleJsonSave,
    handleSolveProblem,
    handleAddTask,
    handleAddAssignment,
    handleClearData
  };
};
