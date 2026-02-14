
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, FileText, ChevronRight, BookOpen, Menu } from 'lucide-react';
import { Page } from '../types';

const DOC_TREE = [
    {
        category: 'Getting Started',
        items: [
            { id: 'intro', title: 'Introduction to TDengine' },
            { id: 'install', title: 'Installation Guide' },
            { id: 'quickstart', title: 'Quick Start' },
        ]
    },
    {
        category: 'Data Modeling',
        items: [
            { id: 'super-table', title: 'Super Tables & Tags' },
            { id: 'schema', title: 'Schema Design Best Practices' },
            { id: 'types', title: 'Supported Data Types' },
        ]
    },
    {
        category: 'Query Language (TAOS SQL)',
        items: [
            { id: 'select', title: 'Data Query (SELECT)' },
            { id: 'time-window', title: 'Time-Series Windowing' },
            { id: 'functions', title: 'Aggregate Functions' },
        ]
    }
];

export const HelpDocs: React.FC = () => {
  const navigate = useNavigate();
  const [activeDoc, setActiveDoc] = useState('intro');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
                    <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
                    Documentation
                </h1>
            </div>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search documentation..." 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 transition-all"
                />
            </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden bg-gray-800 rounded-xl border border-gray-700 relative">
            {/* Sidebar */}
            <div className={`w-64 border-r border-gray-700 flex flex-col bg-gray-800/50 transition-all duration-300 ${sidebarOpen ? '' : '-ml-64'}`}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Contents</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {DOC_TREE.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-sm font-bold text-gray-200 mb-2">{group.category}</h3>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveDoc(item.id)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                            activeDoc === item.id 
                                            ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' 
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 border-l-2 border-transparent'
                                        }`}
                                    >
                                        {item.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute top-4 left-4 z-10 p-2 bg-gray-800 border border-gray-600 rounded text-gray-400 hover:text-white lg:hidden"
            >
                <Menu className="w-4 h-4" />
            </button>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center text-sm text-blue-400 mb-2">
                        <span>Getting Started</span>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="font-semibold">Introduction to TDengine</span>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-100 mb-6">Introduction to TDengine</h1>
                    
                    <div className="prose prose-invert prose-blue max-w-none">
                        <p className="text-lg text-gray-300 leading-relaxed">
                            TDengine is an open-source, high-performance, cloud-native time-series database optimized for Internet of Things (IoT), Industrial IoT, IT infrastructure monitoring, and other time-series data scenarios.
                        </p>
                        
                        <div className="my-8 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                            <h3 className="text-lg font-bold text-gray-200 mb-3 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-yellow-400" />
                                Key Features
                            </h3>
                            <ul className="space-y-2 text-gray-400 list-disc list-inside">
                                <li><strong>High Performance:</strong> 10x faster ingestion than traditional databases.</li>
                                <li><strong>Standard SQL:</strong> Full support for SQL-like querying (TAOS SQL).</li>
                                <li><strong>Cluster Support:</strong> Horizontal scalability and high availability.</li>
                                <li><strong>Stream Computing:</strong> Built-in continuous aggregation and downsampling.</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-100 mt-8 mb-4">Core Concepts</h2>
                        <p className="text-gray-400 mb-4">
                            Unlike typical time-series databases, TDengine introduces the concept of a <strong>"Super Table"</strong>. A Super Table serves as a template for a specific type of device (e.g., smart meters), defining the schema for metrics (dynamic data) and tags (static attributes).
                        </p>
                        
                        <div className="bg-black/30 p-4 rounded-lg border border-gray-700 font-mono text-sm text-gray-300 overflow-x-auto">
                            <span className="text-purple-400">CREATE STABLE</span> meters (ts TIMESTAMP, current FLOAT, voltage INT) <span className="text-purple-400">TAGS</span> (location BINARY(64), groupId INT);
                        </div>
                    </div>

                    <div className="flex justify-between mt-12 pt-8 border-t border-gray-700">
                        <div></div> {/* Spacer */}
                        <button className="flex items-center text-blue-400 hover:text-blue-300 font-medium">
                            Next: Installation Guide <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
