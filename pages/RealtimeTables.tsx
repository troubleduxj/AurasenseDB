
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Table, Layers, Eye, ChevronRight, ChevronDown, 
  Search, Terminal, Activity, Tag, Box, ArrowRight, MoreHorizontal
} from 'lucide-react';
import { MOCK_SUPER_TABLES } from '../constants';
import { Page } from '../types';

// --- Types ---
type NodeType = 'DB' | 'CATEGORY' | 'STABLE' | 'TABLE' | 'VIEW';

interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  children?: TreeNode[];
  expanded?: boolean;
  parentId?: string;
  dbName?: string; // For context
}

// --- Mock Data Generation ---
const generateDbTree = (): TreeNode[] => {
  const dbs = ['power_db', 'factory_db', 'fleet_db'];
  
  return dbs.map(db => {
    // Filter super tables for this db
    const stables = MOCK_SUPER_TABLES.filter(st => st.database === db).map(st => ({
        id: `${db}_st_${st.name}`,
        name: st.name,
        type: 'STABLE' as NodeType,
        dbName: db,
        parentId: `${db}_cat_st`
    }));

    // Mock some child tables
    const tables = Array.from({ length: 3 }).map((_, i) => ({
        id: `${db}_t_${i}`,
        name: `${stables[0]?.name || 'device'}_${100 + i}`,
        type: 'TABLE' as NodeType,
        dbName: db,
        parentId: `${db}_cat_t`
    }));

    // Mock some views
    const views = Array.from({ length: 1 }).map((_, i) => ({
        id: `${db}_v_${i}`,
        name: `view_${db}_summary`,
        type: 'VIEW' as NodeType,
        dbName: db,
        parentId: `${db}_cat_v`
    }));

    return {
      id: db,
      name: db,
      type: 'DB',
      expanded: db === 'power_db', // Default expand first
      children: [
        {
            id: `${db}_cat_st`,
            name: 'Super Tables',
            type: 'CATEGORY',
            expanded: true,
            children: stables
        },
        {
            id: `${db}_cat_t`,
            name: 'Tables',
            type: 'CATEGORY',
            expanded: false,
            children: tables
        },
        {
            id: `${db}_cat_v`,
            name: 'Views',
            type: 'CATEGORY',
            expanded: false,
            children: views
        }
      ]
    };
  });
};

