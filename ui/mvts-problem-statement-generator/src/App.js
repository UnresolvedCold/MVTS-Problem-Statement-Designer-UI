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
      <div className="flex justify-center items-center h-screen flex-col gap-2.5">
        <div>Loading configuration...</div>
        {configError && (
          <div className="text-orange-500 text-sm">
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