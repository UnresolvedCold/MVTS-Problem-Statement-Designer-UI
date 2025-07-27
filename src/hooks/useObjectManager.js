import { useState, useCallback } from 'react';

// Default properties for new objects
const getDefaultProperties = (type) => {
  return type === 'bot' ? {
    id: Date.now(),
    coordinate: { x: 0, y: 0 },
    paused: false,
    available_at_time: null,
    available_at_coordinate: null,
    total_capacity: 0,
    available_capacity: 0,
    is_paused: false,
    status: null,
    version: null,
    ranger_schedule: [],
    current_aisle_info: null
  } : {
    id: Date.now(),
    coordinate: { x: 0, y: 0 },
    bin_details: [],
    queue_length: 0,
    ranger_dock_coordinates: null,
    mode: null,
    pps_type: null,
    current_schedule: {
      cost: null,
      assignments: [],
      reserved_ranger_list: []
    },
    connected_pps_list: null,
    can_assign_task: false,
    ranger_exit_coordinates: null,
    msio_bins: [],
    pps_status: "open",
    pps_logged_in: true,
    pps_login_time: 0
  };
};

export const useObjectManager = (cellSize, onWarehouseUpdate, loadingHandlers = {}) => {
  const { setIsLoading, setLoadingMessage } = loadingHandlers;
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  const addObject = useCallback((type) => {
    const defaultProperties = getDefaultProperties(type);
    
    // Set loading state
    if (setIsLoading && setLoadingMessage) {
      setIsLoading(true);
      setLoadingMessage(`Adding ${type}...`);
    }
    
    // Send ADD_BOT or ADD_PPS event to server instead of adding locally
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: type === 'bot' ? 'ADD_BOT' : 'ADD_PPS',
        objectData: {
          ...defaultProperties,
          coordinate: {
            x: 0, // Default grid position
            y: 0
          }
        }
      });
    }
  }, [onWarehouseUpdate, setIsLoading, setLoadingMessage]);

  const removeObject = useCallback((id) => {
    const objectToRemove = objects.find(obj => obj.id === id);
    if (!objectToRemove) return;

    // Set loading state
    if (setIsLoading && setLoadingMessage) {
      setIsLoading(true);
      setLoadingMessage(`Removing ${objectToRemove.type}...`);
    }

    // Clear selection if the removed object was selected
    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }
    
    // Send remove request to server
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: 'REMOVE_OBJECT',
        objectId: id,
        objectType: objectToRemove.type
      });
    }
  }, [objects, selectedObject, onWarehouseUpdate, setIsLoading, setLoadingMessage]);

  const updateObjectPosition = useCallback((objectId, x, y) => {
    // Use functional state update to ensure we have the latest objects
    setObjects(currentObjects => {
      const updatedObjects = currentObjects.map((obj) =>
        obj.id === objectId 
          ? { 
              ...obj, 
              x, 
              y,
              properties: {
                ...obj.properties,
                coordinate: {
                  x: Math.floor(x / cellSize),
                  y: Math.floor(y / cellSize)
                }
              }
            } 
          : obj
      );
      
      // Debug logging
      console.log('Current objects:', currentObjects);
      console.log('Updated objects:', updatedObjects);
      console.log('Filtered bots:', updatedObjects.filter(obj => obj.type === 'bot'));
      console.log('Filtered pps:', updatedObjects.filter(obj => obj.type === 'pps'));
      
      // Send update to server using the fresh updatedObjects
      if (onWarehouseUpdate) {
        const rangerList = updatedObjects
          .filter(obj => obj.type === 'bot')
          .map(obj => ({
            ...obj.properties
          }));
        
        const ppsList = updatedObjects
          .filter(obj => obj.type === 'pps')
          .map(obj => ({
            ...obj.properties
          }));
        
        console.log('Sending ranger_list:', rangerList);
        console.log('Sending pps_list:', ppsList);
        
        onWarehouseUpdate({
          type: 'UPDATE_WAREHOUSE_DATA',
          data: {
            ranger_list: rangerList,
            pps_list: ppsList
          }
        });
      }
      
      return updatedObjects;
    });
  }, [cellSize, onWarehouseUpdate]);

  const updateObjectProperties = useCallback((objectId, newProperties) => {
    // Use functional state update to ensure we have the latest objects
    setObjects(currentObjects => {
      const updatedObjects = currentObjects.map((obj) =>
        obj.id === objectId 
          ? { 
              ...obj, 
              properties: newProperties,
              // Update visual position if coordinates changed
              x: newProperties.coordinate?.x !== undefined ? newProperties.coordinate.x * cellSize : obj.x,
              y: newProperties.coordinate?.y !== undefined ? newProperties.coordinate.y * cellSize : obj.y
            } 
          : obj
      );
      
      // Update selected object if it's the one being edited
      if (selectedObject?.id === objectId) {
        setSelectedObject({ 
          ...selectedObject, 
          properties: newProperties,
          x: newProperties.coordinate?.x !== undefined ? newProperties.coordinate.x * cellSize : selectedObject.x,
          y: newProperties.coordinate?.y !== undefined ? newProperties.coordinate.y * cellSize : selectedObject.y
        });
      }
      
      // Send update to server using the fresh updatedObjects
      if (onWarehouseUpdate) {
        onWarehouseUpdate({
          type: 'UPDATE_WAREHOUSE_DATA',
          data: {
            ranger_list: updatedObjects
              .filter(obj => obj.type === 'bot')
              .map(obj => ({
                ...obj.properties
              })),
            pps_list: updatedObjects
              .filter(obj => obj.type === 'pps')
              .map(obj => ({
                ...obj.properties
              }))
          }
        });
      }
      
      return updatedObjects;
    });
  }, [selectedObject, cellSize, onWarehouseUpdate]);

  const loadObjectsFromWarehouse = useCallback((warehouseData) => {
    const loadedObjects = [];
    
    // Load bots from ranger_list
    if (warehouseData.warehouse.problem_statement?.ranger_list) {
      warehouseData.warehouse.problem_statement.ranger_list.forEach((ranger, index) => {
        if (ranger.coordinate?.x !== undefined && ranger.coordinate?.y !== undefined) {
          loadedObjects.push({
            id: `bot-${ranger.id || index}-${Date.now()}`,
            type: 'bot',
            x: ranger.coordinate.x * cellSize,
            y: ranger.coordinate.y * cellSize,
            properties: { ...ranger }
          });
        }
      });
    }
    
    // Load PPS from pps_list
    if (warehouseData.warehouse.problem_statement?.pps_list) {
      warehouseData.warehouse.problem_statement.pps_list.forEach((pps, index) => {
        if (pps.coordinate?.x !== undefined && pps.coordinate?.y !== undefined) {
          loadedObjects.push({
            id: `pps-${pps.id || index}-${Date.now()}`,
            type: 'pps',
            x: pps.coordinate.x * cellSize,
            y: pps.coordinate.y * cellSize,
            properties: { ...pps }
          });
        }
      });
    }
    
    setObjects(loadedObjects);
  }, [cellSize]);

  return {
    objects,
    selectedObject,
    setSelectedObject,
    addObject,
    removeObject,
    updateObjectPosition,
    updateObjectProperties,
    loadObjectsFromWarehouse,
    setObjects
  };
};
