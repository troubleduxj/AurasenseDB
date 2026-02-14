import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Database, Server, Zap } from 'lucide-react';

const data = Array.from({ length: 24 }, (_, i) => ({
  name: `${i}:00`,
  ingestion: Math.floor(Math.random() * 5000) + 2000,
  queries: Math.floor(Math.random() * 1000) + 100,
}));

const Card: React.FC<{ title: string; value: string; sub: string; icon: React.ElementType; color: string }> = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-24 h-24" />
    </div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg bg-gray-700/50 ${color.replace('text-', 'text-opacity-100 ')}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="relative z-10">
      <span className="text-3xl font-bold text-gray-100 block mb-1">{value}</span>
      <span className="text-xs text-gray-500 font-mono">{sub}</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">System Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Cluster Healthy
          </span>
          <span className="mx-2">|</span>
          <span>Last updated: just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Ingestion Rate" value="45.2K" sub="Rows / Second" icon={Zap} color="text-yellow-400" />
        <Card title="Total Storage" value="12.8 TB" sub="Compressed Data" icon={Database} color="text-blue-400" />
        <Card title="Active Nodes" value="4/4" sub="100% Availability" icon={Server} color="text-green-400" />
        <Card title="QPS" value="1,240" sub="Queries / Second" icon={Activity} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Traffic Trend (24h)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIngestion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#93c5fd' }}
                />
                <Area type="monotone" dataKey="ingestion" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIngestion)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Resource Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(18)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  cursor={{fill: '#374151', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                />
                <Bar dataKey="queries" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};