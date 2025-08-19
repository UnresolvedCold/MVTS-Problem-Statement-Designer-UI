import React, { useEffect, useState } from 'react';
import GridEditor from "./GridEditor";
import { initRuntimeConfig } from './utils/runtimeConfig';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

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
      <ThemeProvider>
        <div className="flex justify-center items-center h-screen flex-col gap-2.5 bg-white dark:bg-gray-900">
          <div className="text-gray-900 dark:text-gray-100">Loading configuration...</div>
          {configError && (
            <div className="text-orange-500 text-sm">
              Warning: {configError}
            </div>
          )}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <ThemeToggle />
        <GridEditor />
      </div>
    </ThemeProvider>
  );
}

export default App;