import React from 'react';
import { Filter, ArrowRight, Trash2, PlusCircle, PlayCircle } from 'lucide-react';

export const IngestionPipelines: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Processing Pipelines</h1>
           <p className="text-sm text-gray-400 mt-1">Define ETL rules to clean, transform, and enrich data before storage.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
             <PlusCircle className="w-4 h-4 mr-2" /> New Pipeline
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-gray-700/30 text-xs font-medium text-gray-400 uppercase">
               <div className="col-span-3">Pipeline Name</div>
               <div className="col-span-4">Steps</div>
               <div className="col-span-2 text-center">Status</div>
               <div className="col-span-2 text-center">Hits/sec</div>
               <div className="col-span-1 text-right">Actions</div>
          </div>
          
          {[1, 2].map(i => (
            <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-700/20 transition-colors border-b border-gray-700/50 last:border-0">
               <div className="col-span-3">
                   <h3 className="text-gray-200 font-medium">Pre-process MQTT Meters {i}</h3>
                   <p className="text-xs text-gray-500 mt-1">Applied to: Factory A Gateway</p>
               </div>
               <div className="col-span-4 flex items-center space-x-2">
                   <div className="px-2 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-500 flex items-center">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter Nulls
                   </div>
                   <ArrowRight className="w-3 h-3 text-gray-600" />
                   <div className="px-2 py-1 bg-blue-900/30 border border-blue-700/50 rounded text-xs text-blue-400">
                      Enrich Location
                   </div>
                   <ArrowRight className="w-3 h-3 text-gray-600" />
                   <div className="px-2 py-1 bg-purple-900/30 border border-purple-700/50 rounded text-xs text-purple-400">
                      Mask Sensitive
                   </div>
               </div>
               <div className="col-span-2 text-center">
                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                      Running
                   </span>
               </div>
               <div className="col-span-2 text-center font-mono text-sm text-gray-300">
                   {(Math.random() * 2000).toFixed(0)}
               </div>
               <div className="col-span-1 flex justify-end space-x-2">
                   <button className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                   <button className="text-gray-500 hover:text-blue-400"><PlayCircle className="w-4 h-4" /></button>
               </div>
            </div>
          ))}
      </div>
      
      {/* Rule Editor Mock */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 opacity-50 pointer-events-none grayscale">
          <div className="text-center">
             <h3 className="text-lg font-medium text-gray-400">Select a pipeline to edit rules</h3>
          </div>
      </div>
    </div>
  );
};