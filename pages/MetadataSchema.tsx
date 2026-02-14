import React from 'react';
import { GitBranch, Clock, ShieldAlert, Check, X, RotateCcw } from 'lucide-react';

const SCHEMA_LOGS = [
    { id: 1, table: 'meters', type: 'ADD COLUMN', detail: 'harmonic_factor (FLOAT)', user: 'system (SML)', time: '10 mins ago', status: 'Pending' },
    { id: 2, table: 'vehicles', type: 'MODIFY TYPE', detail: 'speed_kmh (INT -> FLOAT)', user: 'admin', time: '2 hours ago', status: 'Applied' },
    { id: 3, table: 'sensors', type: 'ADD TAG', detail: 'installation_date (TIMESTAMP)', user: 'admin', time: '1 day ago', status: 'Applied' },
];

export const MetadataSchema: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Dynamic Schema Evolution</h1>
            <p className="text-sm text-gray-400 mt-1">Manage version control and auto-schema policies.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Policy Config */}
           <div className="lg:col-span-1 space-y-6">
               <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                   <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                       <ShieldAlert className="w-5 h-5 mr-2 text-blue-400" />
                       Evolution Policy
                   </h3>
                   <div className="space-y-4">
                       <div className="flex items-center justify-between">
                           <div>
                               <p className="text-sm font-medium text-gray-300">Schemaless Write (SML)</p>
                               <p className="text-xs text-gray-500">Auto-create metrics on ingestion</p>
                           </div>
                           <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                               <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                           </div>
                       </div>
                       <hr className="border-gray-700" />
                       <div className="flex items-center justify-between">
                           <div>
                               <p className="text-sm font-medium text-gray-300">Require Approval</p>
                               <p className="text-xs text-gray-500">New columns enter 'Pending' state</p>
                           </div>
                           <div className="w-11 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                               <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                           </div>
                       </div>
                       <hr className="border-gray-700" />
                       <div>
                           <p className="text-sm font-medium text-gray-300 mb-2">Type Conflict Resolution</p>
                           <select className="w-full bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 p-2">
                               <option>Reject Write</option>
                               <option>Try Cast / Convert</option>
                               <option>Save to Dead Letter Queue</option>
                           </select>
                       </div>
                   </div>
               </div>
           </div>

           {/* Change Log */}
           <div className="lg:col-span-2">
               <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 h-full">
                   <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                       <GitBranch className="w-5 h-5 mr-2 text-green-400" />
                       Schema Change Log
                   </h3>
                   <div className="space-y-4">
                       {SCHEMA_LOGS.map(log => (
                           <div key={log.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-700/50">
                               <div className="flex items-start gap-4">
                                   <div className={`p-2 rounded-lg ${log.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                       <Clock className="w-5 h-5" />
                                   </div>
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                           <span className="font-bold text-gray-200">{log.table}</span>
                                           <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-mono">{log.type}</span>
                                       </div>
                                       <p className="text-sm text-gray-300">{log.detail}</p>
                                       <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                           <span>User: {log.user}</span>
                                           <span>•</span>
                                           <span>{log.time}</span>
                                       </div>
                                   </div>
                               </div>

                               <div className="flex items-center gap-2">
                                   {log.status === 'Pending' ? (
                                       <>
                                           <button className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition-colors" title="Approve">
                                               <Check className="w-4 h-4" />
                                           </button>
                                           <button className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors" title="Reject">
                                               <X className="w-4 h-4" />
                                           </button>
                                       </>
                                   ) : (
                                       <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1.5 rounded transition-colors">
                                           <RotateCcw className="w-3 h-3" /> Rollback
                                       </button>
                                   )}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};