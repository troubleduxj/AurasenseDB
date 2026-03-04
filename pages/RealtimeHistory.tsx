
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, Search, Filter, CheckCircle, XCircle, Clock, Database, 
  Play, Copy, ChevronRight, FileText, RefreshCw, AlertTriangle, 
  Terminal, User, Download, Calendar
} from 'lucide-react';
import { Page } from '../types';

interface QueryLog {
  id: string;
  ts: string;
  sql: string;
  status: 'SUCCESS' | 'ERROR';
  duration: number; // ms
  rows?: number;
  db: string;
  user: string;
  clientIp: string;
  errorMsg?: string;
}

const MOCK_HISTORY: QueryLog[] = Array.from({ length: 25 }).map((_, i) => {
    const isError = Math.random() > 0.9;
    const isSlow = Math.random() > 0.8;
    const db = i % 3 === 0 ? 'power_db' : i % 3 === 1 ? 'factory_db' : 'sys_db';
    
    let sql = '';
    if (i % 4 === 0) sql = `SELECT avg(voltage), max(current) FROM meters WHERE ts > NOW - 1h GROUP BY location`;
    else if (i % 4 === 1) sql = `SELECT * FROM sensors LIMIT 100`;
    else if (i % 4 === 2) sql = `INSERT INTO meters VALUES (NOW, ${Math.random()*10}, ${Math.floor(Math.random()*220)})`;
    else sql = `CREATE TABLE IF NOT EXISTS temp_analysis AS SELECT count(*) FROM logs`;

    return {
        id: `req_${Date.now() - i * 100000}_${i}`,
        ts: new Date(Date.now() - i * 300000).toLocaleString(),
        sql,
        status: isError ? 'ERROR' : 'SUCCESS',
        duration: isError ? 15 : (isSlow ? 1200 + Math.random() * 2000 : 10 + Math.random() * 50),
        rows: isError ? 0 : Math.floor(Math.random() * 5000),
        db,
        user: i % 5 === 0 ? 'admin' : 'grafana_bot',
        clientIp: '192.168.1.' + (10 + i),
        errorMsg: isError ? 'Syntax error near "GROUP BY": column not found' : undefined
    };
});

