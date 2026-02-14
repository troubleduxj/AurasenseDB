import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitMerge, ArrowRight, FileJson, Table, Save, Link as LinkIcon, Trash2, X, AlertCircle, Check } from 'lucide-react';
import { MOCK_DATA_SOURCES } from '../constants';
import { MappingRule } from '../types';

const DEFAULT_SOURCE_JSON = {
  "device_id": "unknown",
  "data": { "value": 0 }
};

const TARGET_SCHEMA = [
  { name: 'ts', type: 'TIMESTAMP', kind: 'Metric' },
  { name: 'current', type: 'FLOAT', kind: 'Metric' },
  { name: 'voltage', type: 'INT', kind: 'Metric' },
  { name: 'phase', type: 'FLOAT', kind: 'Metric' },
  { name: 'location', type: 'BINARY(20)', kind: 'Tag' },
  { name: 'group_id', type: 'INT', kind: 'Tag' },
  { name: 'device_sn', type: 'BINARY(20)', kind: 'Tag' },
  { name: 'status_code', type: 'INT', kind: 'Metric' },
];

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

export const IngestionMapping: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId');

  // --- State ---
  const [sourceData, setSourceData] = useState<Record<string, any>>(DEFAULT_SOURCE_JSON);
  const [mappings, setMappings] = useState<MappingRule[]>([]);
  const [dataSourceName, setDataSourceName] = useState<string>('Unknown Source');
  
  const [selectedSourcePath, setSelectedSourcePath] = useState<string | null>(null);
  const [selectedTargetCol, setSelectedTargetCol] = useState<string | null>(null);
  const [activeMappingId, setActiveMappingId] = useState<string | null>(null);

  // Load data based on sourceId
  useEffect(() => {
    if (sourceId) {
        const source = MOCK_DATA_SOURCES.find(s => s.id === sourceId);
        if (source) {
            setDataSourceName(source.name);
            if (source.sampleData) {
                setSourceData(source.sampleData);
            }
            if (source.mappingRules) {
                setMappings(source.mappingRules);
            }
        }
    }
  }, [sourceId]);

  // Computed flat source keys
  const sourceKeys = useMemo(() => getFlattenedKeys(sourceData), [sourceData]);

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

  // Helper to check if source is mapped
  const isSourceMapped = (path: string) => mappings.some(m => m.sourcePath === path);
  const isTargetMapped = (col: string) => mappings.some(m => m.targetColumn === col);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex items-center justify-between shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Mapping Rules</h1>
           <p className="text-sm text-gray-400 mt-1">Configuring for: <span className="text-blue-400 font-medium">{dataSourceName}</span></p>
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
              <div className="p-3 border-b border-gray-700 flex items-center bg-gray-750">
                  <FileJson className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="font-semibold text-gray-200 text-sm">Source Data</span>
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1">
                  {sourceKeys.map((item) => {
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

          {/* --- Middle Panel (Mappings List & Actions) --- */}
          <div className="flex-1 flex flex-col gap-4">
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
                       {mappings.map(m => (
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
                       ))}
                   </div>
               </div>
          </div>

          {/* --- Target Panel --- */}
          <div className="w-1/4 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-700 flex items-center bg-gray-750">
                  <Table className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="font-semibold text-gray-200 text-sm">Target Schema</span>
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1">
                  {TARGET_SCHEMA.map((col) => {
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
                                <span className="font-medium">{col.name}</span>
                                <span className="text-[10px] text-gray-500">{col.type} • {col.kind}</span>
                             </div>
                             {isMapped && <Check className="w-3 h-3 text-green-500 shrink-0" />}
                          </div>
                      );
                  })}
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