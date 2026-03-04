import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Activity, CheckCircle, XCircle, RefreshCw, Terminal, Cpu, HardDrive, Network, Lock, FileText, Plus, Search, Filter, MoreHorizontal, Play, Square, RotateCcw, Key, Eye, EyeOff, Copy, X } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  version: string;
  ip: string;
  os: string;
  status: 'Online' | 'Offline' | 'Warning';
  uptime: string;
  cpu: number;
  memory: number;
  lastHeartbeat: string;
  configVersion: string;
  token: string; // Independent token for each agent
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

const MOCK_AGENTS: Agent[] = [
  { id: 'agt_001', name: 'Factory-Gateway-01', version: 'v2.4.1', ip: '192.168.1.101', os: 'Linux (Ubuntu 22.04)', status: 'Online', uptime: '14d 2h', cpu: 12, memory: 45, lastHeartbeat: '2s ago', configVersion: 'v12', token: 'tk_fact01_8f7a9c2b' },
  { id: 'agt_002', name: 'Factory-Gateway-02', version: 'v2.4.1', ip: '192.168.1.102', os: 'Linux (Ubuntu 22.04)', status: 'Online', uptime: '14d 2h', cpu: 15, memory: 48, lastHeartbeat: '5s ago', configVersion: 'v12', token: 'tk_fact02_3d4e5f6g' },
  { id: 'agt_003', name: 'Warehouse-Edge-01', version: 'v2.3.0', ip: '10.0.5.20', os: 'Windows Server 2019', status: 'Warning', uptime: '2d 5h', cpu: 85, memory: 92, lastHeartbeat: '45s ago', configVersion: 'v11', token: 'tk_ware01_1a2b3c4d' },
  { id: 'agt_004', name: 'Logistics-Tracker-05', version: 'v2.4.1', ip: '172.16.0.55', os: 'Linux (Alpine)', status: 'Offline', uptime: '-', cpu: 0, memory: 0, lastHeartbeat: '2h ago', configVersion: 'v10', token: 'tk_logi05_9z8y7x6w' },
  { id: 'agt_005', name: 'HQ-Server-Monitor', version: 'v2.4.2', ip: '10.10.1.5', os: 'Linux (CentOS 7)', status: 'Online', uptime: '45d 12h', cpu: 5, memory: 12, lastHeartbeat: '1s ago', configVersion: 'v14', token: 'tk_hqmon_5v4u3t2s' },
];

