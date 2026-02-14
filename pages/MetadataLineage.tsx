import React from 'react';
import { Workflow, ArrowRight, Database, Server, Cpu, Box, Table } from 'lucide-react';

export const MetadataLineage: React.FC = () => {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Data Lineage</h1>
            <p className="text-sm text-gray-400 mt-1">Trace data flow from source to application.</p>
          </div>
          <div className="flex gap-2">
              <select className="bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-2 outline-none">
                  <option>Table: power_db.meters</option>
                  <option>Table: fleet_db.vehicles</option>
              </select>
          </div>
       </div>

       {/* Canvas Area */}
       <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 relative overflow-hidden bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
           <div className="absolute inset-0 flex items-center justify-center p-10">
               
               {/* Mock Flow Chart */}
               <div className="flex items-center gap-12">
                   
                   {/* Source */}
                   <div className="flex flex-col items-center gap-4">
                       <div className="w-48 p-4 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center text-center hover:border-blue-500 transition-colors cursor-pointer group">
                           <div className="p-3 bg-gray-700 rounded-full mb-2 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                               <Server className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
                           </div>
                           <h4 className="font-bold text-gray-200">MQTT Gateway</h4>
                           <p className="text-xs text-gray-500">ds_001 (Factory A)</p>
                       </div>
                   </div>

                   <ArrowRight className="w-8 h-8 text-gray-600" />

                   {/* Raw Table */}
                   <div className="flex flex-col items-center gap-4">
                       <div className="w-48 p-4 bg-gray-800 border border-blue-500 rounded-xl flex flex-col items-center text-center shadow-[0_0_20px_rgba(59,130,246,0.1)] relative">
                           <div className="absolute -top-3 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Raw</div>
                           <div className="p-3 bg-gray-700 rounded-full mb-2">
                               <Database className="w-6 h-6 text-blue-400" />
                           </div>
                           <h4 className="font-bold text-gray-200">meters</h4>
                           <p className="text-xs text-gray-500">power_db</p>
                           <p className="text-[10px] text-gray-600 mt-2 font-mono">ts, current, voltage</p>
                       </div>
                   </div>

                   <div className="flex flex-col items-center relative h-32 justify-center">
                        <div className="absolute w-0.5 h-full bg-gray-600 top-1/2 left-1/2 -translate-x-1/2"></div>
                        <div className="absolute w-full h-0.5 bg-gray-600 top-1/2 left-1/2 -translate-y-1/2 z-0"></div>
                        <ArrowRight className="w-6 h-6 text-gray-600 absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-900 z-10" />
                        
                        {/* Stream Processing Node connected via lines */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-800 border border-purple-500 p-2 rounded-lg z-10 flex items-center gap-2 whitespace-nowrap">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-gray-300">stream_avg_1m</span>
                        </div>
                   </div>

                   {/* Aggregated Table */}
                   <div className="flex flex-col items-center gap-4">
                       <div className="w-48 p-4 bg-gray-800 border border-green-500 rounded-xl flex flex-col items-center text-center shadow-[0_0_20px_rgba(34,197,94,0.1)] relative">
                           <div className="absolute -top-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Agg</div>
                           <div className="p-3 bg-gray-700 rounded-full mb-2">
                               <Table className="w-6 h-6 text-green-400" />
                           </div>
                           <h4 className="font-bold text-gray-200">meters_1m_avg</h4>
                           <p className="text-xs text-gray-500">power_db</p>
                       </div>
                   </div>

                   <ArrowRight className="w-8 h-8 text-gray-600" />

                   {/* Downstream App */}
                   <div className="flex flex-col items-center gap-4">
                       <div className="w-48 p-4 bg-gray-800 border border-gray-600 rounded-xl flex flex-col items-center text-center opacity-75 hover:opacity-100 transition-opacity">
                           <div className="p-3 bg-gray-700 rounded-full mb-2">
                               <Box className="w-6 h-6 text-yellow-400" />
                           </div>
                           <h4 className="font-bold text-gray-200">Grafana</h4>
                           <p className="text-xs text-gray-500">Dashboard: Power Monitor</p>
                       </div>
                   </div>

               </div>
           </div>
           
           <div className="absolute bottom-4 right-4 bg-gray-800 border border-gray-700 p-3 rounded-lg text-xs text-gray-400">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> Raw Data
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Aggregated
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span> Stream Task
                </div>
           </div>
       </div>
    </div>
  );
};