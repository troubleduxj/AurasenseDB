import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, RefreshCw, Trash2, CheckCircle, Search, FileJson, ArrowRight, ExternalLink, Play, X, AlertTriangle, GitMerge } from 'lucide-react';
import { Page } from '../types';

interface DeadLetter {
    id: string;
    ts: string;
    sourceId: string;
    sourceName: string;
    errorType: 'Schema Mismatch' | 'Parse Error' | 'Missing Field' | 'Type Error';
    errorMessage: string;
    payload: string;
    status: 'Pending' | 'Replayed' | 'Discarded';
}

const MOCK_DLQ: DeadLetter[] = [
    {
        id: 'msg_001',
        ts: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        sourceId: 'ds_001',
        sourceName: 'Factory A IoT Gateway',
        errorType: 'Schema Mismatch',
        errorMessage: "Field 'voltage' expected FLOAT, got STRING 'high'",
        payload: JSON.stringify({ device_id: 'sensor_01', voltage: 'high', ts: 1678888800000 }, null, 2),
        status: 'Pending'
    },
    {
        id: 'msg_002',
        ts: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        sourceId: 'ds_002',
        sourceName: 'Vehicle Fleet Stream',
        errorType: 'Missing Field',
        errorMessage: "Required field 'vin' is missing",
        payload: JSON.stringify({ speed: 85, gps: { lat: 34.0, lng: -118.2 } }, null, 2),
        status: 'Pending'
    },
    {
        id: 'msg_003',
        ts: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        sourceId: 'ds_003',
        sourceName: 'Weather API Poller',
        errorType: 'Parse Error',
        errorMessage: "Unexpected token in JSON at position 45",
        payload: '{"city": "London", "temp": 12.5, "humidity": 60, ...TRUNCATED',
        status: 'Discarded'
    }
];

