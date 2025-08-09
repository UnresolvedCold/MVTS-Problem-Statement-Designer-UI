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
  cellSize,
  setActiveTab,
  schemaManager  // Add schema manager
) => {
  const { addObject } = objectManager;
  const { addAssignmentToPPS, removeAssignmentFromPPS } = localStateManager;
  const { solveProblemStatement } = serverAPI;
  const { getConfigForProblemStatement } = configManager;
  const { getTemplate } = schemaManager;

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
      
      // Clear previous solution data and switch to solution tab immediately
      setSolutionData(null);
      if (setActiveTab) {
        setActiveTab('solution');
      }
      
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
  }, [solveProblemStatement, setSolutionData, getConfigForProblemStatement, setActiveTab]);

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
      
      // Get assignment schema from server
      const assignmentTemplate = getTemplate('assignment');
      
      if (!assignmentTemplate) {
        console.warn('No assignment schema available, using basic structure');
        // Use the existing addAssignmentToPPS function with original data
        addAssignmentToPPS(assignmentData);
        console.log('Assignment added to PPS with basic structure');
        return;
      }
      
      console.log('Assignment template from server:', assignmentTemplate);
      
      // Create assignment using server schema, but let addAssignmentToPPS handle the actual creation
      // Just pass the assignmentData as-is since addAssignmentToPPS will create the full structure
      addAssignmentToPPS(assignmentData);
      console.log('Assignment added to PPS using server schema template');
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Failed to add assignment. Please check the console for details.');
    }
  }, [addAssignmentToPPS, getTemplate]);

  const handleRemoveAssignment = useCallback((ppsId, assignmentId) => {
    try {
      console.log('Removing assignment:', { ppsId, assignmentId });
      removeAssignmentFromPPS(ppsId, assignmentId);
      console.log('Assignment removed from PPS successfully');
    } catch (error) {
      console.error('Error removing assignment:', error);
      alert('Failed to remove assignment. Please check the console for details.');
    }
  }, [removeAssignmentFromPPS]);

  const handleAssignmentSelect = useCallback((assignment) => {
    // Clear other selections when selecting an assignment
    setSelectedObject(null);
    // Use selectedObject to store assignment for now, we can create selectedAssignment later if needed
    setSelectedObject({
      id: assignment.id,
      type: 'assignment', 
      properties: assignment,
      pps_id: assignment.pps_id, // Store PPS ID for updates
      isAssignment: true // Flag to identify it's an assignment
    });
  }, [setSelectedObject]);

  const handleClearData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStateManager.clearLocalData();
      setSelectedObject(null);
    }
  }, [localStateManager, setSelectedObject]);

  return {
    handleObjectSelect,
    handleTaskSelect,
    handleAssignmentSelect,
    handleAddObjectFromList,
    handleJsonSave,
    handleSolveProblem,
    handleAddTask,
    handleAddAssignment,
    handleRemoveAssignment,
    handleClearData
  };
};
