import React from 'react';
import { Webhook, Plus, Copy, Power, MoreVertical, PlayCircle } from 'lucide-react';

const MOCK_APIS = [
    { id: 'api_01', path: '/v1/stats/voltage', method: 'GET', sql: 'SELECT avg(voltage) FROM meters...', status: 'Active', latency: '45ms', hits: '12.5k' },
    { id: 'api_02', path: '/v1/alerts/recent', method: 'GET', sql: 'SELECT * FROM alerts WHERE severity > 2...', status: 'Active', latency: '120ms', hits: '3.2k' },
    { id: 'api_03', path: '/v1/report/daily', method: 'POST', sql: 'SELECT max(val) FROM sensors WHERE...', status: 'Inactive', latency: '-', hits: '0' },
];

export const QueryApi: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">Query as API</h1>
           <p className="text-sm text-gray-400 mt-1">Publish SQL queries as RESTful endpoints for 3rd-party integration.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
           <Plus className="w-4 h-4 mr-2" /> New Endpoint
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-gray-700/50 text-gray-400 text-xs uppercase border-b border-gray-700">
                      <th className="p-4 font-medium">Endpoint Path</th>
                      <th className="p-4 font-medium text-center">Method</th>
                      <th className="p-4 font-medium">Underlying SQL</th>
                      <th className="p-4 font-medium text-center">Status</th>
                      <th className="p-4 font-medium text-center">Avg Latency</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                  {MOCK_APIS.map(api => (
                      <tr key={api.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="p-4">
                              <div className="flex items-center gap-2">
                                  <div className="p-2 bg-gray-700 rounded text-purple-400">
                                      <Webhook className="w-4 h-4" />
                                  </div>
                                  <div>
                                      <span className="font-mono text-sm text-gray-200">{api.path}</span>
                                      <span className="block text-xs text-gray-500">ID: {api.id}</span>
                                  </div>
                              </div>
                          </td>
                          <td className="p-4 text-center">
                              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{api.method}</span>
                          </td>
                          <td className="p-4">
                              <code className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-700 block truncate max-w-[200px]">
                                  {api.sql}
                              </code>
                          </td>
                          <td className="p-4 text-center">
                              {api.status === 'Active' ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                      Active
                                  </span>
                              ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                                      Inactive
                                  </span>
                              )}
                          </td>
                          <td className="p-4 text-center text-sm text-gray-300 font-mono">{api.latency}</td>
                          <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition" title="Test">
                                      <PlayCircle className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition" title="Copy URL">
                                      <Copy className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition" title="Disable">
                                      <Power className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition">
                                      <MoreVertical className="w-4 h-4" />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};