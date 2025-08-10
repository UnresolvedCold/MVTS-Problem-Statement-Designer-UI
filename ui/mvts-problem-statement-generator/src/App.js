import React, { useEffect, useState } from 'react';
import GridEditor from "./GridEditor";
import { initRuntimeConfig } from './utils/runtimeConfig';

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await initRuntimeConfig();
        console.log('Runtime configuration loaded successfully');
        setConfigLoaded(true);
      } catch (error) {
        console.warn('Failed to load runtime config, using defaults:', error);
        setConfigError(error.message);
        setConfigLoaded(true); // Still continue with defaults
      }
    };

    loadConfig();
  }, []);

  if (!configLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>Loading configuration...</div>
        {configError && (
          <div style={{ color: 'orange', fontSize: '0.9em' }}>
            Warning: {configError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <GridEditor />
    </div>
  );
}

export default App;