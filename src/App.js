import React, { useState } from 'react';
import GridEditor from "./GridEditor";
import ConfigManager from "./components/ConfigManager";

function App() {
  const [currentPage, setCurrentPage] = useState('grid'); // 'grid' or 'config'

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'config':
        return <ConfigManager onBack={() => setCurrentPage('grid')} />;
      case 'grid':
      default:
        return <GridEditor onNavigateToConfig={() => setCurrentPage('config')} />;
    }
  };

  return (
    <div>
      {renderCurrentPage()}
    </div>
  );
}

export default App;