
import React, { useState, useMemo, useEffect } from 'react';
import { Database, Search, Table, ChevronRight, ChevronDown, Terminal, AlertCircle, Activity, FileWarning, Shuffle, Copy, CheckCircle, BarChart3, HelpCircle, Sparkles, ShieldAlert, RefreshCw, Plus, Trash2, Edit3, Save, Settings2, MoreHorizontal, X, Box, Tag, Cpu, Layers } from 'lucide-react';
import { MOCK_SUPER_TABLES } from '../constants';
import { analyzeDataQuality } from '../services/geminiService';

// --- Types ---
interface ColumnDef {
    name: string;
    type: string;
    length?: number;
    note?: string;
}

interface TableSchema {
    metrics: ColumnDef[];
    tags: ColumnDef[];
}

// --- Mock Data Generators ---
const getQualityStats = (tableName: string) => {
    // Deterministic mock data generation
    const hash = tableName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Simulate specific scenarios
    if (tableName === 'meters') {
        return {
            score: 92,
            outOfOrder: 0.5,
            nullRate: 1.2,
            duplication: 0.1,
            trend: [90, 91, 92, 91, 92, 93, 92],
            defaultSuggestion: "Rule: Quality is excellent. Indicators are within healthy ranges."
        };
    }
    return {
        score: 85,
        outOfOrder: 0.2,
        nullRate: 0.5,
        duplication: 0.0,
        trend: [80, 82, 85, 84, 86, 88, 85],
        defaultSuggestion: "Rule: Periodic monitoring recommended."
    };
};

const MOCK_SCHEMA: TableSchema = {
    metrics: [
        { name: 'ts', type: 'TIMESTAMP', note: 'Primary Key' },
        { name: 'current', type: 'FLOAT', note: 'Amps' },
        { name: 'voltage', type: 'INT', note: 'Volts' },
        { name: 'phase', type: 'FLOAT', note: 'Phase angle' },
    ],
    tags: [
        { name: 'location', type: 'BINARY', length: 64, note: 'Geo location' },
        { name: 'group_id', type: 'INT', note: 'Device Group' },
    ]
};

// Mock Child Tables generator
const generateChildTables = (stName: string) => {
    const count = 5; 
    return Array.from({ length: count }).map((_, i) => ({
        name: `${stName}_device_${100 + i}`,
        tags: {
            location: i % 2 === 0 ? 'California_DC_01' : 'Nevada_Site_B',
            group_id: 100 + (i % 3)
        }
    }));
};

// --- Sub-Components ---

