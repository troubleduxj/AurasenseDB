import React, { useState } from 'react';
import { FileText, Plus, Copy, Edit, Trash2, Check, Clock, Globe, Shield, X, Save, ChevronRight, Search, Filter } from 'lucide-react';

interface InputSource {
  id: string;
  type: 'system_metrics' | 'opc_ua' | 'mqtt' | 'file_log';
  name: string;
  streamId: string; // The ID used for routing to pipelines
  config: Record<string, string>;
}

interface ConfigProfile {
  id: string;
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
  appliedAgents: number;
  status: 'Active' | 'Draft' | 'Archived';
  inputs: InputSource[]; // Replaces single pipelineId
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
}

const MOCK_PIPELINES: Pipeline[] = [
  { id: 'pl_001', name: 'Pre-process MQTT Meters 1', description: 'Applied to: Factory A Gateway' },
  { id: 'pl_002', name: 'Pre-process MQTT Meters 2', description: 'Applied to: Factory B Gateway' },
  { id: 'pl_003', name: 'Log Sanitization', description: 'Remove sensitive data from logs' },
];

const MOCK_CONFIGS: ConfigProfile[] = [
  { 
    id: 'cfg_001', 
    name: 'Default-Factory-Profile', 
    description: 'Standard collection rules for factory gateways', 
    version: 'v12', 
    lastUpdated: '2025-05-10 14:30', 
    appliedAgents: 145, 
    status: 'Active',
    inputs: [
      { id: 'in_1', type: 'mqtt', name: 'Factory MQTT', streamId: 'mqtt_stream_factory_a', config: { topic: 'factory/#' } }
    ]
  },
  { 
    id: 'cfg_002', 
    name: 'High-Frequency-Sampling', 
    description: '100ms sampling rate for critical machinery', 
    version: 'v4', 
    lastUpdated: '2025-05-08 09:15', 
    appliedAgents: 12, 
    status: 'Active',
    inputs: [
      { id: 'in_2', type: 'opc_ua', name: 'PLC Data', streamId: 'opc_plc_01', config: { endpoint: 'opc.tcp://192.168.1.10:4840' } }
    ]
  },
  { 
    id: 'cfg_003', 
    name: 'Debug-Logging-Profile', 
    description: 'Verbose logging enabled for troubleshooting', 
    version: 'v1', 
    lastUpdated: '2025-05-11 11:20', 
    appliedAgents: 3, 
    status: 'Draft',
    inputs: []
  },
  { 
    id: 'cfg_004', 
    name: 'Legacy-Protocol-Support', 
    description: 'Includes Modbus RTU and OPC DA adapters', 
    version: 'v8', 
    lastUpdated: '2025-04-20 16:45', 
    appliedAgents: 28, 
    status: 'Active',
    inputs: [
      { id: 'in_3', type: 'system_metrics', name: 'Server Health', streamId: 'sys_metrics_01', config: { interval: '10s' } }
    ]
  },
];

