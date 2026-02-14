import React, { useState, useMemo } from 'react';
import { Turtle, Fingerprint, Clock, User, Filter, AlertTriangle, ChevronRight, Activity, Search, RefreshCw, Sparkles, Monitor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeSlowQueryPattern } from '../services/geminiService';

// --- Types & Interfaces ---
interface RawLog {
  id: string;
  ts: string;
  sql: string;
  duration: number; // ms
  user: string;
  clientIp: string;
  db: string;
}

interface SqlPattern {
  id: string;
  patternHash: string;
  patternSql: string; // The fingerprint (e.g., SELECT * FROM t WHERE id = ?)
  count: number;
  avgDuration: number;
  totalDuration: number; // Impact score
  maxDuration: number;
  users: Record<string, number>; // user -> count
  ips: Record<string, number>; // ip -> count
  example: string;
}

// --- Mock Data Generation ---
const RAW_LOGS: RawLog[] = Array.from({ length: 50 }).map((_, i) => {
  const isScan = Math.random() > 0.7;
  const isAgg = Math.random() > 0.8;
  const db = Math.random() > 0.5 ? 'power_db' : 'fleet_db';
  
  let sql = '';
  if (isScan) {
      sql = `SELECT * FROM ${db}.meters WHERE ts > NOW - ${Math.floor(Math.random() * 30)}d`;
  } else if (isAgg) {
      sql = `SELECT avg(voltage) FROM ${db}.meters GROUP BY location_id = '${Math.floor(Math.random() * 1000)}'`;
  } else {
      sql = `SELECT last(*) FROM ${db}.sensors WHERE device_id = 'dev_${Math.floor(Math.random() * 500)}'`;
  }

  return {
    id: `log_${i}`,
    ts: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    sql,
    duration: Math.floor(Math.random() * 2000) + 100, // 100ms to 2100ms
    user: Math.random() > 0.6 ? 'data_analyst' : 'grafana_viewer',
    clientIp: Math.random() > 0.7 ? '192.168.1.50' : '10.0.0.8',
    db
  };
});

// --- Helper: SQL Fingerprinting ---
const fingerprintSql = (sql: string): string => {
  return sql
    .replace(/'[^']*'/g, "'?'") // Replace quoted strings
    .replace(/\b\d+\b/g, "?")    // Replace numbers
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
};

