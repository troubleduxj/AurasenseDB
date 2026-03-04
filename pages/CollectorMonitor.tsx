import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Database, Server, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DATA_THROUGHPUT = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  ingress: Math.floor(Math.random() * 5000) + 2000,
  egress: Math.floor(Math.random() * 4500) + 1800,
}));

const ERROR_RATES = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  errors: Math.floor(Math.random() * 50),
  warnings: Math.floor(Math.random() * 150),
}));

export const CollectorMonitor: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Collector Monitoring</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time metrics, throughput analysis, and health status of the collection layer.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Status: Healthy
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap className="w-24 h-24" />
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase">Total Throughput</p>
          <div className="flex items-end gap-2 mt-2">
            <h3 className="text-3xl font-bold text-gray-100">4.2 GB/s</h3>
            <span className="text-green-400 text-xs flex items-center mb-1"><ArrowUpRight className="w-3 h-3 mr-0.5" /> +12%</span>
          </div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-24 h-24" />
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase">Events Processed</p>
          <div className="flex items-end gap-2 mt-2">
            <h3 className="text-3xl font-bold text-gray-100">850K</h3>
            <span className="text-gray-500 text-xs mb-1">per second</span>
          </div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Server className="w-24 h-24" />
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase">Active Agents</p>
          <div className="flex items-end gap-2 mt-2">
            <h3 className="text-3xl font-bold text-gray-100">182</h3>
            <span className="text-green-400 text-xs flex items-center mb-1"><ArrowUpRight className="w-3 h-3 mr-0.5" /> +3</span>
          </div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase">Error Rate</p>
          <div className="flex items-end gap-2 mt-2">
            <h3 className="text-3xl font-bold text-green-400">0.02%</h3>
            <span className="text-green-400 text-xs flex items-center mb-1"><ArrowDownRight className="w-3 h-3 mr-0.5" /> -0.01%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-gray-100 mb-6">Network Throughput (24h)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_THROUGHPUT}>
                <defs>
                  <linearGradient id="colorIngress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                />
                <Legend />
                <Area type="monotone" dataKey="ingress" name="Ingress (MB/s)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIngress)" />
                <Area type="monotone" dataKey="egress" name="Egress (MB/s)" stroke="#10b981" fillOpacity={1} fill="url(#colorEgress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-gray-100 mb-6">Error & Warning Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ERROR_RATES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  cursor={{fill: '#374151', opacity: 0.4}}
                />
                <Legend />
                <Bar dataKey="errors" name="Errors" fill="#ef4444" stackId="a" />
                <Bar dataKey="warnings" name="Warnings" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
