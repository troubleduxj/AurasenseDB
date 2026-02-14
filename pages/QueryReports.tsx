import React, { useState } from 'react';
import { CalendarClock, Plus, MoreHorizontal, Mail, Webhook, FileSpreadsheet, FileText, CheckCircle, Clock, PlayCircle } from 'lucide-react';

const MOCK_REPORTS = [
    { id: 'rpt_001', name: 'Daily Power Consumption', schedule: 'Daily at 08:00', nextRun: 'Tomorrow 08:00', lastStatus: 'Success', format: 'PDF', channel: 'Email' },
    { id: 'rpt_002', name: 'Weekly Voltage Anomalies', schedule: 'Weekly (Mon) at 09:00', nextRun: 'Mon 09:00', lastStatus: 'Success', format: 'CSV', channel: 'Webhook' },
    { id: 'rpt_003', name: 'Shift End Summary', schedule: 'Daily at 18:00', nextRun: 'Today 18:00', lastStatus: 'Failed', format: 'Excel', channel: 'Email' },
];

export const QueryReports: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', query: '', frequency: 'Daily', time: '08:00', format: 'PDF', channel: 'Email' });

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">Scheduled Reports</h1>
             <p className="text-sm text-gray-400 mt-1">Automate query execution and delivery via Email or Webhooks.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
          >
             <Plus className="w-4 h-4 mr-2" /> Create Schedule
          </button>
       </div>

       <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
           <table className="w-full text-left border-collapse">
               <thead>
                   <tr className="bg-gray-700/50 text-gray-400 text-xs uppercase border-b border-gray-700">
                       <th className="p-4 font-medium">Report Name</th>
                       <th className="p-4 font-medium">Schedule (Cron)</th>
                       <th className="p-4 font-medium">Next Run</th>
                       <th className="p-4 font-medium text-center">Format</th>
                       <th className="p-4 font-medium text-center">Channel</th>
                       <th className="p-4 font-medium text-center">Last Status</th>
                       <th className="p-4 font-medium text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-gray-700">
                   {MOCK_REPORTS.map(rpt => (
                       <tr key={rpt.id} className="hover:bg-gray-700/30 transition-colors">
                           <td className="p-4">
                               <div className="flex items-center gap-3">
                                   <div className="p-2 bg-purple-500/20 rounded text-purple-400">
                                       <CalendarClock className="w-4 h-4" />
                                   </div>
                                   <div>
                                       <p className="font-bold text-gray-200 text-sm">{rpt.name}</p>
                                       <p className="text-xs text-gray-500">{rpt.id}</p>
                                   </div>
                               </div>
                           </td>
                           <td className="p-4 text-sm text-gray-300">{rpt.schedule}</td>
                           <td className="p-4 text-sm text-gray-400 flex items-center gap-2">
                               <Clock className="w-3 h-3" /> {rpt.nextRun}
                           </td>
                           <td className="p-4 text-center">
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-700 text-gray-300 border border-gray-600">
                                   {rpt.format === 'PDF' && <FileText className="w-3 h-3 mr-1 text-red-400"/>}
                                   {rpt.format === 'Excel' && <FileSpreadsheet className="w-3 h-3 mr-1 text-green-400"/>}
                                   {rpt.format === 'CSV' && <FileText className="w-3 h-3 mr-1 text-blue-400"/>}
                                   {rpt.format}
                               </span>
                           </td>
                           <td className="p-4 text-center">
                               <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                   {rpt.channel === 'Email' ? <Mail className="w-3 h-3"/> : <Webhook className="w-3 h-3"/>}
                                   {rpt.channel}
                               </div>
                           </td>
                           <td className="p-4 text-center">
                               {rpt.lastStatus === 'Success' ? (
                                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400">Success</span>
                               ) : (
                                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400">Failed</span>
                               )}
                           </td>
                           <td className="p-4 text-right">
                               <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Run Now">
                                   <PlayCircle className="w-4 h-4" />
                               </button>
                               <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                                   <MoreHorizontal className="w-4 h-4" />
                               </button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>

       {/* Create Modal */}
       {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
               <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                   <div className="p-6 border-b border-gray-700">
                       <h2 className="text-xl font-bold text-gray-100 flex items-center">
                           <CalendarClock className="w-5 h-5 mr-2 text-blue-400" />
                           New Scheduled Report
                       </h2>
                   </div>
                   <div className="p-6 space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Report Name</label>
                           <input 
                               type="text" 
                               value={formData.name}
                               onChange={e => setFormData({...formData, name: e.target.value})}
                               className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                               placeholder="e.g. Daily Executive Summary"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Source Query</label>
                           <textarea 
                               className="w-full h-24 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-xs outline-none focus:border-blue-500 resize-none"
                               placeholder="SELECT ... FROM ..."
                           />
                           <p className="text-xs text-gray-500 mt-1">Tip: Use saved snippets for complex logic.</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
                               <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none">
                                   <option>Daily</option>
                                   <option>Weekly (Monday)</option>
                                   <option>Monthly (1st)</option>
                                   <option>Custom Cron</option>
                               </select>
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Time (UTC)</label>
                               <input 
                                   type="time" 
                                   value={formData.time}
                                   onChange={e => setFormData({...formData, time: e.target.value})}
                                   className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none"
                               />
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Export Format</label>
                               <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none">
                                   <option>PDF Document</option>
                                   <option>Excel Workbook (.xlsx)</option>
                                   <option>CSV (Zipped)</option>
                               </select>
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-1">Destination</label>
                               <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none">
                                   <option>Email</option>
                                   <option>Webhook (JSON)</option>
                                   <option>Slack</option>
                               </select>
                           </div>
                       </div>
                   </div>
                   <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                       <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                       <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center">
                           <CheckCircle className="w-4 h-4 mr-2" /> Activate Schedule
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
