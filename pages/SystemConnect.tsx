import React, { useState } from 'react';
import { Database, Server, Link2, CheckCircle, XCircle, RefreshCw, Bot, Cpu, Settings2, Trash2, Plus, Sparkles, AlertTriangle, Activity, FileText, Shield, X, Save } from 'lucide-react';

// --- Types ---
interface ConnectionDetail {
    restPort?: number; // 6041 for taosAdapter
    version?: '2.x' | '3.x';
    logAgentUrl?: string; // e.g., http://agent:9090/logs
    prometheusUrl?: string; // e.g., http://prometheus:9090
    token?: string; // Security token
    maxPoolSize?: number;
    timeout?: number;
}

interface ConnectionConfig {
  id: string;
  name: string;
  type: 'TDengine' | 'Redis' | 'Kafka' | 'ClickHouse';
  host: string;
  port: number;
  username?: string;
  password?: string; 
  status: 'Connected' | 'Disconnected' | 'Testing';
  details?: ConnectionDetail; // Extended config
}

interface AIProviderConfig {
    id: string;
    provider: 'Google Gemini' | 'OpenAI' | 'Anthropic' | 'Local (Ollama/vLLM)';
    name: string;
    apiKey?: string;
    baseUrl?: string;
    model: string;
    isDefault: boolean;
    status: 'Connected' | 'Error' | 'Untested';
}

// --- Mock Data ---
const INITIAL_CONNECTIONS: ConnectionConfig[] = [
  { 
      id: 'c1', 
      name: 'Primary Cluster', 
      type: 'TDengine', 
      host: 'td-core-01.internal', 
      port: 6030, 
      username: 'root', 
      status: 'Connected',
      details: {
          version: '3.x',
          restPort: 6041,
          logAgentUrl: 'http://td-core-01.internal:9200/logs/_search',
          prometheusUrl: 'http://monitor.internal:9090',
          maxPoolSize: 100,
          timeout: 5000
      }
  },
  { id: 'c2', name: 'Metadata Cache', type: 'Redis', host: 'redis-cache.internal', port: 6379, status: 'Connected' },
  { id: 'c3', name: 'Message Queue', type: 'Kafka', host: 'kafka-broker-01:9092', port: 9092, status: 'Disconnected' },
];

const INITIAL_AI_PROVIDERS: AIProviderConfig[] = [
    { id: 'ai_1', provider: 'Google Gemini', name: 'Gemini Production', model: 'gemini-1.5-pro', isDefault: true, status: 'Connected' },
    { id: 'ai_2', provider: 'OpenAI', name: 'GPT-4 Fallback', model: 'gpt-4-turbo', isDefault: false, status: 'Untested' },
    { id: 'ai_3', provider: 'Local (Ollama/vLLM)', name: 'Local Reasoning', baseUrl: 'http://localhost:11434', model: 'deepseek-r1:8b', isDefault: false, status: 'Connected' }
];