export const IngestionDLQ: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DeadLetter[]>(MOCK_DLQ);
  const [selectedMsg, setSelectedMsg] = useState<DeadLetter | null>(null);
  const [editPayload, setEditPayload] = useState('');
  const [filter, setFilter] = useState('');
  const [isReplaying, setIsReplaying] = useState(false);

  // Stats
  const stats = {
      total: messages.length,
      pending: messages.filter(m => m.status === 'Pending').length,
      replayed: messages.filter(m => m.status === 'Replayed').length,
  };

  const handleOpenDetail = (msg: DeadLetter) => {
      setSelectedMsg(msg);
      setEditPayload(msg.payload);
  };

  const handleCloseDetail = () => {
      setSelectedMsg(null);
      setEditPayload('');
  };

  const handleReplay = (id: string) => {
      setIsReplaying(true);
      setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'Replayed' } : m));
          setIsReplaying(false);
          handleCloseDetail();
      }, 800);
  };

  const handleDelete = (id: string) => {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMsg?.id === id) handleCloseDetail();
  };

  const handleNavigateToMapping = (sourceId: string) => {
      navigate(`/${Page.INGESTION_MAPPING}?sourceId=${sourceId}`);
  };

  const filteredMessages = messages.filter(m => 
      m.sourceName.toLowerCase().includes(filter.toLowerCase()) || 
      m.errorType.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100 flex items-center">
               <AlertOctagon className="w-6 h-6 mr-3 text-red-500" />
               Exception Data Center (DLQ)
           </h1>
           <p className="text-sm text-gray-400 mt-1">Manage, fix, and replay failed ingestion messages.</p>
        </div>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-600 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Queue
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Pending Fix</p>
                  <p className="text-2xl font-bold text-red-400">{stats.pending}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                  <AlertTriangle className="w-6 h-6" />
              </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Successfully Replayed</p>
                  <p className="text-2xl font-bold text-green-400">{stats.replayed}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                  <CheckCircle className="w-6 h-6" />
              </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Events</p>
                  <p className="text-2xl font-bold text-gray-200">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <FileJson className="w-6 h-6" />
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col min-h-[500px]">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                      type="text" 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Search by source or error type..."
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                  />
              </div>
              <div className="flex gap-2">
                  <button className="px-3 py-2 text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 rounded-lg flex items-center">
                      <Trash2 className="w-3 h-3 mr-1.5" /> Clear All Discarded
                  </button>
                  <button className="px-3 py-2 text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20 rounded-lg flex items-center">
                      <Play className="w-3 h-3 mr-1.5" /> Replay All
                  </button>
              </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-750 text-xs text-gray-400 uppercase sticky top-0 bg-gray-800 z-10">
                      <tr>
                          <th className="p-4 border-b border-gray-700 font-medium">Timestamp</th>
                          <th className="p-4 border-b border-gray-700 font-medium">Source</th>
                          <th className="p-4 border-b border-gray-700 font-medium">Error Type</th>
                          <th className="p-4 border-b border-gray-700 font-medium">Message Details</th>
                          <th className="p-4 border-b border-gray-700 font-medium text-center">Status</th>
                          <th className="p-4 border-b border-gray-700 font-medium text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 text-sm">
                      {filteredMessages.map(msg => (
                          <tr key={msg.id} className="hover:bg-gray-700/30 transition-colors group">
                              <td className="p-4 text-gray-400 whitespace-nowrap font-mono text-xs">
                                  {msg.ts}
                              </td>
                              <td className="p-4 text-gray-200">
                                  {msg.sourceName}
                                  <span className="block text-xs text-gray-500">{msg.sourceId}</span>
                              </td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      msg.errorType === 'Schema Mismatch' ? 'bg-orange-500/20 text-orange-400' :
                                      msg.errorType === 'Parse Error' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                      {msg.errorType}
                                  </span>
                              </td>
                              <td className="p-4 max-w-xs">
                                  <p className="truncate text-gray-300" title={msg.errorMessage}>{msg.errorMessage}</p>
                                  <code className="text-xs text-gray-500 block truncate font-mono mt-1 opacity-70">{msg.payload}</code>
                              </td>
                              <td className="p-4 text-center">
                                  {msg.status === 'Pending' && <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Pending"></span>}
                                  {msg.status === 'Replayed' && <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Replayed"></span>}
                                  {msg.status === 'Discarded' && <span className="inline-block w-2 h-2 rounded-full bg-gray-500" title="Discarded"></span>}
                              </td>
                              <td className="p-4 text-right">
                                  <button 
                                      onClick={() => handleOpenDetail(msg)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
                                  >
                                      Inspect & Fix
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {filteredMessages.length === 0 && (
                          <tr>
                              <td colSpan={6} className="p-12 text-center text-gray-500">
                                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                  <p>No exception messages found matching criteria.</p>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Inspect Drawer/Modal */}
      {selectedMsg && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-xl bg-gray-800 border-l border-gray-700 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-750">
                      <div>
                          <h2 className="text-lg font-bold text-gray-100 flex items-center">
                              <FileJson className="w-5 h-5 mr-2 text-blue-400" /> Message Inspector
                          </h2>
                          <p className="text-xs text-gray-500 font-mono mt-1">{selectedMsg.id}</p>
                      </div>
                      <button onClick={handleCloseDetail} className="text-gray-400 hover:text-white">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Error Info */}
                      <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4">
                          <h4 className="text-red-400 font-bold text-sm mb-1 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              {selectedMsg.errorType}
                          </h4>
                          <p className="text-red-200 text-sm">{selectedMsg.errorMessage}</p>
                      </div>

                      {/* Source Info */}
                      <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <div>
                              <p className="text-xs text-gray-500 uppercase">Source</p>
                              <p className="text-sm font-bold text-gray-200">{selectedMsg.sourceName}</p>
                          </div>
                          <button 
                              onClick={() => handleNavigateToMapping(selectedMsg.sourceId)}
                              className="text-xs flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                          >
                              <GitMerge className="w-3 h-3 mr-1" /> Fix Mapping Rules
                          </button>
                      </div>

                      {/* Payload Editor */}
                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-300">Message Payload</label>
                              <span className="text-xs text-gray-500">JSON Format</span>
                          </div>
                          <textarea 
                              value={editPayload}
                              onChange={(e) => setEditPayload(e.target.value)}
                              className="w-full h-96 bg-[#1e1e1e] border border-gray-600 rounded-lg p-4 font-mono text-sm text-blue-300 outline-none focus:border-blue-500 resize-none leading-relaxed"
                              spellCheck={false}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                              You can manually correct the data payload here before replaying.
                          </p>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-between items-center">
                       <button 
                          onClick={() => handleDelete(selectedMsg.id)}
                          className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors flex items-center"
                       >
                           <Trash2 className="w-4 h-4 mr-2" /> Discard
                       </button>
                       <div className="flex gap-3">
                           <button onClick={handleCloseDetail} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                           <button 
                              onClick={() => handleReplay(selectedMsg.id)}
                              disabled={isReplaying || selectedMsg.status === 'Replayed'}
                              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-900/20 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {isReplaying ? 'Replaying...' : (
                                  <>
                                      <Play className="w-4 h-4 mr-2 fill-current" /> Replay Message
                                  </>
                              )}
                           </button>
                       </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
