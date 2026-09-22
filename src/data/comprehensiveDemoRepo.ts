import { RepositoryData, FileNode } from '../types/repository';

/**
 * Comprehensive Demo Repository - TaskFlow Project Management System
 * A realistic full-stack application with multiple branches for testing all features
 */

// Main branch file structure
const mainBranchFiles: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'src-pages',
        name: 'pages',
        path: 'src/pages',
        type: 'directory',
        isOpen: true,
        children: [
          {
            id: 'src-pages-dashboard',
            name: 'Dashboard.tsx',
            path: 'src/pages/Dashboard.tsx',
            type: 'file',
            language: 'typescript',
            size: 3840,
            symbols: [
              { name: 'Dashboard', kind: 'function', line: 12, exported: true },
              { name: 'fetchUserTasks', kind: 'function', line: 45 },
              { name: 'calculateTaskMetrics', kind: 'function', line: 78 }
            ],
            content: `import React, { useState, useEffect } from 'react';
import { TaskCard } from '../components/TaskCard';
import { MetricsPanel } from '../components/MetricsPanel';
import { apiClient } from '../services/api';
import { Task, TaskMetrics } from '../types';
import { Loader2, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTasks();
  }, [userId]);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(\`/api/tasks?userId=\${userId}&limit=50\`);
      const fetchedTasks = response.data.tasks;
      
      setTasks(fetchedTasks);
      setMetrics(calculateTaskMetrics(fetchedTasks));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskMetrics = (taskList: Task[]): TaskMetrics => {
    const total = taskList.length;
    const completed = taskList.filter(t => t.status === 'COMPLETED').length;
    const inProgress = taskList.filter(t => t.status === 'IN_PROGRESS').length;
    const overdue = taskList.filter(t => {
      return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED';
    }).length;
    
    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await apiClient.patch(\`/api/tasks/\${taskId}\`, updates);
      await fetchUserTasks();
    } catch (err: any) {
      setError('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Task Dashboard</h1>
        <p className="text-slate-600">Manage and track your project tasks</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricsPanel
            icon={<TrendingUp />}
            title="Total Tasks"
            value={metrics.total}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricsPanel
            icon={<CheckCircle />}
            title="Completed"
            value={metrics.completed}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <MetricsPanel
            icon={<Clock />}
            title="In Progress"
            value={metrics.inProgress}
            bgColor="bg-yellow-50"
            iconColor="text-yellow-600"
          />
          <MetricsPanel
            icon={<AlertCircle />}
            title="Overdue"
            value={metrics.overdue}
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => handleTaskUpdate(task.id, updates)}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No tasks found. Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
};
`
          },
          {
            id: 'src-pages-tasks',
            name: 'TaskList.tsx',
            path: 'src/pages/TaskList.tsx',
            type: 'file',
            language: 'typescript',
            size: 2540,
            symbols: [
              { name: 'TaskList', kind: 'function', line: 8, exported: true }
            ],
            content: `import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Search, Filter } from 'lucide-react';

interface TaskListProps {
  onCreateTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onCreateTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">All Tasks</h2>
        <button
          onClick={onCreateTask}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
    </div>
  );
};
`
          }
        ]
      },
      {
        id: 'src-components',
        name: 'components',
        path: 'src/components',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-components-taskcard',
            name: 'TaskCard.tsx',
            path: 'src/components/TaskCard.tsx',
            type: 'file',
            language: 'typescript',
            size: 1980,
            symbols: [
              { name: 'TaskCard', kind: 'function', line: 10, exported: true }
            ],
            content: `import React from 'react';
import { Task } from '../types';
import { Calendar, User, Tag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'TODO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-slate-900 text-lg">{task.title}</h3>
        <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(task.status)}\`}>
          {task.status}
        </span>
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{task.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{task.assignee}</span>
          </div>
        )}
        <div className={\`flex items-center gap-1 \${getPriorityColor(task.priority)}\`}>
          <Tag className="w-3.5 h-3.5" />
          <span>{task.priority}</span>
        </div>
      </div>
    </div>
  );
};
`
          },
          {
            id: 'src-components-metricspanel',
            name: 'MetricsPanel.tsx',
            path: 'src/components/MetricsPanel.tsx',
            type: 'file',
            language: 'typescript',
            size: 980,
            symbols: [
              { name: 'MetricsPanel', kind: 'function', line: 10, exported: true }
            ],
            content: `import React from 'react';

interface MetricsPanelProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  bgColor: string;
  iconColor: string;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ 
  icon, 
  title, 
  value, 
  bgColor, 
  iconColor 
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={\`\${bgColor} p-3 rounded-lg\`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
};
`
          }
        ]
      },
      {
        id: 'src-services',
        name: 'services',
        path: 'src/services',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-services-api',
            name: 'api.ts',
            path: 'src/services/api.ts',
            type: 'file',
            language: 'typescript',
            size: 1450,
            symbols: [
              { name: 'apiClient', kind: 'variable', line: 5, exported: true }
            ],
            content: `const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
  async get(endpoint: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: \`Bearer \${token}\` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
    
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: \`Bearer \${token}\` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
    
    return response.json();
  },

  async patch(endpoint: string, data: any) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: \`Bearer \${token}\` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
    
    return response.json();
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: \`Bearer \${token}\` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
    
    return response.json();
  },
};
`
          }
        ]
      },
      {
        id: 'src-types',
        name: 'types',
        path: 'src/types',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-types-index',
            name: 'index.ts',
            path: 'src/types/index.ts',
            type: 'file',
            language: 'typescript',
            size: 1200,
            symbols: [
              { name: 'Task', kind: 'interface', line: 1, exported: true },
              { name: 'TaskMetrics', kind: 'interface', line: 14, exported: true },
              { name: 'User', kind: 'interface', line: 22, exported: true }
            ],
            content: `export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}
`
          }
        ]
      }
    ]
  },
  {
    id: 'server',
    name: 'server',
    path: 'server',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'server-index',
        name: 'index.ts',
        path: 'server/index.ts',
        type: 'file',
        language: 'typescript',
        size: 1620,
        symbols: [
          { name: 'app', kind: 'variable', line: 8, exported: true }
        ],
        content: `import express from 'express';
import cors from 'cors';
import { taskRoutes } from './routes/tasks';
import { authRoutes } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`🚀 TaskFlow API running on port \${PORT}\`);
});

export default app;
`
      },
      {
        id: 'server-routes',
        name: 'routes',
        path: 'server/routes',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'server-routes-tasks',
            name: 'tasks.ts',
            path: 'server/routes/tasks.ts',
            type: 'file',
            language: 'typescript',
            size: 2890,
            symbols: [
              { name: 'taskRoutes', kind: 'variable', line: 6, exported: true }
            ],
            content: `import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
export const taskRoutes = Router();

taskRoutes.use(authMiddleware);

taskRoutes.get('/', async (req, res, next) => {
  try {
    const { userId, status, priority, limit = '50' } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        ...(userId && { userId: userId as string }),
        ...(status && { status: status as string }),
        ...(priority && { priority: priority as string }),
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
});

taskRoutes.post('/', async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignee } = req.body;
    const userId = (req as any).user.id;
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee,
        userId,
        status: 'TODO',
      },
    });
    
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

taskRoutes.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const task = await prisma.task.update({
      where: { id },
      data: updates,
    });
    
    res.json(task);
  } catch (error) {
    next(error);
  }
});

taskRoutes.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.task.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
`
          },
          {
            id: 'server-routes-auth',
            name: 'auth.ts',
            path: 'server/routes/auth.ts',
            type: 'file',
            language: 'typescript',
            size: 1840,
            symbols: [
              { name: 'authRoutes', kind: 'variable', line: 7, exported: true }
            ],
            content: `import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export const authRoutes = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';

authRoutes.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });
    
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
});
`
          }
        ]
      },
      {
        id: 'server-middleware',
        name: 'middleware',
        path: 'server/middleware',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'server-middleware-auth',
            name: 'auth.ts',
            path: 'server/middleware/auth.ts',
            type: 'file',
            language: 'typescript',
            size: 890,
            symbols: [
              { name: 'authMiddleware', kind: 'function', line: 5, exported: true }
            ],
            content: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    (req as any).user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
`
          },
          {
            id: 'server-middleware-logger',
            name: 'logger.ts',
            path: 'server/middleware/logger.ts',
            type: 'file',
            language: 'typescript',
            size: 520,
            symbols: [
              { name: 'requestLogger', kind: 'function', line: 3, exported: true }
            ],
            content: `import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path} - \${res.statusCode} (\${duration}ms)\`);
  });
  
  next();
};
`
          },
          {
            id: 'server-middleware-errorHandler',
            name: 'errorHandler.ts',
            path: 'server/middleware/errorHandler.ts',
            type: 'file',
            language: 'typescript',
            size: 640,
            symbols: [
              { name: 'errorHandler', kind: 'function', line: 3, exported: true }
            ],
            content: `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
`
          }
        ]
      }
    ]
  },
  {
    id: 'prisma',
    name: 'prisma',
    path: 'prisma',
    type: 'directory',
    isOpen: false,
    children: [
      {
        id: 'prisma-schema',
        name: 'schema.prisma',
        path: 'prisma/schema.prisma',
        type: 'file',
        language: 'prisma',
        size: 1450,
        content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String       @db.Text
  status      TaskStatus   @default(TODO)
  priority    Priority     @default(MEDIUM)
  assignee    String?
  dueDate     DateTime?
  tags        String[]
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([userId])
  @@index([status])
  @@index([priority])
}

enum Role {
  USER
  ADMIN
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
`
      }
    ]
  },
  {
    id: 'tests',
    name: 'tests',
    path: 'tests',
    type: 'directory',
    isOpen: false,
    children: [
      {
        id: 'tests-dashboard',
        name: 'Dashboard.test.tsx',
        path: 'tests/Dashboard.test.tsx',
        type: 'file',
        language: 'typescript',
        size: 1340,
        symbols: [
          { name: 'describe', kind: 'function', line: 5 }
        ],
        content: `import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../src/pages/Dashboard';
import { apiClient } from '../src/services/api';

jest.mock('../src/services/api');

describe('Dashboard', () => {
  it('should render loading state initially', () => {
    render(<Dashboard userId="test-user-123" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should fetch and display tasks', async () => {
    const mockTasks = [
      { id: '1', title: 'Test Task', status: 'TODO', priority: 'HIGH' },
    ];
    
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { tasks: mockTasks } });
    
    render(<Dashboard userId="test-user-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should calculate metrics correctly', async () => {
    const mockTasks = [
      { id: '1', status: 'COMPLETED' },
      { id: '2', status: 'TODO' },
      { id: '3', status: 'IN_PROGRESS' },
    ];
    
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { tasks: mockTasks } });
    
    render(<Dashboard userId="test-user-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    });
  });
});
`
      }
    ]
  },
  {
    id: 'package.json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    language: 'json',
    size: 1200,
    content: `{
  "name": "taskflow",
  "version": "1.0.0",
  "description": "Full-stack task management system",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "tsx watch server/index.ts",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "express": "^4.18.2",
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "lucide-react": "^0.263.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/express": "^4.17.17",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.3.9",
    "prisma": "^5.0.0",
    "tsx": "^3.12.7",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.5",
    "jest": "^29.5.0"
  }
}
`
  },
  {
    id: 'README.md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    language: 'markdown',
    size: 2480,
    content: `# TaskFlow - Project Management System

A modern, full-stack task management application built with React, Express, and PostgreSQL.

## Features

- 📊 **Dashboard** - Visual metrics and task overview
- ✅ **Task Management** - Create, update, and organize tasks
- 🔐 **Authentication** - Secure JWT-based auth system
- 🎯 **Priority Levels** - Categorize tasks by urgency
- 📅 **Due Dates** - Track deadlines and overdue tasks
- 👥 **User Management** - Multi-user support with roles
- 🧪 **Testing** - Comprehensive test coverage

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite for blazing-fast builds
- Lucide React for icons
- TailwindCSS for styling

### Backend
- Express.js for REST API
- Prisma ORM for database access
- PostgreSQL for data persistence
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourorg/taskflow.git
cd taskflow
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

4. Run database migrations
\`\`\`bash
npx prisma migrate dev
\`\`\`

5. Start development servers
\`\`\`bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
\`\`\`

## Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user

### Tasks
- \`GET /api/tasks\` - Get all tasks
- \`POST /api/tasks\` - Create new task
- \`PATCH /api/tasks/:id\` - Update task
- \`DELETE /api/tasks/:id\` - Delete task

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
`
  }
];

