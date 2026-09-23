import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GraphNodeData } from '../../types/impact';
import { Badge } from '../../frontend';

interface NodeProps {
  data: GraphNodeData;
  selected?: boolean;
}

interface GenericGraphNodeProps {
  data: GraphNodeData;
  selected?: boolean;
  typeLabel: string;
  hasTargetHandle?: boolean;
  hasSourceHandle?: boolean;
}

const BaseImpactNode: React.FC<GenericGraphNodeProps> = ({
  data,
  selected,
  typeLabel,
  hasTargetHandle = true,
  hasSourceHandle = true,
}) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 transition-all min-w-[220px] max-w-[280px] select-none shadow-lg ${
        selected
          ? 'border-accent bg-gradient-to-br from-bg-surface-2 to-bg-surface shadow-accent/20'
          : 'border-[#2d3340] bg-gradient-to-br from-[#1e2230] to-[#161b26] hover:border-accent/50 hover:shadow-accent/10'
      }`}
    >
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-accent !border-2 !border-accent/40 !w-3 !h-3 !rounded-full"
        />
      )}
      {hasSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-accent !border-2 !border-accent/40 !w-3 !h-3 !rounded-full"
        />
      )}

      <div className="space-y-2">
        <span className="text-[9px] font-mono uppercase text-accent/70 font-semibold tracking-wider block">
          {typeLabel}
        </span>
        <h4 className="font-semibold text-sm text-text-primary leading-tight">{data.label}</h4>
        {data.sublabel && (
          <div className="text-[11px] font-mono text-text-secondary/80 leading-tight">{data.sublabel}</div>
        )}
      </div>

      {data.riskScore !== undefined && (
        <div className="mt-3 pt-2 border-t border-[#2d3340] flex items-center justify-between text-[10px] font-mono">
          <span className="text-text-tertiary font-medium">Blast Risk:</span>
          <Badge
            variant={
              data.riskScore > 70 ? 'critical' : data.riskScore > 40 ? 'warn' : 'good'
            }
            className="text-[10px] font-semibold"
          >
            {data.riskScore}%
          </Badge>
        </div>
      )}
    </div>
  );
};

export const DbNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseImpactNode
    data={data}
    selected={selected}
    typeLabel="DB MODEL"
    hasTargetHandle={false}
    hasSourceHandle={true}
  />
);

export const ServiceNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseImpactNode
    data={data}
    selected={selected}
    typeLabel="SERVICE LAYER"
    hasTargetHandle={true}
    hasSourceHandle={true}
  />
);

export const ApiNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseImpactNode
    data={data}
    selected={selected}
    typeLabel="API ROUTE"
    hasTargetHandle={true}
    hasSourceHandle={true}
  />
);

export const FunctionNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseImpactNode
    data={data}
    selected={selected}
    typeLabel="FUNCTION"
    hasTargetHandle={true}
    hasSourceHandle={true}
  />
);

export const FileNodeCustom: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseImpactNode
    data={data}
    selected={selected}
    typeLabel="SOURCE FILE"
    hasTargetHandle={true}
    hasSourceHandle={true}
  />
);

export const TestNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseImpactNode
    data={data}
    selected={selected}
    typeLabel="TEST SUITE"
    hasTargetHandle={true}
    hasSourceHandle={false}
  />
);
