
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ChevronRight, ChevronDown, Factory, Warehouse, Cpu, 
  Activity, Thermometer, Zap, Gauge, Clock, Tag, Settings, 
  MoreVertical, RefreshCw, AlertTriangle, CheckCircle, Wifi
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- Types ---
interface DeviceNode {
  id: string;
  name: string;
  type: 'FACTORY' | 'WORKSHOP' | 'DEVICE';
  status?: 'ONLINE' | 'OFFLINE' | 'WARNING';
  children?: DeviceNode[];
  // Device specific data
  model?: string;
  tags?: Record<string, string>;
}

// --- Mock Data ---
const MOCK_HIERARCHY: DeviceNode[] = [
  {
    id: 'f_1',
    name: 'Shanghai Gigafactory',
    type: 'FACTORY',
    children: [
      {
        id: 'ws_1_a',
        name: 'Assembly Shop A',
        type: 'WORKSHOP',
        children: [
          { id: 'd_101', name: 'Robotic Arm #101', type: 'DEVICE', status: 'ONLINE', model: 'KUKA-KR6', tags: { ip: '192.168.1.50', firmware: 'v2.1', install_date: '2022-05-12' } },
          { id: 'd_102', name: 'Robotic Arm #102', type: 'DEVICE', status: 'WARNING', model: 'KUKA-KR6', tags: { ip: '192.168.1.51', firmware: 'v2.0', install_date: '2022-05-12' } },
          { id: 'd_103', name: 'Conveyor Belt Main', type: 'DEVICE', status: 'ONLINE', model: 'Siemens-S7', tags: { ip: '192.168.1.60', firmware: 'v4.5', install_date: '2021-11-30' } },
        ]
      },
      {
        id: 'ws_1_b',
        name: 'Paint Shop B',
        type: 'WORKSHOP',
        children: [
          { id: 'd_201', name: 'Sprayer Unit Alpha', type: 'DEVICE', status: 'OFFLINE', model: 'ABB-IRB', tags: { ip: '192.168.2.10', firmware: 'v1.2', install_date: '2023-01-15' } },
          { id: 'd_202', name: 'Drying Oven Controller', type: 'DEVICE', status: 'ONLINE', model: 'Honeywell-HC', tags: { ip: '192.168.2.20', firmware: 'v3.0', install_date: '2023-02-01' } },
        ]
      }
    ]
  },
  {
    id: 'f_2',
    name: 'Austin Plant',
    type: 'FACTORY',
    children: [
      {
        id: 'ws_2_c',
        name: 'Battery Assembly',
        type: 'WORKSHOP',
        children: Array.from({ length: 5 }).map((_, i) => ({
            id: `d_austin_${i}`,
            name: `Cell Welder #${i+1}`,
            type: 'DEVICE',
            status: Math.random() > 0.8 ? 'WARNING' : 'ONLINE',
            model: 'Fanuc-M20',
            tags: { region: 'US-South', lane: `Lane-${i%2}` }
        }))
      }
    ]
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'ONLINE') return <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20"><Wifi className="w-3 h-3 mr-1" /> Online</span>;
    if (status === 'WARNING') return <span className="flex items-center text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> Warning</span>;
    return <span className="flex items-center text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"><Wifi className="w-3 h-3 mr-1" /> Offline</span>;
};

