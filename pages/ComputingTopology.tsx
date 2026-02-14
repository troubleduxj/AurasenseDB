import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Database, Zap, AlertTriangle, Trash2, AlertCircle, Info, Filter } from 'lucide-react';

// --- Types ---
interface StreamNode {
  id: string;
  type: 'TABLE' | 'STREAM';
  name: string;
  db?: string;
  layer: number; // 0: Raw, 1: Process 1, 2: Agg 1, 3: Process 2, 4: Agg 2
  status?: 'RUNNING' | 'PAUSED' | 'FAILED';
}

interface StreamEdge {
  from: string;
  to: string;
}

interface ConnectionPath {
    id: string;
    d: string;
    status: 'default' | 'highlight' | 'impact' | 'upstream';
}

// --- Mock Data ---
const INITIAL_NODES: StreamNode[] = [
  // Chain 1: Power Meters
  { id: 'n1', type: 'TABLE', name: 'meters (Raw)', db: 'power_db', layer: 0 },
  { id: 'n2', type: 'STREAM', name: 'stream_1m_avg', status: 'RUNNING', layer: 1 },
  { id: 'n3', type: 'TABLE', name: 'meters_1m', db: 'power_db', layer: 2 },
  { id: 'n4', type: 'STREAM', name: 'stream_1h_avg', status: 'RUNNING', layer: 3 },
  { id: 'n5', type: 'TABLE', name: 'meters_1h', db: 'power_db', layer: 4 },
  { id: 'n6', type: 'STREAM', name: 'stream_alert_vol', status: 'RUNNING', layer: 1 },
  { id: 'n7', type: 'TABLE', name: 'alerts', db: 'sys_db', layer: 2 },
  { id: 'n8', type: 'STREAM', name: 'stream_daily_rpt', status: 'PAUSED', layer: 3 },
  { id: 'n9', type: 'TABLE', name: 'daily_reports', db: 'power_db', layer: 4 },

  // Chain 2: Fleet Vehicles (Isolated Chain)
  { id: 'n10', type: 'TABLE', name: 'vehicles (Raw)', db: 'fleet_db', layer: 0 },
  { id: 'n11', type: 'STREAM', name: 'stream_speed_chk', status: 'RUNNING', layer: 1 },
  { id: 'n12', type: 'TABLE', name: 'speed_violations', db: 'fleet_db', layer: 2 },
];

const INITIAL_EDGES: StreamEdge[] = [
  // Chain 1
  { from: 'n1', to: 'n2' },
  { from: 'n2', to: 'n3' },
  { from: 'n3', to: 'n4' }, // meters_1m -> stream_1h
  { from: 'n4', to: 'n5' },
  { from: 'n1', to: 'n6' }, // meters (Raw) -> alert stream
  { from: 'n6', to: 'n7' },
  { from: 'n3', to: 'n8' }, // meters_1m -> daily report stream
  { from: 'n8', to: 'n9' },

  // Chain 2
  { from: 'n10', to: 'n11' },
  { from: 'n11', to: 'n12' },
];

