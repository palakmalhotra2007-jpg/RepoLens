import React, { createContext, useContext, useState, useEffect } from 'react';
import { RepositoryData, FileNode } from '../types/repository';
import { ReviewFinding, OrchestrationSummary, AgentId, SeverityLevel, ReviewState } from '../types/agents';
import { MergeConflictBlock, SemanticConflictAlert, BranchComparison, ComparisonState } from '../types/merge';
import { ChatMessage, JumpAction } from '../types/chat';
import { FeatureChangePlan } from '../types/impact';
import { reviewAgents } from '../config/agents';
import { comprehensiveDemoRepo } from '../data/comprehensiveDemoRepo';
import { createEmptyBranchComparison } from '../config/defaultRepository';
import { findFileByPath, flattenFileTree } from '../services/repoParser';
import { ragService } from '../services/ragService';
import { APP_CONFIG, MESSAGES, AGENT_CONFIG } from '../config/constants';
import { llmService } from '../services/llm/llmService';
import { llmAnalyzer } from '../services/llm/llmAnalyzer';
import confetti from 'canvas-confetti';

// Voice-related types
interface VoiceSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  autoPlayResponses: boolean;
}

interface VoicePlayback {
  isPlaying: boolean;
  speakingAgentId: AgentId | null;
  currentText: string | null;
  progressPercent: number;
}

// Browser Web Speech API Engine
const voiceEngine = {
  speak: (
    text: string,
    agentId: AgentId,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate || 1.0;
    utterance.pitch = settings.pitch || 1.0;
    utterance.volume = settings.volume || 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Pick voice variation based on agent
      const voiceIndex = Math.abs(agentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % voices.length;
      utterance.voice = voices[voiceIndex] || voices[0];
    }

    if (onStart) utterance.onstart = () => onStart();
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },
  stopSpeaking: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
  startListening: (
    onResult: (text: string) => void,
    onError: (error: any) => void,
    onEnd: () => void
  ) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Speech recognition not supported in this browser.');
      onEnd();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error);
      };

      recognition.onend = () => {
        onEnd();
      };

      recognition.start();
    } catch (e) {
      onError(e);
      onEnd();
    }
  },
  stopListening: () => {
    // Handled by browser SpeechRecognition onend
  },
};

export type AppView = 
  | 'overview' 
  | 'explore' 
  | 'review' 
  | 'debate' 
  | 'merge' 
  | 'impact' 
  | 'history' 
  | 'copilot'
  | 'chat';

interface RepoStoreContextType {
  // Repository
  repo: RepositoryData;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  activeFile: FileNode | null;
  setActiveFile: (file: FileNode | null) => void;
  activeLine: number | null;
  setActiveLine: (line: number | null) => void;
  selectFileByPath: (path: string, line?: number) => void;
  switchRepo: (newRepo: RepositoryData) => void;
  switchBranch: (branch: string) => void;

