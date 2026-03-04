
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RefreshCw, Database, Table, Server, 
  Search, Check, ChevronRight, Activity, Zap, Thermometer, 
  AlertTriangle, BarChart2, TrendingUp, GitCommit
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';

// --- Types & Mock Data ---

interface Device {
  id: string;
  name: string;
  group: string;
  status: 'Online' | 'Offline';
}

const MOCK_DEVICES: Device[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `dev_${100 + i}`,
  name: `Meter_${100 + i}`,
  group: i < 10 ? 'Zone A' : 'Zone B',
  status: Math.random() > 0.1 ? 'Online' : 'Offline'
}));

const FIELDS = [
  { key: 'current', label: 'Current (A)', color: '#3b82f6', icon: Zap },
  { key: 'voltage', label: 'Voltage (V)', color: '#eab308', icon: Activity },
  { key: 'temp', label: 'Temp (°C)', color: '#ef4444', icon: Thermometer },
  { key: 'status_val', label: 'Status', color: '#10b981', icon: GitCommit }, // Mapped to number for chart
];

export const RealtimeLive: React.FC = () => {
  // --- State: Selection ---
  const [selectedSource, setSelectedSource] = useState('ds_001');
  const [selectedDb, setSelectedDb] = useState('power_db');
  const [selectedTable, setSelectedTable] = useState('meters');
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['dev_100']); // Default select first
  const [deviceSearch, setDeviceSearch] = useState('');

  // --- State: Controls ---
  const [refreshRate, setRefreshRate] = useState<1000 | 5000 | 10000>(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'status'>('line');
  const [visibleFields, setVisibleFields] = useState<string[]>(['current', 'voltage', 'temp']);

  // --- State: Data ---
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const maxPoints = 50;

  // --- Data Generator ---
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false });
      
      const newPoint: any = { time: timeStr, fullTime: now.toISOString() };

      // Generate data for ALL selected devices
      selectedDevices.forEach(devId => {
        // Deterministic random based on time for smoother curves
        const base = now.getTime() / 1000;
        const offset = parseInt(devId.split('_')[1]) || 0;
        
        // Simulating values
        newPoint[`${devId}.current`] = Number((10 + Math.sin(base + offset) * 5 + Math.random()).toFixed(2));
        newPoint[`${devId}.voltage`] = Number((220 + Math.cos(base * 0.5) * 10 + Math.random() * 2).toFixed(1));
        newPoint[`${devId}.temp`] = Number((45 + Math.sin(base * 0.2) * 15).toFixed(1));
        
        // Status: 2=OK, 1=Warn, 0=Error
        const rand = Math.random();
        newPoint[`${devId}.status_val`] = rand > 0.1 ? 2 : rand > 0.05 ? 1 : 0; 
        newPoint[`${devId}.status_txt`] = rand > 0.1 ? 'OK' : rand > 0.05 ? 'WARN' : 'ERR'; 
      });

      setDataPoints(prev => {
        const next = [...prev, newPoint];
        return next.slice(-maxPoints); // Keep sliding window
      });

    }, refreshRate);

    return () => clearInterval(interval);
  }, [refreshRate, isPaused, selectedDevices]);

  // --- Handlers ---
  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => 
      prev.includes(id) 
        ? prev.filter(d => d !== id) 
        : [...prev, id]
    );
  };

  const toggleField = (fieldKey: string) => {
    setVisibleFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const filteredDevices = MOCK_DEVICES.filter(d => d.name.toLowerCase().includes(deviceSearch.toLowerCase()));

  // --- Rendering ---

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 animate-in fade-in duration-300">
      
      {/* LEFT: Hierarchy & Device Selection */}
      <div className="w-72 bg-gray-800 rounded-xl border border-gray-700 flex flex-col shrink-0 overflow-hidden">
        {/* Top Hierarchy */}
        <div className="p-4 border-b border-gray-700 space-y-3 bg-gray-750">
           <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase font-bold flex items-center">
                 <Server className="w-3 h-3 mr-1" /> Data Source
              </label>
              <select 
                value={selectedSource} 
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded text-sm text-gray-200 p-2 outline-none"
              >
                 <option value="ds_001">Factory A Gateway (MQTT)</option>
                 <option value="ds_002">Fleet Stream (Kafka)</option>
              </select>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase font-bold flex items-center">
                    <Database className="w-3 h-3 mr-1" /> DB
                  </label>
                  <select 
                    value={selectedDb} 
                    onChange={(e) => setSelectedDb(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded text-sm text-gray-200 p-2 outline-none"
                  >
                    <option value="power_db">power_db</option>
                    <option value="test_db">test_db</option>
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase font-bold flex items-center">
                    <Table className="w-3 h-3 mr-1" /> Table
                  </label>
                  <select 
                    value={selectedTable} 
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded text-sm text-gray-200 p-2 outline-none"
                  >
                    <option value="meters">meters</option>
                    <option value="sensors">sensors</option>
                  </select>
              </div>
           </div>
        </div>

        {/* Device List */}
        <div className="flex-1 flex flex-col min-h-0">
           <div className="p-3 border-b border-gray-700 bg-gray-750">
              <div className="relative">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                 <input 
                    type="text" 
                    placeholder="Search devices..." 
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500"
                 />
              </div>
              <div className="flex justify-between items-center mt-2">
                 <span className="text-xs text-gray-400 font-medium">Select Devices for Compare</span>
                 <span className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                    {selectedDevices.length} Selected
                 </span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredDevices.map(device => {
                 const isSelected = selectedDevices.includes(device.id);
                 return (
                    <div 
                      key={device.id}
                      onClick={() => toggleDevice(device.id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                        isSelected 
                        ? 'bg-blue-600/10 border-blue-500/50' 
                        : 'border-transparent hover:bg-gray-700/50'
                      }`}
                    >
                       <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                             isSelected ? 'bg-blue-600 border-blue-500' : 'border-gray-500 bg-gray-800'
                          }`}>
                             {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                             <div className={`text-sm font-medium ${isSelected ? 'text-blue-200' : 'text-gray-300'}`}>{device.name}</div>
                             <div className="text-[10px] text-gray-500">{device.group} • {device.id}</div>
                          </div>
                       </div>
                       <div className={`w-2 h-2 rounded-full ${device.status === 'Online' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    </div>
                 );
              })}
           </div>
        </div>
      </div>

      {/* RIGHT: Main Content */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
         
         {/* Toolbar */}
         <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm">
             <div className="flex items-center gap-4">
                 {/* Refresh Rate */}
                 <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-600">
                     {[1000, 5000, 10000].map(rate => (
                         <button
                            key={rate}
                            onClick={() => setRefreshRate(rate as any)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                refreshRate === rate ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                            }`}
                         >
                            {rate / 1000}s
                         </button>
                     ))}
                 </div>

                 <div className="h-6 w-px bg-gray-700"></div>

                 {/* Chart Type */}
                 <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-600">
                     <button onClick={() => setChartType('line')} className={`p-1.5 rounded ${chartType === 'line' ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`} title="Line Chart"><TrendingUp className="w-4 h-4"/></button>
                     <button onClick={() => setChartType('bar')} className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`} title="Bar Chart"><BarChart2 className="w-4 h-4"/></button>
                     <button onClick={() => setChartType('status')} className={`p-1.5 rounded ${chartType === 'status' ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`} title="Status Timeline"><GitCommit className="w-4 h-4"/></button>
                 </div>

                 <div className="h-6 w-px bg-gray-700"></div>

                 {/* Field Toggles */}
                 <div className="flex items-center gap-2">
                     {FIELDS.map(f => (
                         f.key !== 'status_val' && (
                             <button 
                                key={f.key}
                                onClick={() => toggleField(f.key)}
                                className={`flex items-center px-2 py-1 rounded text-xs border transition-colors ${
                                    visibleFields.includes(f.key) 
                                    ? `bg-[${f.color}]/10 border-[${f.color}]/50 text-gray-200`
                                    : 'bg-gray-800 border-gray-600 text-gray-500 opacity-60'
                                }`}
                                style={visibleFields.includes(f.key) ? { borderColor: f.color, backgroundColor: `${f.color}20` } : {}}
                             >
                                 <f.icon className="w-3 h-3 mr-1.5" style={{ color: visibleFields.includes(f.key) ? f.color : undefined }} />
                                 {f.label}
                             </button>
                         )
                     ))}
                 </div>
             </div>

             <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded border border-gray-700">
                     <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></span>
                     {isPaused ? 'Paused' : 'Live Streaming'}
                 </div>
                 <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={`p-2 rounded-lg border transition-colors ${
                        isPaused 
                        ? 'bg-green-600 hover:bg-green-500 border-green-500 text-white' 
                        : 'bg-red-900/30 hover:bg-red-900/50 border-red-500/50 text-red-400'
                    }`}
                 >
                    {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                 </button>
             </div>
         </div>

         {/* Chart Area */}
         <div className="flex-1 min-h-[350px] bg-gray-800 rounded-xl border border-gray-700 p-4 relative overflow-hidden flex flex-col">
             {selectedDevices.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                     <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                     <p>Select a device from the left to view real-time data.</p>
                 </div>
             ) : (
                 <ResponsiveContainer width="100%" height="100%">
                     {chartType === 'bar' ? (
                         <BarChart data={dataPoints}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                             <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                             <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }}
                                itemStyle={{ padding: 0 }}
                             />
                             <Legend />
                             {selectedDevices.map((devId, i) => (
                                 visibleFields.map((field) => (
                                     <Bar 
                                        key={`${devId}-${field}`}
                                        dataKey={`${devId}.${field}`}
                                        name={`${MOCK_DEVICES.find(d => d.id === devId)?.name} ${field}`}
                                        fill={FIELDS.find(f => f.key === field)?.color}
                                        opacity={0.8}
                                        radius={[2, 2, 0, 0]}
                                     />
                                 ))
                             ))}
                         </BarChart>
                     ) : chartType === 'status' ? (
                         <LineChart data={dataPoints}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                             <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                             <YAxis 
                                stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} 
                                domain={[0, 2]} 
                                ticks={[0, 1, 2]}
                                tickFormatter={(val) => val === 2 ? 'OK' : val === 1 ? 'WARN' : 'ERR'}
                             />
                             <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }} />
                             <Legend />
                             {selectedDevices.map((devId, i) => (
                                 <Line 
                                    key={`${devId}-status`}
                                    type="stepAfter"
                                    dataKey={`${devId}.status_val`}
                                    name={`${MOCK_DEVICES.find(d => d.id === devId)?.name} Status`}
                                    stroke={`hsl(${i * 60}, 70%, 50%)`}
                                    strokeWidth={2}
                                    dot={false}
                                 />
                             ))}
                         </LineChart>
                     ) : (
                         <LineChart data={dataPoints}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                             <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                             <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }} 
                             />
                             <Legend />
                             {selectedDevices.map((devId, i) => (
                                 visibleFields.map((field) => {
                                     // Slightly adjust color for same field across different devices if multiple selected
                                     // Base color from field definition
                                     const baseColor = FIELDS.find(f => f.key === field)?.color || '#fff';
                                     // If multiple devices, use dashed lines for 2nd, dotted for 3rd etc, or opacity
                                     return (
                                         <Line 
                                            key={`${devId}-${field}`}
                                            type="monotone"
                                            dataKey={`${devId}.${field}`}
                                            name={`${MOCK_DEVICES.find(d => d.id === devId)?.name} ${field}`}
                                            stroke={baseColor}
                                            strokeWidth={2}
                                            strokeDasharray={selectedDevices.length > 1 && i > 0 ? (i === 1 ? '5 5' : '3 3') : ''}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                         />
                                     )
                                 })
                             ))}
                         </LineChart>
                     )}
                 </ResponsiveContainer>
             )}
         </div>

         {/* Bottom: Data Table */}
         <div className="h-64 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
             <div className="px-4 py-2 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
                 <h3 className="text-xs font-bold text-gray-400 uppercase">Live Data Feed</h3>
                 <button onClick={() => setDataPoints([])} className="text-[10px] text-gray-500 hover:text-red-400 flex items-center">
                     <RefreshCw className="w-3 h-3 mr-1" /> Clear Buffer
                 </button>
             </div>
             <div className="flex-1 overflow-auto">
                 <table className="w-full text-left border-collapse text-xs">
                     <thead className="bg-gray-800 text-gray-500 font-medium sticky top-0 z-10">
                         <tr>
                             <th className="p-3 border-b border-gray-700 w-32">Timestamp</th>
                             <th className="p-3 border-b border-gray-700 w-32">Device</th>
                             {FIELDS.map(f => (
                                 <th key={f.key} className="p-3 border-b border-gray-700" style={{color: f.color}}>{f.label}</th>
                             ))}
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-700 font-mono">
                         {[...dataPoints].reverse().map((pt, idx) => (
                             // For table, we need to flatten the rows per device
                             selectedDevices.map(devId => (
                                 <tr key={`${idx}-${devId}`} className="hover:bg-gray-700/50 transition-colors">
                                     <td className="p-2 pl-3 text-gray-400">{pt.time}</td>
                                     <td className="p-2 text-blue-200">{MOCK_DEVICES.find(d => d.id === devId)?.name}</td>
                                     <td className="p-2">{pt[`${devId}.current`]}</td>
                                     <td className="p-2">{pt[`${devId}.voltage`]}</td>
                                     <td className="p-2">{pt[`${devId}.temp`]}</td>
                                     <td className="p-2">
                                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                             pt[`${devId}.status_txt`] === 'OK' ? 'bg-green-500/20 text-green-400' :
                                             pt[`${devId}.status_txt`] === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                                             'bg-red-500/20 text-red-400'
                                         }`}>
                                             {pt[`${devId}.status_txt`]}
                                         </span>
                                     </td>
                                 </tr>
                             ))
                         ))}
                     </tbody>
                 </table>
             </div>
         </div>
      </div>
    </div>
  );
};
