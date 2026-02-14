import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Ingestion } from './pages/Ingestion';
import { IngestionPlugins } from './pages/IngestionPlugins';
import { IngestionMapping } from './pages/IngestionMapping';
import { IngestionPipelines } from './pages/IngestionPipelines';
import { IngestionDLQ } from './pages/IngestionDLQ';

// Computing Pages
import { ComputingNative } from './pages/ComputingNative';
import { ComputingFlinkJobs } from './pages/ComputingFlinkJobs';
import { ComputingFlinkSQL } from './pages/ComputingFlinkSQL';
import { ComputingMonitor } from './pages/ComputingMonitor';
import { ComputingTopology } from './pages/ComputingTopology';

// Query Services Pages
import { QueryWorkbench } from './pages/QueryWorkbench';
import { QueryApi } from './pages/QueryApi';
import { QueryVirtualViews } from './pages/QueryVirtualViews';
import { QuerySnippets } from './pages/QuerySnippets';
import { QueryReports } from './pages/QueryReports';

// Metadata Pages
import { MetadataMap } from './pages/MetadataMap';
import { MetadataLifecycle } from './pages/MetadataLifecycle';
import { MetadataSchema } from './pages/MetadataSchema';
import { MetadataLineage } from './pages/MetadataLineage';

// Operations Pages
import { OperationsCluster } from './pages/OperationsCluster';
import { OperationsNodes } from './pages/OperationsNodes';
import { OperationsData } from './pages/OperationsData';
import { OperationsSlowQuery } from './pages/OperationsSlowQuery';
import { OperationsLogs } from './pages/OperationsLogs';
import { OperationsTenants } from './pages/OperationsTenants';
import { OperationsAlerts } from './pages/OperationsAlerts';
import { OperationsBackup } from './pages/OperationsBackup';

// System Pages
import { SystemSettings } from './pages/SystemSettings';
import { SystemConnect } from './pages/SystemConnect';
import { SystemNotifications } from './pages/SystemNotifications';
import { SystemSecurity } from './pages/SystemSecurity';

import { Ecosystem } from './pages/Ecosystem';
import { Page } from './types';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to={`/${Page.DASHBOARD}`} replace />} />
          <Route path={`/${Page.DASHBOARD}`} element={<Dashboard />} />
          
          {/* Data Ingestion Routes */}
          <Route path="/ingestion" element={<Navigate to={`/${Page.INGESTION_SOURCES}`} replace />} />
          <Route path={`/${Page.INGESTION_SOURCES}`} element={<Ingestion />} />
          <Route path={`/${Page.INGESTION_PLUGINS}`} element={<IngestionPlugins />} />
          <Route path={`/${Page.INGESTION_MAPPING}`} element={<IngestionMapping />} />
          <Route path={`/${Page.INGESTION_PIPELINES}`} element={<IngestionPipelines />} />
          <Route path={`/${Page.INGESTION_DLQ}`} element={<IngestionDLQ />} />

          {/* Stream Computing Routes */}
          <Route path="/computing" element={<Navigate to={`/${Page.COMPUTING_NATIVE}`} replace />} />
          <Route path={`/${Page.COMPUTING_NATIVE}`} element={<ComputingNative />} />
          <Route path={`/${Page.COMPUTING_FLINK_JOBS}`} element={<ComputingFlinkJobs />} />
          <Route path={`/${Page.COMPUTING_FLINK_SQL}`} element={<ComputingFlinkSQL />} />
          <Route path={`/${Page.COMPUTING_TOPOLOGY}`} element={<ComputingTopology />} />
          <Route path={`/${Page.COMPUTING_MONITOR}`} element={<ComputingMonitor />} />

          {/* Unified Query Service Routes */}
          <Route path="/query" element={<Navigate to={`/${Page.QUERY_WORKBENCH}`} replace />} />
          <Route path={`/${Page.QUERY_WORKBENCH}`} element={<QueryWorkbench />} />
          <Route path={`/${Page.QUERY_REPORTS}`} element={<QueryReports />} />
          <Route path={`/${Page.QUERY_API}`} element={<QueryApi />} />
          <Route path={`/${Page.QUERY_VIRTUAL_VIEWS}`} element={<QueryVirtualViews />} />
          <Route path={`/${Page.QUERY_SNIPPETS}`} element={<QuerySnippets />} />
          
          {/* Metadata Routes */}
          <Route path="/metadata" element={<Navigate to={`/${Page.METADATA_MAP}`} replace />} />
          <Route path={`/${Page.METADATA_MAP}`} element={<MetadataMap />} />
          <Route path={`/${Page.METADATA_LIFECYCLE}`} element={<MetadataLifecycle />} />
          <Route path={`/${Page.METADATA_SCHEMA}`} element={<MetadataSchema />} />
          <Route path={`/${Page.METADATA_LINEAGE}`} element={<MetadataLineage />} />

          {/* Operations Routes */}
          <Route path="/operations" element={<Navigate to={`/${Page.OPERATIONS_CLUSTER}`} replace />} />
          <Route path={`/${Page.OPERATIONS_CLUSTER}`} element={<OperationsCluster />} />
          <Route path={`/${Page.OPERATIONS_NODES}`} element={<OperationsNodes />} />
          <Route path={`/${Page.OPERATIONS_DATA}`} element={<OperationsData />} />
          <Route path={`/${Page.OPERATIONS_SLOW_QUERY}`} element={<OperationsSlowQuery />} />
          <Route path={`/${Page.OPERATIONS_LOGS}`} element={<OperationsLogs />} />
          <Route path={`/${Page.OPERATIONS_TENANTS}`} element={<OperationsTenants />} />
          <Route path={`/${Page.OPERATIONS_ALERTS}`} element={<OperationsAlerts />} />
          <Route path={`/${Page.OPERATIONS_BACKUP}`} element={<OperationsBackup />} />

          {/* System Management Routes */}
          <Route path="/system" element={<Navigate to={`/${Page.SYSTEM_SETTINGS}`} replace />} />
          <Route path={`/${Page.SYSTEM_SETTINGS}`} element={<SystemSettings />} />
          <Route path={`/${Page.SYSTEM_CONNECT}`} element={<SystemConnect />} />
          <Route path={`/${Page.SYSTEM_NOTIFICATIONS}`} element={<SystemNotifications />} />
          <Route path={`/${Page.SYSTEM_SECURITY}`} element={<SystemSecurity />} />

          <Route path={`/${Page.ECOSYSTEM}`} element={<Ecosystem />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
