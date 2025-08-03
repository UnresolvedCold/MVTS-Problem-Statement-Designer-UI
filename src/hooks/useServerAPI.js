// src/hooks/useServerAPI.js
import { useState, useCallback, useRef } from 'react';
import { WEBSOCKET_CONFIG, REST_API_CONFIG } from '../utils/constants';

export const useServerAPI = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const socketRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());
  const [schemas, setSchemas] = useState({});

  // Generate unique request ID
  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Connect to server
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const port = process.env.REACT_APP_WEBSOCKET_PORT || WEBSOCKET_CONFIG.DEFAULT_PORT;
      const host = process.env.REACT_APP_WEBSOCKET_HOST || WEBSOCKET_CONFIG.DEFAULT_HOST;
      const protocol = process.env.REACT_APP_WEBSOCKET_PROTOCOL || WEBSOCKET_CONFIG.DEFAULT_PROTOCOL;
      const endpoint = WEBSOCKET_CONFIG.ENDPOINT;

      console.log(`Connecting to server: ${protocol}://${host}:${port}${endpoint}`);
      
      const socket = new WebSocket(`${protocol}://${host}:${port}${endpoint}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Connected to server');
        setIsConnected(true);
        resolve();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from server:', data);

          // Handle responses to pending requests
          if (data.requestId && pendingRequestsRef.current.has(data.requestId)) {
            const { resolve: requestResolve, reject: requestReject } = pendingRequestsRef.current.get(data.requestId);
            pendingRequestsRef.current.delete(data.requestId);

            if (data.error) {
              requestReject(new Error(data.error));
            } else {
              requestResolve(data);
            }
          }
        } catch (error) {
          console.error('Error parsing server message:', error);
        }
      };

      socket.onclose = () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        socketRef.current = null;
      };

      socket.onerror = (error) => {
        console.error('Server connection error:', error);
        setIsConnected(false);
        reject(error);
      };
    });
  }, []);

  // Send message to server and wait for response
  const sendRequest = useCallback((type, data = {}) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected to server'));
        return;
      }

      const requestId = generateRequestId();
      const message = {
        type,
        requestId,
        data: {...data}
      };

      // Store the promise resolvers
      pendingRequestsRef.current.set(requestId, { resolve, reject });

      // Set timeout for request
      setTimeout(() => {
        if (pendingRequestsRef.current.has(requestId)) {
          pendingRequestsRef.current.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000); // 30 second timeout

      console.log('Sending request to server:', message);
      socketRef.current.send(JSON.stringify(message));
    });
  }, [generateRequestId]);

  // Fetch schema from REST API
  const fetchSchema = useCallback(async (schemaType) => {
    const port = process.env.REACT_APP_REST_PORT || REST_API_CONFIG.DEFAULT_PORT;
    const host = process.env.REACT_APP_REST_HOST || REST_API_CONFIG.DEFAULT_HOST;
    const protocol = process.env.REACT_APP_REST_PROTOCOL || REST_API_CONFIG.DEFAULT_PROTOCOL;
    const endpoint = REST_API_CONFIG.SCHEMAS_ENDPOINT;

    const url = `${protocol}://${host}:${port}${endpoint}/${schemaType}`;
    
    try {
      console.log(`Fetching schema from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.schema || data;
    } catch (error) {
      console.error(`Failed to fetch ${schemaType} schema:`, error);
      throw error;
    }
  }, []);

  // Get schema for any object type (unified schema fetching)
  const getSchema = useCallback(async (schemaType) => {
    setIsLoading(true);
    setLoadingMessage(`Getting ${schemaType} schema...`);
    
    try {
      // Check if schema is already cached
      if (schemas[schemaType]) {
        setIsLoading(false);
        setLoadingMessage('');
        return schemas[schemaType];
      }

      const schema = await fetchSchema(schemaType);
      
      // Cache the schema
      setSchemas(prev => ({
        ...prev,
        [schemaType]: schema
      }));

      setIsLoading(false);
      setLoadingMessage('');
      return schema;
    } catch (error) {
      setIsLoading(false);
      setLoadingMessage('');
      console.error(`Failed to get ${schemaType} schema:`, error);
      // Return default fallback schema
      const defaultSchema = await getDefaultSchema(schemaType);
      if (defaultSchema) {
        setSchemas(prev => ({
          ...prev,
          [schemaType]: defaultSchema
        }));
        return defaultSchema;
      }
      throw error;
    }
  }, [fetchSchema, schemas]);

  // Legacy methods for backward compatibility
  const getTemplate = useCallback(async (templateType) => {
    return getSchema(templateType);
  }, [getSchema]);

  const getObjectTemplate = useCallback(async (objectType) => {
    return getSchema(objectType);
  }, [getSchema]);

  const getTaskTemplate = useCallback(async () => {
    return getSchema('task');
  }, [getSchema]);

  // Get basic problem statement template
  const getProblemStatementTemplate = useCallback(async () => {
    return getSchema('problemStatement');
  }, [getSchema]);

  // Get all schemas at once
  const getAllSchemas = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage('Loading all schemas from server...');
    
    try {
      const schemaTypes = ['bot', 'pps', 'msu', 'task', 'relay', 'assignment', 'problem-statement'];
      const schemaPromises = schemaTypes.map(async (type) => {
        try {
          const schema = await getSchema(type);
          return { [type]: schema };
        } catch (error) {
          console.warn(`Failed to get ${type} schema:`, error);
          const defaultSchema = await getDefaultSchema(type);
          return { [type]: defaultSchema };
        }
      });

      const schemaResults = await Promise.all(schemaPromises);
      const allSchemas = schemaResults.reduce((acc, schemaObj) => ({ ...acc, ...schemaObj }), {});

      setIsLoading(false);
      setLoadingMessage('');

      return allSchemas;
    } catch (error) {
      setIsLoading(false);
      setLoadingMessage('');
      console.error('Failed to get schemas:', error);
      // Return default schemas as fallback
      return await getDefaultSchemas();
    }
  }, [getSchema]);

  // Legacy method for backward compatibility
  const getAllTemplates = useCallback(async () => {
    return getAllSchemas();
  }, [getAllSchemas]);

  // Send problem statement to server for solving
  const solveProblemStatement = useCallback(async (problemStatementData) => {
    setIsLoading(true);
    setLoadingMessage('Solving problem statement...');
    
    try {
      await connect();
      const response = await sendRequest('SOLVE_PROBLEM_STATEMENT', { 
        problemStatement: problemStatementData 
      });
      setIsLoading(false);
      setLoadingMessage('');
      return response.solution;
    } catch (error) {
      setIsLoading(false);
      setLoadingMessage('');
      console.error('Failed to solve problem statement:', error);
      throw error;
    }
  }, [connect, sendRequest]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isLoading,
    loadingMessage,
    connect,
    disconnect,
    getTemplate,
    getSchema,
    getObjectTemplate,
    getTaskTemplate,
    getProblemStatementTemplate,
    getAllSchemas,
    solveProblemStatement
  };
};

// Default template fallbacks - Load from JSON files
const loadTemplateFromFile = async (templateName) => {
  try {
    const response = await fetch(`/templates/${templateName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${templateName}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
};

const getDefaultBotTemplate = async () => {
  return await loadTemplateFromFile('bot');
};

const getDefaultPpsTemplate = async () => {
  return await loadTemplateFromFile('pps');
};

const getDefaultMsuTemplate = async () => {
  return await loadTemplateFromFile('msu');
};

const getDefaultTaskTemplate = async () => {
  return await loadTemplateFromFile('task');
};

const getDefaultRelayTemplate = async () => {
  return await loadTemplateFromFile('relay');
};

const getDefaultAssignmentTemplate = async () => {
  return await loadTemplateFromFile('assignment');
};

const getDefaultProblemStatementTemplate = async () => {
  return await loadTemplateFromFile('problemStatement');
};

// Helper function to get default schema by type
const getDefaultSchema = async (schemaType) => {
  switch (schemaType) {
    case 'bot':
      return await getDefaultBotTemplate();
    case 'pps':
      return await getDefaultPpsTemplate();
    case 'msu':
      return await getDefaultMsuTemplate();
    case 'task':
      return await getDefaultTaskTemplate();
    case 'relay':
      return await getDefaultRelayTemplate();
    case 'assignment':
      return await getDefaultAssignmentTemplate();
    case 'problemStatement':
      return await getDefaultProblemStatementTemplate();
    default:
      return null;
  }
};

// Helper function to get all default schemas
const getDefaultSchemas = async () => ({
  bot: await getDefaultBotTemplate(),
  pps: await getDefaultPpsTemplate(),
  msu: await getDefaultMsuTemplate(),
  task: await getDefaultTaskTemplate(),
  relay: await getDefaultRelayTemplate(),
  assignment: await getDefaultAssignmentTemplate(),
  problemStatement: await getDefaultProblemStatementTemplate()
});
