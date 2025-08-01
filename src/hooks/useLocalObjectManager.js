// src/hooks/useLocalObjectManager.js
import { useState, useCallback, useRef } from 'react';

export const useLocalObjectManager = (cellSize, localStateManager, schemaManager) => {
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const lastUpdateRef = useRef(null);

  const {
    localWarehouseData,
    addObjectToLocal,
    removeObjectFromLocal,
    updateObjectInLocal,
    templates
  } = localStateManager;

  const { getTemplate } = schemaManager;

  // Generate unique ID for objects
  const generateObjectId = useCallback((type) => {
    const existing = localWarehouseData.warehouse.problem_statement[type === 'bot' ? 'ranger_list' : type === 'pps' ? 'pps_list' : 'transport_entity_list'] || [];
    const maxId = existing.reduce((max, item) => Math.max(max, item.id || 0), 0);
    return maxId + 1;
  }, [localWarehouseData]);

  // Convert warehouse data objects to visual objects
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
    
    // Load MSU from transport_entity_list
    if (warehouseData.warehouse.problem_statement?.transport_entity_list) {
      warehouseData.warehouse.problem_statement.transport_entity_list.forEach((msu, index) => {
        if (msu.coordinate?.x !== undefined && msu.coordinate?.y !== undefined) {
          loadedObjects.push({
            id: `msu-${msu.id || index}-${Date.now()}`,
            type: 'msu',
            x: msu.coordinate.x * cellSize,
            y: msu.coordinate.y * cellSize,
            properties: { ...msu }
          });
        }
      });
    }

    console.log('Loaded objects from warehouse data:', loadedObjects);
    setObjects(loadedObjects);
  }, [cellSize]);

  // Add a new object
  const addObject = useCallback(async (type, x, y) => {
    try {
      // Get template from schema manager (unified for all types)
      let template = templates[type];
      if (!template) {
        console.log(`Getting template for ${type} from schema manager...`);
        template = getTemplate(type);
        
        if (!template) {
          throw new Error(`No template available for type: ${type}. Please load schemas first.`);
        }
      }

      // Generate new ID
      const newId = generateObjectId(type);
      
      // Create object data with grid coordinates
      const objectData = {
        ...template,
        id: newId,
        coordinate: {
          x: Math.floor(x / cellSize),
          y: Math.floor(y / cellSize)
        }
      };

      // Add to local warehouse data
      addObjectToLocal(type, objectData);

      // Create visual object
      const visualObject = {
        id: `${type}-${newId}-${Date.now()}`,
        type,
        x,
        y,
        properties: objectData
      };

      // Add to visual objects
      setObjects(prev => [...prev, visualObject]);

      console.log(`Added ${type} to local state:`, objectData);
      return visualObject;
    } catch (error) {
      console.error(`Failed to add ${type}:`, error);
      throw error;
    }
  }, [cellSize, templates, getTemplate, generateObjectId, addObjectToLocal]);

  // Remove an object
  const removeObject = useCallback((id) => {
    const objectToRemove = objects.find(obj => obj.id === id);
    if (!objectToRemove) {
      console.warn('Object not found for removal:', id);
      return;
    }

    // Clear selection if the removed object was selected
    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }

    // Remove from local warehouse data
    removeObjectFromLocal(objectToRemove.type, objectToRemove.properties.id);

    // Remove from visual objects
    setObjects(prev => prev.filter(obj => obj.id !== id));

    console.log(`Removed ${objectToRemove.type} from local state`);
  }, [objects, selectedObject, removeObjectFromLocal]);

  // Update object position
  const updateObjectPosition = useCallback((objectId, x, y) => {
    console.log('updateObjectPosition called for object:', objectId, 'position:', x, y);
    
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

      // Update the object in local warehouse data
      const updatedObject = updatedObjects.find(obj => obj.id === objectId);
      if (updatedObject) {
        updateObjectInLocal(
          updatedObject.type,
          updatedObject.properties.id,
          {
            ...updatedObject.properties,
            coordinate: {
              x: Math.floor(x / cellSize),
              y: Math.floor(y / cellSize)
            }
          }
        );
      }
      
      return updatedObjects;
    });
  }, [cellSize, updateObjectInLocal]);

  // Update object properties
  const updateObjectProperties = useCallback((objectId, newProperties, shouldSyncPosition = true) => {
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
      
      // Update the object in local warehouse data
      const updatedObject = updatedObjects.find(obj => obj.id === objectId);
      if (updatedObject) {
        updateObjectInLocal(
          updatedObject.type,
          updatedObject.properties.id,
          newProperties
        );
      }
      
      return updatedObjects;
    });
  }, [selectedObject, cellSize, updateObjectInLocal]);

  return {
    objects,
    selectedObject,
    setSelectedObject,
    addObject,
    removeObject,
    updateObjectPosition,
    updateObjectProperties,
    loadObjectsFromWarehouse
  };
};
