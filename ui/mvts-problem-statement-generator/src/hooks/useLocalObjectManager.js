// src/hooks/useLocalObjectManager.js
import { useState, useEffect, useCallback, useRef } from 'react';

// This is the main hook for managing pps, bot, msu, task and assignment objects in the local state
// cellSize is used to convert grid coordinates to pixel positions
// localStateManager is used to interact and save the local warehouse data
// schemaManager is used to get the templates for each object type
export const useLocalObjectManager = (cellSize, localStateManager, schemaManager) => {
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  const {
    localWarehouseData,
    addObjectToLocal,
    removeObjectFromLocal,
    updateObjectInLocal,
    templates
  } = localStateManager;

  const { getTemplate } = schemaManager;

  // Generate unique ID for objects and tasks
  const generateObjectId = useCallback((type) => {
    // Get the list associated with the object type and return the next id
    const listKey = type === 'bot' ? 'ranger_list' : 
                   type === 'pps' ? 'pps_list' : 
                   type === 'msu' ? 'transport_entity_list' :
                   type === 'task' ? 'task_list' :
                   type === 'assignment' ? 'assignment_list' : null;
    
    if (!listKey) {
      console.warn('Unknown object type:', type);
      return 1;
    }
    
    const existing = localWarehouseData.warehouse.problem_statement[listKey] || [];
    
    if (type === 'task') {
      // Tasks use task_key with pattern t-{number}
      const maxNum = existing.reduce((max, task) => {
        const match = (task.task_key || '').match(/t-(\d+)/);
        return Math.max(max, match ? parseInt(match[1]) : 0);
      }, 0);
      return `t-${maxNum + 1}`;
    } else if (type === 'assignment') {
      const maxNum = existing.reduce((max, assignment) => {
        const match = (assignment.task_key || '').match(/a-(\d+)/);
        return Math.max(max, match ? parseInt(match[1]) : 0);
      }, 0);
      return `a-${maxNum + 1}`;
    } else {
      // All other types use numeric id
      const maxId = existing.reduce((max, item) => Math.max(max, item.id || 0), 0);
      return maxId + 1;
    }
  }, [localWarehouseData]);

  // Convert warehouse data objects to visual objects
  const loadObjectsFromWarehouse = useCallback((warehouseData) => {
    const loadedObjects = [];

    // Load bots from ranger_list
    if (warehouseData.warehouse.problem_statement?.ranger_list) {
      warehouseData.warehouse.problem_statement.ranger_list.forEach((ranger, index) => {
        if (ranger.coordinate?.x !== undefined && ranger.coordinate?.y !== undefined) {
          loadedObjects.push({
            id: `bot-${ranger.id || index}`,
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
            id: `pps-${pps.id || index}`,
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
            id: `msu-${msu.id || index}`,
            type: 'msu',
            x: msu.coordinate.x * cellSize,
            y: msu.coordinate.y * cellSize,
            properties: { ...msu }
          });
        }
      });
    }
    
    // Load tasks from task_list (no visual representation, just for management)
    if (warehouseData.warehouse.problem_statement?.task_list) {
      warehouseData.warehouse.problem_statement.task_list.forEach((task, index) => {
        loadedObjects.push({
          id: `t-${task.task_key || index}`,
          type: 'task',
          x: null, // No visual position
          y: null, // No visual position
          properties: { ...task }
        });
      });
    }

    // Load assignments from assignment_list (no visual representation, just for management)
    if (warehouseData.warehouse.problem_statement?.assignment_list) {
      warehouseData.warehouse.problem_statement.assignment_list.forEach((assignment, index) => {
        loadedObjects.push({
          id: `a-${assignment.id || index}`,
          type: 'assignment',
          x: null, // No visual position
          y: null, // No visual position
          properties: { ...assignment }
        });
      });
    }

    console.log('Loaded objects from warehouse data:', loadedObjects);
    setObjects(loadedObjects);
  }, [cellSize]);

  // Add a new object
  const addObject = useCallback(async (type, x, y, customData = {}) => {
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
      
      let objectData, visualObject;
      
      if (type === 'task') {
        // Tasks don't have coordinates, use task_key instead of id
        objectData = {
          ...template,
          task_key: newId,
          ...customData
        };
        
        // Create visual object without position
        visualObject = {
          id: `t-${newId}`,
          type,
          x: null,
          y: null,
          properties: {
            ...objectData,
            __meta_data: {}
          }
        };
      } else if (type === 'assignment') {
        // Assignments don't have coordinates, use id
        objectData = {
          ...template,
          task_key: newId,
          ...customData
        };
        
        // Create visual object without position
        visualObject = {
          id: `a-${newId}`,
          type,
          x: null,
          y: null,
          properties: {
            ...objectData,
            __meta_data: {}
          }
        };
      } else if (type === 'bot' || type === 'msu') {
        // Regular objects with grid coordinates
        objectData = {
          ...template,
          id: newId,
          coordinate: {
            x: Math.floor(x/cellSize),
            y: Math.floor(y/cellSize)
          },
          available_at_coordinate: {
            x: Math.floor(x/cellSize),
            y: Math.floor(y/cellSize)
          },
          ...customData
        };
        
        // Create visual object
        visualObject = {
          id: `${type}-${newId}`,
          type,
          x,
          y,
          properties: {
            ...objectData,
            __meta_data: {}
          }
        };
      }else {
        // Regular objects with grid coordinates
        objectData = {
          ...template,
          id: newId,
          coordinate: {
            x: Math.floor(x/cellSize),
            y: Math.floor(y/cellSize)
          },
          ...customData
        };

        // Create visual object
        visualObject = {
          id: `${type}-${newId}`,
          type,
          x,
          y,
          manual_change: {},
          properties: {
            ...objectData,
            __meta_data: {}
          }
        };
      }

      // Add to local warehouse data
      addObjectToLocal(type, objectData);

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

    // Determine the object identifier for removal
    let objectIdentifier;
    if (objectToRemove.type === 'task') {
      objectIdentifier = objectToRemove.properties.task_key;
    } else {
      objectIdentifier = objectToRemove.properties.id;
    }

    // Remove from local warehouse data
    removeObjectFromLocal(objectToRemove.type, objectIdentifier);

    // Remove from visual objects
    setObjects(prev => prev.filter(obj => obj.id !== id));

    console.log(`Removed ${objectToRemove.type} from local state`);
  }, [objects, selectedObject, removeObjectFromLocal]);

  // Update object position
  const updateObjectPosition = useCallback((objectId, x, y) => {
    console.log('updateObjectPosition called for object:', objectId, 'position:', x, y);

    setObjects(currentObjects => {
      const updatedObjects = currentObjects.map((obj) => {

        // eyes: logs for debug
        if (obj.id === objectId) {
          console.log("should change available at coordinate",
            obj,
            ((obj.type === "bot" || obj.type === "msu") && !obj.properties.__meta_data?.manual_change?.available_at_coordinate));
        }

          return (
          obj.id === objectId
            ? (obj.type === "bot" || obj.type === "msu") && !obj.properties.__meta_data?.manual_change?.available_at_coordinate ? {
                ...obj,
                x,
                y,
                properties: {
                  ...obj.properties,
                  coordinate: {
                    x: Math.floor(x / cellSize),
                    y: Math.floor(y / cellSize)
                  },
                  available_at_coordinate: {
                    x: Math.floor(x / cellSize),
                    y: Math.floor(y / cellSize)
                  }
                }
              }
              :
              {
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
            : obj)
        }
      );

      // Update the object in local warehouse data
      const updatedObject = updatedObjects.find(obj => obj.id === objectId);
      if (updatedObject) {
        // Persist full properties including available_at_coordinate so manual_change remains effective
        updateObjectInLocal(
          updatedObject.type,
          updatedObject.properties.id,
          updatedObject.properties
        );
      }
      
      return updatedObjects;
    });
  }, [cellSize, updateObjectInLocal]);

  // Update object properties
  const updateObjectProperties = useCallback((objectId, newProperties, shouldSyncPosition = true) => {
    setObjects(currentObjects => {
      const updatedObjects = currentObjects.map((obj) => {
          if (obj.id === objectId) {

            console.log("Property update:", objectId, newProperties, obj);


            if (obj.type === 'bot' || obj.type === 'msu') {

              // Replace manual update logic for available_at_coordinate
              const prevAvail = obj.properties.available_at_coordinate || {};
              const prevCoord = obj.properties.coordinate || {};
              const newAvail = newProperties.available_at_coordinate || {};
              const newCoord = newProperties.coordinate || {};

              const isAvailChanged = prevAvail.x !== newAvail.x || prevAvail.y !== newAvail.y;
              const isCoordChanged = prevCoord.x !== newCoord.x || prevCoord.y !== newCoord.y;
              const isAvailSameAsCoord = newAvail.x === newCoord.x && newAvail.y === newCoord.y;

              const manualChange = isAvailChanged && !isAvailSameAsCoord
                ? { available_at_coordinate: true }
                : obj.properties.__meta_data?.manual_change || {};

              const updatedAvailable = !manualChange.available_at_coordinate && isCoordChanged
                ? { ...newCoord }
                : { ...newAvail };

              const updatedProps = {
                ...newProperties,
                available_at_coordinate: updatedAvailable
              };

              const res = {
                ...obj,
                properties: {
                  ...updatedProps,
                  __meta_data: {
                    ...obj.properties.__meta_data,
                    manual_change: {
                      ...obj.properties.__meta_data?.manual_change,
                      ...manualChange
                    }
                  }
                },
                x: updatedProps.coordinate?.x !== undefined ? updatedProps.coordinate.x * cellSize : obj.x,
                y: updatedProps.coordinate?.y !== undefined ? updatedProps.coordinate.y * cellSize : obj.y
              };
              console.log("Final object properties", res);
              return res;
            }

            let res = {
              ...obj,
              properties: newProperties,
              // Update visual position if coordinates changed
              x: newProperties.coordinate?.x !== undefined ? newProperties.coordinate.x * cellSize : obj.x,
              y: newProperties.coordinate?.y !== undefined ? newProperties.coordinate.y * cellSize : obj.y
            }
            console.log("Final object properties", res);

            return res;

          } else {
            return obj;
          }
        });
      
      // Update selected object if it's the one being edited
      if (selectedObject?.id === objectId) {
        const updatedSelectedObject = updatedObjects.find(obj => obj.id === objectId);
        if (updatedSelectedObject) {
          setSelectedObject(updatedSelectedObject);
        }
      }
      
      // Update the object in local warehouse data
      const updatedObject = updatedObjects.find(obj => obj.id === objectId);
      if (updatedObject) {
        // Use the correct identifier based on object type
        let identifier;
        if (updatedObject.type === 'task' || updatedObject.type === 'assignment') {
          identifier = updatedObject.properties.task_key;
        } else {
          identifier = updatedObject.properties.id;
        }

        updateObjectInLocal(
          updatedObject.type,
          identifier,
          updatedObject.properties
        );
      }
      
      return updatedObjects;
    });
  }, [selectedObject, cellSize, updateObjectInLocal]);

  // Keep selectedObject in sync when its position or manual_change updates
  // eyes: This is sort of hack, but in the future maybe we can do this more elegantly
  useEffect(() => {
    if (selectedObject) {
      const updated = objects.find(o => o.id === selectedObject.id);
      if (updated && (updated.x !== selectedObject.x || updated.y !== selectedObject.y || JSON.stringify(updated.manual_change) !== JSON.stringify(selectedObject.manual_change))) {
        setSelectedObject(updated);
      }
    }
  }, [objects, selectedObject, setSelectedObject]);

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