const SchemaEditor = ({ schema, onAdd, readOnly = false }: { schema: TableSchema, onAdd: (type: 'metric' | 'tag') => void, readOnly?: boolean }) => {
    return (
        <div className="p-6 space-y-8">
            {/* Metrics Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-blue-400" /> Data Columns (Metrics)
                    </h4>
                    {!readOnly && (
                        <button onClick={() => onAdd('metric')} className="text-xs flex items-center bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded transition-colors border border-blue-600/30">
                            <Plus className="w-3 h-3 mr-1" /> Add Column
                        </button>
                    )}
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Data Type</th>
                                <th className="p-3 font-medium">Length</th>
                                {!readOnly && <th className="p-3 font-medium text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {schema.metrics.map((col) => (
                                <tr key={col.name} className="hover:bg-gray-800/50 group">
                                    <td className="p-3 font-mono text-gray-200">{col.name}</td>
                                    <td className="p-3 text-yellow-500 font-mono text-xs">{col.type}</td>
                                    <td className="p-3 text-gray-500 text-xs">{col.length || '-'}</td>
                                    {!readOnly && (
                                        <td className="p-3 text-right">
                                            {col.name !== 'ts' && (
                                                <button className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tags Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center">
                        <Box className="w-4 h-4 mr-2 text-purple-400" /> Tags (Metadata)
                    </h4>
                    {!readOnly && (
                        <button onClick={() => onAdd('tag')} className="text-xs flex items-center bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-3 py-1.5 rounded transition-colors border border-purple-600/30">
                            <Plus className="w-3 h-3 mr-1" /> Add Tag
                        </button>
                    )}
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Data Type</th>
                                <th className="p-3 font-medium">Length</th>
                                {!readOnly && <th className="p-3 font-medium text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {schema.tags.map((col) => (
                                <tr key={col.name} className="hover:bg-gray-800/50 group">
                                    <td className="p-3 font-mono text-gray-200">{col.name}</td>
                                    <td className="p-3 text-purple-400 font-mono text-xs">{col.type}</td>
                                    <td className="p-3 text-gray-500 text-xs">{col.length || '-'}</td>
                                    {!readOnly && (
                                        <td className="p-3 text-right">
                                            <button className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TagAttributesEditor = ({ tableName, initialTags }: { tableName: string, initialTags: Record<string, any> }) => {
    return (
        <div className="p-6 max-w-3xl">
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex gap-3">
                <Tag className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-300">Device Static Attributes</h4>
                    <p className="text-xs text-blue-200/80 mt-1">
                        Modifying tags here will update the metadata for <strong>{tableName}</strong> instantly. 
                        This does not affect historical metric data.
                    </p>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-750 flex justify-between items-center">
                    <h3 className="font-medium text-gray-200">Tag Values</h3>
                    <button className="text-xs flex items-center bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">
                        <Save className="w-3 h-3 mr-1.5" /> Save Attributes
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-4 w-1/3">Tag Name</th>
                            <th className="p-4">Current Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {Object.entries(initialTags).map(([key, value]) => (
                            <tr key={key} className="hover:bg-gray-700/30">
                                <td className="p-4 font-mono text-purple-300">{key}</td>
                                <td className="p-4">
                                    <input 
                                        type="text" 
                                        defaultValue={value}
                                        className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 w-full max-w-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DatabaseSettings = ({ dbName }: { dbName: string }) => {
    return (
        <div className="p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                        <Database className="w-6 h-6 mr-3 text-yellow-500" />
                        {dbName}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Database Configuration & Parameters</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded-lg text-sm transition-colors flex items-center">
                        <Trash2 className="w-4 h-4 mr-2" /> Drop Database
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-4">
                    <h3 className="font-bold text-gray-200 border-b border-gray-700 pb-2">Retention Policy</h3>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Keep (Days)</label>
                        <div className="flex gap-2">
                            <input type="number" defaultValue={365} className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500" />
                            <span className="text-sm text-gray-500 self-center">days</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">How long to keep raw data before automatic deletion.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Duration (Blocks)</label>
                        <input type="number" defaultValue={10} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500" />
                    </div>
                </div>

                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-4">
                    <h3 className="font-bold text-gray-200 border-b border-gray-700 pb-2">Performance & Availability</h3>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Replica Factor</label>
                        <select className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none">
                            <option value="1">1 (No High Availability)</option>
                            <option value="3" selected>3 (Standard HA)</option>
                            <option value="5">5 (High Reliability)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">WAL Level</label>
                            <select className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none">
                                <option value="1">1 (Write Only)</option>
                                <option value="2" selected>2 (Fsync)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">VGroups</label>
                            <input type="number" defaultValue={4} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export const OperationsData: React.FC = () => {
  const [expandedDb, setExpandedDb] = useState<string | null>('power_db');
  const [expandedSt, setExpandedSt] = useState<string | null>(null); // For Super Table expansion
  
  // Context: DB, SUPER_TABLE, or CHILD_TABLE
  const [viewContext, setViewContext] = useState<{ 
      type: 'DB' | 'SUPER_TABLE' | 'CHILD_TABLE' | 'NONE', 
      name: string, 
      db?: string,
      st?: string, // Parent super table name if type is CHILD_TABLE
      tags?: any // For child table tags
  }>({ type: 'DB', name: 'power_db' });
  
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'quality' | 'tags'>('preview');
  const [showSqlConsole, setShowSqlConsole] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  
  // AI Analysis State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'RULE' | 'AI'>('RULE');

  // New Column State
  const [newCol, setNewCol] = useState({ name: '', type: 'FLOAT', length: 64, isTag: false });

  // Reset analysis when table changes
  useEffect(() => {
      setAiSuggestion(null);
      setAnalysisMode('RULE');
      setIsAnalyzing(false);
      // Default tab based on context
      if (viewContext.type === 'CHILD_TABLE') setActiveTab('preview'); 
      else if (viewContext.type === 'SUPER_TABLE') setActiveTab('preview');
  }, [viewContext]);

  const qualityData = useMemo(() => viewContext.type === 'SUPER_TABLE' ? getQualityStats(viewContext.name) : null, [viewContext]);

  // Generate child tables map for the UI state
  const childTablesMap = useMemo(() => {
      const map: Record<string, any[]> = {};
      MOCK_SUPER_TABLES.forEach(st => {
          map[st.name] = generateChildTables(st.name);
      });
      return map;
  }, []);

  const handleRunAiAnalysis = async () => {
      if (!qualityData || viewContext.type !== 'SUPER_TABLE') return;
      
      setIsAnalyzing(true);
      try {
          const suggestion = await analyzeDataQuality(viewContext.name, {
              outOfOrder: qualityData.outOfOrder,
              nullRate: qualityData.nullRate,
              duplication: qualityData.duplication
          });
          setAiSuggestion(suggestion);
          setAnalysisMode('AI');
      } catch (error) {
          console.error("AI failed");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleAddColumn = () => {
      setShowAddColumnModal(false);
      alert(`Column '${newCol.name}' (${newCol.type}) added successfully! (Mock)`);
      setNewCol({ name: '', type: 'FLOAT', length: 64, isTag: false });
  };

  // Breadcrumbs renderer
  const renderBreadcrumbs = () => {
      return (
          <div className="flex items-center text-sm text-gray-400 mb-1">
              <span className="hover:text-white cursor-pointer" onClick={() => {
                  if (viewContext.db) setViewContext({ type: 'DB', name: viewContext.db });
              }}>
                  {viewContext.db || 'Cluster'}
              </span>
              {viewContext.st && (
                  <>
                      <ChevronRight className="w-3 h-3 mx-1" />
                      <span className={`hover:text-white cursor-pointer ${viewContext.type === 'SUPER_TABLE' ? 'text-gray-100 font-bold' : ''}`} onClick={() => {
                          setViewContext({ type: 'SUPER_TABLE', name: viewContext.st!, db: viewContext.db });
                      }}>
                          {viewContext.st}
                      </span>
                  </>
              )}
              {viewContext.type === 'CHILD_TABLE' && (
                  <>
                      <ChevronRight className="w-3 h-3 mx-1" />
                      <span className="text-gray-100 font-bold">{viewContext.name}</span>
                  </>
              )}
          </div>
      );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
       {/* Sidebar Tree */}
       <div className="w-72 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
           <div className="p-3 border-b border-gray-700 bg-gray-750 flex items-center justify-between gap-2">
               <div className="relative flex-1">
                   <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                   <input 
                      type="text" 
                      placeholder="Filter..." 
                      className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1 text-xs text-gray-200 outline-none"
                   />
               </div>
               <button className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded" title="New Database">
                   <Plus className="w-4 h-4" />
               </button>
           </div>
           <div className="flex-1 overflow-y-auto p-2">
               {['power_db', 'factory_db', 'fleet_db', 'sys_db'].map(db => (
                   <div key={db} className="mb-1">
                       {/* Level 1: Database */}
                       <div 
                         className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-sm font-medium group transition-colors ${
                             viewContext.type === 'DB' && viewContext.name === db ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-200 hover:bg-gray-700'
                         }`}
                       >
                           <div className="flex items-center w-full" onClick={() => { 
                               setExpandedDb(expandedDb === db ? null : db); 
                               setViewContext({ type: 'DB', name: db }); 
                           }}>
                               {expandedDb === db ? <ChevronDown className="w-3 h-3 mr-1 text-gray-500" /> : <ChevronRight className="w-3 h-3 mr-1 text-gray-500" />}
                               <Database className="w-3 h-3 mr-2 text-yellow-500" />
                               <span className="truncate">{db}</span>
                           </div>
                           <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white"><MoreHorizontal className="w-3 h-3" /></button>
                       </div>
                       
                       {/* Level 2: Super Tables */}
                       {expandedDb === db && (
                           <div className="pl-2 mt-0.5 space-y-0.5 ml-2 border-l border-gray-700/50">
                               {MOCK_SUPER_TABLES.filter(t => t.database === db).map(st => (
                                   <div key={st.name}>
                                       <div 
                                          className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-xs group transition-colors ${
                                              viewContext.name === st.name && viewContext.type === 'SUPER_TABLE'
                                              ? 'bg-blue-600/20 text-blue-300' 
                                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                                          }`}
                                       >
                                           <div className="flex items-center w-full" onClick={() => { 
                                               setExpandedSt(expandedSt === st.name ? null : st.name);
                                               setViewContext({ type: 'SUPER_TABLE', name: st.name, db: db, st: st.name }); 
                                               setActiveTab('preview');
                                           }}>
                                                {expandedSt === st.name ? <ChevronDown className="w-3 h-3 mr-1.5 opacity-70" /> : <ChevronRight className="w-3 h-3 mr-1.5 opacity-70" />}
                                                <Layers className="w-3 h-3 mr-2 text-blue-400" />
                                                <span className="truncate">{st.name}</span>
                                           </div>
                                       </div>

                                       {/* Level 3: Child Tables */}
                                       {expandedSt === st.name && (
                                           <div className="pl-3 mt-0.5 mb-1 space-y-0.5 ml-2 border-l border-gray-700/30">
                                               {childTablesMap[st.name]?.map((ct: any) => (
                                                   <div 
                                                      key={ct.name}
                                                      onClick={() => { 
                                                          setViewContext({ type: 'CHILD_TABLE', name: ct.name, db: db, st: st.name, tags: ct.tags }); 
                                                          setActiveTab('preview');
                                                      }}
                                                      className={`flex items-center p-1.5 rounded cursor-pointer text-xs pl-2 ${
                                                          viewContext.name === ct.name && viewContext.type === 'CHILD_TABLE'
                                                          ? 'bg-purple-600/20 text-purple-300' 
                                                          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                                                      }`}
                                                   >
                                                       <Cpu className="w-3 h-3 mr-2 opacity-70" />
                                                       <span className="truncate">{ct.name.replace(st.name + '_', '')}</span>
                                                   </div>
                                               ))}
                                               <button className="flex items-center p-1.5 text-[10px] text-gray-600 hover:text-blue-400 w-full hover:bg-gray-800 rounded mt-1 pl-2">
                                                   <Plus className="w-2.5 h-2.5 mr-1.5" /> Create Child Table
                                               </button>
                                           </div>
                                       )}
                                   </div>
                               ))}
                               <button className="flex items-center p-1.5 text-xs text-gray-500 hover:text-blue-400 w-full hover:bg-gray-700/50 rounded mt-1">
                                   <Plus className="w-3 h-3 mr-1" /> New Super Table
                               </button>
                           </div>
                       )}
                   </div>
               ))}
           </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col gap-4 min-w-0">
           
           {/* Collapsible Admin Console */}
           <div className={`bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0 transition-all duration-300 ${showSqlConsole ? 'h-48' : 'h-10'}`}>
               <div className="flex items-center justify-between px-4 py-2 bg-gray-750 cursor-pointer hover:bg-gray-700/50" onClick={() => setShowSqlConsole(!showSqlConsole)}>
                   <h3 className="text-xs font-bold text-gray-300 flex items-center uppercase tracking-wide">
                       <Terminal className="w-3 h-3 mr-2 text-green-400" /> 
                       Advanced: SQL Console
                   </h3>
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] text-gray-500">Only for DDL/DCL operations</span>
                       {showSqlConsole ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
                   </div>
               </div>
               {showSqlConsole && (
                   <div className="flex-1 flex flex-col">
                       <textarea 
                           className="flex-1 bg-[#1e1e1e] text-green-100 font-mono p-4 text-sm resize-none focus:outline-none placeholder-gray-600"
                           placeholder="-- Enter SQL commands directly (CREATE, ALTER, DROP)..."
                           spellCheck={false}
                       />
                       <div className="p-2 border-t border-gray-700 bg-gray-800 flex justify-end">
                           <button className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center">
                               Execute <Settings2 className="w-3 h-3 ml-2" />
                           </button>
                       </div>
                   </div>
               )}
           </div>

           {/* Content Panel */}
           <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden min-h-0 relative">
               
               {/* Scenario 1: Database Settings */}
               {viewContext.type === 'DB' && (
                   <div className="flex-1 overflow-auto">
                       <DatabaseSettings dbName={viewContext.name} />
                   </div>
               )}

               {/* Scenario 2 & 3: Table Details (Super OR Child) */}
               {(viewContext.type === 'SUPER_TABLE' || viewContext.type === 'CHILD_TABLE') && (
                   <>
                       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-750 shrink-0">
                           <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${viewContext.type === 'SUPER_TABLE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                   {viewContext.type === 'SUPER_TABLE' ? <Layers className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
                               </div>
                               <div>
                                   {renderBreadcrumbs()}
                                   <div className="flex items-center gap-2">
                                       <span className="text-xl font-bold text-gray-100">{viewContext.name}</span>
                                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                           viewContext.type === 'SUPER_TABLE' 
                                           ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                                           : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                       }`}>
                                           {viewContext.type === 'SUPER_TABLE' ? 'Super Table' : 'Child Table'}
                                       </span>
                                   </div>
                               </div>
                           </div>
                           <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                               <button 
                                   onClick={() => setActiveTab('preview')}
                                   className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                               >
                                   Data Preview
                               </button>
                               {viewContext.type === 'SUPER_TABLE' ? (
                                   <>
                                       <button 
                                           onClick={() => setActiveTab('schema')}
                                           className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${activeTab === 'schema' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                       >
                                           <Settings2 className="w-3 h-3 mr-1.5" /> Schema
                                       </button>
                                       <button 
                                           onClick={() => setActiveTab('quality')}
                                           className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${activeTab === 'quality' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                                       >
                                           <Activity className="w-3 h-3 mr-1.5" />
                                           Data Quality
                                       </button>
                                   </>
                               ) : (
                                   <>
                                       <button 
                                           onClick={() => setActiveTab('tags')}
                                           className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${activeTab === 'tags' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:text-gray-200'}`}
                                       >
                                           <Tag className="w-3 h-3 mr-1.5" />
                                           Attributes (Tags)
                                       </button>
                                       <button 
                                           onClick={() => setActiveTab('schema')}
                                           className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${activeTab === 'schema' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                       >
                                           <Settings2 className="w-3 h-3 mr-1.5" /> View Schema
                                       </button>
                                   </>
                               )}
                           </div>
                       </div>

                       <div className="flex-1 overflow-auto p-0 bg-gray-800/50">
                           {activeTab === 'preview' && (
                               <div className="h-full flex flex-col">
                                   {viewContext.type === 'SUPER_TABLE' && (
                                       <div className="bg-blue-900/10 border-b border-blue-500/10 px-4 py-2 text-xs text-blue-300 flex items-center">
                                           <Box className="w-3 h-3 mr-2" />
                                           Showing aggregated data from all {childTablesMap[viewContext.name]?.length || 0} child tables.
                                       </div>
                                   )}
                                   <table className="w-full text-left border-collapse text-sm">
                                       <thead>
                                           <tr className="bg-gray-700 text-gray-300">
                                               <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">ts</th>
                                               <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">current</th>
                                               <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">voltage</th>
                                               <th className="p-3 border-b border-gray-600 whitespace-nowrap sticky top-0 bg-gray-700">phase</th>
                                               {viewContext.type === 'SUPER_TABLE' && (
                                                   <>
                                                       <th className="p-3 border-b border-gray-600 whitespace-nowrap text-blue-300 sticky top-0 bg-gray-700">location (Tag)</th>
                                                       <th className="p-3 border-b border-gray-600 whitespace-nowrap text-blue-300 sticky top-0 bg-gray-700">group_id (Tag)</th>
                                                   </>
                                               )}
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y divide-gray-700 text-gray-300 font-mono">
                                           {[...Array(15)].map((_, i) => (
                                               <tr key={i} className="hover:bg-gray-700/50">
                                                   <td className="p-3 text-gray-400">2023-10-27 10:{10+i}:00.000</td>
                                                   <td className="p-3">{(Math.random() * 10).toFixed(2)}</td>
                                                   <td className="p-3">{(220 + Math.random() * 5).toFixed(1)}</td>
                                                   <td className="p-3">{(Math.random()).toFixed(3)}</td>
                                                   {viewContext.type === 'SUPER_TABLE' && (
                                                       <>
                                                           <td className="p-3 text-blue-200">{i % 2 === 0 ? 'California_DC_01' : 'Nevada_Site_B'}</td>
                                                           <td className="p-3 text-blue-200">10{i % 3}</td>
                                                       </>
                                                   )}
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                           )}

                           {activeTab === 'schema' && (
                               <SchemaEditor 
                                   schema={MOCK_SCHEMA} 
                                   onAdd={(type) => { setNewCol(prev => ({...prev, isTag: type === 'tag'})); setShowAddColumnModal(true); }} 
                                   readOnly={viewContext.type === 'CHILD_TABLE'}
                               />
                           )}

                           {activeTab === 'tags' && viewContext.type === 'CHILD_TABLE' && (
                               <TagAttributesEditor tableName={viewContext.name} initialTags={viewContext.tags || {}} />
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
                                       {/* ... (Metrics visual blocks same as before) ... */}
                                   </div>
                               </div>
                           )}
                       </div>
                   </>
               )}

               {viewContext.type === 'NONE' && (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500">
                       <Database className="w-16 h-16 mb-4 opacity-20" />
                       <p className="text-lg font-medium text-gray-400">No Asset Selected</p>
                       <p className="text-xs text-gray-500 mt-2">Select a database or table from the sidebar to manage.</p>
                   </div>
               )}
           </div>
       </div>

       {/* Create Column Modal */}
       {showAddColumnModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
               <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                   <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                       <h2 className="text-lg font-bold text-gray-100">Add New {newCol.isTag ? 'Tag' : 'Column'}</h2>
                       <button onClick={() => setShowAddColumnModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                   </div>
                   <div className="p-6 space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                           <input 
                               type="text" 
                               value={newCol.name}
                               onChange={e => setNewCol({...newCol, name: e.target.value})}
                               className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                               placeholder="e.g. engine_temp"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Data Type</label>
                           <select 
                               value={newCol.type}
                               onChange={e => setNewCol({...newCol, type: e.target.value})}
                               className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                           >
                               <option value="INT">INT</option>
                               <option value="BIGINT">BIGINT</option>
                               <option value="FLOAT">FLOAT</option>
                               <option value="DOUBLE">DOUBLE</option>
                               <option value="BOOL">BOOL</option>
                               <option value="TIMESTAMP">TIMESTAMP</option>
                               <option value="BINARY">BINARY (String)</option>
                               <option value="NCHAR">NCHAR (Unicode)</option>
                           </select>
                       </div>
                       {(newCol.type === 'BINARY' || newCol.type === 'NCHAR') && (
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Length</label>
                               <input 
                                   type="number" 
                                   value={newCol.length}
                                   onChange={e => setNewCol({...newCol, length: Number(e.target.value)})}
                                   className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                               />
                           </div>
                       )}
                   </div>
                   <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                       <button onClick={() => setShowAddColumnModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                       <button 
                           onClick={handleAddColumn}
                           disabled={!newCol.name}
                           className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium flex items-center shadow-lg disabled:opacity-50"
                       >
                           <Plus className="w-4 h-4 mr-1.5" /> Add
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