export const SystemConnect: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'infra' | 'ai'>('infra');
  
  // Infra State
  const [connections, setConnections] = useState<ConnectionConfig[]>(INITIAL_CONNECTIONS);
  
  // Edit Modal State
  const [editingConn, setEditingConn] = useState<ConnectionConfig | null>(null);
  const [editTab, setEditTab] = useState<'basic' | 'monitor' | 'advanced'>('basic');

  // AI State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiProviders, setAiProviders] = useState<AIProviderConfig[]>(INITIAL_AI_PROVIDERS);

  // --- Infra Handlers ---
  const handleTestInfra = (id: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'Testing' } : c));
    setTimeout(() => {
        setConnections(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, status: c.type === 'Kafka' ? 'Disconnected' : 'Connected' };
            }
            return c;
        }));
    }, 1500);
  };

  const handleSaveConnection = () => {
      if (editingConn) {
          setConnections(prev => prev.map(c => c.id === editingConn.id ? editingConn : c));
          setEditingConn(null);
      }
  };

  const handleEditChange = (field: keyof ConnectionConfig, value: any) => {
      if (editingConn) setEditingConn({ ...editingConn, [field]: value });
  };

  const handleDetailChange = (field: keyof ConnectionDetail, value: any) => {
      if (editingConn) {
          setEditingConn({
              ...editingConn,
              details: { ...editingConn.details, [field]: value }
          });
      }
  };

  // --- AI Handlers ---
  const handleTestAI = (id: string) => {
      setAiProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'Untested' } : p)); // Reset visually for demo
      // Mock test
      setTimeout(() => {
          setAiProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'Connected' } : p));
      }, 1200);
  };

  const handleSetDefaultAI = (id: string) => {
      setAiProviders(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
  };

  const handleDeleteAI = (id: string) => {
      setAiProviders(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Connect Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage infrastructure and AI model connections.</p>
        </div>
        
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => setActiveTab('infra')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'infra' 
                    ? 'bg-gray-700 text-gray-100 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
            >
                Infrastructure
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'ai' 
                    ? 'bg-purple-600/20 text-purple-300 shadow-sm border border-purple-500/30' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
            >
                <Sparkles className="w-3.5 h-3.5" /> AI Config
            </button>
        </div>
      </div>

      {activeTab === 'infra' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {connections.map(conn => (
              <div key={conn.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                        conn.type === 'TDengine' ? 'bg-blue-500/20 text-blue-400' :
                        conn.type === 'Redis' ? 'bg-red-500/20 text-red-400' :
                        'bg-purple-500/20 text-purple-400'
                    }`}>
                      {conn.type === 'TDengine' ? <Database className="w-6 h-6" /> :
                       conn.type === 'Redis' ? <Server className="w-6 h-6" /> :
                       <Link2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-100">{conn.name}</h3>
                      <p className="text-xs text-gray-500">{conn.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                      {conn.status === 'Testing' ? (
                          <span className="text-xs flex items-center text-yellow-500 animate-pulse">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Testing
                          </span>
                      ) : conn.status === 'Connected' ? (
                          <span className="text-xs flex items-center text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                              <CheckCircle className="w-3 h-3 mr-1" /> Online
                          </span>
                      ) : (
                          <span className="text-xs flex items-center text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              <XCircle className="w-3 h-3 mr-1" /> Offline
                          </span>
                      )}
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Host</span>
                                <span className="text-sm text-gray-200 font-mono truncate block" title={conn.host}>{conn.host}</span>
                            </div>
                            <div className="col-span-1">
                                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Port</span>
                                <span className="text-sm text-gray-200 font-mono block">{conn.port}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">User</span>
                            <span className="text-sm text-gray-200 font-mono block">{conn.username || '-'}</span>
                        </div>
                    </div>
                    
                    {/* Compact Info Row */}
                    {conn.type === 'TDengine' && conn.details && (
                        <div className="flex gap-2 flex-wrap">
                            {conn.details.version && (
                                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600/50">
                                    v{conn.details.version}
                                </span>
                            )}
                            {conn.details.restPort && (
                                <span className="text-[10px] bg-blue-900/20 text-blue-300 px-2 py-1 rounded border border-blue-500/20">
                                    REST: {conn.details.restPort}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-2">
                    <button 
                        onClick={() => { setEditingConn(conn); setEditTab('basic'); }}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm font-medium transition-colors flex items-center border border-gray-600"
                    >
                        <Settings2 className="w-4 h-4 mr-1.5" /> Configure
                    </button>
                    <button 
                        onClick={() => handleTestInfra(conn.id)}
                        disabled={conn.status === 'Testing'}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center"
                    >
                        {conn.status === 'Testing' ? 'Ping...' : 'Test'}
                    </button>
                </div>
              </div>
            ))}
            
            {/* Add New Placeholder */}
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer min-h-[300px]">
                <div className="p-4 bg-gray-800 rounded-full mb-3">
                    <Link2 className="w-8 h-8" />
                </div>
                <p className="font-medium">Add Service Connection</p>
            </div>
          </div>
      )}

      {/* Edit Connection Modal */}
      {editingConn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                              editingConn.type === 'TDengine' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'
                          }`}>
                              {editingConn.type === 'TDengine' ? <Database className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                          </div>
                          <div>
                              <h2 className="text-lg font-bold text-gray-100">Configure {editingConn.name}</h2>
                              <p className="text-xs text-gray-400">{editingConn.type} Connection Parameters</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingConn(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-700 px-5 gap-4">
                      <button 
                          onClick={() => setEditTab('basic')}
                          className={`py-3 text-sm font-medium border-b-2 transition-colors ${editTab === 'basic' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                      >
                          General
                      </button>
                      {editingConn.type === 'TDengine' && (
                          <>
                              <button 
                                  onClick={() => setEditTab('monitor')}
                                  className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${editTab === 'monitor' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                              >
                                  <Activity className="w-3.5 h-3.5 mr-2" /> Monitoring & Logs
                              </button>
                              <button 
                                  onClick={() => setEditTab('advanced')}
                                  className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${editTab === 'advanced' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                              >
                                  <Shield className="w-3.5 h-3.5 mr-2" /> Advanced
                              </button>
                          </>
                      )}
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                      {editTab === 'basic' && (
                          <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Host / IP</label>
                                      <input 
                                          type="text" 
                                          value={editingConn.host}
                                          onChange={(e) => handleEditChange('host', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">RPC Port</label>
                                      <input 
                                          type="number" 
                                          value={editingConn.port}
                                          onChange={(e) => handleEditChange('port', Number(e.target.value))}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                                      />
                                      <p className="text-[10px] text-gray-500 mt-1">Default: 6030</p>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                                      <input 
                                          type="text" 
                                          value={editingConn.username || ''}
                                          onChange={(e) => handleEditChange('username', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                                      <input 
                                          type="password" 
                                          value={editingConn.password || ''} // In real app, don't show real password
                                          onChange={(e) => handleEditChange('password', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                                          placeholder="••••••••"
                                      />
                                  </div>
                              </div>
                              {editingConn.type === 'TDengine' && (
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Cluster Version</label>
                                      <select 
                                          value={editingConn.details?.version || '3.x'}
                                          onChange={(e) => handleDetailChange('version', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none"
                                      >
                                          <option value="3.x">TDengine 3.x (Recommended)</option>
                                          <option value="2.x">TDengine 2.x (Legacy)</option>
                                      </select>
                                  </div>
                              )}
                          </div>
                      )}

                      {editTab === 'monitor' && (
                          <div className="space-y-5">
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
                                  <Activity className="w-5 h-5 text-blue-400 shrink-0" />
                                  <div className="text-xs text-blue-200/80">
                                      <p className="font-bold text-blue-300 mb-1">Why configure monitoring?</p>
                                      <p>Enables the "Operations" module to display real-time cluster health, node status, and query slow logs via REST API or Agent.</p>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">REST API Port (taosAdapter)</label>
                                      <input 
                                          type="number" 
                                          value={editingConn.details?.restPort || 6041}
                                          onChange={(e) => handleDetailChange('restPort', Number(e.target.value))}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                                      />
                                      <p className="text-[10px] text-gray-500 mt-1">Used for lightweight status checks.</p>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Prometheus Exporter URL</label>
                                      <input 
                                          type="text" 
                                          value={editingConn.details?.prometheusUrl || ''}
                                          onChange={(e) => handleDetailChange('prometheusUrl', e.target.value)}
                                          placeholder="http://host:9090"
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                                      />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-medium text-gray-400 mb-1">Log Agent Endpoint (Elastic/Vector)</label>
                                  <div className="flex gap-2">
                                      <div className="p-2 bg-gray-700 rounded text-gray-400">
                                          <FileText className="w-4 h-4" />
                                      </div>
                                      <input 
                                          type="text" 
                                          value={editingConn.details?.logAgentUrl || ''}
                                          onChange={(e) => handleDetailChange('logAgentUrl', e.target.value)}
                                          placeholder="http://log-server:9200/_search"
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                                      />
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-1">URL to fetch aggregated logs for the "Log Center" module.</p>
                              </div>
                          </div>
                      )}

                      {editTab === 'advanced' && (
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-medium text-gray-400 mb-1">Auth Token (Optional)</label>
                                  <input 
                                      type="password" 
                                      value={editingConn.details?.token || ''}
                                      onChange={(e) => handleDetailChange('token', e.target.value)}
                                      placeholder="Use token instead of password..."
                                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-yellow-500"
                                  />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Max Connection Pool</label>
                                      <input 
                                          type="number" 
                                          value={editingConn.details?.maxPoolSize || 100}
                                          onChange={(e) => handleDetailChange('maxPoolSize', Number(e.target.value))}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-yellow-500"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">Request Timeout (ms)</label>
                                      <input 
                                          type="number" 
                                          value={editingConn.details?.timeout || 5000}
                                          onChange={(e) => handleDetailChange('timeout', Number(e.target.value))}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-yellow-500"
                                      />
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-5 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                      <button onClick={() => setEditingConn(null)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                      <button 
                          onClick={handleSaveConnection}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center"
                      >
                          <Save className="w-4 h-4 mr-2" /> Save Configuration
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'ai' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Global AI Switch */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${aiEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-500'}`}>
                          <Bot className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                              AI Assistant Features
                              {!aiEnabled && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">DISABLED</span>}
                          </h3>
                          <p className="text-sm text-gray-400">Enable LLM-powered capabilities: Text-to-SQL, Log Analysis, and Root Cause Diagnosis.</p>
                      </div>
                  </div>
                  <div 
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${aiEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
                  >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${aiEnabled ? 'left-[30px]' : 'left-1'}`}></div>
                  </div>
              </div>

              {/* Provider Configs */}
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity ${!aiEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  {aiProviders.map(provider => (
                      <div 
                          key={provider.id} 
                          className={`
                              bg-gray-800 rounded-xl border p-6 relative group transition-all
                              ${provider.isDefault ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-gray-700 hover:border-gray-500'}
                          `}
                      >
                          {provider.isDefault && (
                              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-sm">
                                  DEFAULT PROVIDER
                              </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-5">
                              <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-gray-700/50 rounded-lg">
                                      <Cpu className={`w-6 h-6 ${provider.isDefault ? 'text-purple-400' : 'text-gray-400'}`} />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-gray-100">{provider.name}</h3>
                                      <p className="text-xs text-gray-500">{provider.provider}</p>
                                  </div>
                              </div>
                              <div className="flex gap-1 pr-2">
                                  <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Settings">
                                      <Settings2 className="w-4 h-4" />
                                  </button>
                                  {!provider.isDefault && (
                                      <button 
                                          onClick={() => handleDeleteAI(provider.id)}
                                          className="p-2 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400 transition-colors"
                                          title="Delete"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  )}
                              </div>
                          </div>

                          <div className="space-y-4 mb-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Model Name</label>
                                      <input 
                                          type="text" 
                                          value={provider.model} 
                                          readOnly 
                                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-300 font-mono outline-none" 
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">API Key</label>
                                      <input 
                                          type="password" 
                                          value="sk-................" 
                                          readOnly 
                                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-300 font-mono outline-none" 
                                      />
                                  </div>
                              </div>
                              {provider.baseUrl && (
                                  <div>
                                      <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Base URL / Endpoint</label>
                                      <input 
                                          type="text" 
                                          value={provider.baseUrl} 
                                          readOnly 
                                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-300 font-mono outline-none" 
                                      />
                                  </div>
                              )}
                          </div>

                          <div className="flex justify-between items-center pt-2">
                              <div className="flex items-center gap-2">
                                  <div className={`w-2.5 h-2.5 rounded-full ${provider.status === 'Connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                                  <span className={`text-xs font-medium ${provider.status === 'Connected' ? 'text-green-400' : 'text-gray-500'}`}>
                                      {provider.status.toUpperCase()}
                                  </span>
                              </div>
                              <div className="flex gap-3">
                                  {!provider.isDefault && (
                                      <button 
                                          onClick={() => handleSetDefaultAI(provider.id)}
                                          className="text-xs text-gray-400 hover:text-purple-400 transition-colors font-medium"
                                      >
                                          Set as Default
                                      </button>
                                  )}
                                  <button 
                                      onClick={() => handleTestAI(provider.id)}
                                      className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs font-medium transition-colors border border-gray-600"
                                  >
                                      Test Connection
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}

                  {/* Add New Card */}
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-purple-500 hover:text-purple-400 hover:bg-purple-900/5 transition-all cursor-pointer min-h-[250px] group">
                      <div className="p-4 bg-gray-800 rounded-full mb-3 group-hover:bg-purple-500/10 transition-colors">
                          <Plus className="w-8 h-8" />
                      </div>
                      <p className="font-medium">Add LLM Provider</p>
                      <p className="text-xs text-gray-600 mt-1">OpenAI, Anthropic, Gemini, or Local</p>
                  </div>
              </div>
              
              {/* Warning Banner if no default */}
              {!aiProviders.some(p => p.isDefault) && aiEnabled && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <p className="text-sm text-yellow-200">
                          <span className="font-bold">Configuration Incomplete:</span> Please select a default AI provider to enable assistant features across the platform.
                      </p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};