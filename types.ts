
export interface Metric {
  time: string;
  value: number;
}

export interface NodeStatus {
  id: number;
  ip: string;
  role: 'DNODE' | 'MNODE';
  status: 'Ready' | 'Offline' | 'Syncing';
  cpu: number;
  memory: number;
}

export interface PluginField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'textarea';
  options?: string[];
  required?: boolean;
  defaultValue?: string | number | boolean;
  description?: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  status: 'Installed' | 'Available' | 'Update';
  schema: PluginField[];
}

export interface MappingRule {
  id: string;
  sourcePath: string;
  targetColumn: string;
  transform: string;
}

export interface DataSource {
  id: string;
  name: string;
  pluginId: string;
  type: string; // Display name type
  status: 'Active' | 'Inactive' | 'Error';
  ingestionRate: number; // rows per second
  config?: Record<string, any>;
  sampleData?: Record<string, any>; // JSON sample for mapping
  mappingRules?: MappingRule[]; // Saved mapping rules
}

export interface SuperTable {
  name: string;
  database: string;
  columns: number;
  tags: number;
  tables: number;
}

export interface QueryResult {
  columns: string[];
  data: (string | number)[][];
  executionTime: number;
}

export enum Page {
  DASHBOARD = 'dashboard',
  INGESTION = 'ingestion',
  INGESTION_SOURCES = 'ingestion/sources',
  INGESTION_PLUGINS = 'ingestion/plugins',
  INGESTION_MAPPING = 'ingestion/mapping',
  INGESTION_PIPELINES = 'ingestion/pipelines',
  INGESTION_DLQ = 'ingestion/dlq',
  COMPUTING = 'computing',
  COMPUTING_NATIVE = 'computing/native',
  COMPUTING_FLINK_JOBS = 'computing/flink-jobs',
  COMPUTING_FLINK_SQL = 'computing/flink-sql',
  COMPUTING_MONITOR = 'computing/monitor',
  COMPUTING_TOPOLOGY = 'computing/topology',
  QUERY = 'query',
  QUERY_WORKBENCH = 'query/workbench',
  QUERY_API = 'query/api',
  QUERY_VIRTUAL_VIEWS = 'query/virtual-views',
  QUERY_SNIPPETS = 'query/snippets',
  QUERY_REPORTS = 'query/reports',
  METADATA = 'metadata',
  METADATA_MAP = 'metadata/map',
  METADATA_LIFECYCLE = 'metadata/lifecycle',
  METADATA_SCHEMA = 'metadata/schema',
  METADATA_LINEAGE = 'metadata/lineage',
  OPERATIONS = 'operations',
  OPERATIONS_CLUSTER = 'operations/cluster',
  OPERATIONS_NODES = 'operations/nodes',
  OPERATIONS_DATA = 'operations/data',
  OPERATIONS_SLOW_QUERY = 'operations/slow-query',
  OPERATIONS_LOGS = 'operations/logs',
  OPERATIONS_TENANTS = 'operations/tenants',
  OPERATIONS_ALERTS = 'operations/alerts',
  OPERATIONS_BACKUP = 'operations/backup',
  ECOSYSTEM = 'ecosystem',
  SYSTEM = 'system',
  SYSTEM_SETTINGS = 'system/settings',
  SYSTEM_CONNECT = 'system/connect',
  SYSTEM_NOTIFICATIONS = 'system/notifications',
  SYSTEM_SECURITY = 'system/security'
}
