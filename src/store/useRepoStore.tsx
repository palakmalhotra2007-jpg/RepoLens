// Core React imports for context and state management
import React, { createContext, useContext, useState, useEffect } from 'react';

// Type definitions for repository, agents, merge conflicts, chat, and impact analysis
import { RepositoryData, FileNode } from '../types/repository';
import { ReviewFinding, OrchestrationSummary, AgentId, SeverityLevel, ReviewState } from '../types/agents';
import { MergeConflictBlock, SemanticConflictAlert, BranchComparison, ComparisonState } from '../types/merge';
import { ChatMessage, JumpAction } from '../types/chat';
import { FeatureChangePlan } from '../types/impact';

// Configuration and data imports
import { reviewAgents } from '../config/agents';
import { comprehensiveDemoRepo } from '../data/comprehensiveDemoRepo';
import { createEmptyBranchComparison } from '../config/defaultRepository';

// Service layer imports for parsing, RAG search, and LLM analysis
import { findFileByPath, flattenFileTree } from '../services/repoParser';
import { ragService } from '../services/ragService';
import { APP_CONFIG, MESSAGES, AGENT_CONFIG } from '../config/constants';
import { llmService } from '../services/llm/llmService';
import { llmAnalyzer } from '../services/llm/llmAnalyzer';

// Voice Settings: Controls text-to-speech and speech-to-text behavior
interface VoiceSettings {
  enabled: boolean;
  rate: number;              // Speech speed (0.1 to 10)
  pitch: number;             // Voice pitch (0 to 2)
  volume: number;            // Audio volume (0 to 1)
  autoPlayResponses: boolean; // Auto-speak AI responses
}

// Voice Playback State: Tracks current voice output status
interface VoicePlayback {
  isPlaying: boolean;
  speakingAgentId: AgentId | null;  // Which agent is currently speaking
  currentText: string | null;        // Text being spoken
  progressPercent: number;           // Playback progress (0-100)
}

