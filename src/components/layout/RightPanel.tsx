import React from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { X } from 'lucide-react';
import { RepoCopilotView } from '../chat/RepoCopilotView';

export const RightPanel: React.FC = () => {
  const {
    isRightPanelOpen,
    setIsRightPanelOpen,
    activeView,
  } = useRepoStore();

  // Only show Context Panel in Impact view when asking AI
  if (!isRightPanelOpen || activeView !== 'impact') return null;

  return (
    <aside className="w-84 lg:w-96 bg-[#0c101c] border-l border-slate-800/80 flex flex-col justify-between flex-shrink-0 z-20 h-full">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">💬 AI Chat</span>
          </div>
          <button
            onClick={() => setIsRightPanelOpen(false)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <RepoCopilotView />
      </div>
    </aside>
  );
};