export const OperationsSlowQuery: React.FC = () => {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Logic: Aggregate Logs into Patterns ---
  const patterns = useMemo(() => {
      const map = new Map<string, SqlPattern>();

      RAW_LOGS.forEach(log => {
          const fp = fingerprintSql(log.sql);
          const existing = map.get(fp);

          if (existing) {
              existing.count++;
              existing.totalDuration += log.duration;
              existing.avgDuration = Math.floor(existing.totalDuration / existing.count);
              existing.maxDuration = Math.max(existing.maxDuration, log.duration);
              existing.users[log.user] = (existing.users[log.user] || 0) + 1;
              existing.ips[log.clientIp] = (existing.ips[log.clientIp] || 0) + 1;
          } else {
              map.set(fp, {
                  id: `pat_${Math.random().toString(36).substr(2, 5)}`,
                  patternHash: fp, // Simple hash for demo
                  patternSql: fp,
                  count: 1,
                  avgDuration: log.duration,
                  totalDuration: log.duration,
                  maxDuration: log.duration,
                  users: { [log.user]: 1 },
                  ips: { [log.clientIp]: 1 },
                  example: log.sql
              });
          }
      });

      // Convert to array and Sort by Total Duration (Impact) descending
      return Array.from(map.values()).sort((a, b) => b.totalDuration - a.totalDuration);
  }, []);

  const selectedPattern = patterns.find(p => p.id === selectedPatternId) || patterns[0];

  const handleAiAnalyze = async () => {
      if (!selectedPattern) return;
      setIsAnalyzing(true);
      try {
          const result = await analyzeSlowQueryPattern(
              selectedPattern.patternSql, 
              selectedPattern.avgDuration, 
              selectedPattern.count
          );
          setAiAnalysis(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsAnalyzing(false);
      }
  };

  // Prepare Chart Data (Top 5 Patterns by Impact)
  const chartData = patterns.slice(0, 5).map(p => ({
      name: p.id,
      impact: p.totalDuration,
      sql: p.patternSql.substring(0, 30) + '...'
  }));

  return (
    // Updated: Increased min-height to 750px to ensure list has space to show ~5 items
    <div className="space-y-6 h-[calc(100vh-7rem)] min-h-[750px] flex flex-col">
       <div className="flex items-center justify-between shrink-0">
          <div>
             <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                 <Turtle className="w-6 h-6 mr-3 text-yellow-500" />
                 Slow Query Analysis
             </h1>
             <p className="text-sm text-gray-400 mt-1">Fingerprint-based aggregation to identify high-impact performance bottlenecks.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-gray-800 p-2 rounded-lg border border-gray-700 flex items-center gap-2">
                 <Filter className="w-4 h-4 text-gray-500" />
                 <select className="bg-gray-800 text-sm text-gray-300 outline-none">
                     <option>Last 1 Hour</option>
                     <option>Last 24 Hours</option>
                 </select>
             </div>
             <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center border border-gray-600">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh Logs
             </button>
          </div>
       </div>

       {/* Top Metrics Grid */}
       <div className="grid grid-cols-4 gap-4 shrink-0">
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
               <div className="flex justify-between items-start">
                   <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">Total Slow Queries</p>
                       <p className="text-2xl font-bold text-gray-100 mt-1">{RAW_LOGS.length}</p>
                   </div>
                   <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Activity className="w-5 h-5"/></div>
               </div>
           </div>
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
               <div className="flex justify-between items-start">
                   <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">Distinct Patterns</p>
                       <p className="text-2xl font-bold text-blue-400 mt-1">{patterns.length}</p>
                   </div>
                   <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Fingerprint className="w-5 h-5"/></div>
               </div>
           </div>
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
               <div className="flex justify-between items-start">
                   <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">P95 Latency</p>
                       <p className="text-2xl font-bold text-yellow-400 mt-1">1,850 <span className="text-sm text-gray-500 font-normal">ms</span></p>
                   </div>
                   <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Clock className="w-5 h-5"/></div>
               </div>
           </div>
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
               <div className="flex justify-between items-start">
                   <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">Top Offender IP</p>
                       <p className="text-lg font-bold text-purple-400 mt-1 truncate">192.168.1.50</p>
                       <p className="text-xs text-gray-500">Responsible for 45% load</p>
                   </div>
                   <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Monitor className="w-5 h-5"/></div>
               </div>
           </div>
       </div>

       {/* Main Content Split */}
       <div className="flex-1 flex gap-6 min-h-0">
           
           {/* Left: Pattern List */}
           <div className="w-3/5 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
               <div className="p-3 border-b border-gray-700 bg-gray-750 flex justify-between items-center">
                   <h3 className="font-bold text-gray-200 text-sm">Top 10 Resource Consuming Patterns</h3>
                   <span className="text-xs text-gray-500">Sorted by Total Impact (Duration × Count)</span>
               </div>
               <div className="flex-1 overflow-y-auto">
                   {patterns.slice(0, 10).map((pat, idx) => (
                       <div 
                           key={pat.id}
                           onClick={() => { setSelectedPatternId(pat.id); setAiAnalysis(null); }}
                           className={`p-3 border-b border-gray-700 cursor-pointer transition-colors group ${
                               selectedPatternId === pat.id || (!selectedPatternId && idx === 0) 
                               ? 'bg-blue-600/10 border-l-4 border-l-blue-500' 
                               : 'hover:bg-gray-700/50 border-l-4 border-l-transparent'
                           }`}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <div className="flex-1 mr-4 min-w-0">
                                   <code className="text-xs font-mono text-gray-300 line-clamp-2 leading-relaxed bg-gray-900/50 px-2 py-1 rounded border border-gray-700/50 block">
                                       {pat.patternSql}
                                   </code>
                               </div>
                               <div className="text-right shrink-0 ml-2">
                                    <span className="block text-sm font-bold text-gray-200">{pat.avgDuration} ms</span>
                                    <span className="text-[10px] text-gray-500 uppercase">Avg Time</span>
                               </div>
                           </div>
                           <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                               <div className="flex gap-4 items-center">
                                   <span className="flex items-center text-blue-400"><Fingerprint className="w-3 h-3 mr-1"/> {pat.id}</span>
                                   <span>Count: <span className="text-gray-300 font-bold">{pat.count}</span></span>
                                   <span>Impact: <span className="text-yellow-500 font-bold">{(pat.totalDuration / 1000).toFixed(1)}s</span></span>
                               </div>
                               <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300" />
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Right: Detail View & Attribution */}
           <div className="flex-1 flex flex-col gap-6 min-w-0">
               {/* Impact Chart */}
               <div className="h-1/3 bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col">
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Total Load Distribution (Top 5)</h4>
                   <div className="flex-1 min-h-0">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                               <XAxis type="number" hide />
                               <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 10, fill: '#9ca3af'}} />
                               <Tooltip 
                                   contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6'}}
                                   cursor={{fill: '#374151', opacity: 0.4}}
                               />
                               <Bar dataKey="impact" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                                    ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </div>

               {/* Attribution Details */}
               <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col">
                   <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-gray-200">Pattern Attribution</h3>
                       <button 
                           onClick={handleAiAnalyze}
                           disabled={isAnalyzing}
                           className="text-xs flex items-center bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                       >
                           {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                           {aiAnalysis ? 'Re-Analyze' : 'Analyze Root Cause'}
                       </button>
                   </div>

                   {/* AI Insight Box */}
                   {aiAnalysis && (
                       <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm text-gray-300 animate-in fade-in slide-in-from-top-2">
                           <span className="font-bold text-purple-300 block mb-1 flex items-center">
                               <Sparkles className="w-3 h-3 mr-1" /> Recommendation
                           </span>
                           {aiAnalysis}
                       </div>
                   )}

                   {/* Source Tables */}
                   <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                       <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 overflow-y-auto">
                           <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center">
                               <User className="w-3 h-3 mr-1" /> Top Users
                           </h4>
                           <div className="space-y-2">
                               {Object.entries(selectedPattern?.users || {}).sort((a,b) => b[1] - a[1]).map(([u, count]) => (
                                   <div key={u} className="flex justify-between text-sm">
                                       <span className="text-gray-300">{u}</span>
                                       <span className="text-gray-500 font-mono">{count}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                       <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 overflow-y-auto">
                           <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center">
                               <Monitor className="w-3 h-3 mr-1" /> Top Client IPs
                           </h4>
                           <div className="space-y-2">
                               {Object.entries(selectedPattern?.ips || {}).sort((a,b) => b[1] - a[1]).map(([ip, count]) => (
                                   <div key={ip} className="flex justify-between text-sm">
                                       <span className="text-gray-300">{ip}</span>
                                       <span className="text-gray-500 font-mono">{count}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>

                   <div className="mt-4 pt-4 border-t border-gray-700">
                       <p className="text-xs text-gray-500 mb-1">Raw Example</p>
                       <code className="block text-xs text-gray-400 font-mono bg-black/30 p-2 rounded truncate">
                           {selectedPattern?.example}
                       </code>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};