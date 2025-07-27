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

export const useObjectManager = (cellSize, onWarehouseUpdate) => {
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  const addObject = useCallback((type) => {
    const defaultProperties = getDefaultProperties(type);
    
    // Send add request to server instead of adding locally
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: 'ADD_OBJECT',
        objectType: type,
        objectData: defaultProperties
      });
    }
  }, [onWarehouseUpdate]);

  const removeObject = useCallback((id) => {
    const objectToRemove = objects.find(obj => obj.id === id);
    if (!objectToRemove) return;

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
  }, [objects, selectedObject, onWarehouseUpdate]);

  const updateObjectPosition = useCallback((objectId, x, y) => {
    const updatedObjects = objects.map((obj) =>
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
    setObjects(updatedObjects);
    
    // Send update to server
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: 'UPDATE_WAREHOUSE_DATA',
        data: buildWarehouseData(updatedObjects, cellSize)
      });
    }
  }, [objects, cellSize, onWarehouseUpdate]);

  const updateObjectProperties = useCallback((objectId, newProperties) => {
    const updatedObjects = objects.map((obj) =>
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
    setObjects(updatedObjects);
    
    // Update selected object if it's the one being edited
    if (selectedObject?.id === objectId) {
      setSelectedObject({ 
        ...selectedObject, 
        properties: newProperties,
        x: newProperties.coordinate?.x !== undefined ? newProperties.coordinate.x * cellSize : selectedObject.x,
        y: newProperties.coordinate?.y !== undefined ? newProperties.coordinate.y * cellSize : selectedObject.y
      });
    }
    
    // Send update to server
    if (onWarehouseUpdate) {
      onWarehouseUpdate({
        type: 'UPDATE_WAREHOUSE_DATA',
        data: buildWarehouseData(updatedObjects, cellSize)
      });
    }
  }, [objects, selectedObject, cellSize, onWarehouseUpdate]);

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

// Helper function to build warehouse data structure
const buildWarehouseData = (objects, cellSize) => {
  return {
    ranger_list: objects
      .filter(obj => obj.type === 'bot')
      .map(obj => ({
        ...obj.properties,
        coordinate: {
          x: Math.floor(obj.x / cellSize),
          y: Math.floor(obj.y / cellSize)
        }
      })),
    pps_list: objects
      .filter(obj => obj.type === 'pps')
      .map(obj => ({
        ...obj.properties,
        coordinate: {
          x: Math.floor(obj.x / cellSize),
          y: Math.floor(obj.y / cellSize)
        }
      }))
  };
};
