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
              pps_list: updateData.data.pps_list || warehouseData.warehouse.problem_statement.pps_list || []
            }
          }
        };
        break;

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
