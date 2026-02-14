import React, { useState, useMemo, useEffect } from 'react';
import { Database, Search, Table, ChevronRight, ChevronDown, Terminal, AlertCircle, Activity, FileWarning, Shuffle, Copy, CheckCircle, BarChart3, HelpCircle, Sparkles, ShieldAlert, RefreshCw } from 'lucide-react';
import { MOCK_SUPER_TABLES } from '../constants';
import { analyzeDataQuality } from '../services/geminiService';

// Mock Quality Stats based on table name
const getQualityStats = (tableName: string) => {
    // Deterministic mock data generation
    const hash = tableName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Simulate specific scenarios
    if (tableName === 'meters') {
        return {
            score: 92,
            outOfOrder: 0.5, // 0.5% - Low
            nullRate: 1.2,   // 1.2% - Acceptable
            duplication: 0.1, // 0.1% - Great
            trend: [90, 91, 92, 91, 92, 93, 92],
            defaultSuggestion: "Rule: Quality is excellent. Indicators are within healthy ranges."
        };
    }
    if (tableName === 'sensors') {
        return {
            score: 78,
            outOfOrder: 5.4,  // High - Warning
            nullRate: 2.1,
            duplication: 1.5,
            trend: [85, 82, 80, 79, 75, 76, 78],
            defaultSuggestion: "Rule: High out-of-order (>5%). Check edge gateway timestamps."
        };
    }
    if (tableName === 'logs') {
        return {
            score: 98,
            outOfOrder: 0.0,
            nullRate: 0.1,
            duplication: 0.0,
            trend: [98, 98, 98, 98, 99, 98, 98],
            defaultSuggestion: "Rule: Data stream is healthy."
        };
    }
    
    // Default random
    return {
        score: 85 + (hash % 15),
        outOfOrder: (hash % 50) / 10,
        nullRate: (hash % 30) / 10,
        duplication: (hash % 10) / 10,
        trend: [80, 82, 85, 84, 86, 88, 85],
        defaultSuggestion: "Rule: Periodic monitoring recommended."
    };
};

