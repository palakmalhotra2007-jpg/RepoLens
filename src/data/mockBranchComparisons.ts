import { BranchComparison } from '../types/merge';

/**
 * Branch comparisons for the TaskFlow demo repository
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
      name: 'App',
      impact: 'Added theme context provider wrapping component tree',
    },
    {
      file: 'src/components/TaskCard.tsx',
      name: 'TaskCard',
      impact: 'Updated styling classes to support dark mode tokens',
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
  comparisonState: 'conflicts_found',
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
      name: 'App',
      impact: 'Mounted NotificationProvider in root App component',
    },
    {
      file: 'src/pages/Dashboard.tsx',
      name: 'Dashboard',
      impact: 'Added real-time notification bell component',
    },
  ],
  changedApis: [
    {
      method: 'GET',
      route: '/api/notifications',
      impact: 'Fetch authenticated user notification queue',
    },
    {
      method: 'PATCH',
      route: '/api/notifications/:id/read',
      impact: 'Mark notification item as read',
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
      conflictType: 'textual',
      title: 'Provider hierarchy collision in App.tsx',
      reason: 'Both branches modified the root component context provider tree.',
      whatConflicted: 'App component JSX wrapping order',
      whyItConflicted: 'Feature branch wrapped NotificationProvider while main updated TaskProvider.',
      whatEachBranchChanged: {
        base: 'Standard AuthProvider and TaskProvider',
        ours: 'Updated TaskProvider configurations',
        theirs: 'Inserted NotificationProvider in middle of context tree',
      },
      whyItHappened: {
        baseContext: 'Root application context wrappers',
        oursIntent: 'Enhance task state management',
        theirsIntent: 'Inject notification subscriptions globally',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['App', 'AuthProvider', 'NotificationProvider', 'TaskProvider'],
      semanticRiskSeverity: 'medium',
      semanticImpact: 'Context nesting order may impact downstream consumer hook initialization.',
      resolutionSuggestion: 'Nest NotificationProvider inside AuthProvider and around TaskProvider.',
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
      aiSuggestedCode: `import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { TaskProvider } from './context/TaskContext';

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
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_1',
      severity: 'medium',
      title: 'Context Provider hierarchy altered',
      category: 'environment_flag',
      fileA: 'src/App.tsx',
      fileB: 'src/context/NotificationContext.tsx',
      description: 'NotificationProvider introduced between AuthProvider and TaskProvider.',
      gitMergeStatus: 'git_clean_merge_with_hidden_runtime_break',
      rootCause: 'Concurrent branch modification of component tree',
      runtimeBreakRisk: 'Components calling useNotification must be descendants of NotificationProvider.',
      recommendedResolution: 'Verify all downstream routes have access to Auth and Notification contexts.',
      diffA: '+ <NotificationProvider>',
      diffB: '- <TaskProvider without NotificationContext>',
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
      name: 'authMiddleware',
      impact: 'Added token expiration validation with 401 response',
    },
    {
      file: 'src/services/api.ts',
      name: 'request',
      impact: 'Added automatic token refresh handler on 401 response',
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
      name: 'GET /api/tasks',
      impact: 'Optimized Prisma query with select projections',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [
    {
      table: 'Task',
      change: 'Added composite index on (userId, status)',
    },
  ],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [
    {
      id: 'semantic_db_1',
      severity: 'medium',
      title: 'Prisma schema migration required before deployment',
      category: 'database_migration',
      fileA: 'prisma/schema.prisma',
      fileB: 'prisma/migrations/migration.sql',
      description: 'New composite index added to Task model.',
      gitMergeStatus: 'structural_mismatch',
      rootCause: 'Schema migration required for production PostgreSQL table',
      runtimeBreakRisk: 'Queries expecting index may degrade performance if migration is not run.',
      recommendedResolution: 'Execute `npx prisma migrate deploy` in release pipeline.',
      diffA: '+ @@index([userId, status])',
      diffB: '+ CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");',
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
      route: '/api/notifications',
      impact: 'Fetch user notifications',
    },
  ],
  changedDatabaseStructures: [
    {
      table: 'Task',
      change: 'Added composite performance indexes',
    },
  ],
  changedDependencies: [
    {
      name: 'repolens',
      oldVersion: '1.0.0',
      newVersion: '2.0.0',
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
  'demo_taskflow': {
    'main->feature/dark-mode': taskflowDarkModeComparison,
    'main->feature/notifications': taskflowNotificationsComparison,
    'main->bugfix/auth-token-expiry': taskflowAuthBugfixComparison,
    'main->refactor/database-optimization': taskflowDbOptimizationComparison,
    'main->release/v2.0': taskflowReleaseComparison,
  },
};

export function getMockBranchComparison(
  repoId: string,
  baseBranch: string,
  targetBranch: string
): BranchComparison | null {
  const repoComparisons = branchComparisonData[repoId] || branchComparisonData['demo_taskflow'];
  if (!repoComparisons) return null;

  const key = `${baseBranch}->${targetBranch}`;
  return repoComparisons[key] || null;
}