  // Modals & Panels
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isLLMSettingsModalOpen: boolean;
  setIsLLMSettingsModalOpen: (open: boolean) => void;
  isVoiceSettingsModalOpen: boolean;
  setIsVoiceSettingsModalOpen: (open: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  rightPanelTab: 'chat' | 'debate' | 'symbols';
  setRightPanelTab: (tab: 'chat' | 'debate' | 'symbols') => void;

  // Voice & Audio
  voiceSettings: VoiceSettings;
  setVoiceSettings: (settings: VoiceSettings) => void;
  voicePlayback: VoicePlayback;
  speakAgentBriefing: (text: string, agentId: AgentId) => void;
  playMultiAgentDebate: (finding: ReviewFinding) => Promise<void>;
  stopAudioPlayback: () => void;
  isRecordingVoice: boolean;
  startVoiceInput: (targetAgentId?: AgentId) => void;
  stopVoiceInput: () => void;

  // Multi-Agent Review
  reviewState: ReviewState;
  reviewFindings: ReviewFinding[];
  orchestrationSummary: OrchestrationSummary;
  selectedFinding: ReviewFinding | null;
  setSelectedFinding: (finding: ReviewFinding | null) => void;
  agentFilter: AgentId | 'all';
  setAgentFilter: (filter: AgentId | 'all') => void;
  severityFilter: SeverityLevel | 'all';
  setSeverityFilter: (filter: SeverityLevel | 'all') => void;
  isReviewRunning: boolean;
  reviewProgress: { label: string; percent: number; stage: string };
  runReview: () => Promise<void>;
  applyFix: (findingId: string) => void;
  dismissFinding: (findingId: string) => void;

  // Agent Debate View
  activeDebateFinding: ReviewFinding | null;
  setActiveDebateFinding: (finding: ReviewFinding | null) => void;
  activeDebateStageIndex: number;
  setActiveDebateStageIndex: (index: number) => void;

  // Merge Conflicts & Branch Comparison
  comparisonState: ComparisonState;
  branchComparison: BranchComparison;
  selectedConflict: MergeConflictBlock | null;
  setSelectedConflict: (c: MergeConflictBlock | null) => void;
  selectedSemanticAlert: SemanticConflictAlert | null;
  setSelectedSemanticAlert: (a: SemanticConflictAlert | null) => void;
  compareBranches: (baseBranch: string, targetBranch: string) => Promise<void>;
  resetComparison: () => void;
  resolveConflictBlock: (conflictId: string, resolution: 'ours' | 'theirs' | 'ai' | 'custom', customCode?: string) => void;

  // Impact Analysis & Change Assistant
  selectedImpactNodeId: string | null;
  setSelectedImpactNodeId: (id: string | null) => void;
  activeChangePlan: FeatureChangePlan | null;
  setActiveChangePlan: (plan: FeatureChangePlan | null) => void;
  generateChangePlanForPrompt: (prompt: string) => void;

  // AI Chat & Jump Actions
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string, targetAgentId?: AgentId) => void;
  clearChat: () => void;
  handleJumpAction: (action: JumpAction) => void;
}

