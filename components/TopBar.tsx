
import React from 'react';
import { Bell, Search, Settings, HelpCircle, PanelLeft } from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen = true }) => {
  return (
    <header className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center flex-1 max-w-xl gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <PanelLeft className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-gray-500" />
          </span>
          <input 
            type="text"
            placeholder="Search databases, tables, or settings..."
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 ml-6">
        <button className="text-gray-400 hover:text-gray-200 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-gray-800 bg-red-500 transform translate-x-1/3 -translate-y-1/3"></span>
        </button>
        <button className="text-gray-400 hover:text-gray-200 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-200 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
