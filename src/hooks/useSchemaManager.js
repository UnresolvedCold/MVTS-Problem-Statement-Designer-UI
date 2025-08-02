// src/hooks/useSchemaManager.js
import { useState, useEffect, useCallback } from 'react';
import { useServerAPI } from './useServerAPI';

export const useSchemaManager = () => {
  const [schemas, setSchemas] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  
  const serverAPI = useServerAPI();
  const { getAllSchemas, isLoading, loadingMessage } = serverAPI;

  // Load all schemas on hook initialization
  const initializeSchemas = useCallback(async () => {
    try {
      console.log('Initializing schemas from server...');
      setInitializationError(null);
      
      const allSchemas = await getAllSchemas();
      setSchemas(allSchemas);
      setIsInitialized(true);
      
      console.log('Schemas initialized successfully:', allSchemas);
      return allSchemas;
    } catch (error) {
      console.error('Failed to initialize schemas:', error);
      setInitializationError(error.message);
      setIsInitialized(true); // Still mark as initialized to allow fallback usage
      throw error;
    }
  }, [getAllSchemas]);

  // Auto-initialize on first mount
  useEffect(() => {
    if (!isInitialized) {
      initializeSchemas();
    }
  }, [initializeSchemas, isInitialized]);

  // Get schema for any object type
  const getSchema = useCallback((type) => {
    if (!schemas[type]) {
      console.warn(`Schema not found for type: ${type}. Available types:`, Object.keys(schemas));
      return null;
    }
    return schemas[type];
  }, [schemas]);

  // Get template for object creation (unified for all types)
  const getTemplate = useCallback((type) => {
    const schema = getSchema(type);
    if (!schema) {
      console.warn(`No template available for type: ${type}`);
      return null;
    }
    
    // Return a deep copy of the schema to avoid mutations
    return JSON.parse(JSON.stringify(schema));
  }, [getSchema]);

  // Check if schemas are available
  const hasSchemas = useCallback(() => {
    return Object.keys(schemas).length > 0;
  }, [schemas]);

  // Refresh schemas from server
  const refreshSchemas = useCallback(async () => {
    setIsInitialized(false);
    return initializeSchemas();
  }, [initializeSchemas]);

  // Update a specific schema locally
  const updateSchema = useCallback((type, newSchema) => {
    setSchemas(prev => ({
      ...prev,
      [type]: newSchema
    }));
    console.log(`Schema updated for type: ${type}`, newSchema);
  }, []);

  // Update all schemas at once
  const updateSchemas = useCallback((newSchemas) => {
    setSchemas(newSchemas);
    console.log('All schemas updated:', newSchemas);
  }, []);

  return {
    schemas,
    isInitialized,
    initializationError,
    isLoading,
    loadingMessage,
    getSchema,
    getTemplate,
    hasSchemas,
    refreshSchemas,
    initializeSchemas,
    updateSchema,
    updateSchemas
  };
};
