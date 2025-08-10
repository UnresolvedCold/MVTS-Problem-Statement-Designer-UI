import React, { useEffect, useState } from 'react';
import { getWSConfig, getRestConfig, getServerCfg } from './utils/constants';

const ConfigTester = () => {
  const [configs, setConfigs] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConfigs = async () => {
      try {
        // Test configuration loading
        const wsConfig = getWSConfig();
        const restConfig = getRestConfig();
        const serverConfig = getServerCfg();

        setConfigs({
          websocket: wsConfig,
          restApi: restConfig,
          server: serverConfig
        });

        // Log the configurations for debugging
        console.log('WebSocket Config:', wsConfig);
        console.log('REST API Config:', restConfig);
        console.log('Server Config:', serverConfig);

        // Test URL construction
        const wsUrl = constructWebSocketUrl(wsConfig);
        const restUrl = constructRestApiUrl(restConfig, 'bot');
        
        console.log('Constructed WebSocket URL:', wsUrl);
        console.log('Constructed REST API URL:', restUrl);
        
      } catch (err) {
        console.error('Configuration error:', err);
        setError(err.message);
      }
    };

    testConfigs();
  }, []);

  const constructWebSocketUrl = (config) => {
    const protocol = config.DEFAULT_PROTOCOL || 
      process.env.REACT_APP_WEBSOCKET_PROTOCOL || 
      (window.location.protocol === 'https:' ? 'wss' : 'ws');
    
    const configHost = config.DEFAULT_HOST || process.env.REACT_APP_WEBSOCKET_HOST;
    const configPort = config.DEFAULT_PORT || process.env.REACT_APP_WEBSOCKET_PORT;
    const endpoint = config.ENDPOINT;
    
    if (!configHost) {
      const host = window.location.hostname;
      if (configPort) {
        return `${protocol}://${host}:${configPort}${endpoint}`;
      } else {
        return `${protocol}://${window.location.host}${endpoint}`;
      }
    } else {
      return `${protocol}://${configHost}:${configPort}${endpoint}`;
    }
  };

  const constructRestApiUrl = (config, schemaType) => {
    const configHost = config.DEFAULT_HOST || process.env.REACT_APP_REST_HOST;
    const configPort = config.DEFAULT_PORT || process.env.REACT_APP_REST_PORT;
    const configProtocol = config.DEFAULT_PROTOCOL || process.env.REACT_APP_REST_PROTOCOL;
    const useRelativeUrl = !configHost && config.USE_RELATIVE_URL;
    
    if (useRelativeUrl) {
      return `${config.SCHEMAS_ENDPOINT}/${schemaType}`;
    } else {
      const protocol = configProtocol || (window.location.protocol === 'https:' ? 'https' : 'http');
      return `${protocol}://${configHost}:${configPort}${config.SCHEMAS_ENDPOINT}/${schemaType}`;
    }
  };

  if (error) {
    return (
      <div style={{ padding: '20px', background: '#ffe6e6', border: '1px solid #ff6b6b' }}>
        <h3>Configuration Error</h3>
        <p>{error}</p>
        <p>Make sure to call <code>initRuntimeConfig()</code> in your App component before using configuration.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Configuration Test Results</h3>
      <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '10px' }}>
        <h4>Current Page URL:</h4>
        <p><strong>Protocol:</strong> {window.location.protocol}</p>
        <p><strong>Host:</strong> {window.location.hostname}</p>
        <p><strong>Port:</strong> {window.location.port || 'default'}</p>
        <p><strong>Full Host:</strong> {window.location.host}</p>
      </div>
      
      {Object.keys(configs).length > 0 && (
        <div>
          <h4>Loaded Configurations:</h4>
          <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(configs, null, 2)}
          </pre>
          
          <h4>Runtime Config (window.MVTS_CONFIG):</h4>
          <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(window.MVTS_CONFIG || 'Not loaded', null, 2)}
          </pre>

          <h4>Example URL Construction:</h4>
          <ul>
            <li><strong>WebSocket:</strong> {constructWebSocketUrl(configs.websocket)}</li>
            <li><strong>REST API (bot schema):</strong> {constructRestApiUrl(configs.restApi, 'bot')}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConfigTester;
