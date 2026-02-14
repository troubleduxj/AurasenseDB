import React, { useState } from 'react';
import { Code2, Play, Table, Database, Save, RotateCcw } from 'lucide-react';

const CATALOG_TREE = [
    { name: 'default_catalog', type: 'catalog', children: [
        { name: 'tdengine', type: 'database', children: [
            { name: 'meters', type: 'table' },
            { name: 'sensors', type: 'table' },
            { name: 'logs', type: 'table' },
        ]},
        { name: 'kafka_source', type: 'table' },
    ]}
];

export const ComputingFlinkSQL: React.FC = () => {
  const [code, setCode] = useState(`-- Create a Flink Job to sync data from Kafka to TDengine
INSERT INTO tdengine.power_db.meters
SELECT 
  window_end, 
  AVG(voltage), 
  MAX(current)
FROM TABLE(
  TUMBLE(TABLE kafka_source, DESCRIPTOR(ts), INTERVAL '1' MINUTE)
)
GROUP BY window_end, window_start;`);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex items-center justify-between mb-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Flink SQL Workbench</h1>
           <p className="text-sm text-gray-400 mt-1">Develop and debug streaming SQL logic with TDengine Catalog integration.</p>
        </div>
        <div className="flex gap-2">
             <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-600 flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Script
             </button>
             <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-green-900/20">
                  <Play className="w-4 h-4 mr-2" /> Submit Job
             </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
          {/* Catalog Sidebar */}
          <div className="w-64 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
              <div className="p-3 border-b border-gray-700 bg-gray-750 flex items-center justify-between">
                  <span className="font-semibold text-gray-200 text-sm flex items-center">
                      <Database className="w-4 h-4 mr-2 text-blue-400" /> Catalogs
                  </span>
                  <button className="text-gray-500 hover:text-white"><RotateCcw className="w-3 h-3" /></button>
              </div>
              <div className="p-2 overflow-y-auto flex-1">
                  {CATALOG_TREE.map(cat => (
                      <div key={cat.name} className="space-y-1">
                          <div className="flex items-center text-sm text-gray-300 p-1 hover:bg-gray-700 rounded cursor-pointer">
                              <span className="w-4 h-4 mr-1 opacity-50">📂</span> {cat.name}
                          </div>
                          <div className="pl-4 space-y-1">
                              {cat.children.map(child => (
                                  <div key={child.name}>
                                      <div className="flex items-center text-sm text-gray-300 p-1 hover:bg-gray-700 rounded cursor-pointer">
                                          {child.type === 'database' ? <span className="mr-2 text-yellow-500 text-xs">DB</span> : <Table className="w-3 h-3 mr-2 text-purple-400" />}
                                          {child.name}
                                      </div>
                                      {child.children && (
                                          <div className="pl-4 space-y-1">
                                              {child.children.map(table => (
                                                  <div key={table.name} className="flex items-center text-sm text-gray-400 p-1 hover:bg-gray-700 rounded cursor-pointer">
                                                       <Table className="w-3 h-3 mr-2 text-blue-400" />
                                                       {table.name}
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Editor & Preview */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Code Area */}
              <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-2 z-10">
                      <div className="bg-gray-700/80 backdrop-blur rounded text-xs text-gray-400 px-2 py-1">SQL Dialect: Flink</div>
                  </div>
                  <textarea 
                      className="flex-1 bg-[#1e1e1e] text-gray-300 font-mono p-4 text-sm resize-none focus:outline-none leading-relaxed"
                      spellCheck={false}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                  />
              </div>

              {/* Preview/Logs */}
              <div className="h-48 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
                   <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-700 bg-gray-750">
                       <button className="text-sm font-medium text-blue-400 border-b-2 border-blue-400 pb-2 -mb-2.5">Result Preview</button>
                       <button className="text-sm font-medium text-gray-500 hover:text-gray-300 pb-2">Logs</button>
                   </div>
                   <div className="flex-1 p-4 flex items-center justify-center text-gray-500 text-sm">
                       <p>Run a query with <span className="font-mono bg-gray-700 px-1 rounded text-gray-300">PRINT</span> sink to preview data here.</p>
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
};