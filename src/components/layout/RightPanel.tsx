import React from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  Code2,
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const {
    isRightPanelOpen,
    selectFileByPath,
    activeFile,
    activeView,
  } = useRepoStore();

  // Only show in review view
  if (!isRightPanelOpen || activeView !== 'review') return null;

  return (
    <aside className="w-84 lg:w-96 bg-[#0c101c] border-l border-slate-800/80 flex flex-col justify-between flex-shrink-0 z-20 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Code Symbols</span>
        </div>
      </div>

      {/* Symbols in Active File */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
          <div className="text-[11px] font-medium text-slate-400 uppercase font-mono">
            Active File
          </div>
          <div className="font-semibold text-slate-100 font-mono truncate">
            {activeFile?.path || 'None selected'}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono mb-2">
            Extracted AST Symbols ({activeFile?.symbols?.length || 0})
          </div>

          {activeFile?.symbols && activeFile.symbols.length > 0 ? (
            activeFile.symbols.map((sym, idx) => (
              <button
                key={idx}
                onClick={() => selectFileByPath(activeFile.path, sym.line)}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/60 hover:border-indigo-500/40 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {sym.kind}
                  </span>
                  <span className="font-mono text-slate-200 text-xs truncate group-hover:text-indigo-300">
                    {sym.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">L{sym.line}</span>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Code2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>No symbols parsed in this file.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