export const CollectorAgents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Online' | 'Offline' | 'Warning'>('All');
  
  // Token Modal State
  const [selectedAgentToken, setSelectedAgentToken] = useState<Agent | null>(null);
  const [showToken, setShowToken] = useState(false);

  // Logs Modal State
  const [selectedAgentForLogs, setSelectedAgentForLogs] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Deploy Modal State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentOS, setNewAgentOS] = useState('Linux (Ubuntu 22.04)');

  const generateMockLogs = (agentName: string): LogEntry[] => {
    const mockLogs: LogEntry[] = [];
    const levels: ('INFO' | 'WARN' | 'ERROR')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'INFO', 'ERROR', 'INFO'];
    const messages = [
      `Agent ${agentName} service started.`,
      'Connected to ingestion pipeline.',
      'Heartbeat acknowledged by server.',
      'Latency spike detected in data transmission.',
      'Batch processed: 1500 records.',
      'Connection timeout. Retrying in 5s...',
      'Configuration updated successfully.'
    ];

    const now = Date.now();
    for (let i = 0; i < 25; i++) {
      mockLogs.push({
        id: `log_${i}`,
        timestamp: new Date(now - i * 1000 * 45).toISOString(), // Every 45 seconds
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      });
    }
    return mockLogs;
  };

  const handleViewLogs = (agent: Agent) => {
    setSelectedAgentForLogs(agent);
    setLogs(generateMockLogs(agent.name));
  };

  const handleDeployAgent = () => {
    if (!newAgentName.trim()) return;

    const newId = `agt_${Math.random().toString(36).substring(2, 5)}_${Date.now().toString().substring(8)}`;
    const newToken = `tk_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36).substring(4)}`;
    
    const newAgent: Agent = {
      id: newId,
      name: newAgentName,
      version: 'v2.5.0',
      ip: '-',
      os: newAgentOS,
      status: 'Offline',
      uptime: '-',
      cpu: 0,
      memory: 0,
      lastHeartbeat: 'Never',
      configVersion: 'v1',
      token: newToken
    };

    setAgents(prev => [newAgent, ...prev]);
    setIsDeployModalOpen(false);
    setNewAgentName('');
    
    // Open token modal for the new agent immediately
    setSelectedAgentToken(newAgent);
    setShowToken(true);
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.ip.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRegenerateToken = (agentId: string) => {
    if (confirm('Are you sure you want to regenerate the token? The agent will be disconnected until updated with the new token.')) {
      const newToken = `tk_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36).substring(4)}`;
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, token: newToken } : a));
      if (selectedAgentToken && selectedAgentToken.id === agentId) {
          setSelectedAgentToken(prev => prev ? { ...prev, token: newToken } : null);
      }
    }
  };

  const handleCopyToken = (token: string) => {
      navigator.clipboard.writeText(token);
      // Could add a toast notification here
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Collector Agents</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor deployed collection agents across your infrastructure.</p>
        </div>
        <button 
          onClick={() => setIsDeployModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" /> Deploy New Agent
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Total Agents</p>
              <h3 className="text-2xl font-bold text-gray-100 mt-1">{agents.length}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Online</p>
              <h3 className="text-2xl font-bold text-green-400 mt-1">{agents.filter(a => a.status === 'Online').length}</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Warnings</p>
              <h3 className="text-2xl font-bold text-yellow-400 mt-1">{agents.filter(a => a.status === 'Warning').length}</h3>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Offline</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1">{agents.filter(a => a.status === 'Offline').length}</h3>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search agents by name or IP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Online">Online</option>
            <option value="Warning">Warning</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700 text-xs uppercase text-gray-400">
                <th className="px-6 py-4 font-semibold">Agent Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Resources</th>
                <th className="px-6 py-4 font-semibold">Configuration</th>
                <th className="px-6 py-4 font-semibold">System Info</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAgents.map(agent => (
                <tr key={agent.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg text-gray-300">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-200">{agent.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{agent.ip}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border w-fit ${
                        agent.status === 'Online' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        agent.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {agent.status === 'Online' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {agent.status === 'Warning' && <Activity className="w-3 h-3 mr-1" />}
                        {agent.status === 'Offline' && <XCircle className="w-3 h-3 mr-1" />}
                        {agent.status}
                      </div>
                      <span className="text-xs text-gray-500">Last seen: {agent.lastHeartbeat}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2 min-w-[140px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                        <span className={`${agent.cpu > 80 ? 'text-red-400' : 'text-gray-300'}`}>{agent.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${agent.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${agent.cpu}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1"><HardDrive className="w-3 h-3" /> MEM</span>
                        <span className={`${agent.memory > 90 ? 'text-red-400' : 'text-gray-300'}`}>{agent.memory}%</span>
                      </div>
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${agent.memory > 90 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${agent.memory}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-300 font-mono">{agent.configVersion}</span>
                      {agent.status === 'Online' && (
                        <span className="text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">Synced</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-16">Version:</span>
                        <span className="text-gray-300">{agent.version}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16">OS:</span>
                        <span className="text-gray-300">{agent.os}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16">Uptime:</span>
                        <span className="text-gray-300">{agent.uptime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedAgentToken(agent); setShowToken(false); }}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors" 
                        title="Manage Token"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Restart Agent">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewLogs(agent)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" 
                        title="View Logs"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Configure">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/30 flex justify-between items-center text-xs text-gray-500">
          <span>Showing {filteredAgents.length} of {agents.length} agents</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 hover:bg-gray-700 rounded transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 hover:bg-gray-700 rounded transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Deploy Agent Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Deploy New Agent</h2>
                <p className="text-xs text-gray-400 mt-0.5">Register a new collector agent</p>
              </div>
              <button onClick={() => setIsDeployModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Agent Name</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g., Production-Gateway-01"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Operating System</label>
                <select 
                  value={newAgentOS}
                  onChange={(e) => setNewAgentOS(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Linux (Ubuntu 22.04)">Linux (Ubuntu 22.04)</option>
                  <option value="Linux (CentOS 7)">Linux (CentOS 7)</option>
                  <option value="Linux (Alpine)">Linux (Alpine)</option>
                  <option value="Windows Server 2019">Windows Server 2019</option>
                  <option value="Windows Server 2022">Windows Server 2022</option>
                  <option value="macOS">macOS</option>
                  <option value="Docker Container">Docker Container</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsDeployModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeployAgent}
                  disabled={!newAgentName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-blue-900/20"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {selectedAgentForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Agent Logs</h2>
                <p className="text-xs text-gray-400 mt-0.5">System logs for <span className="text-gray-200 font-mono">{selectedAgentForLogs.name}</span></p>
              </div>
              <button onClick={() => setSelectedAgentForLogs(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-0 overflow-hidden flex-1 flex flex-col">
              <div className="bg-gray-950 p-4 overflow-y-auto font-mono text-xs space-y-1 h-full custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 hover:bg-gray-900/50 p-1 rounded">
                    <span className="text-gray-500 shrink-0 w-36">{log.timestamp}</span>
                    <span className={`shrink-0 w-12 font-bold ${
                      log.level === 'INFO' ? 'text-blue-400' : 
                      log.level === 'WARN' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-gray-300 break-all">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500 text-center py-10 italic">No logs available for this period.</div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 bg-gray-900/30 flex justify-between items-center">
               <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                  <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors flex items-center gap-1">
                    <Search className="w-3 h-3" /> Filter
                  </button>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => navigate(`/operations/logs?source=${selectedAgentForLogs.id}`)}
                   className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-300 transition-colors flex items-center gap-2"
                 >
                   <FileText className="w-4 h-4" /> View Historical Logs
                 </button>
                 <button 
                   onClick={() => setSelectedAgentForLogs(null)}
                   className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
                 >
                   Close
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Management Modal */}
      {selectedAgentToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Access Token</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage authentication for {selectedAgentToken.name}</p>
              </div>
              <button onClick={() => setSelectedAgentToken(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-200/80">
                  <p className="font-bold text-yellow-500 mb-1">Security Warning</p>
                  This token grants full access for this specific agent. Do not share it. If compromised, regenerate it immediately.
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Current Token</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 font-mono text-sm text-gray-300 break-all relative group">
                    {showToken ? selectedAgentToken.token : '••••••••••••••••••••••••••••••••'}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 bg-gradient-to-l from-gray-950 via-gray-950 to-transparent pl-4">
                       {/* Gradient fade for long tokens if needed */}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowToken(!showToken)}
                    className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                    title={showToken ? "Hide Token" : "Show Token"}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleCopyToken(selectedAgentToken.token)}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg shadow-blue-900/20"
                    title="Copy Token"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700">
                <button 
                  onClick={() => handleRegenerateToken(selectedAgentToken.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 border border-transparent rounded-lg text-sm font-medium text-gray-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate Token
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-2">
                  Regenerating will invalidate the current token immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
