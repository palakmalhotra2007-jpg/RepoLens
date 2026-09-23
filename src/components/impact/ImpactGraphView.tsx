import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  DbNode,
  ServiceNode,
  ApiNode,
  FunctionNode,
  FileNodeCustom,
  TestNode,
} from './CustomNodes';
import { BlastRadiusPanel } from './BlastRadiusPanel';
import { ChangeAssistant } from './ChangeAssistant';
import { useRepoStore } from '../../store/useRepoStore';
import { buildDynamicImpactGraph } from '../../services/impactGraphBuilder';
import { Button, Badge } from '../../frontend';
import {
  Network,
  Sparkles,
} from 'lucide-react';

const nodeTypes = {
  dbNode: DbNode,
  serviceNode: ServiceNode,
  apiNode: ApiNode,
  functionNode: FunctionNode,
  fileNode: FileNodeCustom,
  testNode: TestNode,
};

export const ImpactGraphView: React.FC = () => {
  const { selectedImpactNodeId, setSelectedImpactNodeId, repo } = useRepoStore();
  const [viewMode, setViewMode] = useState<'graph' | 'assistant'>('graph');

  // Dynamically build real graph nodes & edges from current repository files
  const { initialNodes, initialEdges } = useMemo(() => {
    const graphData = buildDynamicImpactGraph(repo);
    return {
      initialNodes: graphData.nodes,
      initialEdges: graphData.edges,
    };
  }, [repo]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync graph state when repository changes
  useEffect(() => {
    const graphData = buildDynamicImpactGraph(repo);
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
    if (graphData.nodes.length > 0 && !selectedImpactNodeId) {
      setSelectedImpactNodeId(graphData.nodes[0].id);
    }
  }, [repo, setNodes, setEdges, setSelectedImpactNodeId]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedImpactNodeId(node.id);
    },
    [setSelectedImpactNodeId]
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="h-12 bg-bg-surface border-b border-border-default px-4 flex items-center justify-between select-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
            <span className="font-semibold text-xs text-text-primary">
              Repository Dependency & Blast Radius Topology
            </span>
          </div>
          <Badge variant="neutral" className="text-[10px] font-mono">
            {nodes.length} Modules • {edges.length} Dependencies ({repo.name})
          </Badge>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setViewMode('graph')}
            className={`gap-1.5 ${viewMode === 'graph' ? 'border-accent text-text-primary' : ''}`}
          >
            <Network strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
            <span>Interactive Graph</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setViewMode('assistant')}
            className={`gap-1.5 ${viewMode === 'assistant' ? 'border-accent text-text-primary' : ''}`}
          >
            <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
            <span>AI Change Assistant</span>
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'graph' ? (
          <>
            <div className="flex-1 h-full relative">
              <ReactFlow
                nodes={nodes.map((n) => ({
                  ...n,
                  selected: n.id === selectedImpactNodeId,
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
              >
                <Background color="#262B31" gap={20} size={1} variant={BackgroundVariant.Dots} />
                <Controls />
                <MiniMap
                  nodeStrokeColor="#383F47"
                  nodeColor="#1B1F24"
                />
              </ReactFlow>
            </div>

            {/* Blast Radius Side Inspector */}
            <BlastRadiusPanel
              selectedNodeId={selectedImpactNodeId}
              nodes={nodes}
              edges={edges}
            />
          </>
        ) : (
          <ChangeAssistant />
        )}
      </div>
    </div>
  );
};