export const RealtimeTables: React.FC = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<TreeNode[]>(generateDbTree());
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(() => {
      // Default selection
      const firstDb = treeData[0];
      const stCat = firstDb.children?.find(c => c.name === 'Super Tables');
      return stCat?.children?.[0] || null;
  });
  const [activeTab, setActiveTab] = useState<'schema' | 'data'>('schema');

  // --- Tree Handlers ---
  const toggleNode = (nodeId: string) => {
    const updateTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setTreeData(updateTree(treeData));
  };

  const handleSelect = (node: TreeNode) => {
      if (node.type === 'CATEGORY') {
          toggleNode(node.id);
      } else if (node.type === 'DB') {
          toggleNode(node.id);
      } else {
          setSelectedNode(node);
      }
  };

  // --- Render Helpers ---
  const getIcon = (type: NodeType, expanded?: boolean) => {
      switch (type) {
          case 'DB': return <Database className="w-4 h-4 text-yellow-500" />;
          case 'CATEGORY': return expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />;
          case 'STABLE': return <Layers className="w-4 h-4 text-blue-400" />;
          case 'TABLE': return <Table className="w-4 h-4 text-green-400" />;
          case 'VIEW': return <Eye className="w-4 h-4 text-purple-400" />;
          default: return <Box className="w-4 h-4" />;
      }
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
      return nodes.map(node => (
          <div key={node.id}>
              <div 
                  className={`flex items-center py-1.5 px-2 cursor-pointer text-sm transition-colors ${
                      selectedNode?.id === node.id 
                      ? 'bg-blue-600/20 text-blue-300' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                  style={{ paddingLeft: `${level * 12 + 8}px` }}
                  onClick={() => handleSelect(node)}
              >
                  <span className="mr-2 opacity-80">{getIcon(node.type, node.expanded)}</span>
                  <span className="truncate">{node.name}</span>
              </div>
              {node.expanded && node.children && (
                  <div>{renderTree(node.children, level + 1)}</div>
              )}
          </div>
      ));
  };

  // --- Navigation Handlers ---
  const handleJumpToQuery = () => {
      if (!selectedNode) return;
      navigate(`/${Page.REALTIME_QUERY}`);
      // In a real app, we would pass state: { query: `SELECT * FROM ${selectedNode.dbName}.${selectedNode.name} LIMIT 10;` }
  };

  const handleJumpToLive = () => {
      if (!selectedNode) return;
      navigate(`/${Page.REALTIME_LIVE}`);
  };

  // --- Mock Schema Data ---
  const renderSchema = () => (
      <div className="space-y-6 animate-in fade-in duration-300">
          {/* Columns */}
          <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                  <Activity className="w-3 h-3 mr-2" /> Data Columns (Metrics)
              </h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-750 text-gray-400 text-xs uppercase">
                          <tr>
                              <th className="p-3 font-medium">Name</th>
                              <th className="p-3 font-medium">Type</th>
                              <th className="p-3 font-medium">Length</th>
                              <th className="p-3 font-medium text-right">Note</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                          <tr className="hover:bg-gray-700/30">
                              <td className="p-3 font-mono text-gray-200">ts</td>
                              <td className="p-3 text-yellow-500 font-mono text-xs">TIMESTAMP</td>
                              <td className="p-3 text-gray-500 text-xs">8</td>
                              <td className="p-3 text-right text-gray-500 text-xs">Primary Key</td>
                          </tr>
                          <tr className="hover:bg-gray-700/30">
                              <td className="p-3 font-mono text-gray-200">current</td>
                              <td className="p-3 text-blue-400 font-mono text-xs">FLOAT</td>
                              <td className="p-3 text-gray-500 text-xs">4</td>
                              <td className="p-3 text-right text-gray-500 text-xs"></td>
                          </tr>
                          <tr className="hover:bg-gray-700/30">
                              <td className="p-3 font-mono text-gray-200">voltage</td>
                              <td className="p-3 text-blue-400 font-mono text-xs">INT</td>
                              <td className="p-3 text-gray-500 text-xs">4</td>
                              <td className="p-3 text-right text-gray-500 text-xs"></td>
                          </tr>
                          <tr className="hover:bg-gray-700/30">
                              <td className="p-3 font-mono text-gray-200">phase</td>
                              <td className="p-3 text-blue-400 font-mono text-xs">FLOAT</td>
                              <td className="p-3 text-gray-500 text-xs">4</td>
                              <td className="p-3 text-right text-gray-500 text-xs"></td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Tags (Only for STABLE) */}
          {selectedNode?.type === 'STABLE' && (
              <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                      <Tag className="w-3 h-3 mr-2" /> Tags (Metadata)
                  </h3>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-750 text-gray-400 text-xs uppercase">
                              <tr>
                                  <th className="p-3 font-medium">Name</th>
                                  <th className="p-3 font-medium">Type</th>
                                  <th className="p-3 font-medium">Length</th>
                                  <th className="p-3 font-medium text-right">Note</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                              <tr className="hover:bg-gray-700/30">
                                  <td className="p-3 font-mono text-gray-200">location</td>
                                  <td className="p-3 text-purple-400 font-mono text-xs">BINARY</td>
                                  <td className="p-3 text-gray-500 text-xs">64</td>
                                  <td className="p-3 text-right text-gray-500 text-xs">Indexed</td>
                              </tr>
                              <tr className="hover:bg-gray-700/30">
                                  <td className="p-3 font-mono text-gray-200">group_id</td>
                                  <td className="p-3 text-purple-400 font-mono text-xs">INT</td>
                                  <td className="p-3 text-gray-500 text-xs">4</td>
                                  <td className="p-3 text-right text-gray-500 text-xs"></td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>
  );

  const renderDataPreview = () => (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left text-sm">
              <thead className="bg-gray-750 text-gray-400 text-xs uppercase">
                  <tr>
                      <th className="p-3 font-medium border-b border-gray-700">ts</th>
                      <th className="p-3 font-medium border-b border-gray-700">current</th>
                      <th className="p-3 font-medium border-b border-gray-700">voltage</th>
                      <th className="p-3 font-medium border-b border-gray-700">phase</th>
                      {selectedNode?.type === 'STABLE' && (
                          <>
                              <th className="p-3 font-medium border-b border-gray-700 text-purple-300">location</th>
                              <th className="p-3 font-medium border-b border-gray-700 text-purple-300">group_id</th>
                          </>
                      )}
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 font-mono">
                  {[...Array(10)].map((_, i) => (
                      <tr key={i} className="hover:bg-gray-700/50">
                          <td className="p-3 text-gray-400">2023-10-27 10:{10 + i}:00.000</td>
                          <td className="p-3 text-gray-200">{(Math.random() * 10).toFixed(2)}</td>
                          <td className="p-3 text-gray-200">{(220 + Math.random() * 5).toFixed(1)}</td>
                          <td className="p-3 text-gray-200">{(Math.random()).toFixed(3)}</td>
                          {selectedNode?.type === 'STABLE' && (
                              <>
                                  <td className="p-3 text-purple-300 opacity-80">{i % 2 === 0 ? 'DC_01' : 'Site_B'}</td>
                                  <td className="p-3 text-purple-300 opacity-80">10{i % 3}</td>
                              </>
                          )}
                      </tr>
                  ))}
              </tbody>
          </table>
          <div className="p-2 bg-gray-750 text-center text-xs text-gray-500 border-t border-gray-700">
              Showing last 10 rows. Use Query Studio for more.
          </div>
      </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Left Sidebar: DB Tree */}
        <div className="w-64 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden shrink-0">
            <div className="p-3 border-b border-gray-700 bg-gray-750">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Filter objects..." 
                        className="w-full bg-gray-900 border border-gray-600 rounded pl-7 pr-2 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {renderTree(treeData)}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
            {selectedNode ? (
                <>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-700 bg-gray-750 flex justify-between items-center shrink-0">
                        <div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                <Database className="w-3 h-3 mr-1" /> {selectedNode.dbName}
                                <ChevronRight className="w-3 h-3 mx-1" />
                                {selectedNode.parentId?.includes('st') ? 'Super Tables' : selectedNode.parentId?.includes('v') ? 'Views' : 'Tables'}
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-100">{selectedNode.name}</h2>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    selectedNode.type === 'STABLE' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                    selectedNode.type === 'VIEW' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                    'bg-green-500/10 text-green-300 border-green-500/20'
                                }`}>
                                    {selectedNode.type === 'STABLE' ? 'Super Table' : selectedNode.type}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleJumpToQuery}
                                className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm font-medium transition-colors border border-gray-600"
                            >
                                <Terminal className="w-4 h-4 mr-2" /> Query
                            </button>
                            <button 
                                onClick={handleJumpToLive}
                                className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                            >
                                <Activity className="w-4 h-4 mr-2" /> Live View
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700 px-6 gap-6 shrink-0">
                        <button 
                            onClick={() => setActiveTab('schema')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schema' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                        >
                            Schema & Tags
                        </button>
                        <button 
                            onClick={() => setActiveTab('data')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                        >
                            Data Preview
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'schema' ? renderSchema() : renderDataPreview()}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <Table className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-gray-400">Select an object</p>
                    <p className="text-xs text-gray-500 mt-2">Choose a table or view from the sidebar to inspect.</p>
                </div>
            )}
        </div>
    </div>
  );
};