const MetricCard = ({ label, value, unit, icon: Icon, color, history }: { label: string, value: string, unit: string, icon: any, color: string, history: number[] }) => {
    // Mini sparkline data
    const data = history.map((val, i) => ({ i, val }));
    
    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center">
                        <Icon className={`w-3.5 h-3.5 mr-1.5 ${color}`} /> {label}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-100">{value}</span>
                        <span className="text-xs text-gray-500 font-mono">{unit}</span>
                    </div>
                </div>
            </div>
            
            {/* Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 group-hover:opacity-30 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <Area type="monotone" dataKey="val" stroke={color.replace('text-', '')} fill="currentColor" className={color} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const RealtimeDevices: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['f_1', 'ws_1_a']);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('d_101');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'tags'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Real-time Data State
  const [liveData, setLiveData] = useState({
      temp: 0,
      speed: 0,
      vibration: 0,
      power: 0,
      history: { temp: [], speed: [], vibration: [], power: [] } as Record<string, number[]>
  });

  // Flatten tree for searching
  const flattenNodes = (nodes: DeviceNode[]): DeviceNode[] => {
      let flat: DeviceNode[] = [];
      nodes.forEach(n => {
          flat.push(n);
          if (n.children) flat = flat.concat(flattenNodes(n.children));
      });
      return flat;
  };
  
  const allNodes = useMemo(() => flattenNodes(MOCK_HIERARCHY), []);
  const selectedNode = allNodes.find(n => n.id === selectedNodeId);

  // Simulation Effect
  useEffect(() => {
      // Reset history on node change
      setLiveData(prev => ({ ...prev, history: { temp: [], speed: [], vibration: [], power: [] } }));

      const interval = setInterval(() => {
          if (!selectedNode || selectedNode.type !== 'DEVICE') return;

          const now = new Date();
          const time = now.toLocaleTimeString();
          
          const newTemp = 40 + Math.random() * 20;
          const newSpeed = 1200 + Math.random() * 300;
          const newVib = Math.random() * 0.5;
          const newPower = 220 + Math.random() * 10;

          setLiveData(prev => {
              const updateHistory = (arr: any[], val: any) => [...arr.slice(-19), { time, val }]; // Keep last 20 points
              const updateScalarHistory = (arr: number[], val: number) => [...arr.slice(-19), val];

              return {
                  temp: newTemp,
                  speed: newSpeed,
                  vibration: newVib,
                  power: newPower,
                  history: {
                      temp: updateScalarHistory(prev.history.temp, newTemp),
                      speed: updateScalarHistory(prev.history.speed, newSpeed),
                      vibration: updateScalarHistory(prev.history.vibration, newVib),
                      power: updateScalarHistory(prev.history.power, newPower),
                      chart: updateHistory((prev.history as any).chart || [], { temp: newTemp, speed: newSpeed, vibration: newVib })
                  }
              };
          });
      }, 1000);

      return () => clearInterval(interval);
  }, [selectedNodeId]);

  const toggleExpand = (id: string) => {
      setExpandedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const renderTree = (nodes: DeviceNode[], level = 0) => {
      return nodes.map(node => {
          if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase()) && node.type === 'DEVICE') return null;
          
          const isExpanded = expandedNodes.includes(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = selectedNodeId === node.id;

          const Icon = node.type === 'FACTORY' ? Factory : node.type === 'WORKSHOP' ? Warehouse : Cpu;
          const colorClass = node.type === 'FACTORY' ? 'text-blue-400' : node.type === 'WORKSHOP' ? 'text-purple-400' : 'text-green-400';

          return (
              <div key={node.id}>
                  <div 
                      className={`flex items-center py-1.5 px-2 cursor-pointer text-sm transition-colors border-l-2 ${
                          isSelected 
                          ? 'bg-blue-600/20 text-blue-100 border-blue-500' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-transparent'
                      }`}
                      style={{ paddingLeft: `${level * 12 + 8}px` }}
                      onClick={() => {
                          if (hasChildren) toggleExpand(node.id);
                          if (node.type === 'DEVICE') setSelectedNodeId(node.id);
                      }}
                  >
                      <span className="mr-1 opacity-70 w-4 flex justify-center">
                          {hasChildren && (
                              isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                          )}
                      </span>
                      <Icon className={`w-4 h-4 mr-2 ${colorClass}`} />
                      <span className="truncate">{node.name}</span>
                      {node.status && (
                          <div className={`ml-auto w-2 h-2 rounded-full ${
                              node.status === 'ONLINE' ? 'bg-green-500' : node.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                      )}
                  </div>
                  {isExpanded && node.children && (
                      <div>{renderTree(node.children, level + 1)}</div>
                  )}
              </div>
          );
      });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Sidebar */}
        <div className="w-72 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
            <div className="p-3 border-b border-gray-700 bg-gray-750">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter assets..." 
                        className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {renderTree(MOCK_HIERARCHY)}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden min-w-0">
            {selectedNode && selectedNode.type === 'DEVICE' ? (
                <>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-700 bg-gray-750 shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    <Factory className="w-3 h-3" /> Factory
                                    <ChevronRight className="w-3 h-3" />
                                    <Warehouse className="w-3 h-3" /> Workshop
                                </div>
                                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                                    {selectedNode.name}
                                    <StatusBadge status={selectedNode.status} />
                                </h2>
                                <p className="text-sm text-gray-400 mt-1 font-mono">ID: {selectedNode.id} • Model: {selectedNode.model}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors" title="Settings"><Settings className="w-4 h-4" /></button>
                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700 px-6 gap-6 shrink-0 bg-gray-800">
                        <button onClick={() => setActiveTab('overview')} className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                            <Gauge className="w-4 h-4 mr-2" /> Overview
                        </button>
                        <button onClick={() => setActiveTab('trends')} className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'trends' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                            <Activity className="w-4 h-4 mr-2" /> Live Trends
                        </button>
                        <button onClick={() => setActiveTab('tags')} className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'tags' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                            <Tag className="w-4 h-4 mr-2" /> Attributes
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-[#0B1120]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <MetricCard 
                                        label="Temperature" 
                                        value={liveData.temp.toFixed(1)} 
                                        unit="°C" 
                                        icon={Thermometer} 
                                        color="text-red-400" 
                                        history={liveData.history.temp}
                                    />
                                    <MetricCard 
                                        label="Motor Speed" 
                                        value={liveData.speed.toFixed(0)} 
                                        unit="RPM" 
                                        icon={RefreshCw} 
                                        color="text-blue-400" 
                                        history={liveData.history.speed}
                                    />
                                    <MetricCard 
                                        label="Vibration" 
                                        value={liveData.vibration.toFixed(3)} 
                                        unit="G" 
                                        icon={Activity} 
                                        color="text-yellow-400" 
                                        history={liveData.history.vibration}
                                    />
                                    <MetricCard 
                                        label="Power Input" 
                                        value={liveData.power.toFixed(1)} 
                                        unit="V" 
                                        icon={Zap} 
                                        color="text-purple-400" 
                                        history={liveData.history.power}
                                    />
                                </div>

                                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                    <h3 className="text-gray-200 font-bold mb-4 flex items-center"><Activity className="w-4 h-4 mr-2 text-green-400" /> Real-time Performance</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={(liveData.history as any).chart || []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                                <Line type="monotone" dataKey="val.temp" name="Temp" stroke="#f87171" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="val.vibration" name="Vibration" stroke="#facc15" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'trends' && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 h-full flex flex-col">
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-gray-200 font-bold">Historical Trends (1 Hour)</h3>
                                    <select className="bg-gray-900 border border-gray-600 rounded px-3 py-1 text-sm text-gray-200 outline-none">
                                        <option>All Metrics</option>
                                        <option>Temperature Only</option>
                                        <option>Speed Only</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={(liveData.history as any).chart || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                                            <YAxis stroke="#6b7280" fontSize={12} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                            <Line type="monotone" dataKey="val.speed" name="Speed" stroke="#60a5fa" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="val.power" name="Power" stroke="#c084fc" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tags' && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-750 text-gray-400 font-medium">
                                        <tr>
                                            <th className="p-4 border-b border-gray-700">Tag Name</th>
                                            <th className="p-4 border-b border-gray-700">Value</th>
                                            <th className="p-4 border-b border-gray-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {Object.entries(selectedNode.tags || {}).map(([key, val]) => (
                                            <tr key={key} className="hover:bg-gray-700/50">
                                                <td className="p-4 font-mono text-blue-300">{key}</td>
                                                <td className="p-4 text-gray-200">{val}</td>
                                                <td className="p-4 text-right">
                                                    <button className="text-gray-500 hover:text-blue-400 text-xs">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Cpu className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Select a Device</p>
                    <p className="text-xs mt-1">Choose a device from the hierarchy to view live telemetry.</p>
                </div>
            )}
        </div>
    </div>
  );
};
