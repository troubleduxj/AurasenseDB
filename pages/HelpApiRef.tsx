
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Code, Copy, Check, Lock, Globe } from 'lucide-react';
import { Page } from '../types';

const API_GROUPS = [
    {
        name: 'Ingestion API',
        endpoints: [
            { method: 'POST', path: '/v2/insert', summary: 'Insert Rows (JSON)', id: 'insert' },
            { method: 'POST', path: '/v2/schemaless', summary: 'Schemaless Write (Line Protocol)', id: 'sml' },
        ]
    },
    {
        name: 'Query API',
        endpoints: [
            { method: 'POST', path: '/v3/sql', summary: 'Execute SQL Query', id: 'sql' },
            { method: 'GET', path: '/v3/health', summary: 'Cluster Health Check', id: 'health' },
        ]
    },
    {
        name: 'Management',
        endpoints: [
            { method: 'GET', path: '/v2/users', summary: 'List Users', id: 'users' },
            { method: 'POST', path: '/v2/users', summary: 'Create User', id: 'create_user' },
        ]
    }
];

export const HelpApiRef: React.FC = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('sql');
  const [copied, setCopied] = useState(false);

  const getMethodColor = (method: string) => {
      switch(method) {
          case 'GET': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          case 'POST': return 'text-green-400 bg-green-500/10 border-green-500/20';
          case 'DELETE': return 'text-red-400 bg-red-500/10 border-red-500/20';
          case 'PUT': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
          default: return 'text-gray-400 bg-gray-700 border-gray-600';
      }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(`/${Page.HELP_CENTER}`)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                    <Code className="w-6 h-6 mr-3 text-purple-400" />
                    API Reference
                </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                <Globe className="w-4 h-4" />
                <span>Base URL: </span>
                <code className="text-gray-200 font-mono">https://api.tdengine.cloud</code>
            </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden bg-gray-800 rounded-xl border border-gray-700">
            {/* Sidebar */}
            <div className="w-72 border-r border-gray-700 flex flex-col bg-gray-800/50">
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {API_GROUPS.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">{group.name}</h3>
                            <div className="space-y-1">
                                {group.endpoints.map(ep => (
                                    <button
                                        key={ep.id}
                                        onClick={() => setActiveId(ep.id)}
                                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all group flex items-center gap-2 ${
                                            activeId === ep.id 
                                            ? 'bg-gray-700 text-gray-100 shadow-sm' 
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getMethodColor(ep.method)}`}>
                                            {ep.method}
                                        </span>
                                        <span className="truncate">{ep.summary}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Endpoint Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-bold font-mono">POST</span>
                            <h2 className="text-3xl font-bold text-gray-100">/v3/sql</h2>
                        </div>
                        <p className="text-gray-400 text-lg">Executes a SQL query against a specific database.</p>
                    </div>

                    {/* Auth */}
                    <div className="mb-8 p-4 bg-gray-900/30 rounded-xl border border-gray-700/50 flex items-start gap-4">
                        <Lock className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-gray-200 mb-1">Authentication Required</h3>
                            <p className="text-sm text-gray-400">
                                Include your API token in the <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">Authorization</code> header.
                                <br/>Example: <code className="text-yellow-500">Authorization: Basic &lt;token&gt;</code>
                            </p>
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-700 pb-2">Body Parameters</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 text-sm p-3 rounded-lg hover:bg-gray-700/20">
                                <div className="col-span-3 font-mono text-blue-400 font-bold">sql <span className="text-red-400">*</span></div>
                                <div className="col-span-2 text-gray-500">string</div>
                                <div className="col-span-7 text-gray-300">The SQL statement to execute. Supports SELECT, INSERT, CREATE, etc.</div>
                            </div>
                            <div className="grid grid-cols-12 gap-4 text-sm p-3 rounded-lg hover:bg-gray-700/20">
                                <div className="col-span-3 font-mono text-blue-400 font-bold">db</div>
                                <div className="col-span-2 text-gray-500">string</div>
                                <div className="col-span-7 text-gray-300">Default database context. Optional if database is specified in SQL.</div>
                            </div>
                            <div className="grid grid-cols-12 gap-4 text-sm p-3 rounded-lg hover:bg-gray-700/20">
                                <div className="col-span-3 font-mono text-blue-400 font-bold">req_id</div>
                                <div className="col-span-2 text-gray-500">string</div>
                                <div className="col-span-7 text-gray-300">Unique request ID for tracing.</div>
                            </div>
                        </div>
                    </div>

                    {/* Example */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Request */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-gray-400 uppercase">Example Request</h4>
                                <button 
                                    onClick={() => handleCopy(`curl -X POST https://api.tdengine.cloud/v3/sql -d '{"sql": "SELECT * FROM meters"}'`)}
                                    className="text-xs flex items-center text-blue-400 hover:text-blue-300"
                                >
                                    {copied ? <Check className="w-3 h-3 mr-1"/> : <Copy className="w-3 h-3 mr-1"/>}
                                    {copied ? 'Copied' : 'Copy cURL'}
                                </button>
                            </div>
                            <div className="bg-[#0d1117] rounded-lg border border-gray-700 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
                                <span className="text-purple-400">curl</span> -X POST https://api.tdengine.cloud/v3/sql \<br/>
                                &nbsp;&nbsp;-H <span className="text-green-400">"Authorization: Basic ..."</span> \<br/>
                                &nbsp;&nbsp;-d <span className="text-yellow-400">'{`\n    "sql": "SELECT * FROM meters LIMIT 5",\n    "db": "power_db"\n  `}'</span>
                            </div>
                        </div>

                        {/* Response */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-gray-400 uppercase">Response (200 OK)</h4>
                            </div>
                            <div className="bg-[#0d1117] rounded-lg border border-gray-700 p-4 font-mono text-xs text-green-300 overflow-x-auto h-full">
{`{
  "code": 0,
  "message": "succ",
  "column_meta": [
    ["ts", "TIMESTAMP", 8],
    ["current", "FLOAT", 4],
    ["voltage", "INT", 4]
  ],
  "data": [
    ["2023-10-27 10:00:00.000", 2.5, 220],
    ["2023-10-27 10:00:01.000", 2.6, 221]
  ],
  "rows": 2
}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
