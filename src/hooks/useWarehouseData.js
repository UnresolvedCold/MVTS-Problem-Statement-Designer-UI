import { useState, useCallback } from 'react';

export const useWarehouseData = (sendMessage) => {
  const [warehouseData, setWarehouseData] = useState(null);

  const sendWarehouseUpdate = useCallback((updateData) => {
    if (!warehouseData) return;

    let updatedWarehouseData;

    switch (updateData.type) {
      case 'ADD_OBJECT':
        // Add new object to the appropriate list
        updatedWarehouseData = {
          ...warehouseData,
          warehouse: {
            ...warehouseData.warehouse,
            problem_statement: {
              ...warehouseData.warehouse.problem_statement,
              ...(updateData.objectType === 'bot' ? {
                ranger_list: [
                  ...(warehouseData.warehouse.problem_statement.ranger_list || []),
                  updateData.objectData
                ]
              } : {
                pps_list: [
                  ...(warehouseData.warehouse.problem_statement.pps_list || []),
                  updateData.objectData
                ]
              })
            }
          }
        };
        break;

      case 'REMOVE_OBJECT':
        // Remove object from the appropriate list
        updatedWarehouseData = {
          ...warehouseData,
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
        // Update entire warehouse data
        updatedWarehouseData = {
          ...warehouseData,
          warehouse: {
            ...warehouseData.warehouse,
            problem_statement: {
              ...warehouseData.warehouse.problem_statement,
              ...updateData.data
            }
          }
        };
        break;

      default:
        console.warn('Unknown update type:', updateData.type);
        return;
    }

    // Send to server
    sendMessage({
      type: 'UPDATE_WAREHOUSE_DATA',
      data: updatedWarehouseData
    });

    // Update local state
    setWarehouseData(updatedWarehouseData);
  }, [warehouseData, sendMessage]);

  return {
    warehouseData,
    setWarehouseData,
    sendWarehouseUpdate
  };
};
