import React from 'react';
import { BlastRadiusResult, GraphNodeData } from '../../types/impact';
import { useRepoStore } from '../../store/useRepoStore';
import { calculateBlastRadius } from '../../services/impactGraphBuilder';
import { Node, Edge } from '@xyflow/react';
import { Button, Badge, Card } from '../../frontend';
import {
  ShieldAlert,
  FileCode,
  Server,
  Terminal,
  Sparkles,
  ArrowRight,
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
    setRightPanelTab,
  } = useRepoStore();

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

  const getRiskVariant = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return 'critical';
      case 'HIGH':
      case 'MEDIUM':
        return 'warn';
      default:
        return 'good';
    }
  };

  const riskFillColor =
    activeRadius.riskScore > 70 ? '#B54A4A' :
    activeRadius.riskScore > 40 ? '#C99A3C' :
    '#4C9A6A';

  return (
    <div className="w-80 lg:w-96 bg-bg-surface border-l border-border-default flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* Target Node Title */}
      <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-medium tracking-[0.04em] text-text-tertiary">
            Selected Target Node
          </span>
          <Badge variant={getRiskVariant(activeRadius.overallRiskCategory)}>
            {activeRadius.overallRiskCategory} RISK
          </Badge>
        </div>

        <h3 className="text-sm font-semibold text-text-primary font-mono leading-snug truncate">
          {activeRadius.targetLabel}
        </h3>

        {/* Risk Score Gauge - Flat color fill, no gradient */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-text-secondary">Calculated Blast Radius</span>
            <span className="text-text-primary font-semibold">{activeRadius.riskScore} / 100</span>
          </div>
          <div className="w-full h-1.5 bg-bg-surface rounded-[4px] border border-border-default overflow-hidden">
            <div
              className="h-full rounded-[4px] transition-all duration-300"
              style={{
                width: `${activeRadius.riskScore}%`,
                backgroundColor: riskFillColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center gap-1.5">
          <ShieldAlert strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> "What breaks if I change this?"
        </span>
        <p className="text-text-secondary leading-relaxed bg-bg-surface-2 p-3.5 rounded-[6px] border border-border-default text-[13px]">
          {activeRadius.impactSummary}
        </p>
      </div>

      {/* Affected Files List */}
      {activeRadius.affectedFiles.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center gap-1.5">
            <FileCode strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> Impacted Files ({activeRadius.affectedFiles.length})
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {activeRadius.affectedFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => selectFileByPath(file)}
                className="w-full text-left p-2.5 rounded-[6px] bg-bg-surface-2 hover:bg-[#262B31] border border-border-default text-text-primary font-mono text-[11px] flex items-center justify-between group transition-colors"
              >
                <span className="truncate text-text-primary">{file}</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Affected Routes & Components */}
      {activeRadius.affectedRoutes.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center gap-1.5">
            <Server strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> Downstream API Routes ({activeRadius.affectedRoutes.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeRadius.affectedRoutes.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-[4px] bg-bg-surface-2 text-text-secondary border border-border-default text-[10px] font-mono"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Validation Steps */}
      <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2">
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] flex items-center gap-1.5">
          <Terminal strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> Suggested Safe Validation Steps
        </span>
        <ul className="space-y-1.5 text-text-secondary text-xs">
          {activeRadius.suggestedValidationSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-text-tertiary select-none">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ask AI to generate Change Plan */}
      {selectedNodeId && (
        <Button
          variant="primary"
          onClick={() => {
            sendChatMessage(`What are the step-by-step changes and risks if I modify ${activeRadius.targetLabel}?`);
            setIsRightPanelOpen(true);
            setRightPanelTab('chat');
          }}
          className="w-full gap-2 py-2"
        >
          <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
          <span>Ask AI Change Impact</span>
        </Button>
      )}
    </div>
  );
};
