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
      className={`px-4 py-3 rounded-[6px] bg-bg-surface border transition-colors min-w-[210px] select-none ${
        selected
          ? 'border-accent bg-bg-surface-2'
          : 'border-border-default hover:border-border-strong'
      }`}
    >
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-border-strong !border !border-border-default !w-2 !h-2"
        />
      )}
      {hasSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-border-strong !border !border-border-default !w-2 !h-2"
        />
      )}

      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-text-tertiary font-medium block">
          {typeLabel}
        </span>
        <h4 className="font-semibold text-xs text-text-primary truncate">{data.label}</h4>
        {data.sublabel && (
          <div className="text-[10px] font-mono text-text-secondary truncate">{data.sublabel}</div>
        )}
      </div>

      {data.riskScore !== undefined && (
        <div className="mt-2 pt-2 border-t border-border-default flex items-center justify-between text-[10px] font-mono text-text-tertiary">
          <span>Blast Risk:</span>
          <Badge
            variant={
              data.riskScore > 70 ? 'critical' : data.riskScore > 40 ? 'warn' : 'good'
            }
            className="text-[10px]"
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
