import { BranchComparison } from '../types/merge';

/**
 * Mock branch comparisons for demo repositories
 * Simulates realistic branch differences for testing
 */

// TaskFlow: main vs feature/dark-mode
export const taskflowDarkModeComparison: BranchComparison = {
  comparisonState: 'no_conflicts',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'feature/dark-mode',
  aheadCount: 3,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [
    'src/styles/themes.ts',
    'src/hooks/useTheme.ts',
  ],
  deletedFiles: [],
  modifiedFiles: [
    'src/App.tsx',
    'src/index.css',
    'src/components/TaskCard.tsx',
    'src/components/MetricsPanel.tsx',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'src/App.tsx',
      functionName: 'App',
      changeType: 'modified',
      description: 'Added theme context provider',
    },
    {
      file: 'src/components/TaskCard.tsx',
      functionName: 'TaskCard',
      changeType: 'modified',
      description: 'Updated styling to use theme variables',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [],
};

// TaskFlow: main vs feature/notifications
export const taskflowNotificationsComparison: BranchComparison = {
  comparisonState: 'has_conflicts',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'feature/notifications',
  aheadCount: 5,
  behindCount: 0,
  conflictingFilesCount: 1,
  semanticConflictsCount: 1,
  addedFiles: [
    'src/components/NotificationCenter.tsx',
    'src/hooks/useNotifications.ts',
    'server/routes/notifications.ts',
  ],
  deletedFiles: [],
  modifiedFiles: [
    'src/App.tsx',
    'src/pages/Dashboard.tsx',
    'server/index.ts',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'src/App.tsx',
      functionName: 'App',
      changeType: 'modified',
      description: 'Added notification system initialization',
    },
    {
      file: 'src/pages/Dashboard.tsx',
      functionName: 'Dashboard',
      changeType: 'modified',
      description: 'Integrated notification display',
    },
  ],
  changedApis: [
    {
      method: 'GET',
      path: '/api/notifications',
      changeType: 'added',
      description: 'Fetch user notifications',
    },
    {
      method: 'PATCH',
      path: '/api/notifications/:id/read',
      changeType: 'added',
      description: 'Mark notification as read',
    },
  ],
  changedDatabaseStructures: [],
  changedDependencies: [],
  conflicts: [
    {
      id: 'conflict_1',
      file: 'src/App.tsx',
      lineStart: 15,
      lineEnd: 25,
      type: 'textual',
      resolutionStatus: 'pending',
      oursCode: `import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <Routes />
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}`,
      theirsCode: `import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TaskProvider>
          <Router>
            <Routes />
          </Router>
        </TaskProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}`,
      baseCode: `import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <Routes />
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}`,
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_1',
      severity: 'medium',
      title: 'Provider nesting order changed',
      description: 'NotificationProvider added between AuthProvider and TaskProvider. This changes the context hierarchy and may affect component behavior.',
      affectedFiles: ['src/App.tsx'],
      recommendation: 'Verify that all components can access both Auth and Notification contexts correctly.',
    },
  ],
};

// TaskFlow: main vs bugfix/auth-token-expiry
export const taskflowAuthBugfixComparison: BranchComparison = {
  comparisonState: 'no_conflicts',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'bugfix/auth-token-expiry',
  aheadCount: 2,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [],
  deletedFiles: [],
  modifiedFiles: [
    'server/middleware/auth.ts',
    'src/services/api.ts',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'server/middleware/auth.ts',
      functionName: 'authMiddleware',
      changeType: 'modified',
      description: 'Added token expiration validation',
    },
    {
      file: 'src/services/api.ts',
      functionName: 'request',
      changeType: 'modified',
      description: 'Added automatic token refresh on 401',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [],
};

// TaskFlow: main vs refactor/database-optimization
export const taskflowDbOptimizationComparison: BranchComparison = {
  comparisonState: 'no_conflicts',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'refactor/database-optimization',
  aheadCount: 4,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 1,
  addedFiles: [],
  deletedFiles: [],
  modifiedFiles: [
    'server/routes/tasks.ts',
    'prisma/schema.prisma',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'server/routes/tasks.ts',
      functionName: 'GET /',
      changeType: 'modified',
      description: 'Optimized query with selective field loading',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [
    {
      model: 'Task',
      changeType: 'index_added',
      description: 'Added composite index on (userId, status)',
    },
    {
      model: 'Task',
      changeType: 'index_added',
      description: 'Added index on dueDate for sorting',
    },
  ],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [
    {
      id: 'semantic_db_1',
      severity: 'low',
      title: 'Database schema migration required',
      description: 'New indexes added to Task model. Requires database migration before deployment.',
      affectedFiles: ['prisma/schema.prisma'],
      recommendation: 'Run `npx prisma migrate dev` to apply schema changes.',
    },
  ],
};

// TaskFlow: main vs release/v2.0
export const taskflowReleaseComparison: BranchComparison = {
  comparisonState: 'no_conflicts',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'release/v2.0',
  aheadCount: 12,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [
    'src/components/NotificationCenter.tsx',
    'src/hooks/useNotifications.ts',
    'src/hooks/useTheme.ts',
    'src/styles/themes.ts',
    'server/routes/notifications.ts',
    'CHANGELOG.md',
  ],
  deletedFiles: [],
  modifiedFiles: [
    'package.json',
    'src/App.tsx',
    'src/pages/Dashboard.tsx',
    'src/components/TaskCard.tsx',
    'server/index.ts',
    'server/middleware/auth.ts',
    'prisma/schema.prisma',
  ],
  renamedFiles: [],
  changedFunctions: [],
  changedApis: [
    {
      method: 'GET',
      path: '/api/notifications',
      changeType: 'added',
      description: 'Fetch user notifications',
    },
  ],
  changedDatabaseStructures: [
    {
      model: 'Task',
      changeType: 'index_added',
      description: 'Added performance indexes',
    },
  ],
  changedDependencies: [
    {
      name: 'package.json',
      type: 'version',
      from: '1.0.0',
      to: '2.0.0',
    },
  ],
  conflicts: [],
  semanticAlerts: [],
};

// Map of repository + branch combinations to comparison data
export const branchComparisonData: Record<string, Record<string, BranchComparison>> = {
  'demo_taskflow_comprehensive': {
    'main->feature/dark-mode': taskflowDarkModeComparison,
    'main->feature/notifications': taskflowNotificationsComparison,
    'main->bugfix/auth-token-expiry': taskflowAuthBugfixComparison,
    'main->refactor/database-optimization': taskflowDbOptimizationComparison,
    'main->release/v2.0': taskflowReleaseComparison,
  },
};

/**
 * Get mock branch comparison for a repository
 */
export function getMockBranchComparison(
  repoId: string,
  baseBranch: string,
  targetBranch: string
): BranchComparison | null {
  const repoComparisons = branchComparisonData[repoId];
  if (!repoComparisons) return null;

  const key = `${baseBranch}->${targetBranch}`;
  return repoComparisons[key] || null;
}
