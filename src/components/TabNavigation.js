import React from 'react';

const TabNavigation = ({ activeTab, onTabChange, tabs = ['grid', 'json'] }) => {
  const tabConfig = {
    grid: { label: '🎯 Grid Editor', icon: '🎯' },
    json: { label: '📄 JSON Viewer', icon: '📄' },
    config: { label: '⚙️ Configuration', icon: '⚙️' }
  };

  return (
    <div style={{
      display: "flex",
      borderBottom: "1px solid #ccc",
      backgroundColor: "#f8f9fa",
      padding: "0 10px"
    }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === tab ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === tab ? "bold" : "normal"
          }}
        >
          {tabConfig[tab]?.label || tab}
        </button>
      ))}
      <div style={{ flex: 1 }}></div>
    </div>
  );
};

export default TabNavigation;
