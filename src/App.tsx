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
import { RepoChatView } from './components/chat/RepoChatView';
import { ConnectRepoModal } from './components/modals/ConnectRepoModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { VoiceSettingsModal } from './components/modals/VoiceSettingsModal';

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
    case 'chat':
      return <RepoChatView />;
    default:
      return <RepoOverview />;
  }
};

const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1117] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] relative">
          <WorkspaceContent />
        </main>

        {/* Right Context & AI Copilot Panel */}
        <RightPanel />
      </div>

      {/* Global Command Palette & Modals */}
      <CommandPalette />
      <ConnectRepoModal />
      <SettingsModal />
      <VoiceSettingsModal />
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
