import React, { useEffect, useState } from 'react';
import { MOCK_NODES } from '../constants';
import { Server, Activity, HardDrive, Cpu, MoreVertical, Terminal } from 'lucide-react';
import { analyzeClusterHealth } from '../services/geminiService';

export const OperationsNodes: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('Analyzing node telemetry...');

  useEffect(() => {
    const runAnalysis = async () => {
        const result = await analyzeClusterHealth(JSON.stringify(MOCK_NODES));
        setAnalysis(result);
    };
    runAnalysis();
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">Node Monitor</h1>
             <p className="text-sm text-gray-400 mt-1">Real-time resource usage and status of all cluster nodes.</p>
          </div>
       </div>

       {/* AI Insight */}
       <div className="bg-gradient-to-r from-gray-800 to-gray-800 border border-purple-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden flex items-start gap-4">
           <div className="p-2 bg-purple-500/20 rounded-lg shrink-0 mt-1">
               <Activity className="w-6 h-6 text-purple-400" />
           </div>
           <div>
               <h3 className="text-purple-400 font-bold mb-1">AI Diagnostic</h3>
               <p className="text-gray-300 text-sm leading-relaxed">{analysis}</p>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {MOCK_NODES.map((node) => (
             <div key={node.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col relative group hover:border-blue-500/30 transition-all">
                 <div className="absolute top-4 right-4">
                     <button className="text-gray-500 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                 </div>

                 <div className="flex items-center gap-4 mb-6">
                     <div className={`p-3 rounded-xl ${node.role === 'MNODE' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        <Server className="w-8 h-8" />
                     </div>
                     <div>
                         <h3 className="text-lg font-bold text-gray-100">Node {node.id}</h3>
                         <div className="flex items-center gap-2">
                             <span className="text-sm text-gray-400 font-mono">{node.ip}</span>
                             <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                 node.role === 'MNODE' ? 'border-yellow-500/30 text-yellow-400' : 'border-blue-500/30 text-blue-400'
                             }`}>
                                 {node.role}
                             </span>
                         </div>
                     </div>
                 </div>

                 <div className="space-y-4 flex-1">
                    {/* CPU */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="flex items-center"><Cpu className="w-3 h-3 mr-1"/> CPU</span>
                            <span>{node.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${node.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${node.cpu}%`}}></div>
                        </div>
                    </div>
                    {/* RAM */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="flex items-center"><Activity className="w-3 h-3 mr-1"/> Memory</span>
                            <span>{node.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-purple-500" style={{width: `${node.memory}%`}}></div>
                        </div>
                    </div>
                    {/* Disk / WAL */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-700/50">
                        <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50 text-center">
                            <p className="text-[10px] text-gray-500 uppercase">WAL Delay</p>
                            <p className={`text-sm font-mono font-bold ${node.status === 'Syncing' ? 'text-yellow-400' : 'text-green-400'}`}>
                                {node.status === 'Syncing' ? '145ms' : '2ms'}
                            </p>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50 text-center">
                            <p className="text-[10px] text-gray-500 uppercase">Disk Usage</p>
                            <p className="text-sm font-mono font-bold text-gray-300">45%</p>
                        </div>
                    </div>
                 </div>

                 <div className="mt-6">
                     <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm font-medium flex items-center justify-center transition-colors">
                         <Terminal className="w-4 h-4 mr-2" /> SSH Console
                     </button>
                 </div>

                 {/* Status Indicator */}
                 <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${
                     node.status === 'Ready' ? 'bg-green-500' : node.status === 'Syncing' ? 'bg-yellow-500' : 'bg-red-500'
                 }`}></div>
             </div>
         ))}
       </div>
    </div>
  );
};