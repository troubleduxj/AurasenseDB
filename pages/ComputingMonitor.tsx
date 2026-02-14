import React from 'react';
import { Gauge, Activity, GitCommit, ArrowRight, Database, Server } from 'lucide-react';

export const ComputingMonitor: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Pipeline Monitor</h1>
           <p className="text-sm text-gray-400 mt-1">End-to-end visualization of data processing streams.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-[400px] relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> Healthy
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Backpressure
              </div>
          </div>

          <div className="flex items-center justify-center h-full pt-10 pb-10 gap-8">
              {/* Stage 1: Ingestion */}
              <div className="flex flex-col items-center gap-4 relative group">
                  <div className="w-40 p-4 bg-gray-900 border border-gray-600 rounded-xl flex flex-col items-center text-center z-10">
                      <div className="p-2 bg-gray-800 rounded-full mb-2">
                          <Server className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">MQTT Ingestion</h4>
                      <p className="text-xs text-gray-500 mt-1">45k msg/s</p>
                  </div>
              </div>

              {/* Arrow */}
              <div className="flex-1 h-0.5 bg-gray-600 relative">
                   <ArrowRight className="absolute -right-2 -top-2.5 w-5 h-5 text-gray-600" />
                   <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 bg-gray-800 px-1">Kafka Topic</div>
              </div>

              {/* Stage 2: Flink Job */}
              <div className="flex flex-col items-center gap-4 relative group">
                   <div className="absolute -top-8 text-xs text-yellow-500 font-bold animate-pulse">High Load</div>
                  <div className="w-40 p-4 bg-gray-900 border border-yellow-500/50 rounded-xl flex flex-col items-center text-center z-10 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                      <div className="p-2 bg-gray-800 rounded-full mb-2">
                          <Activity className="w-5 h-5 text-yellow-400" />
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">Flink ETL Job</h4>
                      <p className="text-xs text-gray-500 mt-1">Lag: 1.2s</p>
                  </div>
              </div>

              {/* Arrow */}
              <div className="flex-1 h-0.5 bg-gray-600 relative">
                   <ArrowRight className="absolute -right-2 -top-2.5 w-5 h-5 text-gray-600" />
              </div>

              {/* Stage 3: TDengine */}
              <div className="flex flex-col items-center gap-4 relative group">
                  <div className="w-40 p-4 bg-gray-900 border border-blue-500 rounded-xl flex flex-col items-center text-center z-10">
                      <div className="p-2 bg-gray-800 rounded-full mb-2">
                          <Database className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">TDengine Storage</h4>
                      <p className="text-xs text-gray-500 mt-1">power_db.meters</p>
                  </div>
              </div>

              {/* Arrow */}
              <div className="flex-1 h-0.5 bg-gray-600 relative">
                   <ArrowRight className="absolute -right-2 -top-2.5 w-5 h-5 text-gray-600" />
                   <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 bg-gray-800 px-1">Native Stream</div>
              </div>

               {/* Stage 4: Aggregation */}
               <div className="flex flex-col items-center gap-4 relative group">
                  <div className="w-40 p-4 bg-gray-900 border border-green-500 rounded-xl flex flex-col items-center text-center z-10">
                      <div className="p-2 bg-gray-800 rounded-full mb-2">
                          <Gauge className="w-5 h-5 text-green-400" />
                      </div>
                      <h4 className="font-bold text-gray-200 text-sm">1min Aggregation</h4>
                      <p className="text-xs text-gray-500 mt-1">Continuous Query</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="font-bold text-gray-200 mb-4">Throughput (Records/sec)</h3>
              <div className="h-40 flex items-end gap-1">
                  {[40, 65, 45, 80, 55, 70, 60, 90, 85, 75, 60, 50, 65, 70, 80, 95, 85, 70, 60, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors rounded-t" style={{height: `${h}%`}}></div>
                  ))}
              </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="font-bold text-gray-200 mb-4">Checkpoint Duration (ms)</h3>
              <div className="h-40 flex items-end gap-1">
                  {[20, 22, 21, 25, 20, 22, 23, 21, 22, 20, 25, 28, 30, 25, 22, 21, 20, 22, 21, 20].map((h, i) => (
                      <div key={i} className="flex-1 bg-green-500/20 hover:bg-green-500/40 transition-colors rounded-t" style={{height: `${h * 2}%`}}></div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};