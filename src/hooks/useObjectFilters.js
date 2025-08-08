// src/hooks/useObjectFilters.js
import { useMemo } from 'react';

export const useObjectFilters = (objects) => {
  return useMemo(() => ({
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
  }), [objects]);
};
