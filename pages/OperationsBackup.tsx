import React from 'react';
import { Archive, Download, Upload, Clock, Save } from 'lucide-react';

export const OperationsBackup: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">Disaster Recovery</h1>
             <p className="text-sm text-gray-400 mt-1">Manage snapshots, backups, and data migration (taosdump).</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
             <Save className="w-4 h-4 mr-2" /> Create Snapshot
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
               <h3 className="font-bold text-gray-200 mb-4 flex items-center">
                   <Archive className="w-5 h-5 mr-2 text-blue-400" /> Snapshot History
               </h3>
               <div className="space-y-3">
                   {[
                       { name: 'daily_backup_20231027', size: '45 GB', time: 'Today 02:00 AM', status: 'Success' },
                       { name: 'daily_backup_20231026', size: '44 GB', time: 'Yesterday 02:00 AM', status: 'Success' },
                       { name: 'manual_pre_upgrade', size: '44 GB', time: 'Oct 25 10:00 AM', status: 'Success' },
                   ].map((bak, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-700 hover:bg-gray-700/50 transition-colors">
                           <div>
                               <p className="text-sm font-medium text-gray-200">{bak.name}</p>
                               <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                   <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {bak.time}</span>
                                   <span>{bak.size}</span>
                               </div>
                           </div>
                           <button className="text-blue-400 hover:text-white p-2">
                               <Download className="w-4 h-4" />
                           </button>
                       </div>
                   ))}
               </div>
           </div>

           <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
               <h3 className="font-bold text-gray-200 mb-4 flex items-center">
                   <Upload className="w-5 h-5 mr-2 text-green-400" /> Import Wizard
               </h3>
               <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-gray-700/10 transition-all cursor-pointer">
                   <Upload className="w-12 h-12 text-gray-500 mb-4" />
                   <p className="text-gray-300 font-medium">Drag & Drop SQL/CSV files</p>
                   <p className="text-xs text-gray-500 mt-2">or click to browse</p>
               </div>
               <div className="mt-4">
                   <p className="text-xs text-gray-500 mb-2">Recent Imports</p>
                   <div className="p-2 bg-gray-700/30 rounded flex items-center justify-between text-xs text-gray-300">
                       <span>meters_legacy_data.csv</span>
                       <span className="text-green-400">Completed</span>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};