export const OperationsData: React.FC = () => {
  const [expandedDb, setExpandedDb] = useState<string | null>('power_db');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'quality'>('preview');
  
  // AI Analysis State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'RULE' | 'AI'>('RULE');

  const qualityData = useMemo(() => selectedTable ? getQualityStats(selectedTable) : null, [selectedTable]);

  // Reset analysis when table changes
  useEffect(() => {
      setAiSuggestion(null);
      setAnalysisMode('RULE');
      setIsAnalyzing(false);
  }, [selectedTable]);

  const handleRunAiAnalysis = async () => {
      if (!qualityData || !selectedTable) return;
      
      setIsAnalyzing(true);
      try {
          const suggestion = await analyzeDataQuality(selectedTable, {
              outOfOrder: qualityData.outOfOrder,
              nullRate: qualityData.nullRate,
              duplication: qualityData.duplication
          });
          setAiSuggestion(suggestion);
          setAnalysisMode('AI');
      } catch (error) {
          console.error("AI failed, staying on rule mode");
          // Optionally show a toast here
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
       {/* Sidebar Tree */}
       <div className="w-64 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
           <div className="p-3 border-b border-gray-700 bg-gray-750">
               <div className="relative">
                   <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                   <input 
                      type="text" 
                      placeholder="Filter Objects..." 
                      className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1 text-xs text-gray-200 outline-none"
                   />
               </div>
           </div>
           <div className="flex-1 overflow-y-auto p-2">
               {['power_db', 'factory_db', 'fleet_db', 'sys_db'].map(db => (
                   <div key={db} className="mb-1">
                       <div 
                         onClick={() => setExpandedDb(expandedDb === db ? null : db)}
                         className="flex items-center p-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-200 font-medium"
                       >
                           {expandedDb === db ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                           <Database className="w-3 h-3 mr-2 text-yellow-500" />
                           {db}
                       </div>
                       {expandedDb === db && (
                           <div className="pl-4 mt-1 space-y-0.5 border-l border-gray-700 ml-2.5">
                               {MOCK_SUPER_TABLES.filter(t => t.database === db).map(t => (
                                   <div 
                                      key={t.name}
                                      onClick={() => { setSelectedTable(t.name); setActiveTab('preview'); }}
                                      className={`flex items-center p-1.5 rounded cursor-pointer text-xs ${selectedTable === t.name ? 'bg-blue-600/20 text-blue-300' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
                                   >
                                       <Table className="w-3 h-3 mr-2" />
                                       {t.name}
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
               ))}
           </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col gap-4 min-w-0">
           {/* Admin Console (Collapsible/Fixed) */}
           <div className="h-1/3 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
               <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-750">
                   <h3 className="text-xs font-bold text-gray-300 flex items-center uppercase tracking-wide">
                       <Terminal className="w-3 h-3 mr-2 text-red-400" /> Admin SQL Console (DDL/DCL)
                   </h3>
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                       High Privileges
                   </div>
               </div>
               <textarea 
                   className="flex-1 bg-[#1e1e1e] text-red-100 font-mono p-4 text-sm resize-none focus:outline-none placeholder-gray-600"
                   placeholder="-- Enter administrative SQL (CREATE, DROP, ALTER, GRANT)..."
                   spellCheck={false}
               />
               <div className="p-2 border-t border-gray-700 bg-gray-800 flex justify-end">
                   <button className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors">
                       Execute Dangerously
                   </button>
               </div>
           </div>

           {/* Table Details Panel */}
           <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden min-h-0">
               {selectedTable ? (
                   <>
                       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-750 shrink-0">
                           <div className="flex items-center gap-2">
                               <Table className="w-5 h-5 text-blue-400" />
                               <span className="text-lg font-bold text-gray-100">{selectedTable}</span>
                               <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">Super Table</span>
                           </div>
                           <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                               <button 
                                   onClick={() => setActiveTab('schema')}
                                   className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'schema' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                               >
                                   Schema
                               </button>
                               <button 
                                   onClick={() => setActiveTab('preview')}
                                   className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                               >
                                   Data Preview
                               </button>
                               <button 
                                   onClick={() => setActiveTab('quality')}
                                   className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${activeTab === 'quality' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                               >
                                   <Activity className="w-3 h-3 mr-1.5" />
                                   Data Quality
                               </button>
                           </div>
                       </div>

                       <div className="flex-1 overflow-auto p-0 bg-gray-800/50">
                           {activeTab === 'preview' && (
                               <table className="w-full text-left border-collapse text-sm">
                                   <thead>
                                       <tr className="bg-gray-700 text-gray-300">
                                           <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">ts</th>
                                           <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">current</th>
                                           <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">voltage</th>
                                           <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">phase</th>
                                           <th className="p-3 border-b border-gray-600 whitespace-nowrap text-blue-300 sticky top-0 bg-gray-700">location (Tag)</th>
                                           <th className="p-3 border-b border-gray-600 whitespace-nowrap text-blue-300 sticky top-0 bg-gray-700">group_id (Tag)</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-700 text-gray-300 font-mono">
                                       {[...Array(15)].map((_, i) => (
                                           <tr key={i} className="hover:bg-gray-700/50">
                                               <td className="p-3 text-gray-400">2023-10-27 10:{10+i}:00.000</td>
                                               <td className="p-3">{(Math.random() * 10).toFixed(2)}</td>
                                               <td className="p-3">{(220 + Math.random() * 5).toFixed(1)}</td>
                                               <td className="p-3">{(Math.random()).toFixed(3)}</td>
                                               <td className="p-3 text-blue-200">California_DC_01</td>
                                               <td className="p-3 text-blue-200">101</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           )}

                           {activeTab === 'schema' && (
                               <div className="p-6 text-gray-400 text-center italic">
                                   Schema visualization placeholder
                               </div>
                           )}

                           {activeTab === 'quality' && qualityData && (
                               <div className="p-6 max-w-5xl mx-auto space-y-6">
                                   
                                   {/* Overall Score Banner */}
                                   <div className="flex items-center gap-8 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                       <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                            {/* Circular Progress Mock */}
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                <path className={qualityData.score > 90 ? "text-green-500" : qualityData.score > 75 ? "text-yellow-500" : "text-red-500"} strokeDasharray={`${qualityData.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-3xl font-bold text-gray-100">{qualityData.score}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Quality Score</span>
                                            </div>
                                       </div>
                                       
                                       <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-gray-200 flex items-center">
                                                    <Activity className="w-5 h-5 mr-2 text-blue-400" />
                                                    Health Assessment
                                                </h4>
                                                <button 
                                                    onClick={handleRunAiAnalysis}
                                                    disabled={isAnalyzing}
                                                    className={`flex items-center text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                                        analysisMode === 'AI' 
                                                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                                                    {analysisMode === 'AI' ? 'Regenerate Insight' : 'Analyze with AI'}
                                                </button>
                                            </div>
                                            
                                            <div className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                                                analysisMode === 'AI' ? 'bg-purple-900/10 border-purple-500/30' : 'bg-gray-800 border-gray-700'
                                            }`}>
                                                <div className="mt-0.5">
                                                    {analysisMode === 'AI' ? (
                                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                                    ) : (
                                                        qualityData.score > 90 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <ShieldAlert className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium mb-1 ${analysisMode === 'AI' ? 'text-purple-300' : 'text-gray-300'}`}>
                                                        {analysisMode === 'AI' ? 'AI Reliability Insight' : 'Rule-Based Suggestion'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 leading-relaxed">
                                                        {aiSuggestion || qualityData.defaultSuggestion}
                                                    </p>
                                                </div>
                                            </div>
                                       </div>
                                   </div>

                                   {/* Metrics Grid */}
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                       
                                       {/* Out of Order */}
                                       <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col relative group">
                                           <div className="flex items-center justify-between mb-4">
                                               <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                                   <Shuffle className="w-6 h-6" />
                                               </div>
                                               <HelpCircle className="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-help" />
                                           </div>
                                           <h5 className="text-sm text-gray-400 font-medium">Out-of-Order</h5>
                                           <div className="mt-1 flex items-end gap-2">
                                               <span className={`text-2xl font-bold ${qualityData.outOfOrder > 1 ? 'text-red-400' : 'text-gray-200'}`}>
                                                   {qualityData.outOfOrder}%
                                               </span>
                                               <span className="text-xs text-gray-500 mb-1">of records</span>
                                           </div>
                                           <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                               <div className={`h-full rounded-full ${qualityData.outOfOrder > 1 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(qualityData.outOfOrder * 10, 100)}%`}}></div>
                                           </div>
                                           <p className="text-[10px] text-gray-500 mt-3">
                                               Impacts write performance. Keep below 1%.
                                           </p>
                                       </div>

                                       {/* Null Rate */}
                                       <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col relative">
                                            <div className="flex items-center justify-between mb-4">
                                               <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                                   <FileWarning className="w-6 h-6" />
                                               </div>
                                           </div>
                                           <h5 className="text-sm text-gray-400 font-medium">Null Rate</h5>
                                           <div className="mt-1 flex items-end gap-2">
                                               <span className={`text-2xl font-bold ${qualityData.nullRate > 5 ? 'text-yellow-400' : 'text-gray-200'}`}>
                                                   {qualityData.nullRate}%
                                               </span>
                                               <span className="text-xs text-gray-500 mb-1">completeness</span>
                                           </div>
                                            <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                               <div className={`h-full rounded-full ${qualityData.nullRate > 5 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{width: `${Math.min(qualityData.nullRate * 5, 100)}%`}}></div>
                                           </div>
                                            <p className="text-[10px] text-gray-500 mt-3">
                                               Percentage of rows with missing critical fields.
                                           </p>
                                       </div>

                                       {/* Duplication */}
                                       <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col relative">
                                           <div className="flex items-center justify-between mb-4">
                                               <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                   <Copy className="w-6 h-6" />
                                               </div>
                                           </div>
                                           <h5 className="text-sm text-gray-400 font-medium">Duplication</h5>
                                           <div className="mt-1 flex items-end gap-2">
                                               <span className="text-2xl font-bold text-gray-200">
                                                   {qualityData.duplication}%
                                               </span>
                                               <span className="text-xs text-gray-500 mb-1">redundancy</span>
                                           </div>
                                           <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                               <div className="h-full rounded-full bg-purple-500" style={{width: `${Math.min(qualityData.duplication * 10, 100)}%`}}></div>
                                           </div>
                                            <p className="text-[10px] text-gray-500 mt-3">
                                               Rows discarded due to exact timestamp match.
                                           </p>
                                       </div>
                                   </div>

                                   {/* Trend Chart Mock */}
                                   <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/50">
                                       <div className="flex items-center justify-between mb-4">
                                           <h5 className="text-xs font-bold text-gray-400 uppercase flex items-center">
                                               <BarChart3 className="w-4 h-4 mr-2" /> 7-Day Quality Trend
                                           </h5>
                                       </div>
                                       <div className="h-24 flex items-end gap-2 px-2">
                                           {qualityData.trend.map((val, i) => (
                                               <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                   <div 
                                                     className="w-full bg-blue-500/20 border-t-2 border-blue-500 rounded-t hover:bg-blue-500/40 transition-all relative" 
                                                     style={{height: `${val}%`}}
                                                   >
                                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-[10px] px-1.5 py-0.5 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {val}
                                                        </div>
                                                   </div>
                                                   <span className="text-[10px] text-gray-600">Day {i+1}</span>
                                               </div>
                                           ))}
                                       </div>
                                   </div>

                               </div>
                           )}
                       </div>
                   </>
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500">
                       <Database className="w-12 h-12 mb-3 opacity-20" />
                       <p>Select a table to inspect data</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};
