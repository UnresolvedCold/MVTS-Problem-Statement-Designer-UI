import React from 'react';

const TabNavigation = ({ activeTab, onTabChange, tabs = ['grid', 'json'] }) => {
  const tabConfig = {
    grid: { label: '🎯 Grid Editor', icon: '🎯' },
    json: { label: '📄 JSON Viewer', icon: '📄' },
    config: { label: '⚙️ Configuration', icon: '⚙️' },
    solution: { label: '🎉 Solution', icon: '🎉' }
  };

  return (
    <div className="flex border-b border-gray-300 bg-gray-50 px-2.5">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`py-2.5 px-5 border-none cursor-pointer bg-transparent transition-colors ${
            activeTab === tab 
              ? 'border-b-4 border-blue-500 font-bold' 
              : 'border-b-4 border-transparent font-normal hover:bg-gray-100'
          }`}
        >
          {tabConfig[tab]?.label || tab}
        </button>
      ))}
      <div className="flex-1"></div>
    </div>
  );
};

export default TabNavigation;