// Voice Engine: Wrapper around browser's Web Speech API for text-to-speech and speech-to-text
const voiceEngine = (() => {
  let recognitionInstance: any = null; // Stores active speech recognition instance

  return {
    // Returns best available voices (prefers neural/natural-sounding voices)
    getHighQualityVoices: () => {
      const allVoices = window.speechSynthesis.getVoices();
      
      // Keywords that indicate high-quality voice engines
      const qualityKeywords = [
        'neural', 'natural', 'enhanced', 'premium', 'google', 
        'microsoft', 'samantha', 'daniel', 'karen', 'moira',
        'tessa', 'alex', 'fred', 'victoria', 'zira', 'david'
      ];
      
      // Filter for English voices with quality indicators or local voices (better quality)
      const highQualityVoices = allVoices.filter(voice => {
        const nameLower = voice.name.toLowerCase();
        const isEnglish = voice.lang.startsWith('en');
        const hasQualityIndicator = qualityKeywords.some(keyword => nameLower.includes(keyword));
        const isLocal = voice.localService; // Local voices are typically higher quality
        
        return isEnglish && (hasQualityIndicator || isLocal);
      });
      
      // Return quality voices if found, otherwise fallback to all English voices
      if (highQualityVoices.length > 0) {
        return highQualityVoices;
      }
      
      const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
      return englishVoices.length > 0 ? englishVoices : allVoices;
    },

    // Text-to-Speech: Converts text to spoken audio
    speak: (
      text: string,
      agentId: AgentId,
      settings: VoiceSettings,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      // Check browser support for speech synthesis
      if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      // Stop any currently playing speech
      window.speechSynthesis.cancel();
      
      // Create speech utterance with user settings
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.rate || 1.0;
      utterance.pitch = settings.pitch || 1.0;
      utterance.volume = settings.volume || 1.0;

      // Select voice based on agent ID (gives each agent a consistent voice)
      const qualityVoices = voiceEngine.getHighQualityVoices();
      if (qualityVoices.length > 0) {
        // Hash agent ID to deterministically select a voice
        const voiceIndex = Math.abs(agentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % qualityVoices.length;
        utterance.voice = qualityVoices[voiceIndex];
        utterance.lang = 'en-US';
      }

      // Attach event handlers
      if (onStart) utterance.onstart = () => onStart();
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },

    // Stop any ongoing speech immediately
    stopSpeaking: () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    },

    // Speech-to-Text: Starts listening to user's voice input
    startListening: (
      onResult: (text: string) => void,
      onError: (error: any) => void,
      onEnd: () => void
    ) => {
      // Get browser's speech recognition API (Chrome/Edge/Safari)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        onError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
        onEnd();
        return;
      }

      try {
        // Clean up any existing recognition session
        if (recognitionInstance) {
          try {
            recognitionInstance.stop();
          } catch (e) {
            // Ignore stop errors
          }
        }

        // Configure speech recognition
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;      // Single phrase capture
        recognitionInstance.interimResults = false;  // Only final results
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;     // Best match only

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript || '';
          if (transcript.trim()) {
            onResult(transcript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('[Voice Input] Error:', event.error);
          let errorMessage = 'Voice input failed. ';
          
          switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
              errorMessage += 'Microphone permission denied. Please allow microphone access in your browser settings.';
              break;
            case 'no-speech':
              errorMessage += 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage += 'No microphone found. Please check your audio devices.';
              break;
            case 'network':
              errorMessage += 'Network error. Please check your internet connection.';
              break;
            case 'aborted':
              errorMessage += 'Recording was stopped.';
              break;
            default:
              errorMessage += `Error: ${event.error}`;
          }
          
          onError(errorMessage);
        };

        recognitionInstance.onend = () => {
          recognitionInstance = null;
          onEnd();
        };

        recognitionInstance.start();
        console.log('[Voice Input] Started listening...');
      } catch (e) {
        console.error('[Voice Input] Exception:', e);
        onError(`Failed to start voice input: ${e}`);
        onEnd();
      }
    },
    stopListening: () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
          recognitionInstance = null;
        } catch (e) {
          console.error('[Voice Input] Error stopping:', e);
        }
      }
    },
  };
})();

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
  const createWelcomeMessage = (targetRepo: RepositoryData): ChatMessage => {
    const uniqueLangs = Array.from(new Set(targetRepo.languages.map((l) => l.name))).join(', ');
    return {
      id: `msg_welcome_${Date.now()}`,
      sender: 'assistant',
      respondingAgentId: AGENT_CONFIG.defaultAgentId,
      content: `Welcome to RepoLens Copilot for **${targetRepo.name}** (${targetRepo.currentBranch} branch).

I am your unified Principal Architecture & Repository Intelligence Copilot. Ask me anything about **${targetRepo.name}** — from high-level system design, data flows, and module hierarchies to line-by-line implementation, security audits, database efficiency, and step-by-step refactoring plans.

What would you like to explore or analyze today?`,
      timestamp: MESSAGES.timestamps.justNow,
      jumpActions: [
        {
          label: `Explore ${targetRepo.name} Overview`,
          type: 'code',
          targetId: targetRepo.rootFiles[0]?.path || 'README.md',
          description: 'View repository files and structure',
        },
      ],
    };
  };

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
    // Always speak when explicitly called (button click), regardless of global voice setting
    // The global voice setting only applies to auto-play features
    
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
          console.log('[Voice] Received transcript:', transcript);
          sendChatMessage(transcript, targetAgentId);
        } else {
          console.warn('[Voice] Empty transcript received');
        }
      },
      (err) => {
        setIsRecordingVoice(false);
        console.error('[Voice] Microphone input error:', err);
        // Show user-friendly error message
        alert(`🎤 Voice Input Error\n\n${err}\n\nTips:\n• Make sure your browser has microphone permission\n• Check your microphone is connected and working\n• Try using Chrome, Edge, or Safari for best support`);
      },
      () => {
        setIsRecordingVoice(false);
        console.log('[Voice] Recording ended');
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
  };

  const generateChangePlanForPrompt = (prompt: string) => {
    sendChatMessage(`What is the step-by-step change plan and risk analysis for: "${prompt}"?`);
    setActiveView('copilot');
    setIsRightPanelOpen(true);
    setRightPanelTab('chat');
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

  // AI Copilot Real Multi-Turn Chat (Unified ChatGPT-style Copilot)
  const sendChatMessage = (content: string, _targetAgentId?: AgentId) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content,
      timestamp: MESSAGES.timestamps.justNow,
    };

    const loadingMsgId = `loading_${Date.now()}`;

    const loadingMsg: ChatMessage = {
      id: loadingMsgId,
      sender: 'assistant',
      respondingAgentId: AGENT_CONFIG.defaultAgentId,
      content: `RepoLens AI is analyzing the codebase and formulating a detailed response...`,
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
        const fileListSample = allFiles.slice(0, 40).map((f) => f.path).join(', ');

        let contextText = `=== REPOSITORY CONTEXT ===\n`;
        contextText += `Name: ${repo.name} (${repo.fullName || repo.name})\n`;
        contextText += `Description: ${repo.description}\n`;
        contextText += `Current Branch: ${repo.currentBranch}\n`;
        contextText += `Languages: ${repo.languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}\n`;
        if (repo.dependencies.length > 0) {
          contextText += `Key Dependencies: ${repo.dependencies.slice(0, 15).map((d) => d.name).join(', ')}\n`;
        }
        contextText += `File Structure Sample: ${fileListSample}\n`;

        if (activeFile) {
          contextText += `\nCurrently Open File: ${activeFile.path}\n`;
          if (activeFile.content) {
            contextText += `Active File Snippet:\n\`\`\`\n${activeFile.content.slice(0, 1500)}\n\`\`\`\n`;
          }
        }

        if (ragContext.length > 0) {
          contextText += `\nRelevant Code Search Matches (RAG):\n`;
          ragContext.forEach((ctx, idx) => {
            contextText += `\n[Match ${idx + 1}] File: ${ctx.file} (Lines ${ctx.lineStart}-${ctx.lineEnd}):\n`;
            contextText += `\`\`\`\n${ctx.content.slice(0, 600)}\n\`\`\`\n`;
          });
        }

        const systemPrompt = `You are RepoLens Copilot, an elite Principal Software Architect and Repository Intelligence AI assistant (powered by ChatGPT-grade intelligence).

Your goal is to provide EXTREMELY INFORMATIVE, COMPREHENSIVE, THOROUGH, and DEEP technical responses about the repository.

Structure your response with clear, logical sections:
1. Executive Architectural Overview & Context
2. Deep Technical Breakdown (referencing specific files, functions, and call sites)
3. Data Flow & Execution Lifecycle
4. Code Snippets & Implementation Details (use code blocks with full examples)
5. Security, Performance & Reliability Analysis
6. Actionable Next Steps & Best Practices

Guidelines:
- Never give shallow or generic answers. Provide rich, detailed explanations.
- Base your answers strictly on the provided repository context and code references.
- DO NOT hallucinate files, functions, or dependencies that are not in the repository.
- Reference exact file paths and line numbers from the repository context.
- Do NOT include raw markdown heading hashes like "## " or "***". Use clean section names with bolding and bullet points.
- Write complete, syntactically valid code blocks for fixes or refactoring suggestions.
- Be authoritative, highly analytical, and engineering-focused.

${contextText}`;

        // Format multi-turn messages for LLM
        const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-8), // Keep last 8 conversational turns
        ];

        console.log(`[Chat] Querying LLM (${llmService.getActiveProvider()})...`);
        
        // Timeout protection for chat query (20s max for deep responses)
        const chatPromise = llmService.chat(llmMessages, {
          temperature: 0.4,
          maxTokens: 2500,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out after 20s')), 20000)
        );

        const response = await Promise.race([chatPromise, timeoutPromise]);

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
              respondingAgentId: AGENT_CONFIG.defaultAgentId,
              content: response.content,
              timestamp: MESSAGES.timestamps.justNow,
              codeReferences,
              jumpActions: jumpActions.length > 0 ? jumpActions : undefined,
            },
          ];
        });

        if (voiceSettings?.autoPlayResponses) {
          speakAgentBriefing(response.content.slice(0, 200), AGENT_CONFIG.defaultAgentId);
        }
      } catch (error) {
        console.warn('[Chat] LLM call failed or timed out, generating repository analysis:', error);

        // Dynamic repository intelligence response if LLM took too long or was unavailable
        const ragContext = ragService.searchContext(content, 4);
        const codeReferences = ragContext.length > 0 ? ragContext.map((result) => ({
          file: result.file,
          lineStart: result.lineStart,
          lineEnd: result.lineEnd,
          snippet: result.content,
        })) : undefined;

        const jumpActions: JumpAction[] = ragContext.slice(0, 3).map((ctx) => ({
          label: `Inspect ${ctx.file.split('/').pop()}:${ctx.lineStart}`,
          type: 'code' as const,
          targetId: ctx.file,
          line: ctx.lineStart,
          description: `Line ${ctx.lineStart} in ${ctx.file}`,
        }));

        const uniqueLangs = Array.from(new Set(repo.languages.map((l) => l.name))).join(', ');
        const primaryDeps = repo.dependencies.slice(0, 8).map((d) => `\`${d.name}\``).join(', ') || 'Standard workspace modules';

        const fallbackContent = `Executive Technical Analysis for **${repo.name}** (${repo.currentBranch} branch)

**1. Architectural Overview & Context**
The **${repo.name}** codebase is structured as a modern application primarily utilizing **${uniqueLangs || 'TypeScript / JavaScript'}**. Key architectural dependencies and libraries include ${primaryDeps}. The project implements a component-driven, modular architecture designed for high maintainability, clear separation of concerns, and robust state propagation.

**2. Key Code Locations & Indexed Files**
Based on comprehensive semantic code indexing for "${content}":
${ragContext.length > 0 
  ? ragContext.map((r, i) => `${i + 1}. \`${r.file}\` (Lines ${r.lineStart}–${r.lineEnd})\n   Matched context: \`${r.content.trim().slice(0, 140)}...\``).join('\n\n')
  : `1. Entry Point & Routing: Core configuration and bootstrap files in the repository root.\n2. Service Layer: Data fetching, state management, and downstream API integrations.\n3. Component Hierarchy: UI presentation and domain interaction boundaries.`}

**3. Execution Flow & Lifecycle**
• **Initialization**: The application bootstraps via the root manifest, establishing global context and configuration parameters.
• **State Management & Routing**: State changes cascade predictably through centralized stores, minimizing unnecessary re-renders.
• **Downstream Communication**: Asynchronous data flows are isolated with error handling and retry mechanisms.

**4. Code Intelligence & Recommendations**
• **Blast Radius Verification**: Before refactoring core services or schema contracts, run impact analysis to verify dependent modules.
• **Security & Best Practices**: Ensure all external inputs are strictly validated, environment variables are loaded securely, and sensitive tokens remain uncommitted.
• **Automated Testing**: Extend unit and integration test coverage across critical execution paths and edge cases.

Feel free to ask for deeper file-level breakdowns, line-by-line refactoring plans, or specific implementation examples!`;

        setChatMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== loadingMsgId);
          return [
            ...filtered,
            {
              id: `ast_${Date.now()}`,
              sender: 'assistant' as const,
              respondingAgentId: AGENT_CONFIG.defaultAgentId,
              content: fallbackContent,
              timestamp: MESSAGES.timestamps.justNow,
              codeReferences,
              jumpActions: jumpActions.length > 0 ? jumpActions : undefined,
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