export const CollectorConfigs: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigProfile[]>(MOCK_CONFIGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigProfile | null>(null);
  const [viewingConfig, setViewingConfig] = useState<ConfigProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ConfigProfile>>({
    name: '',
    description: '',
    status: 'Draft',
    inputs: []
  });

  const handleOpenModal = (config?: ConfigProfile) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        description: config.description,
        status: config.status,
        inputs: config.inputs ? [...config.inputs] : []
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        description: '',
        status: 'Draft',
        inputs: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingConfig) {
      // Update existing
      setConfigs(prev => prev.map(c => c.id === editingConfig.id ? { ...c, ...formData, lastUpdated: new Date().toLocaleString() } as ConfigProfile : c));
    } else {
      // Create new
      const newConfig: ConfigProfile = {
        id: `cfg_${Date.now()}`,
        name: formData.name || 'New Configuration',
        description: formData.description || '',
        version: 'v1',
        lastUpdated: new Date().toLocaleString(),
        appliedAgents: 0,
        status: formData.status as 'Active' | 'Draft' | 'Archived',
        inputs: formData.inputs || []
      };
      setConfigs(prev => [...prev, newConfig]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      setConfigs(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleViewDetails = (config: ConfigProfile) => {
    setViewingConfig(config);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Collector Configurations</h1>
          <p className="text-sm text-gray-400 mt-1">Define and manage collection profiles, transformation rules, and sink targets.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" /> Create Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {configs.map(config => (
          <div key={config.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/30 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-700/50 rounded-lg text-blue-400 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium border ${
                config.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                config.status === 'Draft' ? 'bg-gray-700 text-gray-400 border-gray-600' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {config.status}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-100 mb-1">{config.name}</h3>
            <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{config.description}</p>

            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Version</span>
                <span className="text-gray-200 font-mono">{config.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-200">{config.lastUpdated}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Applied Agents</span>
                <span className="text-blue-400 font-medium">{config.appliedAgents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data Inputs</span>
                <span className="text-purple-400 font-medium">{config.inputs?.length || 0} Sources</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenModal(config)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" 
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(config.id)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400 transition-colors" 
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => handleViewDetails(config)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center"
              >
                View Details <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        ))}

        {/* New Config Placeholder */}
        <div 
          onClick={() => handleOpenModal()}
          className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer min-h-[300px]"
        >
          <div className="p-4 bg-gray-800 rounded-full mb-3">
            <Plus className="w-8 h-8" />
          </div>
          <p className="font-medium">Create New Profile</p>
          <p className="text-xs text-gray-600 mt-1 text-center max-w-[200px]">Start from scratch or import from existing template</p>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-100">
                {editingConfig ? 'Edit Configuration' : 'Create Configuration'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Configuration Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                  placeholder="e.g., Factory-Gateway-Profile"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 min-h-[80px]"
                  placeholder="Describe the purpose of this configuration..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-700">
                 <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-gray-200">Data Inputs & Routing</label>
                    <button 
                      onClick={() => {
                        const newInput: InputSource = {
                          id: `in_${Date.now()}`,
                          type: 'system_metrics',
                          name: 'New Input',
                          streamId: `stream_${Date.now()}`,
                          config: {}
                        };
                        setFormData({ ...formData, inputs: [...(formData.inputs || []), newInput] });
                      }}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Input
                    </button>
                 </div>
                 <p className="text-xs text-gray-500 mb-3">Define multiple data collection sources. Each source generates a stream ID that can be routed to specific pipelines.</p>
                 
                 <div className="space-y-3">
                    {formData.inputs?.map((input, index) => (
                      <div key={input.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <span className="bg-gray-800 text-gray-400 text-xs px-1.5 py-0.5 rounded border border-gray-700">#{index + 1}</span>
                             <input 
                               type="text" 
                               value={input.name}
                               onChange={(e) => {
                                 const newInputs = [...(formData.inputs || [])];
                                 newInputs[index].name = e.target.value;
                                 setFormData({ ...formData, inputs: newInputs });
                               }}
                               className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 text-sm font-medium text-gray-200 outline-none w-32"
                             />
                          </div>
                          <button 
                            onClick={() => {
                              const newInputs = formData.inputs?.filter((_, i) => i !== index);
                              setFormData({ ...formData, inputs: newInputs });
                            }}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1">Input Type</label>
                            <select 
                              value={input.type}
                              onChange={(e) => {
                                const newInputs = [...(formData.inputs || [])];
                                newInputs[index].type = e.target.value as any;
                                setFormData({ ...formData, inputs: newInputs });
                              }}
                              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-200 outline-none"
                            >
                              <option value="system_metrics">System Metrics</option>
                              <option value="opc_ua">OPC UA</option>
                              <option value="mqtt">MQTT</option>
                              <option value="file_log">File Log</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 uppercase mb-1">Target Stream ID</label>
                            <div className="flex items-center bg-gray-800 border border-gray-600 rounded px-2 py-1.5">
                              <span className="text-xs text-gray-200 font-mono truncate">{input.streamId}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dynamic Config based on Type */}
                        <div className="bg-gray-950/50 rounded p-2 border border-gray-800">
                          {input.type === 'opc_ua' && (
                             <div>
                               <label className="block text-[10px] text-gray-500 mb-1">Endpoint URL</label>
                               <input 
                                 type="text" 
                                 value={input.config.endpoint || ''}
                                 onChange={(e) => {
                                   const newInputs = [...(formData.inputs || [])];
                                   newInputs[index].config = { ...newInputs[index].config, endpoint: e.target.value };
                                   setFormData({ ...formData, inputs: newInputs });
                                 }}
                                 placeholder="opc.tcp://localhost:4840"
                                 className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 outline-none"
                               />
                             </div>
                          )}
                          {input.type === 'mqtt' && (
                             <div>
                               <label className="block text-[10px] text-gray-500 mb-1">Topic Subscription</label>
                               <input 
                                 type="text" 
                                 value={input.config.topic || ''}
                                 onChange={(e) => {
                                   const newInputs = [...(formData.inputs || [])];
                                   newInputs[index].config = { ...newInputs[index].config, topic: e.target.value };
                                   setFormData({ ...formData, inputs: newInputs });
                                 }}
                                 placeholder="factory/line1/#"
                                 className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 outline-none"
                               />
                             </div>
                          )}
                          {input.type === 'system_metrics' && (
                             <div>
                               <label className="block text-[10px] text-gray-500 mb-1">Collection Interval</label>
                               <input 
                                 type="text" 
                                 value={input.config.interval || ''}
                                 onChange={(e) => {
                                   const newInputs = [...(formData.inputs || [])];
                                   newInputs[index].config = { ...newInputs[index].config, interval: e.target.value };
                                   setFormData({ ...formData, inputs: newInputs });
                                 }}
                                 placeholder="10s"
                                 className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 outline-none"
                               />
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.inputs || formData.inputs.length === 0) && (
                      <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 text-xs">
                        No inputs defined. Click "Add Input" to configure data collection.
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                      <div>
                          <h2 className="text-xl font-bold text-gray-100">{viewingConfig.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono text-gray-500">{viewingConfig.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                viewingConfig.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                viewingConfig.status === 'Draft' ? 'bg-gray-700 text-gray-400 border-gray-600' :
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>
                                {viewingConfig.status}
                              </span>
                          </div>
                      </div>
                      <button onClick={() => setViewingConfig(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Metadata</h3>
                              <div className="space-y-3 bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
                                  <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Version</span>
                                      <span className="text-sm text-gray-200 font-mono">{viewingConfig.version}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Last Updated</span>
                                      <span className="text-sm text-gray-200">{viewingConfig.lastUpdated}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">Applied Agents</span>
                                      <span className="text-sm text-blue-400 font-bold">{viewingConfig.appliedAgents}</span>
                                  </div>
                              </div>
                          </div>
                          <div>
                              <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Description</h3>
                              <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50 h-full">
                                  <p className="text-sm text-gray-400 leading-relaxed">{viewingConfig.description || 'No description provided.'}</p>
                              </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                              <Filter className="w-4 h-4" /> Data Inputs & Routing
                          </h3>
                          <div className="space-y-3">
                            {viewingConfig.inputs?.map((input, idx) => (
                              <div key={input.id} className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      input.type === 'system_metrics' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' :
                                      input.type === 'opc_ua' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                                      'bg-green-900/30 text-green-400 border border-green-500/30'
                                    }`}>
                                      {input.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm font-medium text-gray-200">{input.name}</span>
                                  </div>
                                  <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded">ID: {input.id}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                  <span>Routes to Stream:</span>
                                  <span className="text-blue-400 font-mono bg-blue-900/10 px-1.5 py-0.5 rounded border border-blue-500/20">{input.streamId}</span>
                                </div>

                                {/* Show linked pipeline if stream matches */}
                                {(() => {
                                  const linkedPipeline = MOCK_PIPELINES.find(p => p.description.includes(input.streamId) || p.name.toLowerCase().includes(input.type.split('_')[0]));
                                  return linkedPipeline ? (
                                    <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2">
                                      <Globe className="w-3 h-3 text-gray-500" />
                                      <span className="text-xs text-gray-500">Processed by:</span>
                                      <span className="text-xs text-blue-300 underline cursor-pointer">{linkedPipeline.name}</span>
                                    </div>
                                  ) : (
                                    <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2">
                                      <Globe className="w-3 h-3 text-gray-600" />
                                      <span className="text-xs text-gray-600 italic">No matching pipeline found for stream {input.streamId}</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            ))}
                            {(!viewingConfig.inputs || viewingConfig.inputs.length === 0) && (
                              <div className="text-center py-4 text-gray-500 text-sm italic">No inputs configured.</div>
                            )}
                          </div>
                      </div>
                      
                      <div>
                          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                              <Shield className="w-4 h-4" /> Associated Agents
                          </h3>
                          <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4">
                              {viewingConfig.appliedAgents > 0 ? (
                                  <div className="space-y-2">
                                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700 hover:border-blue-500/30 transition-colors">
                                          <div className="flex items-center gap-3">
                                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                              <span className="text-sm text-gray-200">Factory-Gateway-01</span>
                                          </div>
                                          <span className="text-xs text-gray-500 font-mono">192.168.1.101</span>
                                      </div>
                                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700 hover:border-blue-500/30 transition-colors">
                                          <div className="flex items-center gap-3">
                                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                              <span className="text-sm text-gray-200">Factory-Gateway-02</span>
                                          </div>
                                          <span className="text-xs text-gray-500 font-mono">192.168.1.102</span>
                                      </div>
                                      {viewingConfig.appliedAgents > 2 && (
                                          <div className="text-center pt-2 text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                                              + {viewingConfig.appliedAgents - 2} more agents...
                                          </div>
                                      )}
                                  </div>
                              ) : (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                      No agents currently using this configuration.
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      <div>
                          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Raw Configuration Preview</h3>
                          <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700 font-mono text-xs text-gray-300 overflow-x-auto">
                              <pre>{JSON.stringify({
                                  profile_id: viewingConfig.id,
                                  version: viewingConfig.version,
                                  inputs: viewingConfig.inputs?.map(i => ({
                                    type: i.type,
                                    stream_id: i.streamId,
                                    config: i.config
                                  })),
                                  settings: {
                                      batch_size: 1000,
                                      flush_interval_ms: 500,
                                      compression: 'gzip'
                                  }
                              }, null, 2)}</pre>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-5 border-t border-gray-700 bg-gray-750 flex justify-end rounded-b-xl">
                      <button 
                          onClick={() => setViewingConfig(null)} 
                          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