export const RealtimeHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [selectedLog, setSelectedLog] = useState<QueryLog | null>(null);

  const filteredLogs = useMemo(() => {
      return MOCK_HISTORY.filter(log => {
          if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
          if (searchTerm && !log.sql.toLowerCase().includes(searchTerm.toLowerCase()) && !log.id.includes(searchTerm)) return false;
          return true;
      });
  }, [searchTerm, statusFilter]);

  const handleOpenInWorkbench = (sql: string) => {
      navigate(`/${Page.QUERY_WORKBENCH}`, { state: { sql } });
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // Ideally show toast here
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between shrink-0">
          <div>
             <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                 <History className="w-6 h-6 mr-3 text-blue-400" />
                 Query Execution History
             </h1>
             <p className="text-sm text-gray-400 mt-1">Audit log of all SQL statements executed against the cluster.</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center border border-gray-600">
                <Download className="w-4 h-4 mr-2" /> Export CSV
             </button>
             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
             </button>
          </div>
       </div>

       {/* Toolbar */}
       <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-wrap items-center gap-4 shrink-0">
           <div className="relative flex-1 min-w-[240px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search by SQL content or Request ID..." 
                   className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
               />
           </div>
           
           <div className="flex items-center gap-2 bg-gray-900 rounded-lg border border-gray-600 px-3 py-2">
               <Filter className="w-4 h-4 text-gray-500" />
               <span className="text-xs text-gray-400 border-r border-gray-700 pr-2 mr-2">Status</span>
               <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value as any)}
                   className="bg-gray-900 text-sm text-gray-200 outline-none cursor-pointer"
               >
                   <option value="ALL">All Status</option>
                   <option value="SUCCESS">Success Only</option>
                   <option value="ERROR">Failed Only</option>
               </select>
           </div>

           <div className="flex items-center gap-2 bg-gray-900 rounded-lg border border-gray-600 px-3 py-2">
               <Calendar className="w-4 h-4 text-gray-500" />
               <span className="text-xs text-gray-400 border-r border-gray-700 pr-2 mr-2">Range</span>
               <select className="bg-gray-900 text-sm text-gray-200 outline-none cursor-pointer">
                   <option value="1h">Last 1 Hour</option>
                   <option value="24h">Last 24 Hours</option>
                   <option value="7d">Last 7 Days</option>
               </select>
           </div>
       </div>

       {/* Main Content Split */}
       <div className="flex-1 flex gap-6 min-h-0">
           
           {/* List */}
           <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-750 text-xs text-gray-400 uppercase sticky top-0 bg-gray-800 z-10 shadow-sm">
                           <tr>
                               <th className="p-4 border-b border-gray-700 font-medium">Status</th>
                               <th className="p-4 border-b border-gray-700 font-medium">Time / ID</th>
                               <th className="p-4 border-b border-gray-700 font-medium w-1/3">Query Snippet</th>
                               <th className="p-4 border-b border-gray-700 font-medium">Duration</th>
                               <th className="p-4 border-b border-gray-700 font-medium">Rows</th>
                               <th className="p-4 border-b border-gray-700 font-medium text-right">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-700 text-sm">
                           {filteredLogs.map(log => (
                               <tr 
                                   key={log.id} 
                                   onClick={() => setSelectedLog(log)}
                                   className={`hover:bg-gray-700/50 transition-colors cursor-pointer group ${selectedLog?.id === log.id ? 'bg-blue-900/10' : ''}`}
                               >
                                   <td className="p-4">
                                       {log.status === 'SUCCESS' ? (
                                           <CheckCircle className="w-5 h-5 text-green-500" />
                                       ) : (
                                           <XCircle className="w-5 h-5 text-red-500" />
                                       )}
                                   </td>
                                   <td className="p-4">
                                       <div className="flex flex-col">
                                           <span className="text-gray-200 text-xs">{log.ts}</span>
                                           <span className="text-[10px] text-gray-500 font-mono mt-0.5">{log.id}</span>
                                       </div>
                                   </td>
                                   <td className="p-4">
                                       <div className="flex flex-col gap-1">
                                           <code className="text-xs text-blue-300 font-mono truncate max-w-md block">
                                               {log.sql}
                                           </code>
                                           <div className="flex items-center gap-2">
                                               <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 rounded flex items-center">
                                                   <Database className="w-2.5 h-2.5 mr-1" /> {log.db}
                                               </span>
                                               <span className="text-[10px] text-gray-500 flex items-center">
                                                   <User className="w-2.5 h-2.5 mr-1" /> {log.user}
                                               </span>
                                           </div>
                                       </div>
                                   </td>
                                   <td className="p-4">
                                       <span className={`font-mono text-xs ${log.duration > 1000 ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                                           {log.duration.toFixed(2)} ms
                                       </span>
                                   </td>
                                   <td className="p-4 text-gray-400 text-xs font-mono">
                                       {log.rows?.toLocaleString()}
                                   </td>
                                   <td className="p-4 text-right">
                                       <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                               onClick={(e) => { e.stopPropagation(); copyToClipboard(log.sql); }}
                                               className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded" 
                                               title="Copy SQL"
                                           >
                                               <Copy className="w-4 h-4" />
                                           </button>
                                           <button 
                                               onClick={(e) => { e.stopPropagation(); handleOpenInWorkbench(log.sql); }}
                                               className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded" 
                                               title="Run in Workbench"
                                           >
                                               <Play className="w-4 h-4" />
                                           </button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
               <div className="p-2 border-t border-gray-700 bg-gray-750 text-center">
                   <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Load more records...</button>
               </div>
           </div>

           {/* Detail Drawer */}
           {selectedLog && (
               <div className="w-96 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-right duration-200 shadow-xl">
                   <div className="p-4 border-b border-gray-700 bg-gray-750 flex justify-between items-center">
                       <h3 className="font-bold text-gray-200 flex items-center">
                           <FileText className="w-4 h-4 mr-2 text-purple-400" /> Query Details
                       </h3>
                       <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white"><XCircle className="w-5 h-5"/></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4 space-y-6">
                       {selectedLog.status === 'ERROR' && (
                           <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                               <h4 className="text-xs font-bold text-red-400 flex items-center mb-1">
                                   <AlertTriangle className="w-3 h-3 mr-1.5" /> Execution Failed
                               </h4>
                               <p className="text-xs text-red-200 font-mono break-words">{selectedLog.errorMsg}</p>
                           </div>
                       )}

                       <div>
                           <div className="flex justify-between items-center mb-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">SQL Statement</label>
                               <button 
                                   onClick={() => copyToClipboard(selectedLog.sql)}
                                   className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center"
                               >
                                   <Copy className="w-3 h-3 mr-1" /> Copy
                               </button>
                           </div>
                           <div className="bg-[#1e1e1e] p-3 rounded-lg border border-gray-700 overflow-x-auto">
                               <code className="text-xs font-mono text-green-300 leading-relaxed whitespace-pre-wrap">
                                   {selectedLog.sql}
                               </code>
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 bg-gray-700/20 rounded border border-gray-700/50">
                               <label className="text-[10px] text-gray-500 uppercase block mb-1">Duration</label>
                               <span className={`font-mono text-sm font-bold ${selectedLog.duration > 1000 ? 'text-yellow-400' : 'text-gray-200'}`}>
                                   {selectedLog.duration.toFixed(3)} ms
                               </span>
                           </div>
                           <div className="p-3 bg-gray-700/20 rounded border border-gray-700/50">
                               <label className="text-[10px] text-gray-500 uppercase block mb-1">Affected Rows</label>
                               <span className="font-mono text-sm font-bold text-gray-200">{selectedLog.rows?.toLocaleString()}</span>
                           </div>
                       </div>

                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Context Metadata</label>
                           <div className="space-y-2 text-xs">
                               <div className="flex justify-between py-1 border-b border-gray-700/50">
                                   <span className="text-gray-400">Request ID</span>
                                   <span className="font-mono text-gray-300">{selectedLog.id}</span>
                               </div>
                               <div className="flex justify-between py-1 border-b border-gray-700/50">
                                   <span className="text-gray-400">Client IP</span>
                                   <span className="font-mono text-gray-300">{selectedLog.clientIp}</span>
                               </div>
                               <div className="flex justify-between py-1 border-b border-gray-700/50">
                                   <span className="text-gray-400">User</span>
                                   <span className="font-mono text-gray-300">{selectedLog.user}</span>
                               </div>
                               <div className="flex justify-between py-1 border-b border-gray-700/50">
                                   <span className="text-gray-400">Database</span>
                                   <span className="font-mono text-gray-300">{selectedLog.db}</span>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="p-4 border-t border-gray-700 bg-gray-750">
                       <button 
                           onClick={() => handleOpenInWorkbench(selectedLog.sql)}
                           className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-lg shadow-blue-900/20"
                       >
                           <Terminal className="w-4 h-4 mr-2" /> Open in Workbench
                       </button>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};
