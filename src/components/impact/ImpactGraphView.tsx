import React, { useState, useCallback } from 'react';
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
  initialImpactNodes,
  initialImpactEdges,
} from '../../data/mockImpactGraph';
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
import {
  Network,
  Sparkles,
  Layers,
  ZoomIn,
  RefreshCw,
  SlidersHorizontal,
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
  const { selectedImpactNodeId, setSelectedImpactNodeId } = useRepoStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialImpactNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialImpactEdges);
  const [viewMode, setViewMode] = useState<'graph' | 'assistant'>('graph');

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedImpactNodeId(node.id);
    },
    [setSelectedImpactNodeId]
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090d16] overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="h-12 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-xs text-white">
              Repository Dependency & Blast Radius Topology
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Database ➔ Service ➔ API ➔ Frontend ➔ Test
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'graph'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Graph</span>
          </button>

          <button
            onClick={() => setViewMode('assistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'assistant'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Change Assistant</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      {viewMode === 'graph' ? (
        <div className="flex-1 flex h-full overflow-hidden relative">
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
              <Background color="rgba(255, 255, 255, 0.05)" gap={20} size={1} variant={BackgroundVariant.Dots} />
              <Controls className="!bg-slate-900 !border-slate-800" />
              <MiniMap
                nodeStrokeColor="#6366f1"
                nodeColor="#1e293b"
                className="!bg-slate-950 !border-slate-800"
              />
            </ReactFlow>
          </div>

          {/* Blast Radius Side Inspector */}
          <BlastRadiusPanel selectedNodeId={selectedImpactNodeId} />
        </div>
      ) : (
        <ChangeAssistant />
      )}
    </div>
  );
};
