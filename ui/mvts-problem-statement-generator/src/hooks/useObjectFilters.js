// src/hooks/useObjectFilters.js
import { useMemo } from 'react';

export const useObjectFilters = (objects) => {
  console.log('useObjectFilters - Input objects:', {
    objects: objects,
    objectsLength: objects?.length,
    objectTypes: objects?.map(o => ({ id: o.id, type: o.type }))
  });

  return useMemo(() => {
    const result = {
      tasks: objects.filter(obj => obj.type === 'task'),
      assignments: objects.filter(obj => obj.type === 'assignment'),
      visualObjects: objects.filter(obj => obj.type !== 'task' && obj.type !== 'assignment'),
      availablePPS: objects.filter(obj => obj.type === 'pps').map(obj => ({
        id: obj.properties?.id || obj.id,
        ...obj.properties
      })),
      availableMSU: objects.filter(obj => obj.type === 'msu').map(obj => ({
        id: obj.properties?.id || obj.id,
        ...obj.properties
      })),
      availableBots: objects.filter(obj => obj.type === 'bot').map(obj => ({
        id: obj.properties?.id || obj.id,
        ...obj.properties
      }))
    };

    console.log('useObjectFilters - Filtered results:', {
      tasksCount: result.tasks.length,
      assignmentsCount: result.assignments.length,
      visualObjectsCount: result.visualObjects.length,
      visualObjectTypes: result.visualObjects.map(o => ({ id: o.id, type: o.type })),
      availablePPSCount: result.availablePPS.length,
      availableMSUCount: result.availableMSU.length,
      availableBotsCount: result.availableBots.length
    });

    return result;
  }, [objects]);
};
