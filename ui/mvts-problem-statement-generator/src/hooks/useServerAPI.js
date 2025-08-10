// src/hooks/useServerAPI.js
import { useState, useCallback, useRef } from 'react';
import { getWSConfig, getRestConfig } from '../utils/constants';

export const useServerAPI = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const socketRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());
  const [schemas, setSchemas] = useState({});
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const logCounterRef = useRef(0);

  // Generate unique request ID
  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Connect to server
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Get current WebSocket configuration
      const WEBSOCKET_CONFIG = getWSConfig();
      
      // Determine protocol - use runtime config, fallback to env var, then auto-detect
      const wsProtocol = WEBSOCKET_CONFIG.DEFAULT_PROTOCOL || 
        process.env.REACT_APP_WEBSOCKET_PROTOCOL || 
        (window.location.protocol === 'https:' ? 'wss' : 'ws');
      
      let socketUrl;
      const endpoint = WEBSOCKET_CONFIG.ENDPOINT;
      
      // Get host and port from runtime config with env fallbacks
      const configHost = WEBSOCKET_CONFIG.DEFAULT_HOST || process.env.REACT_APP_WEBSOCKET_HOST;
      const configPort = WEBSOCKET_CONFIG.DEFAULT_PORT || process.env.REACT_APP_WEBSOCKET_PORT;
      
      // Check if we should use relative URL construction
      const useRelativeUrl = !configHost && WEBSOCKET_CONFIG.USE_RELATIVE_URL;
      
      if (useRelativeUrl) {
        // Use relative URL approach - same host, potentially different port
        const host = window.location.hostname;
        
        if (configPort) {
          // Same host, different port
          socketUrl = `${wsProtocol}://${host}:${configPort}${endpoint}`;
        } else {
          // Same host, same port
          socketUrl = `${wsProtocol}://${window.location.host}${endpoint}`;
        }
      } else {
        // Use explicit host/port configuration (absolute URL)
        socketUrl = `${wsProtocol}://${configHost}:${configPort}${endpoint}`;
      }

      console.log(`Connecting to server: ${socketUrl}`);
      console.log('WebSocket Config:', {
        configHost,
        configPort,
        useRelativeUrl,
        protocol: wsProtocol,
        endpoint,
        USE_RELATIVE_URL: WEBSOCKET_CONFIG.USE_RELATIVE_URL
      });
      
      const socket = new WebSocket(socketUrl);
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

          // Handle streaming log messages
          if (data.type === 'SOLVING_PROBLEM_STATEMENT') {
            const uniqueId = `log-${Date.now()}-${++logCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
            setLogs(prevLogs => [...prevLogs, {
              id: uniqueId,
              timestamp: data.data?.timestamp || Date.now(),
              level: data.data?.level || 'INFO',
              logger: data.data?.logger || 'Unknown',
              message: data.data?.log || 'No message',
              receivedAt: new Date().toLocaleString()
            }]);
            setIsStreaming(true);
            return; // Don't process as regular request response
          }

          // Handle problem statement solved
          if (data.type === 'PROBLEM_STATEMENT_SOLVED') {
            console.log('Problem statement solved, received solution:', data.data);
            setIsStreaming(false); // Stop streaming
            setIsLoading(false);
            setLoadingMessage('');
            
            // Find the pending solve request and resolve it with the solution
            const solveRequest = Array.from(pendingRequestsRef.current.entries())
              .find(([id, request]) => request.type === 'SOLVE_PROBLEM_STATEMENT');
            
            if (solveRequest) {
              const [requestId, { resolve: requestResolve }] = solveRequest;
              pendingRequestsRef.current.delete(requestId);
              requestResolve({ solution: data.data });
            }
            
            // Disconnect from server after receiving solution
            setTimeout(() => {
              disconnect();
            }, 1000);
            
            return; // Don't process as regular request response
          }

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
  }, [disconnect]);

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

      // Store the promise resolvers with request type
      pendingRequestsRef.current.set(requestId, { resolve, reject, type });

      // Set timeout for request
      const WEBSOCKET_CONFIG = getWSConfig();
      setTimeout(() => {
        if (pendingRequestsRef.current.has(requestId)) {
          pendingRequestsRef.current.delete(requestId);
          reject(new Error(`Request timed out after ${WEBSOCKET_CONFIG.TIMEOUT_MS / 60000} minutes`));
        }
      }, WEBSOCKET_CONFIG.TIMEOUT_MS); // 5 minute timeout from config

      console.log('Sending request to server:', message);
      socketRef.current.send(JSON.stringify(message));
    });
  }, [generateRequestId]);

  // Fetch schema from REST API
  const fetchSchema = useCallback(async (schemaType) => {
    // Get current REST API configuration
    const REST_API_CONFIG = getRestConfig();
    
    // Get host and port from runtime config with env fallbacks
    const configHost = REST_API_CONFIG.DEFAULT_HOST || process.env.REACT_APP_REST_HOST;
    const configPort = REST_API_CONFIG.DEFAULT_PORT || process.env.REACT_APP_REST_PORT;
    const configProtocol = REST_API_CONFIG.DEFAULT_PROTOCOL || process.env.REACT_APP_REST_PROTOCOL;
    
    // Check if we should use relative URL (when served from same server)
    const useRelativeUrl = !configHost && REST_API_CONFIG.USE_RELATIVE_URL;
    
    let url;
    if (useRelativeUrl) {
      // Use relative REST API URL - automatically uses same host/port as the web app
      const endpoint = REST_API_CONFIG.SCHEMAS_ENDPOINT;
      url = `${endpoint}/${schemaType}`;
    } else {
      // Use explicit host/port configuration
      const port = configPort;
      const host = configHost;
      const protocol = configProtocol || (window.location.protocol === 'https:' ? 'https' : 'http');
      const endpoint = REST_API_CONFIG.SCHEMAS_ENDPOINT;
      url = `${protocol}://${host}:${port}${endpoint}/${schemaType}`;
    }
    
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
  const solveProblemStatement = useCallback(async (problemStatementData, configData = null) => {
    setIsLoading(true);
    setLoadingMessage('Solving problem statement...');
    setLogs([]); // Clear previous logs
    setIsStreaming(false);
    logCounterRef.current = 0; // Reset log counter
    
    try {
      await connect();
      
      // Prepare request data
      const requestData = { 
        problemStatement: problemStatementData 
      };
      
      // Include config if provided
      if (configData && Object.keys(configData).length > 0) {
        requestData.config = configData;
        console.log('Sending problem statement with config:', configData);
      }
      
      const response = await sendRequest('SOLVE_PROBLEM_STATEMENT', requestData);
      setIsLoading(false);
      setLoadingMessage('');
      setIsStreaming(false); // Problem solving completed
      return response.solution;
    } catch (error) {
      setIsLoading(false);
      setLoadingMessage('');
      setIsStreaming(false);
      console.error('Failed to solve problem statement:', error);
      throw error;
    }
  }, [connect, sendRequest]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    logCounterRef.current = 0; // Reset log counter
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
    solveProblemStatement,
    logs,
    isStreaming,
    clearLogs
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