const RepoContext = createContext<RepoStoreContextType | undefined>(undefined);

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to TaskFlow demo repository on launch
  const [repo, setRepo] = useState<RepositoryData>(comprehensiveDemoRepo);
  const [activeView, setActiveView] = useState<AppView>(APP_CONFIG.ui.defaultView);
  const [activeFile, setActiveFile] = useState<FileNode | null>(() => {
    return findFileByPath(comprehensiveDemoRepo.rootFiles, 'src/pages/Dashboard.tsx') ||
           findFileByPath(comprehensiveDemoRepo.rootFiles, 'README.md') ||
           comprehensiveDemoRepo.rootFiles[0] || null;
  });
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Initialize RAG service with repository whenever repository changes
  useEffect(() => {
    ragService.indexRepository(repo);
    console.log('[RAG] Indexed repository files:', ragService.getIndexStats());
  }, [repo]);

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLLMSettingsModalOpen, setIsLLMSettingsModalOpen] = useState(false);
  const [isVoiceSettingsModalOpen, setIsVoiceSettingsModalOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'debate' | 'symbols'>(APP_CONFIG.ui.rightPanelDefaultTab);

  // Voice & Audio State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: APP_CONFIG.voice.defaultEnabled,
    rate: APP_CONFIG.voice.defaultRate,
    pitch: APP_CONFIG.voice.defaultPitch,
    volume: APP_CONFIG.voice.defaultVolume,
    autoPlayResponses: false,
  });
  const [voicePlayback, setVoicePlayback] = useState<VoicePlayback>({
    isPlaying: false,
    speakingAgentId: null,
    currentText: null,
    progressPercent: 0,
  });
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Multi-Agent Review State (Starts as 'not_started')
  const [reviewState, setReviewState] = useState<ReviewState>('not_started');
  const [reviewFindings, setReviewFindings] = useState<ReviewFinding[]>([]);
  const [orchestrationSummary, setOrchestrationSummary] = useState<OrchestrationSummary>({
    totalIssuesFound: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    infoCount: 0,
    crossAgentVerifications: 0,
    challengesResolved: 0,
    overallHealthScore: 100,
    readinessVerdict: 'ready_to_merge',
    finalReviewerNotes: '',
    orchestratorAudioSummary: import.meta.env.VITE_REVIEW_NOT_RUN_MESSAGE || 'Review not yet run. Click "Run 5-Agent Review" to analyze the repository.',
  });
  const [selectedFinding, setSelectedFinding] = useState<ReviewFinding | null>(null);
  const [activeDebateFinding, setActiveDebateFinding] = useState<ReviewFinding | null>(null);
  const [activeDebateStageIndex, setActiveDebateStageIndex] = useState(0);
  const [agentFilter, setAgentFilter] = useState<AgentId | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [isReviewRunning, setIsReviewRunning] = useState(false);
  const [reviewProgress, setReviewProgress] = useState({ label: '', percent: 0, stage: '' });

  // Merge Conflict & Comparison State
  const [comparisonState, setComparisonState] = useState<ComparisonState>('no_comparison');
  const [branchComparison, setBranchComparison] = useState<BranchComparison>(createEmptyBranchComparison());
  const [selectedConflict, setSelectedConflict] = useState<MergeConflictBlock | null>(null);
  const [selectedSemanticAlert, setSelectedSemanticAlert] = useState<SemanticConflictAlert | null>(null);

  // Impact Analysis State
  const [selectedImpactNodeId, setSelectedImpactNodeId] = useState<string | null>(null);
  const [activeChangePlan, setActiveChangePlan] = useState<FeatureChangePlan | null>(null);

  // AI Chat State
  const createWelcomeMessage = (targetRepo: RepositoryData): ChatMessage => ({
    id: `msg_welcome_${Date.now()}`,
    sender: 'assistant',
    respondingAgentId: AGENT_CONFIG.defaultAgentId,
    content: `Engineering Intelligence ready for **${targetRepo.name}** (${targetRepo.currentBranch} branch).

I have indexed the codebase across ${targetRepo.languages.map((l) => l.name).join(', ') || 'all files'}. Ask any technical question, explore dependencies, or query one of the 5 specialized engineering agents.`,
    timestamp: MESSAGES.timestamps.justNow,
    jumpActions: [
      {
        label: `Explore ${targetRepo.name} Overview`,
        type: 'code',
        targetId: targetRepo.rootFiles[0]?.path || 'README.md',
        description: 'View repository files and structure',
      },
    ],
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    createWelcomeMessage(comprehensiveDemoRepo),
  ]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsConnectModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsLLMSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectFileByPath = async (path: string, line?: number) => {
    const file = findFileByPath(repo.rootFiles, path);
    if (file) {
      // If file content is not yet loaded from GitHub, fetch it dynamically
      if (!file.content && !repo.isDemo && repo.fullName) {
        try {
          const { fetchRawFileContent } = await import('../services/githubFetcher');
          console.log(`[FileLoader] Fetching content for: ${file.path}`);
          const content = await fetchRawFileContent(repo.fullName, repo.currentBranch, file.path);
          file.content = content;
          
          const { extractCodeSymbols } = await import('../services/repoParser');
          file.symbols = extractCodeSymbols(file.name, content);
          console.log(`[FileLoader] Successfully loaded: ${file.path}`);
        } catch (error) {
          console.error(`[FileLoader] Failed to load file ${file.path}:`, error);
          file.content = `// ${MESSAGES.errors.loadFailed}\n// ${error instanceof Error ? error.message : MESSAGES.placeholders.unknownError}\n\n// File path: ${file.path}`;
        }
      }
      
      setActiveFile(file);
      if (line) setActiveLine(line);
      setActiveView('explore');
    } else {
      console.warn(`[FileLoader] File not found in repository tree: ${path}`);
    }
  };

  const switchRepo = (newRepo: RepositoryData) => {
    setRepo(newRepo);
    const firstFile = findFileByPath(newRepo.rootFiles, 'src/pages/Dashboard.tsx') ||
                     findFileByPath(newRepo.rootFiles, 'src/pages/Checkout.tsx') ||
                     findFileByPath(newRepo.rootFiles, 'README.md') ||
                     findFileByPath(newRepo.rootFiles, 'readme.md') ||
                     newRepo.rootFiles[0];
    setActiveFile(firstFile || null);
    setActiveView('overview');
    setIsConnectModalOpen(false);
    
    // Reset review, debate, and comparison states for the new repository
    setReviewState('not_started');
    setReviewFindings([]);
    setSelectedFinding(null);
    setActiveDebateFinding(null);
    setComparisonState('no_comparison');
    setBranchComparison(createEmptyBranchComparison());
    setSelectedConflict(null);
    setSelectedImpactNodeId(null);
    setActiveChangePlan(null);

    // Refresh chat messages with welcome for new repo
    setChatMessages([createWelcomeMessage(newRepo)]);
  };

  const switchBranch = (branch: string) => {
    setRepo((prev) => ({ ...prev, currentBranch: branch }));
  };

  // Voice Speech Synthesis
  const speakAgentBriefing = (text: string, agentId: AgentId) => {
    if (!voiceSettings.enabled) return;

    setVoicePlayback({
      isPlaying: true,
      speakingAgentId: agentId,
      currentText: text,
      progressPercent: 0,
    });

    voiceEngine.speak(
      text,
      agentId,
      voiceSettings,
      () => {
        setVoicePlayback((prev) => ({ ...prev, isPlaying: true }));
      },
      () => {
        setVoicePlayback({
          isPlaying: false,
          speakingAgentId: null,
          currentText: null,
          progressPercent: 100,
        });
      }
    );
  };

  // Play Multi-Agent Audio Debate
  const playMultiAgentDebate = async (finding: ReviewFinding) => {
    if (!finding.debateStages?.length) return;

    stopAudioPlayback();

    for (let i = 0; i < finding.debateStages.length; i++) {
      const stage = finding.debateStages[i];
      setActiveDebateStageIndex(i);

      setVoicePlayback({
        isPlaying: true,
        speakingAgentId: stage.agentId,
        currentText: stage.audioSpeechText || stage.argumentText,
        progressPercent: Math.round(((i + 1) / finding.debateStages.length) * 100),
      });

      await new Promise<void>((resolve) => {
        voiceEngine.speak(
          stage.audioSpeechText || stage.argumentText,
          stage.agentId,
          voiceSettings,
          undefined,
          () => resolve()
        );
      });

      await new Promise((r) => setTimeout(r, 400));
    }

    setVoicePlayback({
      isPlaying: false,
      speakingAgentId: null,
      currentText: null,
      progressPercent: 100,
    });
  };

  const stopAudioPlayback = () => {
    voiceEngine.stopSpeaking();
    setVoicePlayback({
      isPlaying: false,
      speakingAgentId: null,
      currentText: null,
      progressPercent: 0,
    });
  };

  // Microphone Voice Input
  const startVoiceInput = (targetAgentId?: AgentId) => {
    setIsRecordingVoice(true);
    voiceEngine.startListening(
      (transcript) => {
        setIsRecordingVoice(false);
        if (transcript.trim()) {
          sendChatMessage(transcript, targetAgentId);
        }
      },
      (err) => {
        setIsRecordingVoice(false);
        console.warn('[Voice] Microphone input error:', err);
      },
      () => {
        setIsRecordingVoice(false);
      }
    );
  };

  const stopVoiceInput = () => {
    voiceEngine.stopListening();
    setIsRecordingVoice(false);
  };

  // 5-Agent Review Execution Flow
  const runReview = async () => {
    setIsReviewRunning(true);
    setReviewState('running');
    setActiveView('review');

    try {
      const { findings, summary } = await llmAnalyzer.analyzeRepository(repo, (label, percent) => {
        if (percent < 30) {
          setReviewState('running');
        } else if (percent < 85) {
          setReviewState('debating');
        } else {
          setReviewState('consensus');
        }
        setReviewProgress({ label, percent, stage: 'analysis' });
      });

      setReviewFindings(findings);
      setOrchestrationSummary(summary);
      setSelectedFinding(findings[0] || null);
      setActiveDebateFinding(findings[0] || null);
      setActiveDebateStageIndex(0);
      setReviewState('completed');
      setIsReviewRunning(false);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });

      if (voiceSettings?.autoPlayResponses) {
        speakAgentBriefing(summary.orchestratorAudioSummary, AGENT_CONFIG.defaultAgentId);
      }
    } catch (error) {
      console.error('[Review] Multi-agent analysis failed:', error);
      setReviewState('not_started');
      setIsReviewRunning(false);
      alert(`${MESSAGES.errors.reviewFailed}: ${error instanceof Error ? error.message : MESSAGES.placeholders.unknownError}`);
    }
  };

  const applyFix = (findingId: string) => {
    setReviewFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return { ...f, status: 'resolved' };
        }
        return f;
      })
    );
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
  };

  const dismissFinding = (findingId: string) => {
    setReviewFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: 'dismissed' } : f))
    );
  };

  // Branch Comparison Flow
  const compareBranches = async (baseBranch: string, targetBranch: string) => {
    setComparisonState('comparing');
    await new Promise((r) => setTimeout(r, 600));

    if (repo.isDemo) {
      const { getMockBranchComparison } = await import('../data/mockBranchComparisons');
      const mockComparison = getMockBranchComparison(repo.id, baseBranch, targetBranch);
      if (mockComparison) {
        setBranchComparison(mockComparison);
        setComparisonState(mockComparison.comparisonState);
        return;
      }
    }

    setBranchComparison({
      comparisonState: 'no_conflicts',
      baseBranch,
      currentBranch: repo.currentBranch,
      targetBranch,
      aheadCount: 0,
      behindCount: 0,
      conflictingFilesCount: 0,
      semanticConflictsCount: 0,
      addedFiles: [],
      deletedFiles: [],
      modifiedFiles: [],
      renamedFiles: [],
      changedFunctions: [],
      changedApis: [],
      changedDatabaseStructures: [],
      changedDependencies: [],
      conflicts: [],
      semanticAlerts: [],
    });

    setComparisonState('no_conflicts');
  };

  const resetComparison = () => {
    setComparisonState('no_comparison');
    setBranchComparison(createEmptyBranchComparison());
    setSelectedConflict(null);
    setSelectedSemanticAlert(null);
  };

  const resolveConflictBlock = (
    conflictId: string,
    resolution: 'ours' | 'theirs' | 'ai' | 'custom',
    customCode?: string
  ) => {
    setBranchComparison((prev) => ({
      ...prev,
      conflicts: prev.conflicts.map((c) => {
        if (c.id === conflictId) {
          const statusMap = {
            ours: 'resolved_ours' as const,
            theirs: 'resolved_theirs' as const,
            ai: 'resolved_ai' as const,
            custom: 'resolved_custom' as const,
          };
          return {
            ...c,
            resolutionStatus: statusMap[resolution],
            customCode: customCode || c.customCode,
          };
        }
        return c;
      }),
    }));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
  };

  const generateChangePlanForPrompt = (prompt: string) => {
    sendChatMessage(`What is the step-by-step change plan and risk analysis for: "${prompt}"?`);
    setActiveView('copilot');
  };

  const handleJumpAction = (action: JumpAction) => {
    switch (action.type) {
      case 'code':
        selectFileByPath(action.targetId, action.line);
        break;
      case 'finding': {
        const f = reviewFindings.find((item) => item.id === action.targetId);
        if (f) {
          setSelectedFinding(f);
          setActiveView('review');
        }
        break;
      }
      case 'debate': {
        const f = reviewFindings.find((item) => item.id === action.targetId);
        if (f) {
          setActiveDebateFinding(f);
          setActiveDebateStageIndex(0);
          setActiveView('debate');
        }
        break;
      }
      case 'impact_node':
        setSelectedImpactNodeId(action.targetId);
        setActiveView('impact');
        break;
      case 'merge_conflict': {
        const c = branchComparison.conflicts.find((item) => item.id === action.targetId);
        if (c) {
          setSelectedConflict(c);
          setActiveView('merge');
        }
        break;
      }
    }
  };

  // AI Copilot Real Multi-Turn Chat
  const sendChatMessage = (content: string, targetAgentId?: AgentId) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: MESSAGES.timestamps.justNow,
    };

    const loadingMsgId = `loading_${Date.now()}`;
    const targetAgent = reviewAgents.find((a) => a.id === targetAgentId) || {
      id: AGENT_CONFIG.defaultAgentId,
      name: AGENT_CONFIG.orchestrator.name,
      role: 'Engineering Intelligence Assistant',
    };

    const loadingMsg: ChatMessage = {
      id: loadingMsgId,
      sender: 'assistant',
      respondingAgentId: targetAgentId || AGENT_CONFIG.defaultAgentId,
      content: `⏳ ${targetAgent.name} is analyzing the codebase and formulating a response...`,
      timestamp: MESSAGES.timestamps.justNow,
    };

    // Capture conversation history for LLM
    const priorChat = chatMessages.filter((m) => m.id !== 'msg_welcome' && !m.id.startsWith('msg_welcome_'));
    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...priorChat.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
      { role: 'user' as const, content },
    ];

    setChatMessages((prev) => [...prev, userMsg, loadingMsg]);

    (async () => {
      try {
        // Retrieve relevant code snippets via RAG
        const ragContext = ragService.searchContext(content, 6);
        const codeReferences = ragContext.length > 0 ? ragContext.map((result) => ({
          file: result.file,
          lineStart: result.lineStart,
          lineEnd: result.lineEnd,
          snippet: result.content,
        })) : undefined;

        // Build comprehensive repository context
        const allFiles = flattenFileTree(repo.rootFiles);
        const fileListSample = allFiles.slice(0, 30).map((f) => f.path).join(', ');

        let contextText = `=== REPOSITORY CONTEXT ===\n`;
        contextText += `Name: ${repo.name} (${repo.fullName || repo.name})\n`;
        contextText += `Description: ${repo.description}\n`;
        contextText += `Current Branch: ${repo.currentBranch}\n`;
        contextText += `Languages: ${repo.languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}\n`;
        if (repo.dependencies.length > 0) {
          contextText += `Key Dependencies: ${repo.dependencies.slice(0, 10).map((d) => d.name).join(', ')}\n`;
        }
        contextText += `File Structure Sample: ${fileListSample}\n`;

        if (activeFile) {
          contextText += `\nCurrently Open File: ${activeFile.path}\n`;
          if (activeFile.content) {
            contextText += `Active File Snippet:\n\`\`\`\n${activeFile.content.slice(0, 1200)}\n\`\`\`\n`;
          }
        }

        if (ragContext.length > 0) {
          contextText += `\nRelevant Code Search Matches (RAG):\n`;
          ragContext.forEach((ctx, idx) => {
            contextText += `\n[Match ${idx + 1}] File: ${ctx.file} (Lines ${ctx.lineStart}-${ctx.lineEnd}):\n`;
            contextText += `\`\`\`\n${ctx.content.slice(0, 500)}\n\`\`\`\n`;
          });
        }

        const systemPrompt = `You are ${targetAgent.name}, a ${targetAgent.role} for the RepoLens repository intelligence platform.

Your mission is to provide accurate, deep technical answers about the selected repository.

Guidelines:
- Base your answers strictly on the provided repository context and code references.
- DO NOT hallucinate files, functions, or dependencies that are not in the repository.
- Provide clear markdown formatting, code snippets, and call-site line numbers where relevant.
- Be actionable, insightful, and conversational.

${contextText}`;

        // Format multi-turn messages for LLM
        const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-8), // Keep last 8 conversational turns
        ];

        console.log(`[Chat] Querying LLM (${llmService.getActiveProvider()})...`);
        const response = await llmService.chat(llmMessages, {
          temperature: 0.4,
          maxTokens: 1500,
        });

        // Dynamic jump actions generated from RAG results
        const jumpActions: JumpAction[] = ragContext.slice(0, 3).map((ctx) => ({
          label: `Open ${ctx.file.split('/').pop()}:${ctx.lineStart}`,
          type: 'code' as const,
          targetId: ctx.file,
          line: ctx.lineStart,
          description: `Line ${ctx.lineStart} in ${ctx.file}`,
        }));

        // Replace loading message with real response
        setChatMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== loadingMsgId);
          return [
            ...filtered,
            {
              id: `ast_${Date.now()}`,
              sender: 'assistant' as const,
              respondingAgentId: targetAgentId || AGENT_CONFIG.defaultAgentId,
              content: response.content,
              timestamp: MESSAGES.timestamps.justNow,
              codeReferences,
              jumpActions: jumpActions.length > 0 ? jumpActions : undefined,
            },
          ];
        });

        if (voiceSettings?.autoPlayResponses) {
          speakAgentBriefing(response.content.slice(0, 200), targetAgentId || AGENT_CONFIG.defaultAgentId);
        }
      } catch (error) {
        console.error('[Chat] LLM error:', error);
        const errMsg = error instanceof Error ? error.message : 'Unknown AI service error';

        setChatMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== loadingMsgId);
          return [
            ...filtered,
            {
              id: `ast_${Date.now()}`,
              sender: 'assistant' as const,
              respondingAgentId: targetAgentId || AGENT_CONFIG.defaultAgentId,
              content: `⚠️ **AI Service Error**: Could not complete request.

**Details**: ${errMsg}

**Troubleshooting**:
1. If using Ollama, ensure it is running on your machine (\`ollama run qwen2.5:3b\`).
2. If using Gemini, verify your \`VITE_GEMINI_API_KEY\` is configured in \`.env.local\`.
3. You can configure providers in the **LLM Settings** modal.`,
              timestamp: MESSAGES.timestamps.justNow,
            },
          ];
        });
      }
    })();
  };

  const clearChat = () => {
    setChatMessages([createWelcomeMessage(repo)]);
  };

  const contextValue: RepoStoreContextType = {
    repo,
    activeView,
    setActiveView,
    activeFile,
    setActiveFile,
    activeLine,
    setActiveLine,
    selectFileByPath,
    switchRepo,
    switchBranch,

    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isConnectModalOpen,
    setIsConnectModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isLLMSettingsModalOpen,
    setIsLLMSettingsModalOpen,
    isVoiceSettingsModalOpen,
    setIsVoiceSettingsModalOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    rightPanelTab,
    setRightPanelTab,

    voiceSettings,
    setVoiceSettings,
    voicePlayback,
    speakAgentBriefing,
    playMultiAgentDebate,
    stopAudioPlayback,
    isRecordingVoice,
    startVoiceInput,
    stopVoiceInput,

    reviewState,
    reviewFindings,
    orchestrationSummary,
    selectedFinding,
    setSelectedFinding,
    activeDebateFinding,
    setActiveDebateFinding,
    activeDebateStageIndex,
    setActiveDebateStageIndex,
    agentFilter,
    setAgentFilter,
    severityFilter,
    setSeverityFilter,
    isReviewRunning,
    reviewProgress,
    runReview,
    applyFix,
    dismissFinding,

    comparisonState,
    branchComparison,
    selectedConflict,
    setSelectedConflict,
    selectedSemanticAlert,
    setSelectedSemanticAlert,
    compareBranches,
    resetComparison,
    resolveConflictBlock,

    selectedImpactNodeId,
    setSelectedImpactNodeId,
    activeChangePlan,
    setActiveChangePlan,
    generateChangePlanForPrompt,

    chatMessages,
    sendChatMessage,
    clearChat,
    handleJumpAction,
  };

  return (
    <RepoContext.Provider value={contextValue}>
      {children}
    </RepoContext.Provider>
  );
};

export const useRepoStore = () => {
  const context = useContext(RepoContext);
  if (!context) throw new Error('useRepoStore must be used within a RepoProvider');
  return context;
};
