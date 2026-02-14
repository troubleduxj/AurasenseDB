import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCog, Upload, RefreshCw, XCircle, PauseCircle, PlayCircle, MoreHorizontal, Gauge } from 'lucide-react';
import { Page } from '../types';

const MOCK_JOBS = [
    { id: 'job_a1b2c3d4', name: 'Kafka to TDengine Sync', type: 'SQL', state: 'RUNNING', uptime: '4d 2h 15m', parallelism: 4, restarts: 0 },
    { id: 'job_e5f6g7h8', name: 'Complex Event Processing (CEP)', type: 'JAR', state: 'RUNNING', uptime: '12h 45m', parallelism: 8, restarts: 2 },
    { id: 'job_i9j0k1l2', name: 'Historical Replay 2023', type: 'SQL', state: 'FAILED', uptime: '-', parallelism: 2, restarts: 5 },
];

export const ComputingFlinkJobs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Flink Job Manager</h1>
           <p className="text-sm text-gray-400 mt-1">Manage stateful stream processing jobs running on the Flink cluster.</p>
        </div>
        <div className="flex gap-3">
             <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-600 flex items-center">
                <Upload className="w-4 h-4 mr-2" /> Upload JAR
             </button>
             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
             </button>
        </div>
      </div>

      {/* Cluster Stats */}
      <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Task Managers</p>
              <p className="text-2xl font-bold text-gray-100">3 <span className="text-sm font-normal text-green-400">Online</span></p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Total Slots</p>
              <p className="text-2xl font-bold text-gray-100">24 <span className="text-sm font-normal text-gray-500">Available</span></p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Running Jobs</p>
              <p className="text-2xl font-bold text-blue-400">2</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Failed Jobs (24h)</p>
              <p className="text-2xl font-bold text-red-400">1</p>
          </div>
      </div>

      {/* Job List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-gray-700/50 text-gray-400 text-xs uppercase border-b border-gray-700">
                      <th className="p-4 font-medium">Job Name / ID</th>
                      <th className="p-4 font-medium text-center">Type</th>
                      <th className="p-4 font-medium text-center">State</th>
                      <th className="p-4 font-medium text-center">Uptime</th>
                      <th className="p-4 font-medium text-center">Parallelism</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                  {MOCK_JOBS.map(job => (
                      <tr key={job.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="p-4">
                              <div className="flex items-center">
                                  <div className="p-2 bg-gray-700 rounded-lg mr-3 text-gray-400">
                                      <ServerCog className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <p className="font-semibold text-gray-200">{job.name}</p>
                                      <p className="text-xs text-gray-500 font-mono">{job.id}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="p-4 text-center">
                              <span className="text-xs font-mono bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">{job.type}</span>
                          </td>
                          <td className="p-4 text-center">
                              {job.state === 'RUNNING' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"><PlayCircle className="w-3 h-3 mr-1"/> RUNNING</span>}
                              {job.state === 'FAILED' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3 mr-1"/> FAILED</span>}
                              {job.state === 'FINISHED' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">FINISHED</span>}
                          </td>
                          <td className="p-4 text-center text-sm text-gray-300 font-mono">
                              {job.uptime}
                          </td>
                          <td className="p-4 text-center">
                              <div className="w-24 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden relative">
                                  <div className="absolute top-0 left-0 h-full bg-blue-500" style={{width: `${(job.parallelism / 24) * 100}%`}}></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1 block">{job.parallelism} / 24 Slots</span>
                          </td>
                          <td className="p-4 text-right">
                              <button 
                                  onClick={() => navigate(`/${Page.COMPUTING_MONITOR}`)}
                                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors mr-1"
                                  title="Monitor Pipeline"
                              >
                                  <Gauge className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                                  <MoreHorizontal className="w-5 h-5" />
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};