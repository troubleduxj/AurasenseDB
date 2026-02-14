
import React, { useState } from 'react';
import { Users, Database, HardDrive, Network, Plus, MoreHorizontal, Shield, Clock, Key, Ban, CheckCircle, Activity, Search, X, Save } from 'lucide-react';

// --- Types ---
interface Tenant {
    id: string;
    name: string;
    company: string;
    dbName: string;
    plan: 'Starter' | 'Professional' | 'Enterprise';
    status: 'Active' | 'Suspended' | 'Provisioning';
    createdAt: string;
    resources: {
        storageUsed: number; // GB
        storageLimit: number; // GB
        tablesUsed: number;
        tablesLimit: number;
        connections: number;
        maxConnections: number;
    };
    config: {
        retentionDays: number;
        replicas: number;
    };
}

// --- Mock Data ---
const INITIAL_TENANTS: Tenant[] = [
    { 
        id: 'tenant_001', 
        name: 'Power Corp', 
        company: 'Global Power Inc.',
        dbName: 't_power_corp', 
        plan: 'Enterprise',
        status: 'Active',
        createdAt: '2023-01-15',
        resources: { storageUsed: 450, storageLimit: 1000, tablesUsed: 1200, tablesLimit: 5000, connections: 120, maxConnections: 500 },
        config: { retentionDays: 3650, replicas: 3 }
    },
    { 
        id: 'tenant_002', 
        name: 'Smart Factory', 
        company: 'AutoParts Mfg',
        dbName: 't_smart_fact', 
        plan: 'Professional',
        status: 'Active',
        createdAt: '2023-03-22',
        resources: { storageUsed: 850, storageLimit: 1000, tablesUsed: 4500, tablesLimit: 5000, connections: 480, maxConnections: 500 },
        config: { retentionDays: 365, replicas: 1 }
    },
    { 
        id: 'tenant_003', 
        name: 'Fleet Logistics', 
        company: 'FastMove Logistics',
        dbName: 't_fleet_logs', 
        plan: 'Starter',
        status: 'Suspended',
        createdAt: '2023-06-10',
        resources: { storageUsed: 120, storageLimit: 200, tablesUsed: 50, tablesLimit: 100, connections: 0, maxConnections: 50 },
        config: { retentionDays: 90, replicas: 1 }
    },
];

