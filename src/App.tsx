import React from 'react';
import { RepoProvider, useRepoStore } from './store/useRepoStore';
import { TopNav } from './components/layout/TopNav';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { CommandPalette } from './components/layout/CommandPalette';
import { RepoOverview } from './components/overview/RepoOverview';
import { ExploreView } from './components/explore/ExploreView';
import { ReviewPanel } from './components/review/ReviewPanel';
import { AgentDebateView } from './components/review/AgentDebateView';
import { MergeConflictView } from './components/merge/MergeConflictView';
import { ImpactGraphView } from './components/impact/ImpactGraphView';
import { GitHistoryView } from './components/git/GitHistoryView';
import { RepoCopilotView } from './components/chat/RepoCopilotView';
import { ConnectRepoModal } from './components/modals/ConnectRepoModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { LLMSettingsModal } from './components/modals/LLMSettingsModal';

const WorkspaceContent: React.FC = () => {
  const { activeView } = useRepoStore();

  switch (activeView) {
    case 'overview':
      return <RepoOverview />;
    case 'explore':
      return <ExploreView />;
    case 'review':
      return <ReviewPanel />;
    case 'debate':
      return <AgentDebateView />;
    case 'merge':
      return <MergeConflictView />;
    case 'impact':
      return <ImpactGraphView />;
    case 'history':
      return <GitHistoryView />;
    case 'copilot':
    case 'chat':
      return <RepoCopilotView />;
    default:
      return <RepoOverview />;
  }
};

const AppShell: React.FC = () => {
  const { isLLMSettingsModalOpen, setIsLLMSettingsModalOpen } = useRepoStore();
  
  return (
    <div className="flex flex-col h-screen w-screen bg-bg-base text-text-primary overflow-hidden font-sans select-none">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-bg-base relative">
          <WorkspaceContent />
        </main>

        {/* Right Context & AI Copilot Panel */}
        <RightPanel />
      </div>

      {/* Global Command Palette & Modals */}
      <CommandPalette />
      <ConnectRepoModal />
      <SettingsModal />
      <LLMSettingsModal isOpen={isLLMSettingsModalOpen} onClose={() => setIsLLMSettingsModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <RepoProvider>
      <AppShell />
    </RepoProvider>
  );
}

export default App;
