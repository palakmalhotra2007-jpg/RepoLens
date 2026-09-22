import React from 'react';
import { BlastRadiusResult, GraphNodeData } from '../../types/impact';
import { useRepoStore } from '../../store/useRepoStore';
import { calculateBlastRadius } from '../../services/impactGraphBuilder';
import { Node, Edge } from '@xyflow/react';
import {
  ShieldAlert,
  FileCode,
  Server,
  Terminal,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface BlastRadiusPanelProps {
  selectedNodeId: string | null;
  nodes?: Node<GraphNodeData>[];
  edges?: Edge[];
}

export const BlastRadiusPanel: React.FC<BlastRadiusPanelProps> = ({
  selectedNodeId,
  nodes = [],
  edges = [],
}) => {
  const { 
    selectFileByPath, 
    sendChatMessage, 
    repo,
    setIsRightPanelOpen,
  } = useRepoStore();

  // Compute real dynamic blast radius from graph topology
  const activeRadius: BlastRadiusResult = selectedNodeId
    ? calculateBlastRadius(selectedNodeId, nodes, edges, repo)
    : {
        targetNodeId: 'unknown',
        targetLabel: 'No node selected',
        overallRiskCategory: 'LOW',
        riskScore: 0,
        affectedComponents: [],
        affectedFiles: [],
        affectedRoutes: [],
        affectedDbTables: [],
        affectedTests: [],
        impactSummary: 'Click on any node in the topology graph to inspect its real upstream dependencies, downstream callers, and calculated blast radius.',
        suggestedValidationSteps: ['Select a module or file to inspect.'],
      };

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="w-84 lg:w-96 bg-[#0c101c] border-l border-slate-800/80 flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* Target Node Title */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300">
            Selected Target Node
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getRiskBadge(activeRadius.overallRiskCategory)}`}>
            {activeRadius.overallRiskCategory} RISK
          </span>
        </div>

        <h3 className="text-sm font-bold text-white font-mono leading-snug truncate">
          {activeRadius.targetLabel}
        </h3>

        {/* Risk Score Gauge */}
        <div className="pt-2">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-200">Calculated Blast Radius</span>
            <span className="text-rose-400 font-bold">{activeRadius.riskScore} / 100</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${activeRadius.riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-200 font-mono flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> "What breaks if I change this?"
        </span>
        <p className="text-slate-200 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 text-[11px]">
          {activeRadius.impactSummary}
        </p>
      </div>

      {/* Affected Files List */}
      {activeRadius.affectedFiles.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-200 font-mono flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Directly Impacted Files ({activeRadius.affectedFiles.length})
          </span>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {activeRadius.affectedFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => selectFileByPath(file)}
                className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 font-mono text-[11px] flex items-center justify-between group transition-all"
              >
                <span className="truncate text-indigo-300 font-medium">{file}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Affected Routes & Components */}
      {activeRadius.affectedRoutes.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-200 font-mono flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Downstream API Routes ({activeRadius.affectedRoutes.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeRadius.affectedRoutes.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800 text-[10px] font-mono"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Validation Steps */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <span className="text-[11px] font-semibold text-slate-100 font-mono flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Suggested Safe Validation Steps
        </span>
        <ul className="space-y-1.5 text-slate-200 text-[11px]">
          {activeRadius.suggestedValidationSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-400 select-none">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ask AI to generate Change Plan */}
      {selectedNodeId && (
        <button
          onClick={() => {
            try {
              console.log('[BlastRadius] Ask AI button clicked, sending message to chat...');
              sendChatMessage(`What are the step-by-step changes and risks if I modify ${activeRadius.targetLabel}?`);
              // Auto-open chat panel when asking AI
              setIsRightPanelOpen(true);
              console.log('[BlastRadius] Right panel opened');
            } catch (error) {
              console.error('[BlastRadius] Error in Ask AI button:', error);
              alert(`Failed to send message to AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all font-mono"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Change Impact</span>
        </button>
      )}
    </div>
  );
};
