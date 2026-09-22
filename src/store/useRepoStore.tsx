import React, { createContext, useContext, useState, useEffect } from 'react';
import { RepositoryData, FileNode, HotspotItem, DeadCodeItem, DuplicateCodeItem } from '../types/repository';
import { ReviewFinding, OrchestrationSummary, AgentId, SeverityLevel, DebateStageItem, ReviewState } from '../types/agents';
import { MergeConflictBlock, SemanticConflictAlert, BranchComparison, ComparisonState } from '../types/merge';
import { ChatMessage, JumpAction } from '../types/chat';
import { FeatureChangePlan } from '../types/impact';
import { reviewAgents } from '../config/agents';
import { createEmptyRepository, createEmptyBranchComparison } from '../config/defaultRepository';
import { findFileByPath, flattenFileTree } from '../services/repoParser';
import { ragService } from '../services/ragService';
import { APP_CONFIG, MESSAGES, AGENT_CONFIG } from '../config/constants';
import confetti from 'canvas-confetti';

// Voice-related types (placeholder for missing voice functionality)
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

// Voice engine placeholder (should be replaced with actual implementation)
const voiceEngine = {
  speak: (text: string, agentId: AgentId, settings: VoiceSettings, onStart?: () => void, onEnd?: () => void) => {
    // Placeholder implementation
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 1000);
  },
  stopSpeaking: () => {
    // Placeholder implementation
  },
  startListening: (onResult: (text: string) => void, onError: (error: any) => void, onEnd: () => void) => {
    // Placeholder implementation
    setTimeout(() => {
      onResult('Voice input not implemented');
      onEnd();
    }, 1000);
  },
  stopListening: () => {
    // Placeholder implementation
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
  const [repo, setRepo] = useState<RepositoryData>(createEmptyRepository());
  const [activeView, setActiveView] = useState<AppView>(APP_CONFIG.ui.defaultView);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Initialize RAG service with repository on mount
  useEffect(() => {
    ragService.indexRepository(repo);
    console.log('[RAG] Repository indexed:', ragService.getIndexStats());
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

  // Multi-Agent Review State (Starts as 'not_started' - only begins on explicit click)
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
    overallHealthScore: 0,
    readinessVerdict: 'review_required',
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

  // Merge Conflict & Comparison State (Starts as 'no_comparison' - only compares when version/branch is selected)
  const [comparisonState, setComparisonState] = useState<ComparisonState>('no_comparison');
  const [branchComparison, setBranchComparison] = useState<BranchComparison>(createEmptyBranchComparison());
  const [selectedConflict, setSelectedConflict] = useState<MergeConflictBlock | null>(null);
  const [selectedSemanticAlert, setSelectedSemanticAlert] = useState<SemanticConflictAlert | null>(null);

  // Impact Analysis State
  const [selectedImpactNodeId, setSelectedImpactNodeId] = useState<string | null>(null);
  const [activeChangePlan, setActiveChangePlan] = useState<FeatureChangePlan | null>(null);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: import.meta.env.VITE_WELCOME_MESSAGE_ID || 'msg_welcome',
      sender: 'assistant',
      respondingAgentId: AGENT_CONFIG.defaultAgentId,
      content: `${APP_CONFIG.chat.welcomeMessage} for ${repo.name}.

I understand the full codebase architecture across React, Node.js/Express, PostgreSQL/Prisma, and Stripe.

Ask any technical question or query one of the 5 specialized review agents:`,
      timestamp: MESSAGES.timestamps.justNow,
      jumpActions: [
        { label: 'Where is authentication?', type: 'code', targetId: 'server/middleware/authGuard.ts', line: 4, description: 'JWT pipeline in authGuard.ts' },
        { label: 'View Checkout Dependency Graph', type: 'impact_node', targetId: 'api_create_intent', description: 'Topology for /api/checkout/create-intent' },
      ]
    }
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectFileByPath = async (path: string, line?: number) => {
    const file = findFileByPath(repo.rootFiles, path);
    if (file) {
      // If file content not loaded and repo is from GitHub, fetch it
      if (!file.content && !repo.isDemo && repo.fullName) {
        try {
          const { fetchRawFileContent } = await import('../services/githubFetcher');
          console.log(`[FileLoader] Fetching content for: ${file.path}`);
          const content = await fetchRawFileContent(repo.fullName, repo.currentBranch, file.path);
          file.content = content;
          
          // Extract symbols from the loaded content
          const { extractCodeSymbols } = await import('../services/repoParser');
          file.symbols = extractCodeSymbols(file.name, content);
          console.log(`[FileLoader] Successfully loaded: ${file.path}`);
        } catch (error) {
          console.error(`[FileLoader] Failed to load file ${file.path}:`, error);
          file.content = `// ${MESSAGES.errors.loadFailed}\n// ${error instanceof Error ? error.message : MESSAGES.placeholders.unknownError}\n\n// This file could not be loaded from GitHub.\n// Please check:\n// 1. Your GitHub token is valid\n// 2. The repository is accessible\n// 3. The file path exists: ${file.path}`;
        }
      }
      
      setActiveFile(file);
      if (line) setActiveLine(line);
      setActiveView('explore');
    } else {
      console.warn(`[FileLoader] File not found in tree: ${path}`);
    }
  };

  const switchRepo = (newRepo: RepositoryData) => {
    setRepo(newRepo);
    const firstFile = findFileByPath(newRepo.rootFiles, 'src/pages/Checkout.tsx') ||
                     findFileByPath(newRepo.rootFiles, 'README.md') ||
                     newRepo.rootFiles[0];
    setActiveFile(firstFile || null);
    setActiveView(APP_CONFIG.ui.defaultView);
    setIsConnectModalOpen(false);
    // Reset review and merge comparison state for new repo
    setReviewState('not_started');
    setReviewFindings([]);
    setSelectedFinding(null);
    setActiveDebateFinding(null);
    setComparisonState('no_comparison');
    setBranchComparison(createEmptyBranchComparison());
    setSelectedConflict(null);
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
    if (!voiceSettings.enabled || !finding.debateStages?.length) return;

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

      // Brief pause between speaker turns
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
        console.warn('Mic input error:', err);
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

  // 5-Agent Review Execution Flow: Not Started -> Running -> Debating -> Consensus -> Completed
  const runReview = async () => {
    setIsReviewRunning(true);
    setReviewState('running');
    setActiveView('review');

    try {
      // Use LLM-powered analysis
      const { llmAnalyzer } = await import('../services/llm/llmAnalyzer');
      
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

      // Optional audio summary
      if (voiceSettings?.autoPlayResponses) {
        speakAgentBriefing(summary.orchestratorAudioSummary, AGENT_CONFIG.defaultAgentId);
      }
    } catch (error) {
      console.error('[Review] Analysis failed:', error);
      setReviewState('not_started');
      setIsReviewRunning(false);
      alert(`${MESSAGES.errors.reviewFailed}: ${error instanceof Error ? error.message : MESSAGES.placeholders.unknownError}.\n\n${MESSAGES.errors.llmNotConfigured}`);
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

  // Branch Comparison Flow: No Comparison -> Comparing -> Conflicts Found / No Conflicts
  const compareBranches = async (baseBranch: string, targetBranch: string) => {
    setComparisonState('comparing');
    
    // Simulate loading delay
    await new Promise((r) => setTimeout(r, 800));
    
    // For demo repositories, use mock comparison data
    if (repo.isDemo) {
      const { getMockBranchComparison } = await import('../data/mockBranchComparisons');
      const mockComparison = getMockBranchComparison(repo.id, baseBranch, targetBranch);
      
      if (mockComparison) {
        setBranchComparison(mockComparison);
        setComparisonState(mockComparison.comparisonState);
        return;
      }
    }
    
    // For non-demo repos or if no mock data available, show empty comparison
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
      })
    }));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
  };

  const generateChangePlanForPrompt = (prompt: string) => {
    // Real change plan generation would happen here with LLM
    alert(`${import.meta.env.VITE_CHANGE_PLAN_MESSAGE || 'Change plan generation requires LLM integration. Feature in development.'}`);
    setActiveChangePlan(null);
  };

  const handleJumpAction = (action: JumpAction) => {
    switch (action.type) {
      case 'code':
        selectFileByPath(action.targetId, action.line);
        break;
      case 'finding': {
        const f = reviewFindings.find(item => item.id === action.targetId);
        if (f) {
          setSelectedFinding(f);
          setActiveView('review');
        }
        break;
      }
      case 'debate': {
        const f = reviewFindings.find(item => item.id === action.targetId);
        if (f) {
          setActiveDebateFinding(f);
          setActiveDebateStageIndex(0);
          setActiveView('review');
        }
        break;
      }
      case 'impact_node':
        setSelectedImpactNodeId(action.targetId);
        setActiveView('impact');
        break;
      case 'merge_conflict': {
        const c = branchComparison.conflicts.find(item => item.id === action.targetId);
        if (c) {
          setSelectedConflict(c);
          setActiveView('merge');
        }
        break;
      }
    }
  };

  const sendChatMessage = (content: string, targetAgentId?: AgentId) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: MESSAGES.timestamps.justNow,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Add loading message
    const loadingMsgId = `loading_${Date.now()}`;
    const loadingMsg: ChatMessage = {
      id: loadingMsgId,
      sender: 'assistant',
      respondingAgentId: targetAgentId || AGENT_CONFIG.defaultAgentId,
      content: '⏳ Analyzing your question and searching the codebase...',
      timestamp: MESSAGES.timestamps.justNow,
    };
    setChatMessages((prev) => [...prev, loadingMsg]);

    // Run async operation without blocking
    (async () => {
      try {
        // Use RAG service to find relevant context
        const ragContext = ragService.searchContext(content, 5);
        const codeReferences = ragContext.length > 0 ? ragContext.map(result => ({
          file: result.file,
          lineStart: result.lineStart,
          lineEnd: result.lineEnd,
          snippet: result.content,
        })) : undefined;

        // Build context for LLM
        let contextText = `Repository: ${repo.name}\n`;
        contextText += `Description: ${repo.description}\n`;
        contextText += `Languages: ${repo.languages.map(l => l.name).join(', ')}\n`;
        contextText += `Frameworks: ${repo.frameworks.map(f => f.name).join(', ')}\n\n`;
        
        if (ragContext.length > 0) {
          contextText += `Relevant Code Context:\n`;
          ragContext.forEach((ctx, idx) => {
            contextText += `\n[${idx + 1}] ${ctx.file} (lines ${ctx.lineStart}-${ctx.lineEnd}):\n`;
            contextText += `${ctx.content.substring(0, 500)}\n`;
          });
        }

        // Import and use LLM service
        const { llmService } = await import('../services/llm/llmService');
        
        // Check if LLM is available
        const status = await llmService.checkProviderStatus();
        console.log('[Chat] LLM Status:', status);
        
        if (!status.ollama.available && !status.gemini.available) {
          throw new Error('No LLM provider available. Please ensure Ollama is running or configure Gemini API key.');
        }

        // Get agent-specific system prompt
        const agentProfile = reviewAgents.find(a => a.id === targetAgentId) || {
          name: AGENT_CONFIG.orchestrator.name,
          role: 'Repository Intelligence Assistant',
        };

        const systemPrompt = `You are ${agentProfile.name}, a ${agentProfile.role}.

You are helping a developer understand their codebase. Answer questions about the repository in a helpful, conversational manner like ChatGPT would.

Guidelines:
- Be conversational and friendly
- Provide specific, actionable insights
- Reference actual code when relevant
- Explain technical concepts clearly
- Suggest next steps or related questions
- Keep responses concise but informative (2-4 paragraphs)

${contextText}

Answer the user's question based on this repository context.`;

        console.log('[Chat] Sending to LLM...');
        const response = await llmService.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content },
        ], {
          temperature: 0.7,
          maxTokens: 1024,
        });

        console.log('[Chat] Got LLM response:', response);

        // Generate jump actions from RAG context
        const jumpActions: JumpAction[] = ragContext.map(ctx => ({
          label: `View ${ctx.file.split('/').pop()}:${ctx.lineStart}`,
          type: 'code' as const,
          targetId: ctx.file,
          line: ctx.lineStart,
          description: `Relevance: ${Math.round(ctx.relevanceScore * 100)}%`,
        }));

        // Remove loading message and add AI response
        setChatMessages((prev) => {
          const withoutLoading = prev.filter(m => m.id !== loadingMsgId);
          return [
            ...withoutLoading,
            {
              id: `ast_${Date.now()}`,
              sender: 'assistant' as const,
              respondingAgentId: targetAgentId || AGENT_CONFIG.defaultAgentId,
              content: response.content,
              timestamp: MESSAGES.timestamps.justNow,
              codeReferences,
              jumpActions,
            },
          ];
        });

        // Auto speech if enabled
        if (voiceSettings?.autoPlayResponses) {
          speakAgentBriefing(response.content.slice(0, 200), targetAgentId || AGENT_CONFIG.defaultAgentId);
        }
      } catch (error) {
        console.error('[Chat] AI response failed:', error);
        
        // Fallback to hardcoded response if LLM fails
        const respondingAgent: AgentId = targetAgentId || AGENT_CONFIG.defaultAgentId;
        const ragContext = ragService.searchContext(content, 5);
        
        let fallbackContent = `I encountered an issue connecting to the AI service.\n\n`;
        
        if (ragContext.length > 0) {
          fallbackContent += `However, I found ${ragContext.length} relevant code sections:\n\n`;
          ragContext.forEach((ctx, idx) => {
            fallbackContent += `${idx + 1}. **${ctx.file}** (lines ${ctx.lineStart}-${ctx.lineEnd})\n`;
          });
          fallbackContent += `\nClick the code references below to explore them.`;
        } else {
          fallbackContent += `**Error Details:**\n${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
          fallbackContent += `**Troubleshooting:**\n`;
          fallbackContent += `1. Ensure Ollama is running: \`ollama list\` in terminal\n`;
          fallbackContent += `2. Check if model is loaded: \`ollama run qwen2.5:3b\`\n`;
          fallbackContent += `3. Or configure Gemini API key in .env.local\n\n`;
          fallbackContent += `Try asking a simpler question while I check the connection.`;
        }

        const codeReferences = ragContext.length > 0 ? ragContext.map(result => ({
          file: result.file,
          lineStart: result.lineStart,
          lineEnd: result.lineEnd,
          snippet: result.content,
        })) : undefined;

        const jumpActions: JumpAction[] = ragContext.map(ctx => ({
          label: `View ${ctx.file.split('/').pop()}:${ctx.lineStart}`,
          type: 'code' as const,
          targetId: ctx.file,
          line: ctx.lineStart,
        }));

        setChatMessages((prev) => {
          const withoutLoading = prev.filter(m => m.id !== loadingMsgId);
          return [
            ...withoutLoading,
            {
              id: `ast_${Date.now()}`,
              sender: 'assistant' as const,
              respondingAgentId: respondingAgent,
              content: fallbackContent,
              timestamp: MESSAGES.timestamps.justNow,
              codeReferences,
              jumpActions,
            },
          ];
        });
      }
    })();
  };
            id: `ast_${Date.now()}`,
            sender: 'assistant' as const,
            respondingAgentId: targetAgentId || AGENT_CONFIG.defaultAgentId,
            content: response.content,
            timestamp: MESSAGES.timestamps.justNow,
            codeReferences,
            jumpActions,
          },
        ];
      });

      // Auto speech if enabled
      if (voiceSettings?.autoPlayResponses) {
        speakAgentBriefing(response.content.slice(0, 200), targetAgentId || AGENT_CONFIG.defaultAgentId);
      }
    } catch (error) {
      console.error('[Chat] AI response failed:', error);
      
      // Fallback to hardcoded response if LLM fails
      const respondingAgent: AgentId = targetAgentId || AGENT_CONFIG.defaultAgentId;
      const ragContext = ragService.searchContext(content, 5);
      
      let fallbackContent = `I encountered an issue connecting to the AI service. `;
      
      if (ragContext.length > 0) {
        fallbackContent += `However, I found ${ragContext.length} relevant code sections:\n\n`;
        ragContext.forEach((ctx, idx) => {
          fallbackContent += `${idx + 1}. **${ctx.file}** (lines ${ctx.lineStart}-${ctx.lineEnd})\n`;
        });
        fallbackContent += `\nClick the code references above to explore them.`;
      } else {
        fallbackContent += `Please ensure Ollama is running or configure your Gemini API key in the .env.local file.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      const codeReferences = ragContext.length > 0 ? ragContext.map(result => ({
        file: result.file,
        lineStart: result.lineStart,
        lineEnd: result.lineEnd,
        snippet: result.content,
      })) : undefined;

      const jumpActions: JumpAction[] = ragContext.map(ctx => ({
        label: `View ${ctx.file.split('/').pop()}:${ctx.lineStart}`,
        type: 'code' as const,
        targetId: ctx.file,
        line: ctx.lineStart,
      }));

      setChatMessages((prev) => {
        const withoutLoading = prev.filter(m => m.id !== loadingMsg.id);
        return [
          ...withoutLoading,
          {
            id: `ast_${Date.now()}`,
            sender: 'assistant' as const,
            respondingAgentId: respondingAgent,
            content: fallbackContent,
            timestamp: MESSAGES.timestamps.justNow,
            codeReferences,
            jumpActions,
          },
        ];
      });
    }
  };

  const clearChat = () => {
    setChatMessages([]);
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
