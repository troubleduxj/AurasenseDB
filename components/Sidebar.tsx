
import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  LogOut,
  CreditCard,
  Sparkles,
  User,
  ChevronsUpDown
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const location = useLocation();
  const currentPath = location.pathname.substring(1);
  
  // State to manage expanded menus.
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // State for Tooltip (Fixed Position to avoid clipping)
  const [tooltip, setTooltip] = useState<{ top: number; text: string } | null>(null);

  // State for Profile Menu
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (id: string) => {
    // Only toggle if sidebar is open to avoid confusing UX in collapsed state
    if (isOpen) {
        setExpandedMenus(prev => 
          prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
      if (!isOpen) {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltip({
              top: rect.top + rect.height / 2,
              text: label
          });
      }
  };

  const handleMouseLeave = () => {
      setTooltip(null);
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
    <>
      <aside 
          className={`bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 transition-all duration-300 overflow-visible ${
              isOpen ? 'w-64' : 'w-16'
          }`}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          <div className={`h-16 flex items-center border-b border-gray-700 shrink-0 transition-all duration-300 ${isOpen ? 'px-6' : 'justify-center px-0'}`}>
            <Hexagon className="w-8 h-8 text-blue-500 shrink-0" />
            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 ml-3 whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              TDengine
            </span>
          </div>

          {/* Nav Items */}
          <nav 
            className="flex-1 py-6 px-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
            onScroll={() => setTooltip(null)}
          >
            {menuItems.map((item) => {
              const isExpanded = expandedMenus.includes(item.id);
              const isParentActive = currentPath === item.id || (item.subItems && currentPath.startsWith(item.id));
              
              if (item.subItems) {
                 return (
                   <div key={item.id} className="relative group">
                     <button
                        onClick={() => toggleMenu(item.id)}
                        onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                        onMouseLeave={handleMouseLeave}
                        className={`w-full flex items-center rounded-lg transition-colors group/btn relative ${
                          isOpen 
                            ? 'justify-between px-3 py-2.5' 
                            : 'justify-center p-2.5'
                        } ${
                          isParentActive 
                            ? 'text-blue-400' 
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className={`w-5 h-5 shrink-0 ${isOpen ? 'mr-3' : ''} ${isParentActive ? 'text-blue-400' : 'text-gray-500 group-hover/btn:text-gray-300'}`} />
                          {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </div>
                        {isOpen && (isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />)}
                      </button>
                      
                      {/* Submenu - Only visible when open */}
                      {isOpen && isExpanded && (
                        <div className="ml-4 pl-4 border-l border-gray-700 mt-1 space-y-1">
                          {item.subItems.map(sub => {
                            const isSubActive = currentPath === sub.id;
                            return (
                              <Link
                                key={sub.id}
                                to={`/${sub.id}`}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                                  isSubActive 
                                    ? 'bg-blue-600/10 text-blue-400' 
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                              >
                                 <sub.icon className="w-4 h-4 mr-2 opacity-70 shrink-0" />
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
                <div key={item.id} className="relative group">
                    <Link
                      to={`/${item.id}`}
                      onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                      onMouseLeave={handleMouseLeave}
                      className={`flex items-center rounded-lg transition-colors group/link relative ${
                          isOpen 
                              ? 'px-3 py-2.5' 
                              : 'justify-center p-2.5'
                      } ${
                        isParentActive 
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-100 border border-transparent'
                      }`}
                    >
                      <item.icon 
                        className={`w-5 h-5 shrink-0 ${isOpen ? 'mr-3' : ''} transition-colors ${
                          isParentActive ? 'text-blue-400' : 'text-gray-500 group-hover/link:text-gray-300'
                        }`} 
                      />
                      {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </Link>
                </div>
              );
            })}
          </nav>

          {/* Footer Profile Menu */}
          <div className="p-4 border-t border-gray-700 shrink-0" ref={profileRef}>
            <div className="relative">
                {isProfileOpen && (
                    <div className={`absolute bottom-full left-0 mb-4 w-64 bg-[#0F172A] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 ${!isOpen ? 'left-14 bottom-0' : ''}`}>
                       {/* Header */}
                       <div className="p-4 border-b border-gray-700 flex items-center gap-3 bg-gray-800/50">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shrink-0">
                                A
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-100 truncate">Admin User</p>
                                <p className="text-xs text-gray-400 truncate">admin@tdengine.local</p>
                            </div>
                       </div>
                       
                       {/* Upgrade */}
                       <div className="p-2">
                           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg transition-colors group">
                               <Sparkles className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" /> 
                               Upgrade to Pro
                           </button>
                       </div>
                       
                       <div className="h-px bg-gray-700 mx-2"></div>
                       
                       {/* Links */}
                       <div className="p-2 space-y-0.5">
                           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors hover:text-white">
                               <User className="w-4 h-4" /> Account
                           </button>
                           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors hover:text-white">
                               <CreditCard className="w-4 h-4" /> Billing
                           </button>
                           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors hover:text-white">
                               <Bell className="w-4 h-4" /> Notifications
                           </button>
                       </div>

                       <div className="h-px bg-gray-700 mx-2"></div>

                       {/* Sign Out */}
                       <div className="p-2">
                           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/10 rounded-lg transition-colors">
                               <LogOut className="w-4 h-4" /> Sign out
                           </button>
                       </div>
                    </div>
                )}

                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center w-full rounded-xl transition-all duration-200 group ${
                        isOpen 
                        ? 'px-3 py-2 hover:bg-gray-700/50' 
                        : 'justify-center p-2 hover:bg-gray-700/50'
                    } ${isProfileOpen ? 'bg-gray-700/50' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-lg shadow-purple-900/20">
                      A
                    </div>
                    {isOpen && (
                        <div className="ml-3 text-left flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">Admin User</p>
                          <p className="text-xs text-gray-500 truncate">admin@tdengine.local</p>
                        </div>
                    )}
                    {isOpen && (
                        <ChevronsUpDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'text-gray-300' : ''}`} />
                    )}
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Fixed Tooltip Portal */}
      {tooltip && !isOpen && (
        <div 
            className="fixed z-[100] px-3 py-2 bg-[#0F172A] text-white text-xs font-medium rounded-md shadow-xl border border-gray-700 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
            style={{ 
                left: '4.5rem', // 16 (4rem) width + margin
                top: tooltip.top,
                transform: 'translateY(-50%)'
            }}
        >
            {tooltip.text}
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#0F172A] border-l border-b border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </>
  );
};
