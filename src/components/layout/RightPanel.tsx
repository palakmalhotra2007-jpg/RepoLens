import React from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Badge } from '../../frontend';
import { Code2 } from 'lucide-react';

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
    <aside className="w-80 lg:w-96 bg-bg-surface border-l border-border-default flex flex-col justify-between flex-shrink-0 z-20 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3 bg-bg-surface">
        <div className="flex items-center gap-2">
          <Code2 strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
          <span className="text-xs font-semibold text-text-primary">Code Symbols</span>
        </div>
      </div>

      {/* Symbols in Active File */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default text-text-primary">
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] mb-1">
            Active File
          </div>
          <div className="font-mono text-xs text-text-primary truncate">
            {activeFile?.path || 'None selected'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
            Extracted AST Symbols ({activeFile?.symbols?.length || 0})
          </div>

          {activeFile?.symbols && activeFile.symbols.length > 0 ? (
            <div className="space-y-1.5">
              {activeFile.symbols.map((sym, idx) => (
                <button
                  key={idx}
                  onClick={() => selectFileByPath(activeFile.path, sym.line)}
                  className="w-full text-left px-3 py-2 rounded-[6px] bg-bg-surface-2 hover:bg-[#262B31] border border-border-default flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Badge variant="accent" className="text-[10px]">
                      {sym.kind}
                    </Badge>
                    <span className="font-mono text-text-primary text-xs truncate">
                      {sym.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary">L{sym.line}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-tertiary">
              <Code2 strokeWidth={1.5} className="w-5 h-5 mx-auto mb-2 text-text-tertiary" />
              <p className="text-xs text-text-secondary">No symbols parsed in this file.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