export const comprehensiveDemoRepo: RepositoryData = {
  id: 'demo_taskflow_comprehensive',
  name: 'TaskFlow',
  fullName: 'demo/taskflow',
  description: 'A comprehensive full-stack task management system with React frontend, Express API, PostgreSQL database, and JWT authentication - perfect for testing all RepoLens features',
  defaultBranch: 'main',
  currentBranch: 'main',
  branches: [
    'main',
    'feature/dark-mode',
    'feature/notifications',
    'bugfix/auth-token-expiry',
    'refactor/database-optimization',
    'release/v2.0'
  ],
  isDemo: true,
  stats: {
    filesCount: 32,
    linesOfCode: 4850,
    stars: 142,
    forks: 28,
    lastCommit: '2 hours ago',
    author: 'TaskFlow Team',
    healthScore: 87,
    securityScore: 82,
    testCoverage: 76,
    complexityScore: 4.2,
  },
  metrics: {
    totalLOC: 4850,
    cyclomaticComplexityAvg: 4.2,
    maintainabilityIndex: 82,
    technicalDebtRatioPercent: 5.1,
    duplicatedCodePercent: 3.2,
    testCoveragePercent: 76.0,
    documentedSymbolsPercent: 68.0,
  },
  hotspots: [
    {
      id: 'hot_1',
      file: 'src/pages/Dashboard.tsx',
      functionName: 'fetchUserTasks',
      cyclomaticComplexity: 8,
      changeFrequencyScore: 85,
      linesOfCode: 42,
      riskScore: 78,
      reason: 'Frequently modified function with multiple async operations and error handling branches',
    },
    {
      id: 'hot_2',
      file: 'server/routes/tasks.ts',
      functionName: 'GET /',
      cyclomaticComplexity: 6,
      changeFrequencyScore: 72,
      linesOfCode: 28,
      riskScore: 68,
      reason: 'Complex query logic with multiple filter conditions',
    }
  ],
  deadCodeItems: [
    {
      id: 'dead_1',
      file: 'src/services/api.ts',
      symbolName: 'legacyAuthHeader',
      kind: 'function',
      line: 85,
      confidence: 92,
      estimatedSavingLines: 12,
      suggestion: 'Function deprecated after JWT migration; no callers found in codebase',
    }
  ],
  duplicateCodeItems: [
    {
      id: 'dup_1',
      title: 'Error handling pattern in API calls',
      similarityPercentage: 89,
      linesCount: 8,
      instances: [
        {
          file: 'src/pages/Dashboard.tsx',
          lineStart: 52,
          lineEnd: 60,
          snippet: 'try { ... } catch (err: any) { setError(err.message || "Failed to...") }',
        },
        {
          file: 'src/pages/TaskList.tsx',
          lineStart: 34,
          lineEnd: 42,
          snippet: 'try { ... } catch (err: any) { setError(err.message || "Failed to...") }',
        }
      ],
      refactoringSuggestion: 'Extract into reusable useApiError hook',
    }
  ],
  languages: [
    { name: 'TypeScript', percentage: 78.5, color: '#3178c6', files: 24 },
    { name: 'JSON', percentage: 8.2, color: '#292929', files: 3 },
    { name: 'Prisma', percentage: 6.8, color: '#0c344b', files: 1 },
    { name: 'Markdown', percentage: 4.5, color: '#083fa1', files: 2 },
    { name: 'JavaScript', percentage: 2.0, color: '#f1e05a', files: 2 },
  ],
  frameworks: [
    { name: 'React', category: 'frontend', version: '18.2.0', icon: 'React' },
    { name: 'Vite', category: 'frontend', version: '4.3.9', icon: 'Zap' },
    { name: 'Express', category: 'backend', version: '4.18.2', icon: 'Server' },
    { name: 'Prisma', category: 'database', version: '5.0.0', icon: 'Database' },
    { name: 'PostgreSQL', category: 'database', version: '14+', icon: 'Database' },
    { name: 'Jest', category: 'testing', version: '29.5.0', icon: 'Flask' },
  ],
  architecture: {
    pattern: 'Full-Stack Monorepo',
    description: 'Modern full-stack application with React frontend and Express API backend sharing a monorepo structure. Uses Prisma ORM for type-safe database access, JWT for authentication, and comprehensive testing with Jest.',
    components: [
      {
        name: 'Frontend (React)',
        role: 'User interface and client-side logic',
        path: 'src/',
        technologies: ['React', 'TypeScript', 'Vite', 'TailwindCSS'],
      },
      {
        name: 'Backend API (Express)',
        role: 'RESTful API server',
        path: 'server/',
        technologies: ['Express', 'TypeScript', 'Prisma'],
      },
      {
        name: 'Database Layer',
        role: 'Data persistence and schema management',
        path: 'prisma/',
        technologies: ['Prisma', 'PostgreSQL'],
      },
      {
        name: 'Test Suite',
        role: 'Unit and integration tests',
        path: 'tests/',
        technologies: ['Jest', 'React Testing Library'],
      }
    ],
    dataFlowSummary: 'React components call API service → Express routes process requests → Prisma queries PostgreSQL → Response flows back through layers',
  },
  dependencies: [
    { name: 'react', version: '18.2.0', type: 'production', description: 'React library' },
    { name: 'express', version: '4.18.2', type: 'production', description: 'Web framework' },
    { name: 'prisma', version: '5.0.0', type: 'development', description: 'ORM tool' },
    { name: 'jsonwebtoken', version: '9.0.0', type: 'production', description: 'JWT auth' },
  ],
  apiRoutes: [
    {
      method: 'POST',
      path: '/api/auth/register',
      handlerFile: 'server/routes/auth.ts',
      handlerSymbol: 'registerHandler',
      authRequired: false,
      description: 'Register new user account',
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      handlerFile: 'server/routes/auth.ts',
      handlerSymbol: 'loginHandler',
      authRequired: false,
      description: 'Authenticate user and return JWT token',
    },
    {
      method: 'GET',
      path: '/api/tasks',
      handlerFile: 'server/routes/tasks.ts',
      handlerSymbol: 'getTasksHandler',
      authRequired: true,
      description: 'Fetch all tasks with optional filters',
    },
    {
      method: 'POST',
      path: '/api/tasks',
      handlerFile: 'server/routes/tasks.ts',
      handlerSymbol: 'createTaskHandler',
      authRequired: true,
      description: 'Create new task',
    },
    {
      method: 'PATCH',
      path: '/api/tasks/:id',
      handlerFile: 'server/routes/tasks.ts',
      handlerSymbol: 'updateTaskHandler',
      authRequired: true,
      description: 'Update existing task',
    },
    {
      method: 'DELETE',
      path: '/api/tasks/:id',
      handlerFile: 'server/routes/tasks.ts',
      handlerSymbol: 'deleteTaskHandler',
      authRequired: true,
      description: 'Delete task by ID',
    },
  ],
  databaseModels: [
    {
      name: 'User',
      tableName: 'users',
      file: 'prisma/schema.prisma',
      fieldsCount: 7,
      relations: ['tasks -> Task[]'],
    },
    {
      name: 'Task',
      tableName: 'tasks',
      file: 'prisma/schema.prisma',
      fieldsCount: 11,
      relations: ['user -> User'],
    },
  ],
  rootFiles: mainBranchFiles,
};
