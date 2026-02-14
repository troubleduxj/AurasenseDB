import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DATA_SOURCES, MOCK_PLUGINS } from '../constants';
import { Plus, Wifi, WifiOff, AlertTriangle, Box, Settings, CheckCircle, ChevronRight, X, GitMerge, Radio, Pause, Play, Trash2, Download, FileJson, Binary, Search, ArrowDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { DataSource } from '../types';
import { DynamicForm } from '../components/DynamicForm';
import { Page } from '../types';

// Helper to render dynamic icon
const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (Icons as any)[name] || Box;
  return <Icon className={className} />;
};

// --- Types for Live Tap ---
interface Packet {
  id: number;
  ts: string;
  direction: 'IN' | 'OUT';
  protocol: string;
  size: number;
  payload: any;
  rawHex: string;
  info: string;
}

// --- Live Tap Modal Component ---
const LiveTapModal = ({ source, onClose }: { source: DataSource; onClose: () => void }) => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const packetIdCounter = useRef(1);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [packets, isPaused]);

  // Mock Data Stream
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const id = packetIdCounter.current++;
      const now = new Date();
      const ts = now.toISOString().split('T')[1].slice(0, -1); // HH:mm:ss.SSS
      
      let protocol = 'TCP';
      let payload: any = {};
      let info = '';
      let rawHex = '';

      // Generate context-aware mock data
      if (source.type.includes('MQTT')) {
          protocol = 'MQTT';
          const topics = ['factory/line1/temp', 'factory/line1/speed', 'sys/alerts'];
          const topic = topics[Math.floor(Math.random() * topics.length)];
          payload = { 
            topic, 
            qos: 1, 
            payload: { value: (Math.random() * 100).toFixed(2), ts: Date.now() } 
          };
          info = `PUBLISH [${topic}] (${JSON.stringify(payload.payload).length} bytes)`;
      } else if (source.type.includes('Kafka')) {
          protocol = 'Kafka';
          const offset = Math.floor(Math.random() * 1000000);
          payload = { 
            partition: 0, 
            offset, 
            key: `k-${id}`, 
            value: { vin: `VH_${Math.floor(Math.random()*500)}`, speed: Math.floor(Math.random()*120) } 
          };
          info = `Message: Partition 0, Offset ${offset}`;
      } else if (source.type.includes('HTTP')) {
          protocol = 'HTTP';
          payload = { 
            method: 'POST', 
            path: '/api/v1/telemetry', 
            headers: { 'Content-Type': 'application/json' },
            body: { temp: 24.5, humidity: 60 } 
          };
          info = 'POST /api/v1/telemetry 200 OK';
      } else {
          protocol = 'TCP';
          payload = { raw: 'binary_data', flags: [0x02, 0x10] };
          info = `Len: ${Math.floor(Math.random() * 100)}`;
      }

      // Mock Hex generation
      const jsonStr = JSON.stringify(payload);
      rawHex = Array.from(jsonStr).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
      // Truncate hex for visual
      if (rawHex.length > 100) rawHex = rawHex.substring(0, 100) + ' ...';

      const newPacket: Packet = {
          id,
          ts,
          direction: Math.random() > 0.1 ? 'IN' : 'OUT',
          protocol,
          size: jsonStr.length + 20,
          payload,
          rawHex,
          info
      };

      setPackets(prev => {
          const next = [...prev, newPacket];
          if (next.length > 100) return next.slice(next.length - 100); // Keep last 100
          return next;
      });
    }, 800); // New packet every 800ms

    return () => clearInterval(interval);
  }, [isPaused, source.type]);

  const filteredPackets = packets.filter(p => 
      p.info.toLowerCase().includes(filter.toLowerCase()) || 
      JSON.stringify(p.payload).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-[#111]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="font-bold text-base">Live Tap</span>
                    </div>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-blue-400 font-bold">{source.name}</span>
                        <span>•</span>
                        <span>{source.type}</span>
                    </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-2">
                    <div className="relative mr-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                        <input 
                            type="text" 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filter packets..." 
                            className="bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 pl-7 pr-2 py-1 outline-none focus:border-blue-500 w-48"
                        />
                    </div>
                    <button 
                        onClick={() => setPackets([])}
                        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors" title="Clear"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setIsPaused(!isPaused)}
                        className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-colors ${isPaused ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}
                    >
                        {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <div className="h-4 w-px bg-gray-700 mx-1"></div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Split Pane */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Top: Packet List */}
                <div className="flex-1 overflow-auto bg-[#0a0a0a]" ref={scrollRef}>
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-[#161616] text-gray-500 font-medium z-10">
                            <tr>
                                <th className="p-2 border-b border-gray-800 w-16">No.</th>
                                <th className="p-2 border-b border-gray-800 w-24">Time</th>
                                <th className="p-2 border-b border-gray-800 w-16 text-center">Dir</th>
                                <th className="p-2 border-b border-gray-800 w-20">Protocol</th>
                                <th className="p-2 border-b border-gray-800 w-16 text-right">Len</th>
                                <th className="p-2 border-b border-gray-800">Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredPackets.map((p) => (
                                <tr 
                                    key={p.id} 
                                    onClick={() => setSelectedPacket(p)}
                                    className={`cursor-pointer transition-colors hover:bg-gray-800 ${
                                        selectedPacket?.id === p.id 
                                        ? 'bg-blue-900/30 text-blue-100' 
                                        : 'text-gray-400'
                                    }`}
                                >
                                    <td className="p-2 text-gray-600">{p.id}</td>
                                    <td className="p-2">{p.ts}</td>
                                    <td className="p-2 text-center">
                                        {p.direction === 'IN' ? (
                                            <span className="text-green-500 font-bold">IN</span>
                                        ) : (
                                            <span className="text-blue-500 font-bold">OUT</span>
                                        )}
                                    </td>
                                    <td className="p-2 text-purple-400">{p.protocol}</td>
                                    <td className="p-2 text-right font-mono">{p.size}</td>
                                    <td className="p-2 truncate max-w-lg font-mono text-gray-300">{p.info}</td>
                                </tr>
                            ))}
                            {/* Dummy spacer for auto-scroll */}
                            <tr className="h-4"></tr>
                        </tbody>
                    </table>
                </div>

                {/* Resizer Mock */}
                <div className="h-1 bg-gray-800 hover:bg-blue-500 cursor-row-resize transition-colors"></div>

                {/* Bottom: Details */}
                <div className="h-1/3 min-h-[200px] bg-[#111] border-t border-gray-800 flex flex-col">
                    {selectedPacket ? (
                        <>
                            <div className="flex border-b border-gray-800">
                                <button className="px-4 py-2 text-xs font-bold text-gray-200 border-b-2 border-blue-500 bg-gray-800/50">
                                    Parsed Payload (JSON)
                                </button>
                                <button className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-300">
                                    Hex View
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-4 flex gap-4">
                                <div className="flex-1">
                                    <div className="bg-[#0a0a0a] border border-gray-700 rounded p-3 overflow-auto h-full">
                                        <pre className="text-green-400 text-xs font-mono leading-relaxed">
                                            {JSON.stringify(selectedPacket.payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                                <div className="w-1/3 space-y-2 text-xs text-gray-400">
                                    <div className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>Frame Number</span>
                                        <span className="text-gray-200">{selectedPacket.id}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>Capture Time</span>
                                        <span className="text-gray-200">{selectedPacket.ts}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>Protocol</span>
                                        <span className="text-purple-400">{selectedPacket.protocol}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-800 pb-1">
                                        <span>Length</span>
                                        <span className="text-gray-200">{selectedPacket.size} bytes</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="block mb-1">Raw Hex Preview</span>
                                        <div className="font-mono text-[10px] text-gray-500 break-all bg-gray-900 p-2 rounded">
                                            {selectedPacket.rawHex}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                            <ArrowDown className="w-6 h-6 mb-2 opacity-50" />
                            <p>Select a packet to inspect details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export const Ingestion: React.FC = () => {
  const navigate = useNavigate();
  const [sources, setSources] = useState<DataSource[]>(MOCK_DATA_SOURCES);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<'SELECT_PLUGIN' | 'CONFIG' | 'MAPPING'>('SELECT_PLUGIN');
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [newSourceName, setNewSourceName] = useState('');
  
  // Live Tap State
  const [tapSource, setTapSource] = useState<DataSource | null>(null);

  const selectedPlugin = MOCK_PLUGINS.find(p => p.id === selectedPluginId);

  const handleOpenWizard = () => {
    setSelectedPluginId(null);
    setNewSourceName('');
    setConfigValues({});
    setWizardStep('SELECT_PLUGIN');
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setSelectedPluginId(null);
  };

  const handleCreateSource = () => {
    if (!selectedPlugin) return;
    
    const newSource: DataSource = {
      id: `ds_${Date.now()}`,
      name: newSourceName,
      pluginId: selectedPlugin.id,
      type: selectedPlugin.name,
      status: 'Active',
      ingestionRate: 0,
      config: configValues
    };

    setSources([...sources, newSource]);
    handleCloseWizard();
  };

  const handleNavigateToMapping = (sourceId: string) => {
    navigate(`/${Page.INGESTION_MAPPING}?sourceId=${sourceId}`);
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Data Sources</h1>
           <p className="text-sm text-gray-400 mt-1">Manage active data ingestion channels and gateways.</p>
        </div>
        <button 
           onClick={handleOpenWizard}
           className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
        >
           <Plus className="w-4 h-4 mr-2" /> Deploy New Source
        </button>
      </div>

      {/* Content Area - Instance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sources.map((source) => (
          <div key={source.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  source.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                  source.status === 'Inactive' ? 'bg-gray-700/50 text-gray-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {source.status === 'Active' ? <Wifi className="w-6 h-6" /> : 
                   source.status === 'Inactive' ? <WifiOff className="w-6 h-6" /> :
                   <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{source.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{source.type}</p>
                </div>
              </div>
              <div className="relative">
                <button className="text-gray-500 hover:text-blue-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Ingestion Rate</span>
                  <span className="text-gray-200 font-mono">{source.ingestionRate.toLocaleString()} rows/s</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${
                      source.status === 'Active' ? 'bg-blue-500' : 'bg-gray-600'
                    }`} 
                    style={{ width: `${Math.min((source.ingestionRate / 15000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700/50">
                <div>
                   <span className="block text-xs text-gray-500">Source ID</span>
                   <span className="block text-sm text-gray-300 font-mono">{source.id}</span>
                </div>
                <div>
                   <span className="block text-xs text-gray-500">Uptime</span>
                   <span className="block text-sm text-gray-300">14d 2h</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                 <button 
                    onClick={() => setTapSource(source)}
                    className="flex-1 py-2 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex items-center justify-center group/btn"
                    title="Start Live Packet Capture"
                 >
                    <Radio className="w-3 h-3 mr-1.5 text-red-400 group-hover/btn:animate-pulse" />
                    Live Tap
                 </button>
                 <button 
                    onClick={() => handleNavigateToMapping(source.id)}
                    className="flex-1 py-2 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded transition-colors flex items-center justify-center"
                 >
                    <GitMerge className="w-3 h-3 mr-1" />
                    Mapping
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Wizard Overlay */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
               <div>
                  <h2 className="text-xl font-bold text-gray-100">Deploy New Source</h2>
                  <p className="text-xs text-gray-500">
                    {wizardStep === 'SELECT_PLUGIN' ? 'Step 1: Select Protocol Plugin' : 
                     wizardStep === 'CONFIG' ? `Step 2: Configure ${selectedPlugin?.name}` : 'Step 3: Target Mapping'}
                  </p>
               </div>
               <button onClick={handleCloseWizard} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
               {/* Step 1: Plugin Selection */}
               {wizardStep === 'SELECT_PLUGIN' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_PLUGINS.filter(p => p.status === 'Installed').map(plugin => (
                      <div 
                        key={plugin.id} 
                        onClick={() => { setSelectedPluginId(plugin.id); setWizardStep('CONFIG'); }}
                        className="p-4 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-blue-500 cursor-pointer transition-all group"
                      >
                         <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-gray-700 group-hover:bg-blue-500/20 rounded-lg text-gray-400 group-hover:text-blue-400">
                                <IconComponent name={plugin.icon} className="w-6 h-6" />
                             </div>
                             <h3 className="font-bold text-gray-200">{plugin.name}</h3>
                         </div>
                         <p className="text-xs text-gray-500 line-clamp-2">{plugin.description}</p>
                      </div>
                    ))}
                 </div>
               )}

               {/* Step 2: Configuration */}
               {wizardStep === 'CONFIG' && selectedPlugin && (
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <label className="block text-sm font-medium text-gray-300">Source Name <span className="text-red-400">*</span></label>
                       <input 
                          type="text" 
                          value={newSourceName} 
                          onChange={(e) => setNewSourceName(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g. Production Line 1 MQTT"
                       />
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                        <DynamicForm 
                            fields={selectedPlugin.schema} 
                            values={configValues} 
                            onChange={(name, value) => setConfigValues(prev => ({...prev, [name]: value}))} 
                        />
                    </div>
                 </div>
               )}

               {/* Step 3: Mapping (Mock) */}
               {wizardStep === 'MAPPING' && (
                 <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4 flex gap-3">
                       <Box className="w-5 h-5 text-blue-400 flex-shrink-0" />
                       <div>
                           <h4 className="text-blue-400 font-medium text-sm mb-1">Auto-Schema Detection</h4>
                           <p className="text-xs text-blue-300/80">We will attempt to infer the schema from the first 10 messages. Any unmatched fields will be stored in a JSON column.</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Target Database</label>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 outline-none">
                             <option>power_db</option>
                             <option>factory_db</option>
                             <option>sys_db</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-300">Target Super Table</label>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 outline-none">
                             <option>meters</option>
                             <option>sensors</option>
                          </select>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
               <button onClick={handleCloseWizard} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
               {wizardStep === 'SELECT_PLUGIN' && (
                   <span className="text-xs text-gray-500 self-center">Select a protocol to proceed</span>
               )}
               {wizardStep === 'CONFIG' && (
                  <div className="flex gap-2">
                     <button onClick={() => setWizardStep('SELECT_PLUGIN')} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Back</button>
                     <button 
                        onClick={() => setWizardStep('MAPPING')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                     >
                        Next Step <ChevronRight className="w-4 h-4 ml-1" />
                     </button>
                  </div>
               )}
               {wizardStep === 'MAPPING' && (
                  <div className="flex gap-2">
                     <button onClick={() => setWizardStep('CONFIG')} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Back</button>
                     <button 
                        onClick={handleCreateSource}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                     >
                        Deploy Source <CheckCircle className="w-4 h-4 ml-2" />
                     </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Live Tap Modal */}
      {tapSource && (
          <LiveTapModal 
              source={tapSource} 
              onClose={() => setTapSource(null)} 
          />
      )}
    </div>
  );
};