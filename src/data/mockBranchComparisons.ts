import { BranchComparison } from '../types/merge';

/**
 * Branch comparisons for the TaskFlow demo repository
 */

// TaskFlow: main vs feature/dark-mode
export const taskflowDarkModeComparison: BranchComparison = {
  comparisonState: 'conflicts_found',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'feature/dark-mode',
  aheadCount: 3,
  behindCount: 1,
  conflictingFilesCount: 2,
  semanticConflictsCount: 1,
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
  conflicts: [
    {
      id: 'conflict_dark_1',
      file: 'src/index.css',
      lineStart: 1,
      lineEnd: 12,
      conflictType: 'textual',
      title: 'CSS root color variables conflict',
      reason: 'Both branches modified the root CSS color palette independently.',
      whatConflicted: 'Root-level CSS custom properties for theming',
      whyItConflicted: 'Main branch updated brand colors while dark-mode branch added theme variables.',
      whatEachBranchChanged: {
        base: 'Original blue theme colors',
        ours: 'Updated to purple brand colors (#8b5cf6)',
        theirs: 'Added dark mode theme tokens with --bg-primary, --text-primary',
      },
      whyItHappened: {
        baseContext: 'Initial CSS color system',
        oursIntent: 'Rebrand with new purple color scheme',
        theirsIntent: 'Enable dark mode theming system',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['Root CSS', 'All styled components'],
      semanticRiskSeverity: 'high',
      semanticImpact: 'Conflicting color systems may cause UI inconsistencies across the app.',
      resolutionSuggestion: 'Merge both changes: use new purple brand colors within dark mode theme tokens.',
      oursCode: `:root {
  --color-primary: #8b5cf6;
  --color-primary-hover: #7c3aed;
  --color-secondary: #6366f1;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
}`,
      theirsCode: `:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}`,
      baseCode: `:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-secondary: #06b6d4;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
}`,
      aiSuggestedCode: `:root {
  /* Brand colors - purple theme */
  --brand-primary: #8b5cf6;
  --brand-primary-hover: #7c3aed;
  --brand-secondary: #6366f1;
  
  /* Semantic theme tokens */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
  
  /* Dark mode brand colors */
  --brand-primary: #a78bfa;
  --brand-primary-hover: #8b5cf6;
}`,
    },
    {
      id: 'conflict_dark_2',
      file: 'src/components/TaskCard.tsx',
      lineStart: 45,
      lineEnd: 58,
      conflictType: 'textual',
      title: 'TaskCard className styling conflict',
      reason: 'Both branches modified component styling approach.',
      whatConflicted: 'TaskCard component className definitions',
      whyItConflicted: 'Main added responsive breakpoints; dark-mode changed to theme-aware classes.',
      whatEachBranchChanged: {
        base: 'Static Tailwind classes',
        ours: 'Added responsive utility classes (sm:, md:, lg:)',
        theirs: 'Replaced color classes with CSS variable references',
      },
      whyItHappened: {
        baseContext: 'Static styling',
        oursIntent: 'Improve mobile responsiveness',
        theirsIntent: 'Enable theme-aware styling',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['TaskCard', 'TaskList'],
      semanticRiskSeverity: 'medium',
      semanticImpact: 'Styling may break on mobile or dark mode if not properly merged.',
      resolutionSuggestion: 'Combine both: use responsive classes with theme variables.',
      oursCode: `<div className="task-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md sm:p-6 md:p-8 lg:rounded-xl transition-all">
  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
    {task.title}
  </h3>
  <p className="mt-2 text-sm sm:text-base text-gray-600">
    {task.description}
  </p>
</div>`,
      theirsCode: `<div className="task-card rounded-lg p-4 shadow-sm hover:shadow-md transition-all" 
     style={{ 
       backgroundColor: 'var(--bg-primary)', 
       borderColor: 'var(--border-color)',
       color: 'var(--text-primary)'
     }}>
  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
    {task.title}
  </h3>
  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
    {task.description}
  </p>
</div>`,
      baseCode: `<div className="task-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
  <h3 className="text-lg font-semibold text-gray-900">
    {task.title}
  </h3>
  <p className="mt-2 text-sm text-gray-600">
    {task.description}
  </p>
</div>`,
      aiSuggestedCode: `<div className="task-card rounded-lg p-4 shadow-sm hover:shadow-md sm:p-6 md:p-8 lg:rounded-xl transition-all" 
     style={{ 
       backgroundColor: 'var(--bg-primary)', 
       borderColor: 'var(--border-color)'
     }}>
  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold" 
      style={{ color: 'var(--text-primary)' }}>
    {task.title}
  </h3>
  <p className="mt-2 text-sm sm:text-base" 
     style={{ color: 'var(--text-secondary)' }}>
    {task.description}
  </p>
</div>`,
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_dark_1',
      severity: 'medium',
      title: 'Theme system architecture change',
      category: 'environment_flag',
      fileA: 'src/index.css',
      fileB: 'src/hooks/useTheme.ts',
      description: 'New theme switching mechanism requires localStorage and context setup.',
      gitMergeStatus: 'git_clean_merge_with_hidden_runtime_break',
      rootCause: 'Theme system depends on new hooks and localStorage keys',
      runtimeBreakRisk: 'Components without ThemeProvider will not respond to theme changes.',
      recommendedResolution: 'Ensure ThemeProvider wraps the entire app in App.tsx.',
      diffA: '+ [data-theme="dark"] CSS variables',
      diffB: '+ useTheme() hook with localStorage persistence',
    },
  ],
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
  comparisonState: 'conflicts_found',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'bugfix/auth-token-expiry',
  aheadCount: 2,
  behindCount: 2,
  conflictingFilesCount: 1,
  semanticConflictsCount: 1,
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
  conflicts: [
    {
      id: 'conflict_auth_1',
      file: 'src/services/api.ts',
      lineStart: 28,
      lineEnd: 45,
      conflictType: 'textual',
      title: 'API error handling logic conflict',
      reason: 'Both branches modified the request interceptor error handling independently.',
      whatConflicted: 'API client response interceptor and error handling',
      whyItConflicted: 'Main branch added retry logic; bugfix branch added token refresh.',
      whatEachBranchChanged: {
        base: 'Simple error throw on failed requests',
        ours: 'Added exponential backoff retry mechanism (3 attempts)',
        theirs: 'Added token refresh on 401 with automatic retry',
      },
      whyItHappened: {
        baseContext: 'Basic error handling',
        oursIntent: 'Improve reliability with network retries',
        theirsIntent: 'Fix authentication token expiry issues',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['apiClient', 'All API requests'],
      semanticRiskSeverity: 'critical',
      semanticImpact: 'Incorrect merge may cause infinite retry loops or failed authentication.',
      resolutionSuggestion: 'Combine both: retry with exponential backoff, but refresh token on 401 before retry.',
      oursCode: `apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry logic with exponential backoff
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    if (config.retry < 3) {
      config.retry += 1;
      const backoffMs = Math.pow(2, config.retry) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      console.log(\`Retrying request (attempt \${config.retry}/3)...\`);
      return apiClient.request(config);
    }
    
    return Promise.reject(error);
  }
);`,
      theirsCode: `apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
        originalRequest.headers['Authorization'] = \`Bearer \${token}\`;
        
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);`,
      baseCode: `apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request failed:', error);
    return Promise.reject(error);
  }
);`,
      aiSuggestedCode: `apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle token refresh on 401 (takes priority over retries)
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
        config.headers['Authorization'] = \`Bearer \${token}\`;
        
        // Reset retry count after successful token refresh
        config.retry = 0;
        return apiClient.request(config);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Retry logic with exponential backoff for other errors
    if (!config.retry) {
      config.retry = 0;
    }
    
    if (config.retry < 3 && error.response?.status >= 500) {
      config.retry += 1;
      const backoffMs = Math.pow(2, config.retry) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      console.log(\`Retrying request (attempt \${config.retry}/3)...\`);
      return apiClient.request(config);
    }
    
    return Promise.reject(error);
  }
);`,
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_auth_1',
      severity: 'high',
      title: 'Authentication flow behavior change',
      category: 'auth_pipeline',
      fileA: 'src/services/api.ts',
      fileB: 'server/middleware/auth.ts',
      description: 'Token refresh mechanism changes authentication lifecycle.',
      gitMergeStatus: 'structural_mismatch',
      rootCause: 'New refresh token endpoint and localStorage dependencies',
      runtimeBreakRisk: 'Users may be logged out unexpectedly if refresh fails.',
      recommendedResolution: 'Test authentication flow end-to-end with expired tokens.',
      diffA: '+ Token refresh on 401',
      diffB: '+ Backend validates token expiry',
    },
  ],
};

// TaskFlow: main vs refactor/database-optimization
export const taskflowDbOptimizationComparison: BranchComparison = {
  comparisonState: 'conflicts_found',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'refactor/database-optimization',
  aheadCount: 4,
  behindCount: 3,
  conflictingFilesCount: 2,
  semanticConflictsCount: 2,
  addedFiles: [
    'prisma/migrations/20240115_add_indexes.sql',
  ],
  deletedFiles: [],
  modifiedFiles: [
    'server/routes/tasks.ts',
    'prisma/schema.prisma',
    'server/services/taskService.ts',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'server/routes/tasks.ts',
      name: 'GET /api/tasks',
      impact: 'Optimized Prisma query with select projections',
    },
    {
      file: 'server/services/taskService.ts',
      name: 'getUserTasks',
      impact: 'Added query pagination and field selection',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [
    {
      table: 'Task',
      change: 'Added composite index on (userId, status)',
    },
    {
      table: 'Task',
      change: 'Added index on createdAt for sorting',
    },
  ],
  changedDependencies: [],
  conflicts: [
    {
      id: 'conflict_db_1',
      file: 'prisma/schema.prisma',
      lineStart: 15,
      lineEnd: 30,
      conflictType: 'textual',
      title: 'Prisma schema Task model field conflicts',
      reason: 'Both branches modified the Task model schema independently.',
      whatConflicted: 'Task model field definitions and indexes',
      whyItConflicted: 'Main added priority field; optimization branch added indexes and changed relations.',
      whatEachBranchChanged: {
        base: 'Basic Task model with standard fields',
        ours: 'Added priority enum field (LOW, MEDIUM, HIGH, URGENT)',
        theirs: 'Added composite indexes and changed assignedTo relationship',
      },
      whyItHappened: {
        baseContext: 'Basic task data model',
        oursIntent: 'Add task prioritization feature',
        theirsIntent: 'Optimize database query performance',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['Task model', 'Task queries', 'Database migrations'],
      semanticRiskSeverity: 'critical',
      semanticImpact: 'Schema conflicts require migration resolution before deployment.',
      resolutionSuggestion: 'Merge both: add priority field AND indexes, then generate new migration.',
      oursCode: `model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      TaskStatus
  priority    Priority @default(MEDIUM)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  dueDate     DateTime?
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}`,
      theirsCode: `model Task {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(255)
  description String?  @db.Text
  status      TaskStatus
  userId      String
  assignedTo  String?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignee    User?    @relation("TaskAssignee", fields: [assignedTo], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  dueDate     DateTime?
  
  @@index([userId, status])
  @@index([createdAt])
  @@index([assignedTo])
}`,
      baseCode: `model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      TaskStatus
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  dueDate     DateTime?
}`,
      aiSuggestedCode: `model Task {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(255)
  description String?  @db.Text
  status      TaskStatus
  priority    Priority @default(MEDIUM)
  userId      String
  assignedTo  String?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignee    User?    @relation("TaskAssignee", fields: [assignedTo], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  dueDate     DateTime?
  
  @@index([userId, status])
  @@index([createdAt])
  @@index([assignedTo])
  @@index([priority])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}`,
    },
    {
      id: 'conflict_db_2',
      file: 'server/routes/tasks.ts',
      lineStart: 12,
      lineEnd: 35,
      conflictType: 'textual',
      title: 'Task query endpoint implementation conflict',
      reason: 'Both branches modified the GET /api/tasks endpoint query logic.',
      whatConflicted: 'Prisma query structure and response fields',
      whyItConflicted: 'Main added priority filtering; optimization added field selection and pagination.',
      whatEachBranchChanged: {
        base: 'Simple findMany query with basic filtering',
        ours: 'Added priority query parameter and filter',
        theirs: 'Added pagination, select fields, and query optimization',
      },
      whyItHappened: {
        baseContext: 'Basic task fetching',
        oursIntent: 'Enable priority-based filtering',
        theirsIntent: 'Reduce payload size and improve performance',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['GET /api/tasks endpoint', 'Task list UI'],
      semanticRiskSeverity: 'high',
      semanticImpact: 'Query changes affect API response structure and frontend rendering.',
      resolutionSuggestion: 'Combine both: paginated query with priority filter and optimized fields.',
      oursCode: `router.get('/api/tasks', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { status, priority } = req.query;
  
  const where: any = { userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  
  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  
  res.json({ tasks });
});`,
      theirsCode: `router.get('/api/tasks', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { status, page = '1', limit = '20' } = req.query;
  
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);
  
  const where: any = { userId };
  if (status) where.status = status;
  
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.task.count({ where }),
  ]);
  
  res.json({ 
    tasks, 
    pagination: { 
      page: parseInt(page as string), 
      limit: take, 
      total, 
      totalPages: Math.ceil(total / take) 
    } 
  });
});`,
      baseCode: `router.get('/api/tasks', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { status } = req.query;
  
  const where: any = { userId };
  if (status) where.status = status;
  
  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  
  res.json({ tasks });
});`,
      aiSuggestedCode: `router.get('/api/tasks', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { status, priority, page = '1', limit = '20' } = req.query;
  
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);
  
  const where: any = { userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.task.count({ where }),
  ]);
  
  res.json({ 
    tasks, 
    pagination: { 
      page: parseInt(page as string), 
      limit: take, 
      total, 
      totalPages: Math.ceil(total / take) 
    } 
  });
});`,
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_db_1',
      severity: 'critical',
      title: 'Prisma schema migration required before deployment',
      category: 'database_migration',
      fileA: 'prisma/schema.prisma',
      fileB: 'prisma/migrations/migration.sql',
      description: 'New composite indexes and schema changes require database migration.',
      gitMergeStatus: 'structural_mismatch',
      rootCause: 'Schema migration required for production PostgreSQL table',
      runtimeBreakRisk: 'Application will fail to start if schema is out of sync with database.',
      recommendedResolution: 'Run `npx prisma migrate dev` locally, then `npx prisma migrate deploy` in production.',
      diffA: '+ @@index([userId, status])\n+ priority field',
      diffB: '+ CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");',
    },
    {
      id: 'semantic_db_2',
      severity: 'high',
      title: 'API response structure changed - frontend breaking change',
      category: 'api_signature',
      fileA: 'server/routes/tasks.ts',
      fileB: 'src/pages/Dashboard.tsx',
      description: 'Task endpoint now returns paginated response with different structure.',
      gitMergeStatus: 'git_clean_merge_with_hidden_runtime_break',
      rootCause: 'API response changed from { tasks: [] } to { tasks: [], pagination: {} }',
      runtimeBreakRisk: 'Frontend components expecting simple array will break.',
      recommendedResolution: 'Update frontend to handle pagination metadata or maintain backward compatibility.',
      diffA: '+ res.json({ tasks, pagination: {...} })',
      diffB: '- const tasks = response.data.tasks (expects array directly)',
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

// ShopFlow: main vs feature/stripe-elements-v3-upgrade
export const shopflowStripeUpgradeComparison: BranchComparison = {
  comparisonState: 'conflicts_found',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'feature/stripe-elements-v3-upgrade',
  aheadCount: 4,
  behindCount: 1,
  conflictingFilesCount: 2,
  semanticConflictsCount: 1,
  addedFiles: [
    'src/components/StripePaymentForm.tsx',
    'src/hooks/useStripeElements.ts',
  ],
  deletedFiles: [
    'src/components/LegacyPaymentForm.tsx',
  ],
  modifiedFiles: [
    'src/pages/Checkout.tsx',
    'src/hooks/usePayment.ts',
    'server/routes/checkout.ts',
    'package.json',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'src/pages/Checkout.tsx',
      name: 'handleProcessPayment',
      impact: 'Migrated from Stripe v2 Token API to v3 Payment Intent confirmation',
    },
    {
      file: 'server/routes/checkout.ts',
      name: 'createPaymentIntentHandler',
      impact: 'Replaced charge creation with Payment Intent creation',
    },
  ],
  changedApis: [
    {
      method: 'POST',
      route: '/api/checkout/create-intent',
      impact: 'New endpoint for Stripe Payment Intent creation (replaces /create-charge)',
    },
    {
      method: 'POST',
      route: '/api/checkout/confirm',
      impact: 'New endpoint for Payment Intent confirmation',
    },
  ],
  changedDatabaseStructures: [],
  changedDependencies: [
    {
      name: '@stripe/stripe-js',
      oldVersion: '1.46.0',
      newVersion: '3.0.6',
    },
    {
      name: '@stripe/react-stripe-js',
      oldVersion: '1.16.4',
      newVersion: '2.5.0',
    },
  ],
  conflicts: [
    {
      id: 'conflict_stripe_1',
      file: 'src/pages/Checkout.tsx',
      lineStart: 44,
      lineEnd: 72,
      conflictType: 'textual',
      title: 'Payment submission handler architecture conflict',
      reason: 'Both branches modified payment processing flow with incompatible approaches.',
      whatConflicted: 'handleProcessPayment function implementation',
      whyItConflicted: 'Main branch added address validation; feature branch migrated to Stripe v3 Payment Intents API.',
      whatEachBranchChanged: {
        base: 'Original Stripe v2 Token-based payment',
        ours: 'Enhanced address validation with postal code regex verification',
        theirs: 'Complete migration to Stripe v3 Payment Intent confirmation flow',
      },
      whyItHappened: {
        baseContext: 'Legacy Stripe v2 integration using createToken()',
        oursIntent: 'Improve shipping address validation to reduce failed deliveries',
        theirsIntent: 'Upgrade to Stripe Payment Intents for SCA compliance and better fraud detection',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['Checkout flow', 'Payment processing', 'Order confirmation'],
      semanticRiskSeverity: 'critical',
      semanticImpact: 'Stripe v2 and v3 APIs are incompatible. Mixing both will cause payment failures.',
      resolutionSuggestion: 'Adopt Stripe v3 Payment Intent flow AND integrate enhanced address validation within confirmPayment.',
      oursCode: `const handleProcessPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateShippingAddress(shippingAddress)) {
    setFormError('Please complete all required shipping fields.');
    return;
  }
  
  // Enhanced postal code validation
  const postalCodeRegex = /^\\d{5}(-\\d{4})?$/;
  if (!postalCodeRegex.test(shippingAddress.postalCode)) {
    setFormError('Invalid postal code format. Use 5-digit or ZIP+4 format.');
    return;
  }
  
  setFormError(null);

  try {
    const { token, error } = await stripe.createToken({ 
      type: 'card',
      name: shippingAddress.fullName,
      address_line1: shippingAddress.street,
      address_city: shippingAddress.city,
      address_zip: shippingAddress.postalCode,
      address_country: shippingAddress.country,
    });
    
    if (error) throw new Error(error.message);
    
    const result = await apiClient.post('/api/checkout/charge', {
      token: token.id,
      billingDetails: shippingAddress,
    });

    if (result.data.success) {
      setPaymentSuccess(true);
    }
  } catch (err: any) {
    setFormError(err.message || 'Payment processing failed.');
  }
};`,
      theirsCode: `const handleProcessPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateShippingAddress(shippingAddress)) {
    setFormError('Please complete all required shipping fields.');
    return;
  }
  setFormError(null);

  try {
    if (!clientSecret) throw new Error('Missing payment intent secret');
    
    // Stripe v3 Payment Intent confirmation with Elements
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement('card'),
        billing_details: {
          name: shippingAddress.fullName,
          address: {
            line1: shippingAddress.street,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent.status === 'succeeded') {
      await apiClient.post('/api/checkout/confirm', {
        paymentIntentId: paymentIntent.id,
      });
      setPaymentSuccess(true);
    }
  } catch (err: any) {
    setFormError(err.message || 'Payment processing failed.');
  }
};`,
      baseCode: `const handleProcessPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateShippingAddress(shippingAddress)) {
    setFormError('Please complete all required shipping fields.');
    return;
  }
  setFormError(null);

  try {
    const { token, error } = await stripe.createToken({ 
      type: 'card',
      name: shippingAddress.fullName,
    });
    
    if (error) throw new Error(error.message);
    
    const result = await apiClient.post('/api/checkout/charge', {
      token: token.id,
    });

    if (result.data.success) {
      setPaymentSuccess(true);
    }
  } catch (err: any) {
    setFormError(err.message || 'Payment processing failed.');
  }
};`,
      aiSuggestedCode: `const handleProcessPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateShippingAddress(shippingAddress)) {
    setFormError('Please complete all required shipping fields.');
    return;
  }
  
  // Enhanced postal code validation (from main)
  const postalCodeRegex = /^\\d{5}(-\\d{4})?$/;
  if (!postalCodeRegex.test(shippingAddress.postalCode)) {
    setFormError('Invalid postal code format. Use 5-digit or ZIP+4 format.');
    return;
  }
  
  setFormError(null);

  try {
    if (!clientSecret) throw new Error('Missing payment intent secret');
    
    // Stripe v3 Payment Intent confirmation with Elements (from feature)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement('card'),
        billing_details: {
          name: shippingAddress.fullName,
          address: {
            line1: shippingAddress.street,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent.status === 'succeeded') {
      await apiClient.post('/api/checkout/confirm', {
        paymentIntentId: paymentIntent.id,
        billingDetails: shippingAddress,
      });
      setPaymentSuccess(true);
    }
  } catch (err: any) {
    setFormError(err.message || 'Payment processing failed.');
  }
};`,
    },
    {
      id: 'conflict_stripe_2',
      file: 'server/routes/checkout.ts',
      lineStart: 14,
      lineEnd: 52,
      conflictType: 'textual',
      title: 'Backend payment endpoint implementation conflict',
      reason: 'Main and feature branch diverged on payment processing backend architecture.',
      whatConflicted: 'Payment creation endpoint handler',
      whyItConflicted: 'Main added inventory reservation logic; feature migrated to Payment Intent API.',
      whatEachBranchChanged: {
        base: 'Simple Stripe charge creation',
        ours: 'Added pessimistic inventory locking with database transactions',
        theirs: 'Migrated to createPaymentIntent with metadata and idempotency',
      },
      whyItHappened: {
        baseContext: 'Direct charge API with no stock validation',
        oursIntent: 'Prevent overselling by reserving inventory before payment',
        theirsIntent: 'Adopt Payment Intents for 3D Secure and improved decline handling',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['Checkout API', 'Inventory management', 'Stripe integration'],
      semanticRiskSeverity: 'critical',
      semanticImpact: 'Backend must support Payment Intents AND inventory reservation atomically.',
      resolutionSuggestion: 'Combine: createPaymentIntent WITH inventory reservation in database transaction.',
      oursCode: `checkoutRouter.post('/create-charge', authGuard, async (req: Request, res: Response) => {
  try {
    const { token, items } = req.body;
    const userId = (req as any).user.id;

    // Calculate total and reserve inventory atomically
    const reservationResult = await prisma.$transaction(async (tx) => {
      let totalCents = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.inventoryCount < item.quantity) {
          throw new Error(\`Insufficient stock for \${item.id}\`);
        }
        await tx.product.update({
          where: { id: item.id },
          data: { inventoryCount: { decrement: item.quantity } },
        });
        totalCents += Math.round(product.price * 100) * item.quantity;
      }
      return totalCents;
    });

    const charge = await stripeService.createCharge({
      amount: reservationResult,
      currency: 'usd',
      source: token,
      metadata: { userId },
    });

    res.json({ success: true, chargeId: charge.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`,
      theirsCode: `checkoutRouter.post('/create-intent', authGuard, async (req: Request, res: Response) => {
  try {
    const { items, currency = 'usd' } = req.body;
    const userId = (req as any).user.id;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    // Calculate price securely on server
    let totalCents = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) {
        return res.status(404).json({ error: \`Product \${item.id} not found\` });
      }
      totalCents += Math.round(product.price * 100) * item.quantity;
    }

    // Create Stripe Payment Intent with Idempotency Key
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalCents,
      currency,
      metadata: {
        userId,
        itemCount: items.length.toString(),
      },
      idempotencyKey: \`pi_\${userId}_\${Date.now()}\`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`,
      baseCode: `checkoutRouter.post('/create-charge', authGuard, async (req: Request, res: Response) => {
  try {
    const { token, amount } = req.body;
    const userId = (req as any).user.id;

    const charge = await stripeService.createCharge({
      amount,
      currency: 'usd',
      source: token,
      metadata: { userId },
    });

    res.json({ success: true, chargeId: charge.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`,
      aiSuggestedCode: `checkoutRouter.post('/create-intent', authGuard, async (req: Request, res: Response) => {
  try {
    const { items, currency = 'usd' } = req.body;
    const userId = (req as any).user.id;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    // Calculate price AND reserve inventory atomically (combining both approaches)
    const totalCents = await prisma.$transaction(async (tx) => {
      let total = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product) {
          throw new Error(\`Product \${item.id} not found\`);
        }
        if (product.inventoryCount < item.quantity) {
          throw new Error(\`Insufficient stock for \${product.title}\`);
        }
        // Pessimistic inventory reservation
        await tx.product.update({
          where: { id: item.id },
          data: { inventoryCount: { decrement: item.quantity } },
        });
        total += Math.round(product.price * 100) * item.quantity;
      }
      return total;
    });

    // Create Stripe Payment Intent (v3 API)
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalCents,
      currency,
      metadata: {
        userId,
        itemCount: items.length.toString(),
      },
      idempotencyKey: \`pi_\${userId}_\${Date.now()}\`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalCents,
    });
  } catch (error: any) {
    console.error('Failed to create payment intent:', error);
    res.status(500).json({ error: error.message || 'Internal payment processing error' });
  }
});`,
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_stripe_1',
      severity: 'critical',
      title: 'Stripe API version incompatibility - breaking change',
      category: 'api_signature',
      fileA: 'src/pages/Checkout.tsx',
      fileB: 'server/routes/checkout.ts',
      description: 'Stripe v2 Token API deprecated; v3 Payment Intents require client-server architecture changes.',
      gitMergeStatus: 'structural_mismatch',
      rootCause: 'createToken() removed in v3; must use confirmCardPayment() with Payment Intent',
      runtimeBreakRisk: 'Payments will fail if frontend and backend use mismatched Stripe API versions.',
      recommendedResolution: 'Complete migration to Payment Intents on BOTH frontend and backend before deployment.',
      diffA: '- stripe.createToken()\n+ stripe.confirmCardPayment(clientSecret, ...)',
      diffB: '- stripeService.createCharge()\n+ stripeService.createPaymentIntent()',
    },
  ],
};

// ShopFlow: main vs bugfix/checkout-idempotency
export const shopflowCheckoutBugfixComparison: BranchComparison = {
  comparisonState: 'no_conflicts',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'bugfix/checkout-idempotency',
  aheadCount: 2,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [],
  deletedFiles: [],
  modifiedFiles: [
    'server/routes/checkout.ts',
    'server/services/orderService.ts',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'server/routes/checkout.ts',
      name: 'confirmOrderHandler',
      impact: 'Added idempotency key checking to prevent duplicate order creation',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [],
};

// ShopFlow: main vs feature/prisma-inventory-reservation
export const shopflowInventoryReservationComparison: BranchComparison = {
  comparisonState: 'conflicts_found',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'feature/prisma-inventory-reservation',
  aheadCount: 3,
  behindCount: 2,
  conflictingFilesCount: 1,
  semanticConflictsCount: 1,
  addedFiles: [
    'server/services/inventoryService.ts',
  ],
  deletedFiles: [],
  modifiedFiles: [
    'server/routes/checkout.ts',
    'prisma/schema.prisma',
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      file: 'server/routes/checkout.ts',
      name: 'createPaymentIntentHandler',
      impact: 'Integrated inventory reservation service with row-level locking',
    },
  ],
  changedApis: [],
  changedDatabaseStructures: [
    {
      table: 'Product',
      change: 'Added reservedCount field for pessimistic inventory locking',
    },
  ],
  changedDependencies: [],
  conflicts: [
    {
      id: 'conflict_inventory_1',
      file: 'server/routes/checkout.ts',
      lineStart: 18,
      lineEnd: 38,
      conflictType: 'textual',
      title: 'Inventory validation strategy conflict',
      reason: 'Both branches implemented different inventory checking approaches.',
      whatConflicted: 'Stock availability validation logic',
      whyItConflicted: 'Main used simple read-check; feature added pessimistic row-level locking.',
      whatEachBranchChanged: {
        base: 'Basic inventory count check',
        ours: 'Added batch inventory validation with async/await error handling',
        theirs: 'Implemented transaction-based pessimistic locking with reservedCount tracking',
      },
      whyItHappened: {
        baseContext: 'Race condition causing overselling under high load',
        oursIntent: 'Improve error messages for out-of-stock scenarios',
        theirsIntent: 'Prevent overselling with database-level row locking',
      },
      resolutionStatus: 'unresolved',
      affectedComponents: ['Checkout flow', 'Inventory management', 'Product availability'],
      semanticRiskSeverity: 'high',
      semanticImpact: 'Simple read-check allows race conditions; pessimistic locking prevents concurrent overselling.',
      resolutionSuggestion: 'Adopt pessimistic locking approach (inventoryService.reserveStock) with improved error messages.',
      oursCode: `// Validate inventory availability with detailed error messages
for (const item of items) {
  const product = await prisma.product.findUnique({ where: { id: item.id } });
  if (!product) {
    return res.status(404).json({ 
      error: \`Product "\${item.id}" not found in catalog\`,
      errorCode: 'PRODUCT_NOT_FOUND',
    });
  }
  if (product.inventoryCount < item.quantity) {
    return res.status(400).json({ 
      error: \`Insufficient stock for "\${product.title}". Available: \${product.inventoryCount}, Requested: \${item.quantity}\`,
      errorCode: 'INSUFFICIENT_STOCK',
      availableQuantity: product.inventoryCount,
    });
  }
  totalCents += Math.round(product.price * 100) * item.quantity;
}`,
      theirsCode: `// Reserve inventory temporarily with pessimistic locking
await inventoryService.reserveStock(items, userId);

// Calculate total after successful reservation
let totalCents = 0;
for (const item of items) {
  const product = await prisma.product.findUnique({ where: { id: item.id } });
  if (!product) {
    return res.status(404).json({ error: \`Product \${item.id} not found\` });
  }
  totalCents += Math.round(product.price * 100) * item.quantity;
}`,
      baseCode: `// Basic inventory check
let totalCents = 0;
for (const item of items) {
  const product = await prisma.product.findUnique({ where: { id: item.id } });
  if (!product) {
    return res.status(404).json({ error: \`Product \${item.id} not found\` });
  }
  if (product.inventoryCount < item.quantity) {
    return res.status(400).json({ error: \`Insufficient stock for \${product.title}\` });
  }
  totalCents += Math.round(product.price * 100) * item.quantity;
}`,
      aiSuggestedCode: `// Reserve inventory with pessimistic locking and detailed error handling
try {
  await inventoryService.reserveStock(items, userId);
} catch (reservationError: any) {
  if (reservationError.code === 'PRODUCT_NOT_FOUND') {
    return res.status(404).json({
      error: reservationError.message,
      errorCode: 'PRODUCT_NOT_FOUND',
    });
  }
  if (reservationError.code === 'INSUFFICIENT_STOCK') {
    return res.status(400).json({
      error: reservationError.message,
      errorCode: 'INSUFFICIENT_STOCK',
      availableQuantity: reservationError.availableQuantity,
    });
  }
  throw reservationError;
}

// Calculate total after successful reservation
let totalCents = 0;
for (const item of items) {
  const product = await prisma.product.findUnique({ where: { id: item.id } });
  if (!product) {
    return res.status(404).json({ error: \`Product \${item.id} not found\` });
  }
  totalCents += Math.round(product.price * 100) * item.quantity;
}`,
    },
  ],
  semanticAlerts: [
    {
      id: 'semantic_inventory_1',
      severity: 'high',
      title: 'Prisma schema change requires database migration',
      category: 'database_migration',
      fileA: 'prisma/schema.prisma',
      fileB: 'server/services/inventoryService.ts',
      description: 'New reservedCount field added to Product model for inventory locking.',
      gitMergeStatus: 'structural_mismatch',
      rootCause: 'Schema migration required for reservedCount column',
      runtimeBreakRisk: 'Application will crash if schema is not migrated before deployment.',
      recommendedResolution: 'Run `npx prisma migrate dev` and `npx prisma migrate deploy` in staging/production.',
      diffA: '+ reservedCount Int @default(0)',
      diffB: '+ inventoryService.reserveStock() uses reservedCount',
    },
  ],
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
  'repo_shopflow_01': {
    'main->feature/stripe-elements-v3-upgrade': shopflowStripeUpgradeComparison,
    'main->bugfix/checkout-idempotency': shopflowCheckoutBugfixComparison,
    'main->feature/prisma-inventory-reservation': shopflowInventoryReservationComparison,
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
