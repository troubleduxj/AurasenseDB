import React from 'react';
import { MOCK_PLUGINS } from '../constants';
import { Download, CheckCircle, Upload, Search, Box } from 'lucide-react';
import * as Icons from 'lucide-react';

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (Icons as any)[name] || Box;
  return <Icon className={className} />;
};

export const IngestionPlugins: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Plugin Library</h1>
           <p className="text-sm text-gray-400 mt-1">Install and manage protocol adapters for data ingestion.</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search market..." 
                    className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500 outline-none w-64" 
                />
             </div>
             <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center border border-gray-600">
                <Upload className="w-4 h-4 mr-2" /> Upload Plugin (.tar.gz)
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_PLUGINS.map((plugin) => (
             <div key={plugin.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col h-full group hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                   <div className="p-3 bg-gray-700/50 rounded-lg text-blue-400 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
                      <IconComponent name={plugin.icon} className="w-8 h-8" />
                   </div>
                   {plugin.status === 'Installed' ? (
                     <span className="flex items-center text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" /> Installed
                     </span>
                   ) : (
                     <span className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full border border-gray-600">
                        Available
                     </span>
                   )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-100 mb-1">{plugin.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500 font-mono bg-gray-900 px-1.5 py-0.5 rounded">v{plugin.version}</span>
                    <span className="text-xs text-gray-500">by TDengine</span>
                </div>
                
                <p className="text-sm text-gray-400 flex-1 mb-6 leading-relaxed">{plugin.description}</p>
                
                {plugin.status === 'Installed' ? (
                   <button 
                      className="w-full py-2 bg-gray-700/50 text-gray-400 rounded-lg text-sm font-medium cursor-default border border-gray-700"
                      disabled
                   >
                      Up to date
                   </button>
                ) : (
                   <button 
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-lg shadow-blue-900/20"
                   >
                      <Download className="w-4 h-4 mr-2" /> Install Plugin
                   </button>
                )}
             </div>
          ))}
      </div>
    </div>
  );
};