export const OperationsTenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // New Tenant Form State
  const [newTenant, setNewTenant] = useState({
      name: '',
      company: '',
      plan: 'Starter'
  });

  const handleCreateTenant = () => {
      const dbName = `t_${newTenant.name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random()*1000)}`;
      const limits = newTenant.plan === 'Enterprise' 
        ? { storage: 5000, tables: 50000, conns: 2000, rep: 3, ret: 3650 }
        : newTenant.plan === 'Professional'
        ? { storage: 1000, tables: 5000, conns: 500, rep: 2, ret: 365 }
        : { storage: 200, tables: 100, conns: 50, rep: 1, ret: 90 };

      const tenant: Tenant = {
          id: `tenant_${Date.now()}`,
          name: newTenant.name,
          company: newTenant.company,
          dbName: dbName,
          plan: newTenant.plan as any,
          status: 'Provisioning',
          createdAt: new Date().toISOString().split('T')[0],
          resources: {
              storageUsed: 0,
              storageLimit: limits.storage,
              tablesUsed: 0,
              tablesLimit: limits.tables,
              connections: 0,
              maxConnections: limits.conns
          },
          config: { retentionDays: limits.ret, replicas: limits.rep }
      };

      setTenants([tenant, ...tenants]);
      setShowModal(false);
      setNewTenant({ name: '', company: '', plan: 'Starter' });

      // Simulate Provisioning
      setTimeout(() => {
          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: 'Active' } : t));
      }, 2000);
  };

  const toggleStatus = (id: string) => {
      setTenants(prev => prev.map(t => {
          if (t.id === id) {
              return { ...t, status: t.status === 'Active' ? 'Suspended' : 'Active' };
          }
          return t;
      }));
  };

  const getUsageColor = (used: number, limit: number) => {
      const ratio = used / limit;
      if (ratio > 0.9) return 'bg-red-500';
      if (ratio > 0.75) return 'bg-yellow-500';
      return 'bg-blue-500';
  };

  const filteredTenants = tenants.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.dbName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">Multi-Tenancy Management</h1>
             <p className="text-sm text-gray-400 mt-1">Manage tenant databases, resource quotas, and access credentials.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tenants..." 
                    className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 outline-none w-64" 
                />
             </div>
             <button 
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
             >
                <Plus className="w-4 h-4 mr-2" /> Provision Tenant
             </button>
          </div>
       </div>

       {/* Tenant Cards */}
       <div className="grid grid-cols-1 gap-6">
           {filteredTenants.map(tenant => (
               <div key={tenant.id} className={`bg-gray-800 rounded-xl border p-6 flex flex-col md:flex-row md:items-start gap-6 transition-all ${tenant.status === 'Suspended' ? 'border-red-900/30 opacity-75 grayscale-[0.5]' : 'border-gray-700 hover:border-blue-500/30'}`}>
                   
                   {/* Info Column */}
                   <div className="w-full md:w-64 shrink-0 border-r border-gray-700/50 pr-6">
                       <div className="flex items-center gap-3 mb-2">
                           <div className={`p-3 rounded-lg ${tenant.status === 'Active' ? 'bg-blue-500/20 text-blue-400' : tenant.status === 'Provisioning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                               <Users className="w-6 h-6" />
                           </div>
                           <div>
                               <h3 className="font-bold text-gray-100">{tenant.name}</h3>
                               <p className="text-xs text-gray-500">{tenant.company}</p>
                           </div>
                       </div>
                       
                       <div className="space-y-2 mt-4">
                           <div className="flex items-center justify-between text-xs">
                               <span className="text-gray-500 flex items-center"><Database className="w-3 h-3 mr-1.5"/> Database</span>
                               <span className="text-blue-300 font-mono bg-blue-900/20 px-1.5 rounded">{tenant.dbName}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs">
                               <span className="text-gray-500 flex items-center"><Shield className="w-3 h-3 mr-1.5"/> Plan</span>
                               <span className="text-gray-300">{tenant.plan}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs">
                               <span className="text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1.5"/> Created</span>
                               <span className="text-gray-300">{tenant.createdAt}</span>
                           </div>
                       </div>

                       <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                               tenant.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                               tenant.status === 'Provisioning' ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' :
                               'bg-red-500/10 text-red-500 border border-red-500/20'
                           }`}>
                               {tenant.status}
                           </span>
                           <div className="flex gap-1">
                                <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Access Keys">
                                    <Key className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => toggleStatus(tenant.id)}
                                    className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400" 
                                    title={tenant.status === 'Active' ? "Suspend" : "Activate"}
                                >
                                    {tenant.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                           </div>
                       </div>
                   </div>

                   {/* Resources Column */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                       <h4 className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-[-10px]">Resource Quotas & Usage</h4>
                       
                       {/* Storage Quota */}
                       <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-400 flex items-center"><HardDrive className="w-4 h-4 mr-2 text-gray-500"/> Storage</span>
                               <span className="text-gray-200">{tenant.resources.storageUsed} GB <span className="text-gray-500">/ {tenant.resources.storageLimit} GB</span></span>
                           </div>
                           <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${getUsageColor(tenant.resources.storageUsed, tenant.resources.storageLimit)}`} 
                                 style={{width: `${(tenant.resources.storageUsed / tenant.resources.storageLimit) * 100}%`}}
                               ></div>
                           </div>
                           <p className="text-[10px] text-gray-500">Retention: {tenant.config.retentionDays} Days</p>
                       </div>

                       {/* Connections Quota */}
                       <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-400 flex items-center"><Network className="w-4 h-4 mr-2 text-gray-500"/> Connections</span>
                               <span className="text-gray-200">{tenant.resources.connections} <span className="text-gray-500">/ {tenant.resources.maxConnections}</span></span>
                           </div>
                           <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${getUsageColor(tenant.resources.connections, tenant.resources.maxConnections)}`} 
                                 style={{width: `${(tenant.resources.connections / tenant.resources.maxConnections) * 100}%`}}
                               ></div>
                           </div>
                           <p className="text-[10px] text-gray-500">Ingress Limit</p>
                       </div>

                       {/* Table Count */}
                       <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-400 flex items-center"><Activity className="w-4 h-4 mr-2 text-gray-500"/> Tables</span>
                               <span className="text-gray-200">{tenant.resources.tablesUsed.toLocaleString()} <span className="text-gray-500">/ {tenant.resources.tablesLimit.toLocaleString()}</span></span>
                           </div>
                           <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${getUsageColor(tenant.resources.tablesUsed, tenant.resources.tablesLimit)}`} 
                                 style={{width: `${(tenant.resources.tablesUsed / tenant.resources.tablesLimit) * 100}%`}}
                               ></div>
                           </div>
                           <p className="text-[10px] text-gray-500">Devices / Sub-tables</p>
                       </div>

                       {/* Configs */}
                       <div className="flex items-center gap-4 text-xs text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                           <div className="flex flex-col">
                               <span className="uppercase text-[10px] text-gray-500">Replica</span>
                               <span className="text-gray-200 font-mono">{tenant.config.replicas} Copies</span>
                           </div>
                           <div className="w-px h-6 bg-gray-700"></div>
                           <div className="flex flex-col">
                               <span className="uppercase text-[10px] text-gray-500">VGroups</span>
                               <span className="text-gray-200 font-mono">Auto (2-12)</span>
                           </div>
                           <div className="w-px h-6 bg-gray-700"></div>
                           <div className="flex flex-col">
                               <span className="uppercase text-[10px] text-gray-500">Isolation</span>
                               <span className="text-green-400 font-bold">Physical DB</span>
                           </div>
                       </div>
                   </div>
               </div>
           ))}
       </div>

       {/* Provisioning Modal */}
       {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
               <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                   <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                       <div>
                           <h2 className="text-xl font-bold text-gray-100 flex items-center">
                               <Plus className="w-5 h-5 mr-2 text-blue-400" /> Provision Tenant
                           </h2>
                           <p className="text-xs text-gray-400 mt-1">This will create a dedicated Database and User in TDengine.</p>
                       </div>
                       <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                   </div>
                   
                   <div className="p-6 space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Tenant Name <span className="text-red-400">*</span></label>
                           <input 
                               type="text" 
                               value={newTenant.name}
                               onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                               placeholder="e.g. Acme Corp"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Company / Organization</label>
                           <input 
                               type="text" 
                               value={newTenant.company}
                               onChange={e => setNewTenant({...newTenant, company: e.target.value})}
                               className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                               placeholder="e.g. Acme International Ltd."
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-3">Service Plan</label>
                           <div className="grid grid-cols-3 gap-3">
                               {['Starter', 'Professional', 'Enterprise'].map(plan => (
                                   <div 
                                       key={plan}
                                       onClick={() => setNewTenant({...newTenant, plan})}
                                       className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                                           newTenant.plan === plan 
                                           ? 'bg-blue-600/20 border-blue-500 text-blue-100 ring-1 ring-blue-500' 
                                           : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                                       }`}
                                   >
                                       <div className="font-bold text-sm mb-1">{plan}</div>
                                       <div className="text-[10px] opacity-70">
                                           {plan === 'Starter' ? '200GB / 1 Rep' : plan === 'Professional' ? '1TB / 2 Rep' : '5TB / 3 Rep'}
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>

                       <div className="p-3 bg-gray-900/50 rounded border border-gray-700 text-xs text-gray-400 font-mono">
                           <p className="mb-1">Proposed Config:</p>
                           <p>CREATE DATABASE <span className="text-blue-400">{`t_${newTenant.name.toLowerCase().replace(/\s+/g, '_')}_xxx`}</span></p>
                           <p>KEEP {newTenant.plan === 'Starter' ? '90' : newTenant.plan === 'Professional' ? '365' : '3650'}</p>
                           <p>REPLICA {newTenant.plan === 'Starter' ? '1' : newTenant.plan === 'Professional' ? '2' : '3'}</p>
                       </div>
                   </div>

                   <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                       <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                       <button 
                           onClick={handleCreateTenant}
                           disabled={!newTenant.name}
                           className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           <Save className="w-4 h-4 mr-2" /> Create Tenant
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
