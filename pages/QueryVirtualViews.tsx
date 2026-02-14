import React, { useState } from 'react';
import { Layers, Database, ArrowRight, GitMerge, Plus, X, Trash2, Eye, Play, Save } from 'lucide-react';

interface VirtualView {
  id: string;
  name: string;
  desc: string;
  sourceA: string;
  sourceB: string;
  sql: string;
  bucket: string;
  status: 'ACTIVE' | 'DRAFT';
}

const INITIAL_VIEWS: VirtualView[] = [
  {
    id: 'v1',
    name: 'view_power_efficiency',
    desc: 'Join: power_db ⇄ factory_db',
    sourceA: 'power_db.meters',
    sourceB: 'factory_db.sensors',
    sql: 'SELECT t1.avg_vol, t2.avg_temp \nFROM power_db.meters t1 \nJOIN factory_db.sensors t2 \nON bucket(t1.ts, 1m) = bucket(t2.ts, 1m)',
    bucket: '1m',
    status: 'ACTIVE'
  }
];

export const QueryVirtualViews: React.FC = () => {
  const [views, setViews] = useState<VirtualView[]>(INITIAL_VIEWS);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      name: '',
      sourceA: 'power_db.meters',
      sourceB: 'factory_db.sensors',
      bucket: '1m'
  });

  const handleCreate = () => {
      const newView: VirtualView = {
          id: `v_${Date.now()}`,
          name: formData.name || `view_${Math.floor(Math.random() * 1000)}`,
          desc: `Join: ${formData.sourceA.split('.')[0]} ⇄ ${formData.sourceB.split('.')[0]}`,
          sourceA: formData.sourceA,
          sourceB: formData.sourceB,
          bucket: formData.bucket,
          sql: `SELECT t1.*, t2.* \nFROM ${formData.sourceA} t1 \nJOIN ${formData.sourceB} t2 \nON bucket(t1.ts, ${formData.bucket}) = bucket(t2.ts, ${formData.bucket})`,
          status: 'ACTIVE'
      };
      setViews([...views, newView]);
      setShowModal(false);
      setFormData({ name: '', sourceA: 'power_db.meters', sourceB: 'factory_db.sensors', bucket: '1m' });
  };

  const handleDelete = (id: string) => {
      setViews(views.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6 relative h-full">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Virtual Views (Federated)</h1>
           <p className="text-sm text-gray-400 mt-1">Configure logic views to join data across different databases (e.g. Power DB + Environment DB).</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
        >
           <Layers className="w-4 h-4 mr-2" /> Create View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {views.map(view => (
            <div key={view.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 relative overflow-hidden group hover:border-gray-500 transition-colors">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                            <GitMerge className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">{view.name}</h3>
                            <p className="text-xs text-gray-400">{view.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20">ACTIVE</span>
                        <button 
                            onClick={() => handleDelete(view.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-opacity opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Visualization of the join */}
                <div className="flex items-center justify-between mb-6 text-sm">
                    <div className="flex-1 p-3 bg-gray-900 rounded border border-gray-700 flex flex-col items-center">
                        <Database className="w-4 h-4 text-blue-400 mb-2" />
                        <span className="font-mono text-gray-300 text-xs">{view.sourceA}</span>
                    </div>
                    <div className="px-2 text-gray-500 flex flex-col items-center">
                        <span className="text-[10px] mb-1">Bucket: {view.bucket}</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="p-2 bg-gray-700 rounded-full z-10 border-2 border-gray-600">
                        <span className="text-[10px] font-bold text-white">JOIN</span>
                    </div>
                    <div className="px-2 text-gray-500 flex flex-col items-center">
                        <span className="text-[10px] mb-1">Bucket: {view.bucket}</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="flex-1 p-3 bg-gray-900 rounded border border-gray-700 flex flex-col items-center">
                        <Database className="w-4 h-4 text-green-400 mb-2" />
                        <span className="font-mono text-gray-300 text-xs">{view.sourceB}</span>
                    </div>
                </div>
                
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700/50 mb-4 h-24 overflow-auto custom-scrollbar">
                    <code className="text-xs text-gray-400 font-mono block whitespace-pre-wrap">
                        {view.sql}
                    </code>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" /> Edit Logic
                    </button>
                    <button 
                        onClick={() => setShowPreview(true)}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center justify-center"
                    >
                        <Eye className="w-4 h-4 mr-2" /> Preview Data
                    </button>
                </div>
            </div>
          ))}

          {/* Add New Placeholder */}
          <button 
            onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-400 transition-all p-6 min-h-[300px]"
          >
              <Plus className="w-12 h-12 mb-2 opacity-50" />
              <span className="font-medium">Create New Virtual View</span>
          </button>
      </div>

      {/* Create Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center p-6 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-gray-100">Create Virtual View</h2>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">View Name</label>
                          <input 
                              type="text" 
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g. view_cross_db_analysis"
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Left Source</label>
                              <select 
                                  value={formData.sourceA}
                                  onChange={e => setFormData({...formData, sourceA: e.target.value})}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none"
                              >
                                  <option value="power_db.meters">power_db.meters</option>
                                  <option value="fleet_db.vehicles">fleet_db.vehicles</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Right Source</label>
                              <select 
                                  value={formData.sourceB}
                                  onChange={e => setFormData({...formData, sourceB: e.target.value})}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none"
                              >
                                  <option value="factory_db.sensors">factory_db.sensors</option>
                                  <option value="sys_db.logs">sys_db.logs</option>
                              </select>
                          </div>
                      </div>
                      <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Join Bucket (Time Window)</label>
                           <select 
                               value={formData.bucket}
                               onChange={e => setFormData({...formData, bucket: e.target.value})}
                               className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none"
                           >
                               <option value="1s">1 Second</option>
                               <option value="1m">1 Minute</option>
                               <option value="1h">1 Hour</option>
                               <option value="1d">1 Day</option>
                           </select>
                           <p className="text-xs text-gray-500 mt-1">Data will be aligned by timestamp buckets before joining.</p>
                      </div>
                      
                      <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded text-xs text-blue-300">
                          <strong className="block mb-1">Generated SQL Preview:</strong>
                          <code className="font-mono opacity-80 block">
                              SELECT t1.*, t2.* <br/>
                              FROM {formData.sourceA} t1 JOIN {formData.sourceB} t2 <br/>
                              ON bucket(t1.ts, {formData.bucket}) = bucket(t2.ts, {formData.bucket})
                          </code>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                      <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                      <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium shadow-lg shadow-blue-900/20">
                          Create View
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <h2 className="text-lg font-bold text-gray-100 flex items-center">
                          <Play className="w-4 h-4 mr-2 text-green-400" /> Data Preview (Limit 10)
                      </h2>
                      <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="flex-1 overflow-auto p-0">
                      <table className="w-full text-left border-collapse text-sm">
                          <thead>
                              <tr className="bg-gray-700 text-gray-300">
                                  <th className="p-3 border-b border-gray-600 sticky top-0 bg-gray-700">bucket_ts</th>
                                  <th className="p-3 border-b border-gray-600 sticky top-0 bg-gray-700">t1.avg_vol</th>
                                  <th className="p-3 border-b border-gray-600 sticky top-0 bg-gray-700">t1.max_curr</th>
                                  <th className="p-3 border-b border-gray-600 sticky top-0 bg-gray-700">t2.avg_temp</th>
                                  <th className="p-3 border-b border-gray-600 sticky top-0 bg-gray-700">t2.humidity</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700 text-gray-300 font-mono">
                              {[...Array(8)].map((_, i) => (
                                  <tr key={i} className="hover:bg-gray-700/50">
                                      <td className="p-3">2023-10-27 10:0{i}:00</td>
                                      <td className="p-3">{(220 + Math.random() * 5).toFixed(2)}</td>
                                      <td className="p-3">{(10 + Math.random() * 2).toFixed(2)}</td>
                                      <td className="p-3">{(45 + Math.random() * 10).toFixed(1)}</td>
                                      <td className="p-3">{(60 + Math.random() * 5).toFixed(1)}%</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};