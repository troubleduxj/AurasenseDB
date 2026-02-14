import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  Cpu, 
  Database, 
  TableProperties, 
  Activity, 
  Share2, 
  Hexagon,
  ChevronDown,
  ChevronRight,
  Server,
  Package,
  GitMerge,
  Filter,
  Map,
  History,
  GitBranch,
  Workflow,
  Zap,
  ServerCog,
  Code2,
  Gauge,
  Terminal,
  Webhook,
  Layers,
  Scissors,
  HardDrive,
  Users,
  Bell,
  Archive,
  LayoutGrid,
  Turtle,
  CalendarClock,
  Settings,
  Shield,
  Sliders,
  Link2,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { Page } from '../types';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.substring(1);
  
  // State to manage expanded menus.
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    if (currentPath.startsWith('ingestion')) {
        setExpandedMenus(prev => prev.includes('ingestion') ? prev : [...prev, 'ingestion']);
    }
    if (currentPath.startsWith('metadata')) {
        setExpandedMenus(prev => prev.includes('metadata') ? prev : [...prev, 'metadata']);
    }
    if (currentPath.startsWith('computing')) {
        setExpandedMenus(prev => prev.includes('computing') ? prev : [...prev, 'computing']);
    }
    if (currentPath.startsWith('query')) {
        setExpandedMenus(prev => prev.includes('query') ? prev : [...prev, 'query']);
    }
    if (currentPath.startsWith('operations')) {
        setExpandedMenus(prev => prev.includes('operations') ? prev : [...prev, 'operations']);
    }
    if (currentPath.startsWith('system')) {
        setExpandedMenus(prev => prev.includes('system') ? prev : [...prev, 'system']);
    }
  }, [currentPath]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const menuItems = [
    { id: Page.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'ingestion', 
      label: 'Data Ingestion', 
      icon: Network,
      subItems: [
        { id: Page.INGESTION_SOURCES, label: 'Data Sources', icon: Server },
        { id: Page.INGESTION_PLUGINS, label: 'Plugin Library', icon: Package },
        { id: Page.INGESTION_MAPPING, label: 'Mapping Rules', icon: GitMerge },
        { id: Page.INGESTION_PIPELINES, label: 'Pipelines (ETL)', icon: Filter },
        { id: Page.INGESTION_DLQ, label: 'Dead Letter Queue', icon: AlertOctagon },
      ]
    },
    { 
      id: 'computing', 
      label: 'Stream Computing', 
      icon: Cpu,
      subItems: [
        { id: Page.COMPUTING_NATIVE, label: 'Native Streams', icon: Zap },
        { id: Page.COMPUTING_FLINK_JOBS, label: 'Flink Jobs', icon: ServerCog },
        { id: Page.COMPUTING_FLINK_SQL, label: 'Flink SQL', icon: Code2 },
        { id: Page.COMPUTING_TOPOLOGY, label: 'Topology & Lineage', icon: Workflow },
        { id: Page.COMPUTING_MONITOR, label: 'Pipeline Monitor', icon: Gauge },
      ]
    },
    { 
      id: 'query', 
      label: 'Query Service', 
      icon: Database,
      subItems: [
        { id: Page.QUERY_WORKBENCH, label: 'SQL Workbench', icon: Terminal },
        { id: Page.QUERY_REPORTS, label: 'Scheduled Reports', icon: CalendarClock },
        { id: Page.QUERY_API, label: 'Query as API', icon: Webhook },
        { id: Page.QUERY_VIRTUAL_VIEWS, label: 'Virtual Views', icon: Layers },
        { id: Page.QUERY_SNIPPETS, label: 'Snippets Library', icon: Scissors },
      ]
    },
    { 
      id: 'metadata', 
      label: 'Metadata Center', 
      icon: TableProperties,
      subItems: [
        { id: Page.METADATA_MAP, label: 'Data Map', icon: Map },
        { id: Page.METADATA_LIFECYCLE, label: 'Lifecycle Mgmt', icon: History },
        { id: Page.METADATA_SCHEMA, label: 'Dynamic Schema', icon: GitBranch },
        { id: Page.METADATA_LINEAGE, label: 'Data Lineage', icon: Workflow },
      ]
    },
    { 
        id: 'operations', 
        label: 'Operations', 
        icon: Activity,
        subItems: [
          { id: Page.OPERATIONS_CLUSTER, label: 'Cluster Core', icon: Hexagon },
          { id: Page.OPERATIONS_NODES, label: 'Node Monitor', icon: Server },
          { id: Page.OPERATIONS_DATA, label: 'Data Ops', icon: HardDrive },
          { id: Page.OPERATIONS_LOGS, label: 'Log Center', icon: FileText },
          { id: Page.OPERATIONS_SLOW_QUERY, label: 'Slow Query Analysis', icon: Turtle },
          { id: Page.OPERATIONS_TENANTS, label: 'Tenants & Quotas', icon: Users },
          { id: Page.OPERATIONS_ALERTS, label: 'Alerting', icon: Bell },
          { id: Page.OPERATIONS_BACKUP, label: 'Disaster Recovery', icon: Archive },
        ]
    },
    { 
      id: 'system', 
      label: 'System Center', 
      icon: Settings,
      subItems: [
        { id: Page.SYSTEM_SETTINGS, label: 'System Settings', icon: Sliders },
        { id: Page.SYSTEM_CONNECT, label: 'Connect Settings', icon: Link2 },
        { id: Page.SYSTEM_NOTIFICATIONS, label: 'Notification Settings', icon: Bell },
        { id: Page.SYSTEM_SECURITY, label: 'Security Settings', icon: Shield },
      ]
    },
    { id: Page.ECOSYSTEM, label: 'Ecosystem', icon: Share2 },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-700">
        <Hexagon className="w-8 h-8 text-blue-500 mr-3" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          TDengine
        </span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isExpanded = expandedMenus.includes(item.id);
          const isParentActive = currentPath === item.id || (item.subItems && currentPath.startsWith(item.id));
          
          if (item.subItems) {
             return (
               <div key={item.id}>
                 <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                      isParentActive 
                        ? 'text-blue-400' 
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`w-5 h-5 mr-3 ${isParentActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-gray-700 mt-1 space-y-1">
                      {item.subItems.map(sub => {
                        const isSubActive = currentPath === sub.id;
                        return (
                          <Link
                            key={sub.id}
                            to={`/${sub.id}`}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                              isSubActive 
                                ? 'bg-blue-600/10 text-blue-400' 
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                          >
                             <sub.icon className="w-4 h-4 mr-2 opacity-70" />
                             {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
               </div>
             );
          }

          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                isParentActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-100'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 mr-3 transition-colors ${
                  isParentActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                }`} 
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">Admin User</p>
            <p className="text-xs text-gray-500">admin@tdengine.local</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
