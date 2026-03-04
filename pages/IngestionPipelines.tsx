import React, { useState } from 'react';
import { Filter, ArrowRight, Trash2, PlusCircle, PlayCircle, X, Save, ArrowLeft, Edit } from 'lucide-react';

interface PipelineStep {
  id: string;
  type: 'filter' | 'enrich' | 'mask' | 'transform';
  name: string;
  config?: Record<string, string>;
}

interface Pipeline {
  id: string;
  name: string;
  source: string;
  status: 'Running' | 'Stopped';
  hitsPerSec: number;
  steps: PipelineStep[];
}

const MOCK_PIPELINES: Pipeline[] = [
  {
    id: '1',
    name: 'Pre-process MQTT Meters 1',
    source: 'Factory A Gateway',
    status: 'Running',
    hitsPerSec: 1250,
    steps: [
      { id: 's1', type: 'filter', name: 'Filter Nulls' },
      { id: 's2', type: 'enrich', name: 'Enrich Location' },
      { id: 's3', type: 'mask', name: 'Mask Sensitive' }
    ]
  },
  {
    id: '2',
    name: 'Log Sanitization Pipeline',
    source: 'Web Servers',
    status: 'Running',
    hitsPerSec: 850,
    steps: [
      { id: 's4', type: 'filter', name: 'Remove Debug Logs' },
      { id: 's5', type: 'mask', name: 'Mask IP Addresses' }
    ]
  }
];

