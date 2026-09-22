import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { ExploreView } from '../explore/ExploreView';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  StatTile,
  TabsList,
  TabsTrigger,
  DataTable,
  TableHeader,
  TableRow,
  TableCell,
} from '../../frontend';
import { FileCode } from 'lucide-react';

export const RepoOverview: React.FC = () => {
  const {
    repo,
    selectFileByPath,
  } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'explorer' | 'apis_db' | 'dependencies' | 'hotspots'>('metrics');

  if (activeTab === 'explorer') {
    return (
      <div className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden">
        <div className="h-12 bg-bg-surface border-b border-border-default px-4 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
              Intelligence
            </span>
            <span className="text-text-primary text-xs">Monaco Code Explorer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('metrics')}>
              ← Back to Metrics
            </Button>
            <Button variant="primary" size="sm">
              <FileCode strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
              <span>Monaco Editor</span>
            </Button>
          </div>
        </div>
        <ExploreView />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 text-text-primary w-full select-none bg-bg-base">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">
              {repo.name}
            </h1>
            <Badge variant="good">Public</Badge>
          </div>
          <p className="text-[13px] text-text-secondary font-normal max-w-2xl">
            {repo.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-text-tertiary mt-2 font-mono">
            <span>Branch: <span className="text-text-primary">{repo.currentBranch}</span></span>
            <span>•</span>
            <span className="text-status-good">CI Checks 100% Passing</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setActiveTab('explorer')}>
            Code Explorer
          </Button>
          <Button variant="primary" size="sm">
            Export
          </Button>
          {/* Max one Accent button per screen */}
          <Button variant="accent" size="sm">
            Run AI Audit
          </Button>
        </div>
      </div>

      {/* Tabs (Underline Active Style, No Box Background) */}
      <div>
        <TabsList>
          <TabsTrigger active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')}>
            Architecture & Metrics
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'apis_db'} onClick={() => setActiveTab('apis_db')}>
            APIs & DB Schema
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'dependencies'} onClick={() => setActiveTab('dependencies')}>
            Dependencies
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'hotspots'} onClick={() => setActiveTab('hotspots')}>
            Hotspots & Dead Code
          </TabsTrigger>
        </TabsList>
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          {/* Top Level Metric Tiles - 4 tiles with identical alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile 
              title="HEALTH SCORE" 
              value={`${repo.stats.healthScore}/100`} 
              subtext="Quality 98% • Coverage 91%"
              status="good"
            />
            <StatTile 
              title="SECURITY INDEX" 
              value={`${repo.stats.securityScore}/100`}
              subtext="0 Critical CVEs"
              status="good"
            />
            <StatTile 
              title="REPOSITORY SCALE" 
              value={(repo.metrics.totalLOC / 1000).toFixed(1) + 'k'}
              subtext={`${repo.stats.filesCount} files`}
              status="neutral"
            />
            <StatTile 
              title="MAINTAINABILITY" 
              value={repo.metrics.maintainabilityIndex}
              subtext="Tier A+"
              status="good"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Architecture Details (2 columns) */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    System Architecture & Component Roles
                  </h3>
                  <p className="text-[11px] text-text-tertiary font-mono">{repo.architecture.pattern}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {repo.architecture.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {repo.architecture.components.map((comp, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectFileByPath(comp.path)}
                        className="p-4 border border-border-default rounded-[6px] bg-bg-surface-2 hover:bg-[#262B31] cursor-pointer transition-colors"
                      >
                        <div className="text-[14px] font-medium text-text-primary">{comp.name}</div>
                        <div className="text-[11px] text-text-tertiary font-mono my-1 truncate">{comp.path}</div>
                        <p className="text-[13px] text-text-secondary">{comp.role}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Language Inventory (1 column) */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <h3 className="text-[15px] font-semibold text-text-primary">Language Inventory</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-1.5 rounded-[4px] flex overflow-hidden bg-bg-surface-2 border border-border-default">
                    {repo.languages.map((l, idx) => (
                      <div
                        key={idx}
                        className="h-full"
                        style={{
                          width: `${l.percentage}%`,
                          backgroundColor: idx === 0 ? '#4FA3D9' : idx === 1 ? '#4C9A6A' : idx === 2 ? '#C99A3C' : '#676E77'
                        }}
                      />
                    ))}
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    {repo.languages.map((l, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-[2px]"
                            style={{
                              backgroundColor: idx === 0 ? '#4FA3D9' : idx === 1 ? '#4C9A6A' : idx === 2 ? '#C99A3C' : '#676E77'
                            }}
                          />
                          <span className="text-text-primary">{l.name}</span>
                        </div>
                        <span className="text-text-tertiary">{l.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APIS & DB */}
      {activeTab === 'apis_db' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-[15px] font-semibold text-text-primary">Discovered API Routes</h3>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable>
                <TableHeader>
                  <TableCell isHeader>Route</TableCell>
                  <TableCell isHeader>Handler</TableCell>
                  <TableCell isHeader>Auth</TableCell>
                </TableHeader>
                <tbody>
                  {repo.apiRoutes.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-text-primary">
                        <span className="mr-2 text-text-tertiary font-medium">{r.method}</span>
                        {r.path}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-secondary">{r.handlerFile}</TableCell>
                      <TableCell>
                        {r.authRequired ? (
                          <Badge variant="critical">Guarded</Badge>
                        ) : (
                          <Badge variant="good">Public</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </DataTable>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-[15px] font-semibold text-text-primary">Database Models</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {repo.databaseModels.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-border-default rounded-[6px] bg-bg-surface-2 flex items-center justify-between"
                >
                  <div>
                    <div className="text-[14px] font-medium text-text-primary">model {m.name}</div>
                    <div className="text-[11px] text-text-tertiary font-mono mt-0.5">{m.file}</div>
                  </div>
                  <span className="text-xs font-mono text-text-secondary">{m.fieldsCount} columns</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: DEPENDENCIES */}
      {activeTab === 'dependencies' && (
        <Card>
          <CardHeader>
            <h3 className="text-[15px] font-semibold text-text-primary">Direct Dependencies</h3>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable>
              <TableHeader>
                <TableCell isHeader>Package</TableCell>
                <TableCell isHeader>Version</TableCell>
                <TableCell isHeader>Type</TableCell>
              </TableHeader>
              <tbody>
                {repo.dependencies.map((dep, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-[13px] font-medium text-text-primary">{dep.name}</TableCell>
                    <TableCell className="font-mono text-xs text-text-secondary">{dep.version}</TableCell>
                    <TableCell>
                      <Badge variant="neutral">{dep.type}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: HOTSPOTS */}
      {activeTab === 'hotspots' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-[15px] font-semibold text-text-primary">Maintenance Hotspots</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {repo.hotspots.map((h) => (
                <div
                  key={h.id}
                  className="p-4 border border-border-default rounded-[6px] bg-bg-surface-2 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-text-primary">{h.functionName}()</span>
                    <Badge variant="critical">Risk: {h.riskScore}%</Badge>
                  </div>
                  <div className="text-[11px] text-text-tertiary font-mono">{h.file}</div>
                  <p className="text-[13px] text-text-secondary">{h.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-[15px] font-semibold text-text-primary">Dead Code Candidates</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {repo.deadCodeItems.map((d) => (
                <div
                  key={d.id}
                  className="p-4 border border-border-default rounded-[6px] bg-bg-surface-2 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-text-primary">{d.symbolName}</span>
                    <Badge variant="warn">~{d.estimatedSavingLines} LOC</Badge>
                  </div>
                  <div className="text-[11px] text-text-tertiary font-mono">{d.file}:{d.line}</div>
                  <p className="text-[13px] text-text-secondary">{d.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};
