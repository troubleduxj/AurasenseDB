import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Play, Pause, Plus, Trash2, Activity, History, X, Calendar, Check, AlertCircle } from 'lucide-react';
import { Page } from '../types';

export const ComputingNative: React.FC = () => {
  const navigate = useNavigate();
  
  // Backfill State
  const [showBackfillModal, setShowBackfillModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [backfillRange, setBackfillRange] = useState('7d'); // 24h, 7d, 30d
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Streams Data
  const streams = [
      { 
          id: 's1', 
          name: 'stream_avg_voltage_1m', 
          status: 'RUNNING', 
          sql: 'SELECT avg(voltage) FROM power_db.meters INTERVAL(1m) SLIDING(1m)',
          target: 'meters_1m_avg',
          processed: '1.2M rows',
          lag: '0s'
      },
      { 
          id: 's2', 
          name: 'stream_max_temp_alert', 
          status: 'PAUSED', 
          sql: 'SELECT max(temperature) FROM factory_db.sensors WHERE temperature > 80',
          target: 'temp_alerts',
          processed: '450k rows',
          lag: 'N/A'
      }
  ];

  const handleOpenBackfill = (stream: any) => {
      setSelectedStream(stream);
      setShowBackfillModal(true);
      setBackfillRange('7d');
  };

  const handleRunBackfill = () => {
      setIsSubmitting(true);
      setTimeout(() => {
          setIsSubmitting(false);
          setShowBackfillModal(false);
          // In a real app, trigger a toast notification here
          alert(`Backfill job started for ${selectedStream.name} (Range: ${backfillRange})`);
      }, 1000);
  };

  // Generate Preview SQL based on selection
  const getPreviewSql = () => {
      if (!selectedStream) return '';
      
      let timeCondition = '';
      const now = new Date();
      let startDate = new Date();

      if (backfillRange === '24h') startDate.setDate(now.getDate() - 1);
      if (backfillRange === '7d') startDate.setDate(now.getDate() - 7);
      if (backfillRange === '30d') startDate.setDate(now.getDate() - 30);

      const startStr = startDate.toISOString().replace('T', ' ').substring(0, 19);
      const endStr = now.toISOString().replace('T', ' ').substring(0, 19);

      // Extract parts from original stream SQL for the preview
      // Very naive parser for demo purposes
      const fromPart = selectedStream.sql.split('FROM')[1] || '';
      
      return `-- Temporary Batch Job for Backfill
INSERT INTO ${selectedStream.target}
SELECT ${selectedStream.sql.split('SELECT')[1].split('FROM')[0]}
FROM ${fromPart}
WHERE ts >= '${startStr}' AND ts <= '${endStr}'
PARTITION BY tbname;`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Native Streams</h1>
           <p className="text-sm text-gray-400 mt-1">Lightweight, kernel-level continuous aggregation and downsampling.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
           <Plus className="w-4 h-4 mr-2" /> Create Native Stream
        </button>
      </div>

      <div className="grid gap-4">
          {streams.map((stream) => (
            <div key={stream.id} className={`bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-500/30 transition-all ${stream.status === 'PAUSED' ? 'opacity-75' : ''}`}>
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${stream.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-700 text-gray-500'}`}>
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className={`text-lg font-bold ${stream.status === 'RUNNING' ? 'text-gray-100' : 'text-gray-300'}`}>{stream.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                stream.status === 'RUNNING' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                                {stream.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 font-mono mb-2">{stream.sql}</p>
                        <div className="flex items-center text-xs text-gray-500 gap-4">
                            <span>Lag: <span className="text-gray-300">{stream.lag}</span></span>
                            <span>Processed: <span className="text-gray-300">{stream.processed}</span></span>
                            {stream.target && <span>Target: <span className="text-blue-300">{stream.target}</span></span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleOpenBackfill(stream)}
                        className="p-2 bg-gray-700 hover:bg-purple-600/20 hover:text-purple-400 text-gray-300 rounded-lg transition-colors group relative" 
                        title="Backfill History"
                    >
                        <History className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Backfill</span>
                    </button>
                    <button 
                        onClick={() => navigate(`/${Page.COMPUTING_MONITOR}`)}
                        className="p-2 bg-gray-700 hover:bg-blue-600/20 hover:text-blue-400 text-gray-300 rounded-lg transition-colors" 
                        title="View Monitor"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                    {stream.status === 'PAUSED' ? (
                        <button className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors" title="Resume">
                            <Play className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors" title="Pause">
                            <Pause className="w-4 h-4" />
                        </button>
                    )}
                    <button className="p-2 bg-gray-700 hover:bg-red-900/30 hover:text-red-400 text-gray-300 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
          ))}
      </div>
      
      {/* Creation Guide Placeholder */}
      <div className="bg-blue-500/5 border border-dashed border-blue-500/20 rounded-xl p-8 text-center mt-8">
          <h3 className="text-gray-300 font-medium mb-2">How Native Streams Work</h3>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-6">
              TDengine streams are persistent queries that run in the background. They process data in real-time as it arrives, automatically writing results to a target table. Ideal for downsampling and simple aggregation.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center"><span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2 text-xs">1</span> Define Source</div>
              <div className="flex items-center"><span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2 text-xs">2</span> Set Window</div>
              <div className="flex items-center"><span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2 text-xs">3</span> Auto Write</div>
          </div>
      </div>

      {/* Backfill Modal */}
      {showBackfillModal && selectedStream && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                      <div>
                          <h2 className="text-xl font-bold text-gray-100 flex items-center">
                              <History className="w-5 h-5 mr-2 text-purple-400" />
                              Backfill History Data
                          </h2>
                          <p className="text-xs text-gray-400 mt-1">
                              Re-calculate aggregation for <span className="text-blue-300 font-mono">{selectedStream.name}</span>
                          </p>
                      </div>
                      <button onClick={() => setShowBackfillModal(false)} className="text-gray-400 hover:text-white">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* Notice */}
                      <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                          <div className="text-sm text-blue-200">
                              <p className="font-bold mb-1">How Backfill Works</p>
                              <p className="text-blue-300/80 text-xs leading-relaxed">
                                  This operation initiates a temporary batch job to process historical data. 
                                  It reads raw data from the source table and inserts computed results into the target table.
                                  <br/>The active real-time stream will <span className="font-bold text-white">NOT</span> be interrupted.
                              </p>
                          </div>
                      </div>

                      {/* Time Range Selector */}
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" /> Select Time Range
                          </label>
                          <div className="flex gap-2">
                              {['24h', '7d', '30d'].map((range) => (
                                  <button
                                      key={range}
                                      onClick={() => setBackfillRange(range)}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                          backfillRange === range 
                                          ? 'bg-purple-600 text-white border-purple-500' 
                                          : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                      }`}
                                  >
                                      Last {range.toUpperCase()}
                                  </button>
                              ))}
                              <button disabled className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed">
                                  Custom Range
                              </button>
                          </div>
                      </div>

                      {/* SQL Preview */}
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Generated Batch SQL</label>
                          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 font-mono text-xs text-gray-300 overflow-x-auto relative">
                              <pre className="whitespace-pre-wrap">{getPreviewSql()}</pre>
                              <div className="absolute top-2 right-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Preview</div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                      <button 
                          onClick={() => setShowBackfillModal(false)} 
                          className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleRunBackfill}
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-900/20 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          {isSubmitting ? 'Submitting...' : (
                              <>
                                  <Play className="w-4 h-4 mr-2 fill-current" /> Start Backfill Job
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
