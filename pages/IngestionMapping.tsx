
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitMerge, ArrowRight, FileJson, Table, Save, Link as LinkIcon, Trash2, X, AlertCircle, Check, ChevronLeft, Search, Plus, Calendar, MoreVertical, LayoutGrid, List as ListIcon, Database, Filter, Layers, Info } from 'lucide-react';
import { MOCK_DATA_SOURCES, MOCK_SUPER_TABLES } from '../constants';
import { MappingRule, DataSource } from '../types';

// --- Types & Constants ---

const DEFAULT_SOURCE_JSON = {
  "device_id": "unknown",
  "data": { "value": 0 }
};

// Mock schemas for different target tables
const TABLE_SCHEMAS: Record<string, { name: string, type: string, kind: string }[]> = {
  meters: [
    { name: 'ts', type: 'TIMESTAMP', kind: 'Metric' },
    { name: 'current', type: 'FLOAT', kind: 'Metric' },
    { name: 'voltage', type: 'INT', kind: 'Metric' },
    { name: 'phase', type: 'FLOAT', kind: 'Metric' },
    { name: 'location', type: 'BINARY(20)', kind: 'Tag' },
    { name: 'group_id', type: 'INT', kind: 'Tag' },
    { name: 'device_sn', type: 'BINARY(20)', kind: 'Tag' },
    { name: 'status_code', type: 'INT', kind: 'Metric' },
  ],
  sensors: [
    { name: 'ts', type: 'TIMESTAMP', kind: 'Metric' },
    { name: 'temperature', type: 'FLOAT', kind: 'Metric' },
    { name: 'humidity', type: 'FLOAT', kind: 'Metric' },
    { name: 'pressure', type: 'FLOAT', kind: 'Metric' },
    { name: 'area_id', type: 'INT', kind: 'Tag' },
    { name: 'model', type: 'BINARY(16)', kind: 'Tag' },
    { name: 'firmware', type: 'BINARY(10)', kind: 'Tag' },
  ],
  vehicles: [
    { name: 'ts', type: 'TIMESTAMP', kind: 'Metric' },
    { name: 'speed', type: 'FLOAT', kind: 'Metric' },
    { name: 'gps_lat', type: 'DOUBLE', kind: 'Metric' },
    { name: 'gps_lng', type: 'DOUBLE', kind: 'Metric' },
    { name: 'battery_level', type: 'INT', kind: 'Metric' },
    { name: 'vin', type: 'BINARY(17)', kind: 'Tag' },
    { name: 'fleet_id', type: 'INT', kind: 'Tag' },
    { name: 'driver_id', type: 'INT', kind: 'Tag' },
  ],
  logs: [
    { name: 'ts', type: 'TIMESTAMP', kind: 'Metric' },
    { name: 'level', type: 'TINYINT', kind: 'Metric' },
    { name: 'content', type: 'BINARY(1024)', kind: 'Metric' },
    { name: 'service_name', type: 'BINARY(64)', kind: 'Tag' },
    { name: 'host_ip', type: 'BINARY(15)', kind: 'Tag' },
    { name: 'trace_id', type: 'BINARY(32)', kind: 'Tag' },
  ]
};

// --- Helper: Flatten JSON keys ---
const getFlattenedKeys = (obj: any, prefix = ''): { path: string, type: string }[] => {
  let keys: { path: string, type: string }[] = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getFlattenedKeys(obj[k], prefix + k + '.'));
    } else {
      keys.push({ path: prefix + k, type: typeof obj[k] });
    }
  }
  return keys;
};

