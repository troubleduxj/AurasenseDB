import React from 'react';
import { Bell, AlertTriangle, Plus, Activity, Mail } from 'lucide-react';

export const OperationsAlerts: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">Alerting Center</h1>
             <p className="text-sm text-gray-400 mt-1">Configure monitoring rules and notification channels.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
             <Plus className="w-4 h-4 mr-2" /> New Alert Rule
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-4">
               <h3 className="font-bold text-gray-200">Active Rules</h3>
               {[
                   { name: 'High WAL Delay', cond: 'wal_fsync_delay > 100ms for 5m', severity: 'Critical', status: 'Firing' },
                   { name: 'Disk Space Low', cond: 'disk_usage > 85%', severity: 'Warning', status: 'OK' },
                   { name: 'Node Offline', cond: 'status != "Ready"', severity: 'Critical', status: 'OK' },
               ].map((rule, i) => (
                   <div key={i} className={`bg-gray-800 rounded-xl border p-4 flex items-center justify-between ${rule.status === 'Firing' ? 'border-red-500/50 bg-red-900/10' : 'border-gray-700'}`}>
                       <div className="flex items-center gap-4">
                           <div className={`p-2 rounded-lg ${rule.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                               <AlertTriangle className="w-5 h-5" />
                           </div>
                           <div>
                               <h4 className="font-bold text-gray-100">{rule.name}</h4>
                               <p className="text-sm text-gray-400 font-mono">{rule.cond}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-4">
                           {rule.status === 'Firing' && <span className="animate-pulse text-red-400 font-bold text-sm">FIRING</span>}
                           <div className={`w-3 h-3 rounded-full ${rule.status === 'Firing' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                       </div>
                   </div>
               ))}
           </div>

           <div>
               <h3 className="font-bold text-gray-200 mb-4">Notification Channels</h3>
               <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
                   <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                       <div className="flex items-center gap-3 text-sm text-gray-300">
                           <Mail className="w-4 h-4 text-blue-400" /> DevOps Team Email
                       </div>
                       <span className="text-xs text-green-400">Active</span>
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                       <div className="flex items-center gap-3 text-sm text-gray-300">
                           <Activity className="w-4 h-4 text-purple-400" /> Slack #alerts
                       </div>
                       <span className="text-xs text-green-400">Active</span>
                   </div>
                   <button className="w-full py-2 border border-dashed border-gray-600 rounded text-xs text-gray-500 hover:text-gray-300 hover:border-gray-500">
                       + Add Channel
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};