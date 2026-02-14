import React from 'react';
import { Users, Database, HardDrive, Network, Plus, MoreHorizontal } from 'lucide-react';

const TENANTS = [
    { id: 't_001', name: 'Power Corp', db: 'power_db', storage: 450, quota: 1000, conns: 120, maxConns: 500, status: 'Active' },
    { id: 't_002', name: 'Smart Factory Inc', db: 'factory_db', storage: 850, quota: 1000, conns: 480, maxConns: 500, status: 'Warning' },
    { id: 't_003', name: 'Fleet Logistics', db: 'fleet_db', storage: 120, quota: 2000, conns: 50, maxConns: 1000, status: 'Active' },
];

export const OperationsTenants: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">Multi-Tenancy</h1>
             <p className="text-sm text-gray-400 mt-1">Manage tenant databases, resource quotas, and access control.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
             <Plus className="w-4 h-4 mr-2" /> New Tenant
          </button>
       </div>

       <div className="grid grid-cols-1 gap-6">
           {TENANTS.map(tenant => (
               <div key={tenant.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row md:items-center gap-6">
                   <div className="w-full md:w-64 shrink-0">
                       <div className="flex items-center gap-3 mb-2">
                           <div className="p-3 bg-gray-700 rounded-lg text-gray-300">
                               <Users className="w-6 h-6" />
                           </div>
                           <div>
                               <h3 className="font-bold text-gray-100">{tenant.name}</h3>
                               <p className="text-xs text-gray-500 font-mono">ID: {tenant.id}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-400">
                           <Database className="w-4 h-4" /> 
                           <span className="font-mono text-blue-300">{tenant.db}</span>
                       </div>
                   </div>

                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Storage Quota */}
                       <div>
                           <div className="flex justify-between text-sm mb-2">
                               <span className="text-gray-400 flex items-center"><HardDrive className="w-4 h-4 mr-2"/> Storage Quota</span>
                               <span className="text-gray-200">{tenant.storage} GB <span className="text-gray-600">/ {tenant.quota} GB</span></span>
                           </div>
                           <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${tenant.storage / tenant.quota > 0.8 ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                                 style={{width: `${(tenant.storage / tenant.quota) * 100}%`}}
                               ></div>
                           </div>
                       </div>

                       {/* Connection Quota */}
                       <div>
                           <div className="flex justify-between text-sm mb-2">
                               <span className="text-gray-400 flex items-center"><Network className="w-4 h-4 mr-2"/> Connections</span>
                               <span className="text-gray-200">{tenant.conns} <span className="text-gray-600">/ {tenant.maxConns}</span></span>
                           </div>
                           <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${tenant.conns / tenant.maxConns > 0.9 ? 'bg-red-500' : 'bg-green-500'}`} 
                                 style={{width: `${(tenant.conns / tenant.maxConns) * 100}%`}}
                               ></div>
                           </div>
                       </div>
                   </div>

                   <div className="w-full md:w-auto flex items-center justify-end gap-3 pl-4 border-l border-gray-700">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                           tenant.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                       }`}>
                           {tenant.status}
                       </span>
                       <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                           <MoreHorizontal className="w-5 h-5" />
                       </button>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};