// --- Sub-Component: Mapping List View ---
const MappingListView = ({ onSelect, onCreate }: { onSelect: (id: string) => void, onCreate: () => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

    // Filter sources that represent "Configurations"
    const configs = MOCK_DATA_SOURCES.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">Mapping Configurations</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage data transformation rules for ingestion pipelines.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search configs..." 
                            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 outline-none w-64" 
                        />
                    </div>
                    <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
                        <button 
                            onClick={() => setViewType('grid')}
                            className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewType('list')}
                            className={`p-1.5 rounded ${viewType === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button 
                        onClick={onCreate}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Configuration
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {viewType === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {configs.map(source => (
                            <div 
                                key={source.id} 
                                onClick={() => onSelect(source.id)}
                                className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-blue-500/50 cursor-pointer transition-all group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-blue-900/20 group-hover:text-blue-400 transition-colors text-gray-400">
                                        <GitMerge className="w-6 h-6" />
                                    </div>
                                    <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <h3 className="font-bold text-gray-100 mb-1 line-clamp-1">{source.name} Mapping</h3>
                                <p className="text-xs text-gray-500 mb-4 flex items-center">
                                    <Database className="w-3 h-3 mr-1" />
                                    Source: {source.type}
                                </p>

                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between text-xs text-gray-400 border-t border-gray-700/50 pt-3">
                                        <span>Rules Defined</span>
                                        <span className="text-gray-200 font-mono font-bold">{source.mappingRules?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Last Updated</span>
                                        <span className="text-gray-500">2 days ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* New Placeholder */}
                        <div 
                            onClick={onCreate}
                            className="border-2 border-dashed border-gray-700 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer min-h-[200px]"
                        >
                            <Plus className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-sm font-medium">Create New</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-700/50 text-xs uppercase text-gray-400 font-medium">
                                <tr>
                                    <th className="p-4">Configuration Name</th>
                                    <th className="p-4">Source Type</th>
                                    <th className="p-4 text-center">Rules</th>
                                    <th className="p-4">Last Updated</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 text-sm">
                                {configs.map(source => (
                                    <tr key={source.id} onClick={() => onSelect(source.id)} className="hover:bg-gray-700/30 cursor-pointer group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-700 rounded text-blue-400">
                                                    <GitMerge className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-200">{source.name} Mapping</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">{source.type}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">{source.mappingRules?.length || 0}</span>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> 2023-10-25
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
export const IngestionMapping: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceIdParam = searchParams.get('sourceId');

  // View State
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Editor State
  const [sourceData, setSourceData] = useState<Record<string, any>>(DEFAULT_SOURCE_JSON);
  const [mappings, setMappings] = useState<MappingRule[]>([]);
  const [dataSourceName, setDataSourceName] = useState<string>('Unknown Source');
  const [selectedSourcePath, setSelectedSourcePath] = useState<string | null>(null);
  const [selectedTargetCol, setSelectedTargetCol] = useState<string | null>(null);
  const [activeMappingId, setActiveMappingId] = useState<string | null>(null);

  // Target Selection State
  const [targetDb, setTargetDb] = useState<string>('power_db');
  const [targetTable, setTargetTable] = useState<string>('meters');

  // Routing State
  const [tableNamePattern, setTableNamePattern] = useState('d_${device_id}');
  const [autoCreate, setAutoCreate] = useState(true);

  // Filters
  const [sourceFilter, setSourceFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');

  // Initialize view mode based on URL
  useEffect(() => {
      if (sourceIdParam) {
          handleSelectConfig(sourceIdParam);
      } else {
          setViewMode('list');
      }
  }, [sourceIdParam]);

  const handleSelectConfig = (id: string) => {
      setSelectedSourceId(id);
      const source = MOCK_DATA_SOURCES.find(s => s.id === id);
      if (source) {
          setDataSourceName(source.name);
          if (source.sampleData) setSourceData(source.sampleData);
          if (source.mappingRules) setMappings(source.mappingRules);
      } else {
          // Handle "New" or not found
          setDataSourceName("New Configuration");
          setSourceData(DEFAULT_SOURCE_JSON);
          setMappings([]);
      }
      setViewMode('editor');
      // Reset filters
      setSourceFilter('');
      setTargetFilter('');
  };

  const handleBackToList = () => {
      setSearchParams({}); // Clear URL params
      setViewMode('list');
      setSelectedSourceId(null);
  };

  const handleCreateNew = () => {
      // Logic for creating a brand new independent mapping (Mocking an ID)
      handleSelectConfig('new_temp_id');
  };

  const handleDbChange = (db: string) => {
      setTargetDb(db);
      // Auto-select the first table in this DB
      const tablesInDb = MOCK_SUPER_TABLES.filter(t => t.database === db);
      if (tablesInDb.length > 0) {
          setTargetTable(tablesInDb[0].name);
      } else {
          setTargetTable('');
      }
  };

  // Computed flat source keys
  const sourceKeys = useMemo(() => getFlattenedKeys(sourceData), [sourceData]);

  // Filtered keys
  const filteredSourceKeys = useMemo(() => {
      if (!sourceFilter) return sourceKeys;
      return sourceKeys.filter(k => k.path.toLowerCase().includes(sourceFilter.toLowerCase()));
  }, [sourceKeys, sourceFilter]);

  // Get current schema based on selected table
  const currentSchema = useMemo(() => {
      return TABLE_SCHEMAS[targetTable] || [];
  }, [targetTable]);

  // Helper to look up column info
  const getTargetInfo = (colName: string) => currentSchema.find(c => c.name === colName);

  // Filtered schema
  const filteredTargetSchema = useMemo(() => {
      if (!targetFilter) return currentSchema;
      return currentSchema.filter(c => c.name.toLowerCase().includes(targetFilter.toLowerCase()));
  }, [targetFilter, currentSchema]);

  // Get list of unique DBs
  const availableDbs = useMemo(() => [...new Set(MOCK_SUPER_TABLES.map(t => t.database))], []);
  
  // Get tables for current DB
  const availableTables = useMemo(() => MOCK_SUPER_TABLES.filter(t => t.database === targetDb), [targetDb]);

  // --- Handlers ---

  const handleCreateMapping = () => {
    if (!selectedSourcePath || !selectedTargetCol) return;

    // Check if target is already mapped
    const existing = mappings.find(m => m.targetColumn === selectedTargetCol);
    if (existing) {
      alert(`Target column '${selectedTargetCol}' is already mapped to '${existing.sourcePath}'`);
      return;
    }

    const newMapping: MappingRule = {
      id: `m_${Date.now()}`,
      sourcePath: selectedSourcePath,
      targetColumn: selectedTargetCol,
      transform: 'None'
    };

    setMappings([...mappings, newMapping]);
    setActiveMappingId(newMapping.id);
    // Reset selection
    setSelectedSourcePath(null);
    setSelectedTargetCol(null);
  };

  const handleDeleteMapping = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMappings(prev => prev.filter(m => m.id !== id));
    if (activeMappingId === id) setActiveMappingId(null);
  };

  const handleTransformChange = (val: string) => {
    if (!activeMappingId) return;
    setMappings(prev => prev.map(m => 
      m.id === activeMappingId ? { ...m, transform: val } : m
    ));
  };

  const activeMapping = mappings.find(m => m.id === activeMappingId);
  const isSourceMapped = (path: string) => mappings.some(m => m.sourcePath === path);
  const isTargetMapped = (col: string) => mappings.some(m => m.targetColumn === col);

  // --- RENDER ---

  if (viewMode === 'list') {
      return <MappingListView onSelect={handleSelectConfig} onCreate={handleCreateNew} />;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <button 
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-transparent hover:border-gray-700"
           >
               <ChevronLeft className="w-5 h-5" />
           </button>
           <div>
               <div className="flex items-center gap-2">
                   <h1 className="text-2xl font-bold text-gray-100">Edit Mapping</h1>
                   <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">Draft</span>
               </div>
               <p className="text-sm text-gray-400 mt-1">Configuration for: <span className="text-blue-400 font-medium">{dataSourceName}</span></p>
           </div>
        </div>
        <div className="flex gap-3">
             <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-600">
                Load JSON Sample
             </button>
             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
                  <Save className="w-4 h-4 mr-2" /> Save Configuration
             </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
          
          {/* --- Source Panel --- */}
          <div className="w-1/4 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-gray-750 space-y-2">
                  <div className="flex items-center">
                      <FileJson className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="font-semibold text-gray-200 text-sm">Source Data</span>
                  </div>
                  <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                      <input 
                          type="text" 
                          value={sourceFilter}
                          onChange={(e) => setSourceFilter(e.target.value)}
                          placeholder="Filter keys..." 
                          className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1 text-xs text-gray-200 outline-none focus:border-blue-500"
                      />
                  </div>
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1">
                  {filteredSourceKeys.map((item) => {
                      const isMapped = isSourceMapped(item.path);
                      const isSelected = selectedSourcePath === item.path;
                      return (
                          <div 
                             key={item.path}
                             onClick={() => setSelectedSourcePath(item.path)}
                             className={`
                                flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-sm font-mono
                                ${isSelected ? 'bg-blue-600/20 border border-blue-500/50 text-white' : 'hover:bg-gray-700/50 border border-transparent'}
                                ${isMapped && !isSelected ? 'opacity-50 text-gray-500' : 'text-gray-300'}
                             `}
                          >
                             <div className="flex items-center overflow-hidden">
                                <span className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                                    item.type === 'number' ? 'bg-blue-400' : 
                                    item.type === 'string' ? 'bg-green-400' : 'bg-gray-400'
                                }`}></span>
                                <span className="truncate" title={item.path}>{item.path}</span>
                             </div>
                             {isMapped && <Check className="w-3 h-3 text-green-500 shrink-0 ml-1" />}
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* --- Middle Panel --- */}
          <div className="flex-1 flex flex-col gap-4">
               
               {/* NEW: Routing Configuration */}
               <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col gap-3 shrink-0 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-200 flex items-center">
                            <Layers className="w-4 h-4 mr-2 text-blue-400" />
                            Sub-table Routing
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                            <Info className="w-3 h-3 mr-1" />
                            Data writes to child tables inheriting Super Table schema
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Target Super Table</label>
                            <div className="flex items-center text-sm text-gray-200 font-mono">
                                <Database className="w-3 h-3 mr-1.5 text-yellow-500" />
                                {targetDb}
                                <span className="mx-1 text-gray-600">/</span>
                                <Table className="w-3 h-3 mr-1.5 text-purple-500" />
                                {targetTable}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                                Child Table Name Pattern
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={tableNamePattern}
                                    onChange={(e) => setTableNamePattern(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 font-mono outline-none focus:border-blue-500"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded cursor-help" title="Use ${field} to reference source data">Var</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="checkbox" 
                            id="autoCreate" 
                            checked={autoCreate} 
                            onChange={(e) => setAutoCreate(e.target.checked)}
                            className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500/20 cursor-pointer" 
                        />
                        <label htmlFor="autoCreate" className="text-xs text-gray-400 select-none cursor-pointer">
                            Auto-create child table using Tags if not exists
                        </label>
                    </div>
               </div>

               {/* Action Bar */}
               <div className="h-14 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center justify-between px-4 shrink-0">
                   <div className="flex items-center text-sm text-gray-400">
                        {selectedSourcePath ? (
                            <span className="text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{selectedSourcePath}</span>
                        ) : <span className="italic">Select source...</span>}
                        <ArrowRight className="w-4 h-4 mx-3" />
                        {selectedTargetCol ? (
                            <span className="text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{selectedTargetCol}</span>
                        ) : <span className="italic">Select target...</span>}
                   </div>
                   <button 
                       onClick={handleCreateMapping}
                       disabled={!selectedSourcePath || !selectedTargetCol}
                       className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-sm font-medium transition-colors flex items-center"
                   >
                       <LinkIcon className="w-3 h-3 mr-2" /> Link Fields
                   </button>
               </div>

               {/* Mappings List */}
               <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
                   <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gray-750">
                       <div className="flex items-center">
                           <GitMerge className="w-4 h-4 text-blue-400 mr-2" />
                           <span className="font-semibold text-gray-200 text-sm">Active Mappings ({mappings.length})</span>
                       </div>
                   </div>
                   <div className="overflow-y-auto flex-1 p-2 space-y-2">
                       {mappings.length === 0 && (
                           <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                               <LinkIcon className="w-8 h-8 mb-2" />
                               <p className="text-sm">No mappings yet</p>
                           </div>
                       )}
                       {mappings.map(m => {
                           const targetInfo = getTargetInfo(m.targetColumn);
                           return (
                               <div 
                                   key={m.id}
                                   onClick={() => setActiveMappingId(m.id)}
                                   className={`
                                       flex items-center p-3 rounded-lg border cursor-pointer transition-all group
                                       ${activeMappingId === m.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-gray-700/30 border-gray-700/50 hover:bg-gray-700/50'}
                                   `}
                               >
                                   <div className="flex-1 flex items-center gap-2 font-mono text-sm">
                                       <span className="text-gray-300" title={m.sourcePath}>{m.sourcePath}</span>
                                       <ArrowRight className="w-3 h-3 text-gray-500" />
                                       <span className="text-purple-300">{m.targetColumn}</span>
                                       {targetInfo?.kind === 'Tag' && (
                                           <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 rounded border border-blue-500/20 ml-1">TAG</span>
                                       )}
                                   </div>
                                   <div className="flex items-center gap-3">
                                       {m.transform !== 'None' && (
                                           <span className="text-xs bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                               {m.transform}
                                           </span>
                                       )}
                                       <button 
                                          onClick={(e) => handleDeleteMapping(m.id, e)}
                                          className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                                       >
                                           <Trash2 className="w-4 h-4" />
                                       </button>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>
          </div>

          {/* --- Target Panel --- */}
          <div className="w-1/4 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-gray-750 space-y-2">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <Table className="w-4 h-4 text-purple-400 mr-2" />
                          <span className="font-semibold text-gray-200 text-sm">Target Schema</span>
                      </div>
                  </div>
                  
                  {/* DB & Table Selector */}
                  <div className="flex gap-2">
                      <select 
                          value={targetDb}
                          onChange={(e) => handleDbChange(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 outline-none focus:border-purple-500"
                      >
                          {availableDbs.map(db => <option key={db} value={db}>{db}</option>)}
                      </select>
                      <select 
                          value={targetTable}
                          onChange={(e) => setTargetTable(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 outline-none focus:border-purple-500"
                      >
                          {availableTables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                      </select>
                  </div>

                  <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                      <input 
                          type="text" 
                          value={targetFilter}
                          onChange={(e) => setTargetFilter(e.target.value)}
                          placeholder="Filter columns..." 
                          className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1 text-xs text-gray-200 outline-none focus:border-purple-500"
                      />
                  </div>
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1">
                  {filteredTargetSchema.map((col) => {
                      const isMapped = isTargetMapped(col.name);
                      const isSelected = selectedTargetCol === col.name;
                      return (
                          <div 
                             key={col.name}
                             onClick={() => setSelectedTargetCol(col.name)}
                             className={`
                                flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-sm font-mono
                                ${isSelected ? 'bg-purple-600/20 border border-purple-500/50 text-white' : 'hover:bg-gray-700/50 border border-transparent'}
                                ${isMapped && !isSelected ? 'opacity-50 text-gray-500' : 'text-gray-300'}
                             `}
                          >
                             <div className="flex flex-col">
                                <span className="font-medium flex items-center">
                                    {col.name}
                                    {col.kind === 'Tag' && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" title="Tag"></span>}
                                </span>
                                <span className="text-[10px] text-gray-500">{col.type} • {col.kind}</span>
                             </div>
                             {isMapped && <Check className="w-3 h-3 text-green-500 shrink-0" />}
                          </div>
                      );
                  })}
                  {filteredTargetSchema.length === 0 && (
                      <div className="text-center text-gray-500 text-xs py-4">No columns found</div>
                  )}
              </div>
          </div>

           {/* --- Properties Panel (Floating or Static) --- */}
           {activeMapping ? (
               <div className="w-64 bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col shrink-0">
                   <h3 className="text-sm font-medium text-gray-200 mb-4 pb-2 border-b border-gray-700 flex justify-between items-center">
                       Properties
                       <button onClick={() => setActiveMappingId(null)}><X className="w-4 h-4 text-gray-500 hover:text-white"/></button>
                   </h3>
                   <div className="space-y-4 flex-1">
                       <div>
                           <label className="text-xs text-gray-500 block mb-1">Source Path</label>
                           <div className="text-sm text-gray-300 font-mono break-all bg-gray-900 p-2 rounded border border-gray-700">
                               {activeMapping.sourcePath}
                           </div>
                       </div>
                       <div>
                           <label className="text-xs text-gray-500 block mb-1">Target Column</label>
                           <div className="text-sm text-gray-300 font-mono bg-gray-900 p-2 rounded border border-gray-700">
                               {activeMapping.targetColumn}
                           </div>
                       </div>
                       <div>
                           <label className="text-xs text-gray-500 block mb-1">Transform Function</label>
                           <select 
                               value={activeMapping.transform}
                               onChange={(e) => handleTransformChange(e.target.value)}
                               className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 outline-none focus:border-blue-500"
                           >
                               <option value="None">None (Direct)</option>
                               <option value="To Int">Cast to Integer</option>
                               <option value="To Float">Cast to Float</option>
                               <option value="Multiply 100">Multiply by 100</option>
                               <option value="Divide 100">Divide by 100</option>
                               <option value="Custom JS">Custom Script...</option>
                           </select>
                       </div>
                       {activeMapping.transform === 'Custom JS' && (
                           <div>
                               <label className="text-xs text-gray-500 block mb-1">Script (return val)</label>
                               <textarea 
                                   className="w-full h-24 bg-gray-900 border border-gray-600 rounded p-2 text-xs font-mono text-green-400 outline-none resize-none"
                                   defaultValue="return parseFloat(val) * 1.8 + 32;"
                               />
                           </div>
                       )}
                   </div>
                   <div className="mt-4 pt-4 border-t border-gray-700">
                       <div className="flex items-start gap-2 p-2 bg-blue-900/20 rounded border border-blue-500/20">
                           <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                           <p className="text-[10px] text-blue-200 leading-tight">
                               Data type conversion will be applied automatically based on the target schema.
                           </p>
                       </div>
                   </div>
               </div>
           ) : (
                <div className="w-64 bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 flex flex-col items-center justify-center text-gray-500 text-xs text-center shrink-0">
                    <p>Select a mapping to edit properties</p>
                </div>
           )}
      </div>
    </div>
  );
};
