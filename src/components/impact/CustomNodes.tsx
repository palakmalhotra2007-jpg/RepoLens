import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GraphNodeData } from '../../types/impact';
import {
  FileCode,
  FunctionSquare,
  Server,
  Database,
  CheckCircle2,
  Zap,
  Activity,
  Code2,
} from 'lucide-react';

interface NodeProps {
  data: GraphNodeData;
  selected?: boolean;
}

export const DbNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl min-w-[200px] ${
        selected
          ? 'border-indigo-500 shadow-indigo-500/20 bg-slate-900/95'
          : 'border-indigo-500/30 hover:border-indigo-500/60'
      }`}
    >
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Database className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">
            Database Model
          </span>
          <h4 className="font-bold text-xs text-white truncate">{data.label}</h4>
        </div>
      </div>
      {data.sublabel && (
        <div className="text-[10px] font-mono text-slate-400 truncate">{data.sublabel}</div>
      )}
      {data.riskScore && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Blast Risk:</span>
          <span className="text-rose-400 font-bold">{data.riskScore}%</span>
        </div>
      )}
    </div>
  );
};

export const ServiceNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl min-w-[220px] ${
        selected
          ? 'border-cyan-500 shadow-cyan-500/20 bg-slate-900/95'
          : 'border-cyan-500/30 hover:border-cyan-500/60'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block">
            Service Layer
          </span>
          <h4 className="font-bold text-xs text-white truncate">{data.label}</h4>
        </div>
      </div>
      {data.sublabel && (
        <div className="text-[10px] font-mono text-slate-400 truncate">{data.sublabel}</div>
      )}
      {data.riskScore && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Blast Risk:</span>
          <span className="text-amber-400 font-bold">{data.riskScore}%</span>
        </div>
      )}
    </div>
  );
};

export const ApiNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl min-w-[230px] ${
        selected
          ? 'border-emerald-500 shadow-emerald-500/20 bg-slate-900/95'
          : 'border-emerald-500/30 hover:border-emerald-500/60'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Server className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
            API Route Handler
          </span>
          <h4 className="font-bold text-xs text-white font-mono truncate">{data.label}</h4>
        </div>
      </div>
      {data.sublabel && (
        <div className="text-[10px] font-mono text-slate-400 truncate">{data.sublabel}</div>
      )}
      {data.riskScore && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Blast Risk:</span>
          <span className="text-rose-400 font-bold">{data.riskScore}%</span>
        </div>
      )}
    </div>
  );
};

export const FunctionNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl min-w-[200px] ${
        selected
          ? 'border-purple-500 shadow-purple-500/20 bg-slate-900/95'
          : 'border-purple-500/30 hover:border-purple-500/60'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
          <Code2 className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold block">
            Client Hook / Function
          </span>
          <h4 className="font-bold text-xs text-white font-mono truncate">{data.label}</h4>
        </div>
      </div>
      {data.sublabel && (
        <div className="text-[10px] font-mono text-slate-400 truncate">{data.sublabel}</div>
      )}
    </div>
  );
};

export const FileNodeCustom: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl min-w-[200px] ${
        selected
          ? 'border-blue-500 shadow-blue-500/20 bg-slate-900/95'
          : 'border-blue-500/30 hover:border-blue-500/60'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
          <FileCode className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold block">
            React UI View
          </span>
          <h4 className="font-bold text-xs text-white font-mono truncate">{data.label}</h4>
        </div>
      </div>
      {data.sublabel && (
        <div className="text-[10px] font-mono text-slate-400 truncate">{data.sublabel}</div>
      )}
    </div>
  );
};

export const TestNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl min-w-[200px] ${
        selected
          ? 'border-amber-500 shadow-amber-500/20 bg-slate-900/95'
          : 'border-amber-500/30 hover:border-amber-500/60'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">
            Automated Test Suite
          </span>
          <h4 className="font-bold text-xs text-white font-mono truncate">{data.label}</h4>
        </div>
      </div>
      {data.sublabel && (
        <div className="text-[10px] font-mono text-slate-400 truncate">{data.sublabel}</div>
      )}
    </div>
  );
};
