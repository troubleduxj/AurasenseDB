import React, { useState } from 'react';
import { MOCK_SUPER_TABLES } from '../constants';
import { Database, Layers, Table, Tag, Search, Filter, AlertTriangle, CheckCircle, HelpCircle, ArrowUpRight, Sparkles, ShieldAlert, RefreshCw } from 'lucide-react';
import { analyzeTagSchema } from '../services/geminiService';

// Initial Mock Data
const INITIAL_TAG_DATA = [
    { id: 1, table: 'meters', tag: 'region', count: 12, status: 'OK', advice: 'Low cardinality, ideal for grouping.' },
    { id: 2, table: 'meters', tag: 'model_ver', count: 45, status: 'OK', advice: 'Good distribution.' },
    { id: 3, table: 'vehicles', tag: 'fleet_id', count: 120, status: 'OK', advice: 'Within healthy limits.' },
    { id: 4, table: 'sensors', tag: 'device_sn', count: 45000, status: 'WARNING', advice: null },
    { id: 5, table: 'logs', tag: 'request_id', count: 2500000, status: 'CRITICAL', advice: null },
    { id: 6, table: 'logs', tag: 'client_timestamp', count: 15000000, status: 'CRITICAL', advice: null },
];

export const MetadataMap: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [tagData, setTagData] = useState(INITIAL_TAG_DATA);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'NONE' | 'AI' | 'RULE'>('NONE');

  const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
  };

  // --- 核心降级策略: 规则引擎 ---
  const getHeuristicAdvice = (item: typeof INITIAL_TAG_DATA[0]) => {
      const lowerTag = item.tag.toLowerCase();
      if (item.count > 1000000) return "Rule: Extremely high cardinality (>1M). Immediate OOM risk. Move to Column.";
      if (lowerTag.includes('time') || lowerTag.includes('date')) return "Rule: Time fields must be Metrics or primary Timestamp, never Tags.";
      if ((lowerTag.includes('id') || lowerTag.includes('uuid')) && item.count > 10000) return "Rule: Unique IDs misused as Tags. High memory consumption.";
      if (item.status === 'WARNING') return "Rule: Cardinality is elevated. Monitor memory usage.";
      return "Rule: Check schema design.";
  };

  const handleRunDiagnosis = async () => {
      setIsAnalyzing(true);
      setAnalysisMode('AI'); // Optimistically try AI

      const updatedData = await Promise.all(tagData.map(async (item) => {
          if (item.status === 'OK') return item;

          try {
              // Try AI Diagnosis
              const aiAdvice = await analyzeTagSchema(item.table, item.tag, item.count);
              return { ...item, advice: aiAdvice, source: 'AI' };
          } catch (error) {
              // Fallback to Rule Engine immediately on error
              console.warn("AI unavailable, switching to Heuristics for", item.tag);
              const ruleAdvice = getHeuristicAdvice(item);
              return { ...item, advice: ruleAdvice, source: 'RULE' };
          }
      }));

      // Check if any actually used AI (to update UI indicator)
      const usedAi = updatedData.some((d: any) => d.source === 'AI');
      setAnalysisMode(usedAi ? 'AI' : 'RULE');
      
      setTagData(updatedData);
      setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Data Map & Schema Analysis</h1>
            <p className="text-sm text-gray-400 mt-1">Explore data asset topology and analyze schema health.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search tables, tags..." 
                    className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 outline-none w-64" 
                />
             </div>
             <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors border border-gray-600 flex items-center">
                <Filter className="w-4 h-4 mr-2" /> Filter
             </button>
          </div>
       </div>

       {/* Top Section: Topology & Cardinality Analysis */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Left: Storage Topology */}
           <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col">
               <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center justify-between">
                   <div className="flex items-center">
                       <Database className="w-5 h-5 mr-2 text-blue-400" />
                       Storage Topology
                   </div>
                   <span className="text-xs font-normal text-gray-500">Live Disk Usage</span>
               </h3>
               {/* Mock Visualization */}
               <div className="flex-1 flex gap-4 items-center">
                  <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors h-48 relative group">
                     <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Database className="w-8 h-8 text-blue-400" />
                     </div>
                     <span className="font-bold text-gray-200">power_db</span>
                     <span className="text-xs text-gray-500">2.4 TB</span>
                     <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors h-48 relative group">
                     <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Database className="w-8 h-8 text-green-400" />
                     </div>
                     <span className="font-bold text-gray-200">factory_db</span>
                     <span className="text-xs text-gray-500">850 GB</span>
                     <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors h-48 relative group">
                     <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Database className="w-8 h-8 text-purple-400" />
                     </div>
                     <span className="font-bold text-gray-200">fleet_db</span>
                     <span className="text-xs text-gray-500">5.1 TB</span>
                     <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
               </div>
           </div>
           
           {/* Right: Tag Cardinality Analysis (New Feature) */}
           <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                       <Tag className="w-5 h-5 mr-2 text-yellow-400" />
                       Tag Cardinality Analysis
                   </h3>
                   
                   <div className="flex gap-2">
                       {analysisMode !== 'NONE' && (
                           <div className={`flex items-center text-xs px-2 py-1 rounded border ${
                               analysisMode === 'AI' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-gray-700 text-gray-400 border-gray-600'
                           }`}>
                               {analysisMode === 'AI' ? <Sparkles className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                               {analysisMode === 'AI' ? 'AI Enhanced' : 'Rule Based'}
                           </div>
                       )}
                       <button 
                           onClick={handleRunDiagnosis}
                           disabled={isAnalyzing}
                           className="flex items-center text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                       >
                           {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                           {isAnalyzing ? 'Diagnosing...' : 'Run Diagnosis'}
                       </button>
                   </div>
               </div>
               
               <div className="flex-1 overflow-y-auto max-h-48 pr-1 custom-scrollbar space-y-2">
                    {tagData.sort((a,b) => b.count - a.count).map((item) => (
                        <div key={item.id} className={`p-3 rounded-lg border flex items-start justify-between group transition-all ${
                            item.status === 'CRITICAL' ? 'bg-red-900/10 border-red-500/30' : 
                            item.status === 'WARNING' ? 'bg-yellow-900/10 border-yellow-500/30' : 
                            'bg-gray-700/30 border-gray-700 hover:bg-gray-700/50'
                        }`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-sm text-gray-200 font-bold">{item.tag}</span>
                                    <span className="text-xs text-gray-500">in {item.table}</span>
                                </div>
                                
                                {/* Advice Section */}
                                {item.advice ? (
                                    <p className={`text-xs flex items-start mt-1 ${item.status === 'OK' ? 'text-gray-500' : 'text-gray-300'}`}>
                                        {(item as any).source === 'AI' && <Sparkles className="w-3 h-3 mr-1.5 mt-0.5 text-purple-400 shrink-0" />}
                                        {(item as any).source === 'RULE' && <ShieldAlert className="w-3 h-3 mr-1.5 mt-0.5 text-gray-400 shrink-0" />}
                                        {item.advice}
                                    </p>
                                ) : (
                                    // Placeholder for unanalyzed items
                                    (item.status !== 'OK') && <p className="text-xs text-gray-600 italic mt-1">Click "Run Diagnosis" for advice.</p>
                                )}
                            </div>

                            <div className="text-right">
                                <div className={`text-sm font-bold font-mono ${
                                    item.status === 'CRITICAL' ? 'text-red-400' : 
                                    item.status === 'WARNING' ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                    {formatNumber(item.count)}
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Cardinality</span>
                            </div>
                        </div>
                    ))}
               </div>
               
               {/* Summary Alert */}
               {tagData.some(t => t.status === 'CRITICAL') && (
                   <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300 flex items-start gap-2">
                       <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                       <div>
                           <span className="font-bold block mb-0.5">Schema Optimization Required</span>
                           <p>Found tags with extremely high cardinality. This causes excessive metadata memory usage on MNodes.</p>
                       </div>
                   </div>
               )}
           </div>
       </div>

       {/* Bottom: Asset Catalog */}
       <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-700 bg-gray-750 flex justify-between items-center">
                <h3 className="font-semibold text-gray-200 flex items-center">
                    <Table className="w-4 h-4 mr-2 text-gray-400" />
                    Asset Catalog (Super Tables)
                </h3>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                    View Full Schema <ArrowUpRight className="w-3 h-3 ml-1" />
                </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-700/50 text-gray-400 text-sm">
                     <th className="p-4 font-medium">Name</th>
                     <th className="p-4 font-medium">Database</th>
                     <th className="p-4 font-medium text-center">Child Tables</th>
                     <th className="p-4 font-medium text-center">Metrics</th>
                     <th className="p-4 font-medium text-center">Tags</th>
                     <th className="p-4 font-medium text-right">Data Owner</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-700">
                   {MOCK_SUPER_TABLES.map((st) => (
                     <tr key={st.name} className="hover:bg-gray-700/30 transition-colors group">
                       <td className="p-4">
                         <div className="flex items-center">
                           <Layers className="w-5 h-5 text-blue-500 mr-3" />
                           <div>
                               <span className="font-semibold text-gray-200 block">{st.name}</span>
                               <span className="text-xs text-gray-500">Updated: 10m ago</span>
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <div className="flex items-center text-gray-400 text-sm">
                            <Database className="w-4 h-4 mr-2" />
                            {st.database}
                         </div>
                       </td>
                       <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200">
                            {st.tables.toLocaleString()}
                          </span>
                       </td>
                       <td className="p-4 text-center text-gray-400 text-sm">{st.columns}</td>
                       <td className="p-4 text-center text-gray-400 text-sm">{st.tags}</td>
                       <td className="p-4 text-right text-sm text-gray-400">
                         Data Eng. Team
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
       </div>
    </div>
  );
};