export const ComputingTopology: React.FC = () => {
  const [nodes, setNodes] = useState<StreamNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<StreamEdge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<StreamNode | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  
  // Refs for drawing lines
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<ConnectionPath[]>([]);

  // Helper: Find all downstream dependencies recursively
  const findDownstream = useCallback((nodeId: string, currentEdges: StreamEdge[]): string[] => {
    const direct = currentEdges.filter(e => e.from === nodeId).map(e => e.to);
    let all = [...direct];
    direct.forEach(childId => {
      all = [...all, ...findDownstream(childId, currentEdges)];
    });
    return [...new Set(all)];
  }, []);

  // Helper: Find upstream dependencies
  const findUpstream = useCallback((nodeId: string, currentEdges: StreamEdge[]): string[] => {
      const direct = currentEdges.filter(e => e.to === nodeId).map(e => e.from);
      let all = [...direct];
      direct.forEach(parentId => {
          all = [...all, ...findUpstream(parentId, currentEdges)];
      });
      return [...new Set(all)];
  }, []);

  // 1. Calculate Visible Nodes based on Source Filter
  const visibleNodes = useMemo(() => {
      if (sourceFilter === 'ALL') return nodes;
      
      // Get downstream nodes from the selected source
      const downstreamIds = findDownstream(sourceFilter, edges);
      const visibleIds = new Set([sourceFilter, ...downstreamIds]);
      
      return nodes.filter(n => visibleIds.has(n.id));
  }, [sourceFilter, nodes, edges, findDownstream]);

  // 2. Group visible nodes by layer for rendering columns
  const layers = useMemo(() => {
    const grouped: Record<number, StreamNode[]> = {};
    visibleNodes.forEach(n => {
      if (!grouped[n.layer]) grouped[n.layer] = [];
      grouped[n.layer].push(n);
    });
    return grouped;
  }, [visibleNodes]);

  // Get list of all L0 (Source) nodes for the dropdown
  const sourceOptions = useMemo(() => {
      return nodes.filter(n => n.layer === 0);
  }, [nodes]);

  const handleDeleteRequest = (node: StreamNode) => {
    setDeleteCandidate(node);
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
        setNodes(prev => prev.filter(n => n.id !== deleteCandidate.id));
        setEdges(prev => prev.filter(e => e.from !== deleteCandidate.id && e.to !== deleteCandidate.id));
        setDeleteCandidate(null);
        setSelectedNode(null);
    }
  };

  // Calculate dependencies for the delete modal
  const downstreamImpact = useMemo(() => {
      if (!deleteCandidate) return [];
      const ids = findDownstream(deleteCandidate.id, edges);
      return nodes.filter(n => ids.includes(n.id));
  }, [deleteCandidate, nodes, edges, findDownstream]);

  // --- Draw Lines Logic ---
  const drawConnections = useCallback(() => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPaths: ConnectionPath[] = [];
      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

      edges.forEach(edge => {
          // Only draw if both nodes are visible
          if (!visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to)) return;

          const fromEl = nodeRefs.current.get(edge.from);
          const toEl = nodeRefs.current.get(edge.to);

          if (fromEl && toEl) {
              const fromRect = fromEl.getBoundingClientRect();
              const toRect = toEl.getBoundingClientRect();

              // Calculate relative coordinates
              // Start: Right middle of 'from' node
              const x1 = fromRect.right - containerRect.left;
              const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
              
              // End: Left middle of 'to' node
              // Subtract a few pixels to prevent arrow overlapping the border too much
              const x2 = toRect.left - containerRect.left - 4; 
              const y2 = toRect.top + toRect.height / 2 - containerRect.top;

              // Control points for Bezier curve (horizontal s-curve)
              // We enforce a horizontal start and end by placing control points parallel to X axis
              const dist = Math.abs(x2 - x1);
              const cpx1 = x1 + dist * 0.5;
              const cpx2 = x2 - dist * 0.5;

              const d = `M ${x1} ${y1} C ${cpx1} ${y1}, ${cpx2} ${y2}, ${x2} ${y2}`;

              // Determine status
              let status: ConnectionPath['status'] = 'default';

              if (deleteCandidate) {
                  const impactIds = findDownstream(deleteCandidate.id, edges);
                  // Highlight edge if it connects two impacted nodes or starts from deletion candidate to an impacted node
                  if ((edge.from === deleteCandidate.id && impactIds.includes(edge.to)) || 
                      (impactIds.includes(edge.from) && impactIds.includes(edge.to))) {
                      status = 'impact';
                  }
              } else if (selectedNode) {
                  const downstreamIds = findDownstream(selectedNode, edges);
                  const upstreamIds = findUpstream(selectedNode, edges);
                  
                  if (edge.from === selectedNode && downstreamIds.includes(edge.to)) {
                      status = 'highlight'; // Direct downstream
                  } else if (downstreamIds.includes(edge.from) && downstreamIds.includes(edge.to)) {
                      status = 'highlight'; // Further downstream
                  } else if (edge.to === selectedNode && upstreamIds.includes(edge.from)) {
                      status = 'upstream'; // Direct upstream
                  } else if (upstreamIds.includes(edge.to) && upstreamIds.includes(edge.from)) {
                      status = 'upstream'; // Further upstream
                  }
              }

              newPaths.push({ id: `${edge.from}-${edge.to}`, d, status });
          }
      });

      setPaths(newPaths);
  }, [edges, visibleNodes, selectedNode, deleteCandidate, findDownstream, findUpstream]);

  // Recalculate paths on resize, scroll or data change
  useEffect(() => {
      const handleRepaint = () => requestAnimationFrame(drawConnections);
      
      // Use setTimeout to ensure DOM has rendered initial layout
      const timeout = setTimeout(drawConnections, 100);
      window.addEventListener('resize', handleRepaint);
      
      const scrollEl = scrollContainerRef.current;
      if (scrollEl) {
          scrollEl.addEventListener('scroll', handleRepaint);
      }
      
      return () => {
          clearTimeout(timeout);
          window.removeEventListener('resize', handleRepaint);
          if (scrollEl) {
              scrollEl.removeEventListener('scroll', handleRepaint);
          }
      };
  }, [drawConnections, visibleNodes]);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Stream Lineage Topology</h1>
            <p className="text-sm text-gray-400 mt-1">Visualize processing chains and analyze impact of changes.</p>
          </div>
          
          <div className="flex items-center gap-6">
               {/* Source Selector */}
               <div className="flex items-center bg-gray-800 p-1 rounded-lg border border-gray-700">
                   <div className="px-3 text-gray-400 flex items-center gap-2 text-sm border-r border-gray-700">
                       <Filter className="w-4 h-4" />
                       Source
                   </div>
                   <select 
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="bg-gray-800 text-sm text-gray-200 py-1 px-3 outline-none cursor-pointer"
                   >
                       <option value="ALL">All Sources</option>
                       {sourceOptions.map(src => (
                           <option key={src.id} value={src.id}>{src.name}</option>
                       ))}
                   </select>
               </div>

               {/* Legend */}
               <div className="flex items-center gap-4 text-sm">
                   <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-blue-500"></span> Raw
                   </div>
                   <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-purple-500"></span> Stream
                   </div>
                   <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-green-500"></span> Agg
                   </div>
               </div>
          </div>
       </div>

       {/* Canvas Area */}
       <div 
            className="flex-1 bg-gray-900 rounded-xl border border-gray-700 relative overflow-hidden bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] flex flex-col"
            ref={containerRef}
        >
           {/* SVG Layer for Connections */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker id="arrowhead-default" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#4b5563" />
                    </marker>
                    <marker id="arrowhead-highlight" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#60a5fa" />
                    </marker>
                    <marker id="arrowhead-upstream" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#a78bfa" />
                    </marker>
                    <marker id="arrowhead-impact" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#ef4444" />
                    </marker>
                </defs>
                {paths.map(path => {
                    let strokeColor = '#4b5563'; // gray-600
                    let strokeWidth = 2;
                    let markerEnd = 'url(#arrowhead-default)';
                    let opacity = 0.6;

                    if (path.status === 'highlight') {
                        strokeColor = '#60a5fa'; // blue-400
                        strokeWidth = 3;
                        markerEnd = 'url(#arrowhead-highlight)';
                        opacity = 1;
                    } else if (path.status === 'upstream') {
                        strokeColor = '#a78bfa'; // purple-400
                        strokeWidth = 3;
                        markerEnd = 'url(#arrowhead-upstream)';
                        opacity = 0.8;
                    } else if (path.status === 'impact') {
                        strokeColor = '#ef4444'; // red-500
                        strokeWidth = 3;
                        markerEnd = 'url(#arrowhead-impact)';
                        opacity = 1;
                    } else if (selectedNode || deleteCandidate) {
                        // Dim others if something is selected
                        opacity = 0.1; 
                    }

                    return (
                        <path 
                            key={path.id} 
                            d={path.d} 
                            stroke={strokeColor} 
                            strokeWidth={strokeWidth} 
                            fill="none"
                            strokeLinecap="round"
                            markerEnd={markerEnd}
                            style={{ opacity, transition: 'all 0.3s ease' }}
                        />
                    );
                })}
           </svg>

           {visibleNodes.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10">
                   <Filter className="w-12 h-12 mb-4 opacity-20" />
                   <p>No lineage found for the selected source.</p>
               </div>
           ) : (
               <div 
                  className="flex-1 overflow-auto p-8 flex gap-16 items-center justify-center min-w-max z-10"
                  ref={scrollContainerRef}
               >
                   {/* Render Columns */}
                   {[0, 1, 2, 3, 4].map(layerIndex => (
                       <div key={layerIndex} className="flex flex-col gap-8 relative">
                           {/* Layer Label */}
                           {layers[layerIndex]?.length > 0 && (
                               <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-900/80 px-2 py-1 rounded shadow-sm border border-gray-700/50">
                                   {layerIndex === 0 ? 'Source (L0)' : layerIndex % 2 !== 0 ? `Process (L${layerIndex})` : `Storage (L${layerIndex})`}
                               </div>
                           )}

                           {layers[layerIndex]?.map(node => {
                               const isSelected = selectedNode === node.id;
                               const isDownstream = selectedNode && findDownstream(selectedNode, edges).includes(node.id);
                               const isUpstream = selectedNode && findUpstream(selectedNode, edges).includes(node.id);
                               const isImpact = deleteCandidate && (deleteCandidate.id === node.id || findDownstream(deleteCandidate.id, edges).includes(node.id));
                               
                               let containerClass = 'border-gray-600 bg-gray-800 opacity-90';
                               if (isSelected) containerClass = 'border-white bg-gray-700 ring-2 ring-blue-500 opacity-100 scale-105 shadow-xl shadow-blue-500/20';
                               else if (isImpact) containerClass = 'border-red-500 bg-red-900/20 ring-1 ring-red-500 opacity-100 shadow-xl shadow-red-500/10';
                               else if (isDownstream) containerClass = 'border-blue-500/50 bg-blue-900/10 opacity-100 shadow-lg shadow-blue-500/5';
                               else if (isUpstream) containerClass = 'border-purple-500/50 bg-purple-900/10 opacity-100 shadow-lg shadow-purple-500/5';
                               else if (selectedNode || deleteCandidate) containerClass = 'border-gray-700 bg-gray-800 opacity-30 blur-[1px]'; // Dim unrelated
                               
                               return (
                                   <div 
                                       key={node.id}
                                       ref={el => {
                                           if (el) nodeRefs.current.set(node.id, el);
                                           else nodeRefs.current.delete(node.id);
                                       }}
                                       onClick={() => setSelectedNode(node.id)}
                                       className={`
                                           w-48 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer relative group flex flex-col items-center text-center z-20
                                           ${containerClass}
                                       `}
                                   >
                                       {/* Connector Points (Visual) */}
                                       {layerIndex > 0 && (
                                            <div className="absolute top-1/2 -left-[6px] w-2.5 h-2.5 rounded-full bg-gray-500 border-2 border-gray-900 z-30 transform -translate-y-1/2"></div>
                                       )}
                                       {layerIndex < 4 && (
                                            <div className="absolute top-1/2 -right-[6px] w-2.5 h-2.5 rounded-full bg-gray-500 border-2 border-gray-900 z-30 transform -translate-y-1/2"></div>
                                       )}

                                       {/* Node Icon */}
                                       <div className={`p-3 rounded-full mb-2 transition-colors duration-300 ${
                                           node.type === 'TABLE' && node.layer === 0 ? 'bg-blue-500/20 text-blue-400' :
                                           node.type === 'TABLE' ? 'bg-green-500/20 text-green-400' : 
                                           'bg-purple-500/20 text-purple-400'
                                       }`}>
                                           {node.type === 'TABLE' ? <Database className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                       </div>
                                       
                                       <h4 className="font-bold text-gray-200 text-sm truncate w-full" title={node.name}>{node.name}</h4>
                                       
                                       {node.db && <p className="text-[10px] text-gray-500 mt-1">{node.db}</p>}
                                       {node.status && (
                                           <span className={`mt-2 text-[10px] px-2 py-0.5 rounded font-bold ${
                                               node.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                                           }`}>
                                               {node.status}
                                           </span>
                                       )}

                                       {/* Hover Actions */}
                                       <div className="absolute -top-3 -right-3 hidden group-hover:flex z-30 scale-0 group-hover:scale-100 transition-transform">
                                           <button 
                                               onClick={(e) => { e.stopPropagation(); handleDeleteRequest(node); }}
                                               className="p-1.5 bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white rounded-full shadow-md border border-gray-600 transition-colors"
                                               title="Delete Node"
                                           >
                                               <Trash2 className="w-3 h-3" />
                                           </button>
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                   ))}
               </div>
           )}

           {/* Legend / Help Box */}
           <div className="absolute bottom-4 left-4 p-4 bg-gray-800/90 backdrop-blur border border-gray-700 rounded-xl text-xs text-gray-400 max-w-xs z-20 shadow-lg">
               <div className="flex items-start gap-2">
                   <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                   <p>Click a node to trace lineage. Blue lines indicate downstream flow, Purple lines indicate upstream sources.</p>
               </div>
           </div>
       </div>

       {/* Delete Warning Modal */}
       {deleteCandidate && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <div className="bg-gray-800 rounded-xl border border-red-500/30 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                   <div className="p-6 border-b border-gray-700 bg-red-900/10 flex items-start gap-4">
                       <div className="p-3 bg-red-500/20 rounded-full text-red-500 shrink-0">
                           <AlertTriangle className="w-8 h-8" />
                       </div>
                       <div>
                           <h2 className="text-xl font-bold text-gray-100">Dependency Warning</h2>
                           <p className="text-sm text-gray-400 mt-1">
                               You are about to delete <span className="text-white font-bold">{deleteCandidate.name}</span>.
                           </p>
                       </div>
                   </div>
                   
                   <div className="p-6">
                       {downstreamImpact.length > 0 ? (
                           <>
                               <p className="text-sm text-gray-300 mb-3">
                                   This action will <span className="text-red-400 font-bold">BREAK</span> the following downstream components:
                               </p>
                               <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden max-h-48 overflow-y-auto">
                                   {downstreamImpact.map(node => (
                                       <div key={node.id} className="p-3 border-b border-gray-800 last:border-0 flex items-center gap-3">
                                           {node.type === 'STREAM' ? <Zap className="w-4 h-4 text-purple-400"/> : <Database className="w-4 h-4 text-green-400"/>}
                                           <span className="text-sm text-gray-200">{node.name}</span>
                                       </div>
                                   ))}
                               </div>
                           </>
                       ) : (
                           <p className="text-sm text-green-400 flex items-center">
                               <AlertCircle className="w-4 h-4 mr-2" />
                               Safe to delete. No downstream dependencies found.
                           </p>
                       )}
                   </div>

                   <div className="p-4 bg-gray-750 flex justify-end gap-3 border-t border-gray-700">
                       <button 
                           onClick={() => setDeleteCandidate(null)} 
                           className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={confirmDelete}
                           className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-900/20"
                       >
                           Yes, Delete Node
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};