export const IngestionPipelines: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>(MOCK_PIPELINES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineSource, setNewPipelineSource] = useState('');

  // Editor View State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const handleCreatePipeline = () => {
    if (!newPipelineName.trim() || !newPipelineSource.trim()) return;

    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      name: newPipelineName,
      source: newPipelineSource,
      status: 'Stopped',
      hitsPerSec: 0,
      steps: []
    };

    setPipelines([...pipelines, newPipeline]);
    setIsModalOpen(false);
    setNewPipelineName('');
    setNewPipelineSource('');
    
    // Open editor for the new pipeline
    setEditingPipelineId(newPipeline.id);
    setIsEditorOpen(true);
  };

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPipelines(pipelines.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Running' ? 'Stopped' : 'Running' };
      }
      return p;
    }));
  };

  const handleDeletePipeline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this pipeline?')) {
      setPipelines(pipelines.filter(p => p.id !== id));
      if (editingPipelineId === id) {
        setIsEditorOpen(false);
        setEditingPipelineId(null);
      }
    }
  };

  const handleAddStep = (type: PipelineStep['type']) => {
    if (!editingPipelineId) return;
    const newStepId = `s_${Date.now()}`;
    setPipelines(pipelines.map(p => {
      if (p.id === editingPipelineId) {
        const newStep: PipelineStep = {
          id: newStepId,
          type,
          name: type === 'filter' ? 'New Filter' : type === 'enrich' ? 'New Enrichment' : type === 'mask' ? 'New Mask' : 'New Transform',
          config: {}
        };
        return { ...p, steps: [...p.steps, newStep] };
      }
      return p;
    }));
    setSelectedStepId(newStepId);
  };

  const handleRemoveStep = (stepId: string) => {
    if (!editingPipelineId) return;
    setPipelines(pipelines.map(p => {
      if (p.id === editingPipelineId) {
        return { ...p, steps: p.steps.filter(s => s.id !== stepId) };
      }
      return p;
    }));
  };

  const handleUpdateStepConfig = (stepId: string, key: string, value: string) => {
    if (!editingPipelineId) return;
    setPipelines(pipelines.map(p => {
      if (p.id === editingPipelineId) {
        return {
          ...p,
          steps: p.steps.map(s => {
            if (s.id === stepId) {
              return { ...s, config: { ...s.config, [key]: value } };
            }
            return s;
          })
        };
      }
      return p;
    }));
  };

  const handleEditPipeline = (id: string) => {
    setEditingPipelineId(id);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingPipelineId(null);
  };

  const editingPipeline = pipelines.find(p => p.id === editingPipelineId);

  // Render Editor View
  if (isEditorOpen && editingPipeline) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCloseEditor}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                Edit Pipeline: <span className="text-blue-400">{editingPipeline.name}</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">Source: <span className="font-mono text-gray-300">{editingPipeline.source}</span></p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleCloseEditor}
               className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-300 transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={handleCloseEditor}
               className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
             >
               <Save className="w-4 h-4" /> Save Configuration
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Steps Palette */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 h-fit">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Available Processors</h4>
            <div className="space-y-3">
              <button onClick={() => handleAddStep('filter')} className="w-full flex items-center gap-3 p-3 bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left group">
                <div className="p-2 bg-yellow-900/30 text-yellow-500 rounded group-hover:bg-yellow-900/50"><Filter className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-medium text-gray-200">Filter</div>
                  <div className="text-xs text-gray-500">Remove unwanted data</div>
                </div>
                <PlusCircle className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => handleAddStep('enrich')} className="w-full flex items-center gap-3 p-3 bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left group">
                <div className="p-2 bg-blue-900/30 text-blue-400 rounded group-hover:bg-blue-900/50"><PlusCircle className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-medium text-gray-200">Enrich</div>
                  <div className="text-xs text-gray-500">Add context data</div>
                </div>
                <PlusCircle className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => handleAddStep('mask')} className="w-full flex items-center gap-3 p-3 bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left group">
                <div className="p-2 bg-purple-900/30 text-purple-400 rounded group-hover:bg-purple-900/50"><X className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-medium text-gray-200">Mask</div>
                  <div className="text-xs text-gray-500">Hide sensitive info</div>
                </div>
                <PlusCircle className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Pipeline Flow Visualization */}
          <div className="col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-8 min-h-[500px] flex gap-6">
            <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-xl space-y-6">
              {/* Source Node */}
              <div className="flex justify-center">
                <div className="px-6 py-3 bg-gray-900 border border-gray-600 rounded-full text-sm text-gray-300 font-mono shadow-lg">
                  Source: {editingPipeline.source}
                </div>
              </div>
              
              <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-gray-600 rotate-90" /></div>

              {/* Steps */}
              {editingPipeline.steps.length === 0 ? (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center bg-gray-900/30">
                  <p className="text-gray-400 font-medium">Pipeline is empty</p>
                  <p className="text-sm text-gray-500 mt-2">Add processing steps from the left panel to define your data flow.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {editingPipeline.steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <div 
                        onClick={() => setSelectedStepId(step.id)}
                        className={`bg-gray-900 border rounded-xl p-4 flex items-center justify-between group cursor-pointer transition-all shadow-md hover:shadow-lg ${
                          selectedStepId === step.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-gray-700 hover:border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            step.type === 'filter' ? 'bg-yellow-900/20 text-yellow-500' :
                            step.type === 'enrich' ? 'bg-blue-900/20 text-blue-400' :
                            'bg-purple-900/20 text-purple-400'
                          }`}>
                            {step.type === 'filter' ? <Filter className="w-5 h-5" /> : 
                             step.type === 'enrich' ? <PlusCircle className="w-5 h-5" /> : 
                             <X className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-200">{step.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {step.id}</div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveStep(step.id); if(selectedStepId === step.id) setSelectedStepId(null); }}
                          className="p-2 text-gray-600 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Remove Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {idx < editingPipeline.steps.length - 1 && (
                        <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-gray-600 rotate-90" /></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {editingPipeline.steps.length > 0 && (
                <>
                  <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-gray-600 rotate-90" /></div>
                  {/* Sink Node */}
                  <div className="flex justify-center">
                    <div className="px-6 py-3 bg-green-900/20 border border-green-700/50 rounded-full text-sm text-green-400 font-mono shadow-lg">
                      Sink: TDengine Database
                    </div>
                  </div>
                </>
              )}
            </div>
            </div>

            {/* Step Configuration Panel */}
            {selectedStepId && (
              <div className="w-80 bg-gray-900/80 border-l border-gray-700 p-6 -my-8 -mr-8 animate-in slide-in-from-right duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-gray-100 uppercase">Step Configuration</h3>
                  <button onClick={() => setSelectedStepId(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4"/></button>
                </div>
                
                {(() => {
                  const step = editingPipeline.steps.find(s => s.id === selectedStepId);
                  if (!step) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Step Name</label>
                        <input 
                          type="text" 
                          value={step.name}
                          readOnly
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none"
                        />
                      </div>

                      {step.type === 'filter' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Filter Condition (SQL)</label>
                          <textarea 
                            value={step.config?.condition || ''}
                            onChange={(e) => handleUpdateStepConfig(step.id, 'condition', e.target.value)}
                            placeholder="e.g., temperature > 100 AND status = 'error'"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[100px] font-mono"
                          />
                        </div>
                      )}

                      {step.type === 'enrich' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Lookup Source</label>
                            <select 
                              value={step.config?.source || ''}
                              onChange={(e) => handleUpdateStepConfig(step.id, 'source', e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select source...</option>
                              <option value="device_metadata">Device Metadata Table</option>
                              <option value="geo_ip">GeoIP Database</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Field</label>
                            <input 
                              type="text" 
                              value={step.config?.targetField || ''}
                              onChange={(e) => handleUpdateStepConfig(step.id, 'targetField', e.target.value)}
                              placeholder="e.g., location_info"
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </>
                      )}

                      {step.type === 'mask' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Field to Mask</label>
                            <input 
                              type="text" 
                              value={step.config?.field || ''}
                              onChange={(e) => handleUpdateStepConfig(step.id, 'field', e.target.value)}
                              placeholder="e.g., user_email"
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Masking Method</label>
                            <select 
                              value={step.config?.method || 'redact'}
                              onChange={(e) => handleUpdateStepConfig(step.id, 'method', e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                              <option value="redact">Full Redaction (***)</option>
                              <option value="partial">Partial Mask (138****0000)</option>
                              <option value="hash">Hash (SHA-256)</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render List View
  return (
    <div className="space-y-6 relative">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Processing Pipelines</h1>
           <p className="text-sm text-gray-400 mt-1">Define ETL rules to clean, transform, and enrich data before storage.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
        >
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
          
          {pipelines.map(pipeline => (
            <div 
              key={pipeline.id} 
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-700/20 transition-colors border-b border-gray-700/50 last:border-0"
            >
               <div className="col-span-3">
                   <h3 className="font-medium text-gray-200">{pipeline.name}</h3>
                   <p className="text-xs text-gray-500 mt-1">Applied to: {pipeline.source}</p>
               </div>
               <div className="col-span-4 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                   {pipeline.steps.length > 0 ? (
                     pipeline.steps.map((step, index) => (
                       <React.Fragment key={step.id}>
                         <div className={`px-2 py-1 rounded text-xs flex items-center whitespace-nowrap border ${
                           step.type === 'filter' ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-500' :
                           step.type === 'enrich' ? 'bg-blue-900/30 border-blue-700/50 text-blue-400' :
                           step.type === 'mask' ? 'bg-purple-900/30 border-purple-700/50 text-purple-400' :
                           'bg-gray-700 border-gray-600 text-gray-300'
                         }`}>
                            {step.type === 'filter' && <Filter className="w-3 h-3 mr-1" />}
                            {step.name}
                         </div>
                         {index < pipeline.steps.length - 1 && <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />}
                       </React.Fragment>
                     ))
                   ) : (
                     <span className="text-xs text-gray-600 italic">No steps defined</span>
                   )}
               </div>
               <div className="col-span-2 text-center">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                     pipeline.status === 'Running' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'
                   }`}>
                      {pipeline.status}
                   </span>
               </div>
               <div className="col-span-2 text-center font-mono text-sm text-gray-300">
                   {pipeline.status === 'Running' ? (Math.random() * 2000).toFixed(0) : '-'}
               </div>
               <div className="col-span-1 flex justify-end space-x-2">
                   <button 
                     onClick={() => handleEditPipeline(pipeline.id)}
                     className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700"
                     title="Edit Pipeline"
                   >
                     <Edit className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={(e) => handleDeletePipeline(pipeline.id, e)}
                     className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-700"
                     title="Delete Pipeline"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={(e) => handleToggleStatus(pipeline.id, e)}
                     className={`p-1 rounded hover:bg-gray-700 ${pipeline.status === 'Running' ? 'text-green-400' : 'text-gray-500 hover:text-blue-400'}`}
                     title={pipeline.status === 'Running' ? 'Stop Pipeline' : 'Start Pipeline'}
                   >
                     <PlayCircle className="w-4 h-4" />
                   </button>
               </div>
            </div>
          ))}
          
          {pipelines.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No pipelines created yet. Click "New Pipeline" to get started.
            </div>
          )}
      </div>
      
      {/* Create Pipeline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Create New Pipeline</h2>
                <p className="text-xs text-gray-400 mt-0.5">Define a new data processing flow</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Pipeline Name</label>
                <input 
                  type="text" 
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  placeholder="e.g., IoT Sensor Data Processing"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Data Source</label>
                <select 
                  value={newPipelineSource}
                  onChange={(e) => setNewPipelineSource(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Select a data source</option>
                  <option value="mqtt_stream_factory_a">mqtt_stream_factory_a</option>
                  <option value="http_logs_webserver">http_logs_webserver</option>
                  <option value="agent_metrics_prod">agent_metrics_prod</option>
                  <option value="kafka_orders_topic">kafka_orders_topic</option>
                  <option value="syslog_firewall_main">syslog_firewall_main</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePipeline}
                  disabled={!newPipelineName.trim() || !newPipelineSource.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Create Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rule Configuration Interface - Removed in favor of separate editor view */}
    </div>
  );
};
