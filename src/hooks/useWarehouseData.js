import { useState, useCallback } from 'react';

export const useWarehouseData = (sendMessage) => {
  const [warehouseData, setWarehouseData] = useState(null);

  const sendWarehouseUpdate = useCallback((updateData) => {
    let updatedWarehouseData;

    switch (updateData.type) {
      case 'ADD_BOT':
        // Send ADD_BOT request to server - no local state update needed
        sendMessage({
          type: 'ADD_BOT',
          objectData: updateData.objectData || {}
        });
        return; // Exit early, don't send UPDATE_WAREHOUSE_DATA

      case 'ADD_PPS':
        // Send ADD_PPS request to server - no local state update needed
        sendMessage({
          type: 'ADD_PPS',
          objectData: updateData.objectData || {}
        });
        return; // Exit early, don't send UPDATE_WAREHOUSE_DATA

      case 'ADD_MSU':
        // Send ADD_MSU request to server - no local state update needed
        sendMessage({
          type: 'ADD_MSU',
          objectData: updateData.objectData || {}
        });
        return; // Exit early, don't send UPDATE_WAREHOUSE_DATA

      case 'ADD_TASK':
        // Send ADD_TASK request to server with pps_id and msu_id
        sendMessage({
          type: 'ADD_TASK',
          data: {
            pps_id: updateData.taskData.pps_id,
            msu_id: updateData.taskData.msu_id
          }
        });
        return; // Exit early, don't send UPDATE_WAREHOUSE_DATA

      case 'ADD_ASSIGNMENT':
        // Send ADD_ASSIGNMENT request to server
        sendMessage({
          type: 'ADD_ASSIGNMENT',
          data: {
            pps_id: updateData.assignmentData.pps_id,
            msu_id: updateData.assignmentData.msu_id,
            task_id: updateData.assignmentData.task_id,
            bot_id: updateData.assignmentData.bot_id
          }
        });
        return; // Exit early, don't send UPDATE_WAREHOUSE_DATA

      case 'REMOVE_TASK':
        // Remove task from task_list
        if (!warehouseData) return;
        
        updatedWarehouseData = {
          ...warehouseData,
          warehouse: {
            ...warehouseData.warehouse,
            problem_statement: {
              ...warehouseData.warehouse.problem_statement,
              task_list: warehouseData.warehouse.problem_statement.task_list?.filter(
                task => (task.task_key || task.id) !== updateData.taskId
              ) || []
            }
          }
        };
        break;

      case 'REMOVE_OBJECT':
        // Remove object from the appropriate list
        if (!warehouseData) return;
        
        updatedWarehouseData = {
          ...warehouseData, // Keep the entire structure including type
          warehouse: {
            ...warehouseData.warehouse,
            problem_statement: {
              ...warehouseData.warehouse.problem_statement,
              ...(updateData.objectType === 'bot' ? {
                ranger_list: warehouseData.warehouse.problem_statement.ranger_list?.filter(
                  ranger => ranger.id !== updateData.objectId
                ) || []
              } : updateData.objectType === 'msu' ? {
                transport_entity_list: warehouseData.warehouse.problem_statement.transport_entity_list?.filter(
                  msu => msu.id !== updateData.objectId
                ) || []
              } : {
                pps_list: warehouseData.warehouse.problem_statement.pps_list?.filter(
                  pps => pps.id !== updateData.objectId
                ) || []
              })
            }
          }
        };
        break;

      case 'UPDATE_WAREHOUSE_DATA':
        // Update warehouse data with new object lists
        if (!warehouseData) return;
        
        updatedWarehouseData = {
          ...warehouseData, // Keep the entire structure including type
          warehouse: {
            ...warehouseData.warehouse,
            problem_statement: {
              ...warehouseData.warehouse.problem_statement,
              ranger_list: updateData.data.ranger_list || warehouseData.warehouse.problem_statement.ranger_list || [],
              pps_list: updateData.data.pps_list || warehouseData.warehouse.problem_statement.pps_list || [],
              transport_entity_list: updateData.data.transport_entity_list || warehouseData.warehouse.problem_statement.transport_entity_list || [],
              task_list: updateData.data.task_list || warehouseData.warehouse.problem_statement.task_list || []
            }
          }
        };
        break;

      case 'SOLVE_PROBLEM_STATEMENT':
        // Send SOLVE_PROBLEM_STATEMENT request to server
        sendMessage({
          type: 'SOLVE_PROBLEM_STATEMENT'
        });
        return; // Exit early, don't send UPDATE_WAREHOUSE_DATA

      default:
        console.warn('Unknown update type:', updateData.type);
        return;
    }

    // Send to server only for cases that modify existing data
    sendMessage({
      type: 'UPDATE_WAREHOUSE_DATA',
      data: {
        height: updatedWarehouseData.warehouse.height,
        width: updatedWarehouseData.warehouse.width,
        problem_statement: updatedWarehouseData.warehouse.problem_statement
      }
    });

    // Update local state
    setWarehouseData({
      ...updatedWarehouseData
    });
  }, [warehouseData, sendMessage]);

  return {
    warehouseData,
    setWarehouseData,
    sendWarehouseUpdate
  };
};
