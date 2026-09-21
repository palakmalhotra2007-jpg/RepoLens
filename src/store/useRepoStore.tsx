import React, { createContext, useContext, useState, useEffect } from 'react';
import { RepositoryData, FileNode, HotspotItem, DeadCodeItem, DuplicateCodeItem } from '../types/repository';
import { ReviewFinding, OrchestrationSummary, AgentId, SeverityLevel, DebateStageItem } from '../types/agents';
import { MergeConflictBlock, SemanticConflictAlert, BranchComparison } from '../types/merge';
import { ChatMessage, JumpAction } from '../types/chat';
import { FeatureChangePlan } from '../types/impact';
import { VoiceSettings, VoicePlaybackState } from '../types/voice';
import { mockShopFlowRepository } from '../data/mockShopFlowRepo';
import { mockReviewFindings, mockOrchestrationSummary, reviewAgents } from '../data/mockReviewAgents';
import { mockBranchComparison } from '../data/mockMergeConflicts';
import { sampleChangePlans } from '../data/mockImpactGraph';
import { findFileByPath } from '../services/repoParser';
import { voiceEngine, defaultAgentVoiceProfiles } from '../services/voiceService';
import confetti from 'canvas-confetti';

export type AppView = 
  | 'overview' 
  | 'explore' 
  | 'review' 
  | 'debate' 
  | 'merge' 
  | 'impact' 
  | 'history' 
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
  isVoiceSettingsModalOpen: boolean;
  setIsVoiceSettingsModalOpen: (open: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  rightPanelTab: 'chat' | 'debate' | 'symbols';
  setRightPanelTab: (tab: 'chat' | 'debate' | 'symbols') => void;

  // Voice Engine State
  voiceSettings: VoiceSettings;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
  voicePlayback: VoicePlaybackState;
  speakAgentBriefing: (text: string, agentId: AgentId) => void;
  playMultiAgentDebate: (finding: ReviewFinding) => void;
  stopAudioPlayback: () => void;
  isRecordingVoice: boolean;
  startVoiceInput: (targetAgentId?: AgentId) => void;
  stopVoiceInput: () => void;

  // Multi-Agent Review
  reviewFindings: ReviewFinding[];
  orchestrationSummary: OrchestrationSummary;
  selectedFinding: ReviewFinding | null;
  setSelectedFinding: (finding: ReviewFinding | null) => void;
  agentFilter: AgentId | 'all';
  setAgentFilter: (filter: AgentId | 'all') => void;
  severityFilter: SeverityLevel | 'all';
  setSeverityFilter: (filter: SeverityLevel | 'all') => void;
  isReviewRunning: boolean;
  reviewProgress: { label: string; percent: number };
  runReview: () => Promise<void>;
  applyFix: (findingId: string) => void;
  dismissFinding: (findingId: string) => void;

  // Agent Debate View
  activeDebateFinding: ReviewFinding | null;
  setActiveDebateFinding: (finding: ReviewFinding | null) => void;
  activeDebateStageIndex: number;
  setActiveDebateStageIndex: (index: number) => void;

  // Merge Conflicts
  branchComparison: BranchComparison;
  selectedConflict: MergeConflictBlock | null;
  setSelectedConflict: (c: MergeConflictBlock | null) => void;
  selectedSemanticAlert: SemanticConflictAlert | null;
  setSelectedSemanticAlert: (a: SemanticConflictAlert | null) => void;
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
  const [repo, setRepo] = useState<RepositoryData>(mockShopFlowRepository);
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [activeFile, setActiveFile] = useState<FileNode | null>(() => {
    return findFileByPath(mockShopFlowRepository.rootFiles, 'src/pages/Checkout.tsx') || null;
  });
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVoiceSettingsModalOpen, setIsVoiceSettingsModalOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'debate' | 'symbols'>('chat');

  // Voice Engine State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    autoPlayResponses: false,
    provider: 'webspeech',
    globalVolume: 1.0,
    agentProfiles: defaultAgentVoiceProfiles,
  });
  const [voicePlayback, setVoicePlayback] = useState<VoicePlaybackState>({
    isPlaying: false,
    speakingAgentId: null,
    currentText: null,
    progressPercent: 0,
  });
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Multi-Agent Review State
  const [reviewFindings, setReviewFindings] = useState<ReviewFinding[]>(mockReviewFindings);
  const [orchestrationSummary, setOrchestrationSummary] = useState<OrchestrationSummary>(mockOrchestrationSummary);
  const [selectedFinding, setSelectedFinding] = useState<ReviewFinding | null>(mockReviewFindings[0]);
  const [activeDebateFinding, setActiveDebateFinding] = useState<ReviewFinding | null>(mockReviewFindings[0]);
  const [activeDebateStageIndex, setActiveDebateStageIndex] = useState(0);
  const [agentFilter, setAgentFilter] = useState<AgentId | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [isReviewRunning, setIsReviewRunning] = useState(false);
  const [reviewProgress, setReviewProgress] = useState({ label: '', percent: 0 });

  // Merge Conflict State
  const [branchComparison, setBranchComparison] = useState<BranchComparison>(mockBranchComparison);
  const [selectedConflict, setSelectedConflict] = useState<MergeConflictBlock | null>(mockBranchComparison.conflicts[0]);
  const [selectedSemanticAlert, setSelectedSemanticAlert] = useState<SemanticConflictAlert | null>(mockBranchComparison.semanticAlerts[0]);

  // Impact Analysis State
  const [selectedImpactNodeId, setSelectedImpactNodeId] = useState<string | null>('api_create_intent');
  const [activeChangePlan, setActiveChangePlan] = useState<FeatureChangePlan | null>(sampleChangePlans[0]);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      respondingAgentId: 'orchestrator',
      content: `**RepoLens Engineering Intelligence ready for ${repo.name}.**

I understand the full codebase architecture across **React, Node.js/Express, PostgreSQL/Prisma, and Stripe**.

Ask any technical question or query one of the **5 specialized review agents**:`,
      timestamp: 'Just now',
      jumpActions: [
        { label: 'Where is authentication?', type: 'code', targetId: 'server/middleware/authGuard.ts', line: 4, description: 'JWT pipeline in authGuard.ts' },
        { label: 'Inspect 5-Agent Review', type: 'finding', targetId: 'issue_sec_01', description: 'Review critical security blockers' },
        { label: 'View Checkout Dependency Graph', type: 'impact_node', targetId: 'api_create_intent', description: 'Topology for /api/checkout/create-intent' },
        { label: 'Inspect 3-Way Merge Conflicts', type: 'merge_conflict', targetId: 'conflict_checkout_01', description: 'Idempotency parameter conflict' },
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
        setIsVoiceSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectFileByPath = (path: string, line?: number) => {
    const file = findFileByPath(repo.rootFiles, path);
    if (file) {
      setActiveFile(file);
      if (line) setActiveLine(line);
      setActiveView('explore');
    }
  };

  const switchRepo = (newRepo: RepositoryData) => {
    setRepo(newRepo);
    const firstFile = findFileByPath(newRepo.rootFiles, 'src/pages/Checkout.tsx') ||
                     findFileByPath(newRepo.rootFiles, 'README.md') ||
                     newRepo.rootFiles[0];
    setActiveFile(firstFile || null);
    setActiveView('overview');
    setIsConnectModalOpen(false);
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

  const runReview = async () => {
    setIsReviewRunning(true);
    setActiveView('review');
    const steps = [
      { label: 'Spawning 5 Autonomous Agents...', percent: 20 },
      { label: '🛡️ Security Guardian scanning auth & webhooks...', percent: 40 },
      { label: '⚡ Performance & DB Agent checking indexes & N+1...', percent: 60 },
      { label: '🧪 Testing & 🌿 Git Agents analyzing branch drift...', percent: 80 },
      { label: '👑 Central Orchestrator conducting debate & consensus...', percent: 100 },
    ];

    for (const step of steps) {
      setReviewProgress(step);
      await new Promise((r) => setTimeout(r, 400));
    }

    setReviewFindings(mockReviewFindings.map(f => ({ ...f, status: 'open' })));
    setIsReviewRunning(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });

    // Optional audio summary
    if (voiceSettings.autoPlayResponses) {
      speakAgentBriefing(mockOrchestrationSummary.orchestratorAudioSummary, 'orchestrator');
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
    const lower = prompt.toLowerCase();
    if (lower.includes('admin') || lower.includes('rbac') || lower.includes('role')) {
      setActiveChangePlan(sampleChangePlans[1]);
    } else {
      setActiveChangePlan(sampleChangePlans[0]);
    }
  };

  const handleJumpAction = (action: JumpAction) => {
    switch (action.type) {
      case 'code':
        selectFileByPath(action.targetId, action.line);
        break;
      case 'finding': {
        const f = reviewFindings.find(item => item.id === action.targetId) || reviewFindings[0];
        if (f) {
          setSelectedFinding(f);
          setActiveView('review');
        }
        break;
      }
      case 'debate': {
        const f = reviewFindings.find(item => item.id === action.targetId) || reviewFindings[0];
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
        const c = branchComparison.conflicts.find(item => item.id === action.targetId) || branchComparison.conflicts[0];
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
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyContent = '';
      let respondingAgent: AgentId = targetAgentId || 'orchestrator';
      let codeReferences: { file: string; lineStart: number; lineEnd: number; snippet: string }[] | undefined = undefined;
      let jumpActions: JumpAction[] = [];
      const lower = content.toLowerCase();

      if (
        lower.includes('everything') ||
        lower.includes('explain') ||
        lower.includes('overview') ||
        lower.includes('what is') ||
        lower.includes('architecture') ||
        lower.includes('summary') ||
        lower.includes('stack') ||
        lower.includes('about')
      ) {
        respondingAgent = 'orchestrator';
        replyContent = `**[Review Orchestrator]**: Complete Repository Intelligence Overview for **${repo.name}**

### 📦 Application Architecture & Tech Stack
ShopFlow is a production-grade full-stack e-commerce engine structured as follows:
- **Frontend Layer**: React 18 with TypeScript, Tailwind CSS, and Stripe Elements integration (\`src/pages/Checkout.tsx\`).
- **API & Backend Layer**: Node.js + Express REST API with JWT bearer authentication & rate limiting (\`server/index.ts\`, \`server/routes/\`).
- **Data & Caching Layer**: PostgreSQL with Prisma ORM (\`prisma/schema.prisma\`) and Redis caching for product catalogs (\`server/services/redisCache.ts\`).
- **Payment Pipeline**: Stripe SDK with server-side price recalculation, atomic inventory locking, and webhook signature verification (\`server/services/stripeService.ts\`, \`server/routes/webhooks.ts\`).

---

### 🔍 Current Multi-Agent Audit Summary (5 Findings Active)
1. 🛡️ **Critical Security**: Hardcoded JWT default fallback secret in \`authGuard.ts:6\`.
2. ⚡ **Performance Hazard**: N+1 database queries when fetching user order history in \`checkout.ts:34\`.
3. 🧪 **Reliability Risk**: Missing webhook event signature verification in \`webhooks.ts:18\`.
4. 🏛️ **Code Quality**: Business logic coupled directly into Express route handlers.
5. 🌿 **Branch Hazard**: 2 textual merge conflicts & 2 semantic drift alerts against \`main\`.`;

        codeReferences = [
          { file: 'src/pages/Checkout.tsx', lineStart: 18, lineEnd: 65, snippet: 'export const CheckoutPage: React.FC' },
          { file: 'server/routes/checkout.ts', lineStart: 14, lineEnd: 52, snippet: 'checkoutRouter.post("/create-intent", ...)' },
          { file: 'server/middleware/authGuard.ts', lineStart: 4, lineEnd: 24, snippet: 'export function authGuard(req: Request, res: Response, next: NextFunction)' },
          { file: 'prisma/schema.prisma', lineStart: 1, lineEnd: 35, snippet: 'model Order { id String @id ... }' },
        ];

        jumpActions = [
          { label: 'Inspect 5-Agent Review', type: 'finding', targetId: 'issue_sec_01' },
          { label: 'Inspect 5-Stage Agent Debate', type: 'debate', targetId: 'issue_sec_01' },
          { label: 'Resolve 3-Way Merge Conflicts', type: 'merge_conflict', targetId: 'conflict_checkout_01' },
          { label: 'Explore Interactive Topology', type: 'impact_node', targetId: 'api_create_intent' },
          { label: 'Browse Code in Studio', type: 'code', targetId: 'src/pages/Checkout.tsx', line: 1 },
        ];
      } else if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt') || lower.includes('secret') || lower.includes('security')) {
        respondingAgent = 'security';
        replyContent = `**[Security Guardian Agent]**:
Authentication & Authorization Pipeline Analysis:

1. **Client Token Management**: \`src/context/AuthContext.tsx\` stores JWT tokens and manages session expiration.
2. **API Request Interceptor**: \`src/services/apiClient.ts\` attaches \`Authorization: Bearer <token>\` on all secure API calls.
3. **Route Guard Middleware**: \`server/middleware/authGuard.ts\` extracts and validates JWT signatures.

⚠️ **Critical Vulnerability Flagged**:
\`server/middleware/authGuard.ts\` uses a hardcoded fallback string (\`dev_insecure_fallback_secret_key_change_me\`) when \`process.env.JWT_SECRET\` is unset, enabling forged admin tokens.`;

        codeReferences = [
          { file: 'server/middleware/authGuard.ts', lineStart: 4, lineEnd: 24, snippet: 'export function authGuard(req: Request, res: Response, next: NextFunction)' },
          { file: 'src/context/AuthContext.tsx', lineStart: 16, lineEnd: 46, snippet: 'export const AuthProvider: React.FC' },
        ];
        jumpActions = [
          { label: 'Open authGuard.ts:4', type: 'code', targetId: 'server/middleware/authGuard.ts', line: 4 },
          { label: 'View Security Finding & Fix', type: 'finding', targetId: 'issue_sec_01' },
          { label: 'Inspect Security Debate', type: 'debate', targetId: 'issue_sec_01' },
        ];
      } else if (lower.includes('checkout') || lower.includes('stripe') || lower.includes('payment') || lower.includes('cart')) {
        respondingAgent = 'performance_db';
        replyContent = `**[Performance & Database Agent]**:
End-to-End Stripe Checkout Flow & DB Locking:

1. **Client Intent**: \`src/pages/Checkout.tsx\` initializes PaymentIntent via \`usePayment()\`.
2. **Server Price Recalculation**: \`server/routes/checkout.ts\` pulls unit prices directly from PostgreSQL to prevent client price tampering.
3. **Pessimistic Inventory Locking**: \`server/services/inventoryService.ts\` locks stock quantities inside an atomic transaction.
4. **Stripe Webhook Fulfillment**: \`server/routes/webhooks.ts\` updates order status to \`PAID\` with replay deduplication.`;

        codeReferences = [
          { file: 'src/pages/Checkout.tsx', lineStart: 18, lineEnd: 65, snippet: 'export const CheckoutPage: React.FC' },
          { file: 'server/routes/checkout.ts', lineStart: 14, lineEnd: 52, snippet: 'checkoutRouter.post("/create-intent", ...)' },
        ];
        jumpActions = [
          { label: 'Open CheckoutPage.tsx', type: 'code', targetId: 'src/pages/Checkout.tsx', line: 18 },
          { label: 'View Checkout Topology Graph', type: 'impact_node', targetId: 'api_create_intent' },
          { label: 'Inspect Checkout Merge Conflict', type: 'merge_conflict', targetId: 'conflict_checkout_01' },
        ];
      } else if (lower.includes('impact') || lower.includes('break') || lower.includes('schema') || lower.includes('database') || lower.includes('prisma')) {
        respondingAgent = 'git_merge';
        replyContent = `**[Git & Merge Intelligence Agent]**:
Prisma Schema & Database Impact Topology:

Modifying \`prisma/schema.prisma\` directly cascades to:
- 4 API Route handlers (\`checkout.ts\`, \`webhooks.ts\`, \`products.ts\`, \`auth.ts\`)
- 2 Vitest integration test suites (\`checkout.test.ts\`, \`stripeWebhook.test.ts\`)
- PostgreSQL migration sequence in \`prisma/migrations/\``;

        jumpActions = [
          { label: 'Open Dependency Graph', type: 'impact_node', targetId: 'db_orders' },
          { label: 'Open schema.prisma', type: 'code', targetId: 'prisma/schema.prisma', line: 1 },
        ];
      } else if (lower.includes('review') || lower.includes('audit') || lower.includes('findings') || lower.includes('agent')) {
        respondingAgent = 'code_quality_arch';
        replyContent = `**[Code Quality & Architecture Agent]**:
5-Agent Engineering Review status:
- 🛡️ Security Guardian: 1 Critical (JWT fallback secret)
- ⚡ Performance Agent: 1 High (N+1 query loop on orders)
- 🧪 Testing Agent: 1 Medium (Stripe webhook signature validation missing)
- 🌿 Git & Merge Agent: 1 High (3-way branch conflict in checkout)
- 🏛️ Code Quality Agent: 1 Medium (Dead code & duplicate pricing logic)`;

        jumpActions = [
          { label: 'Inspect 5-Agent Review Panel', type: 'finding', targetId: 'issue_sec_01' },
          { label: 'Play Multi-Agent Debate Audio', type: 'debate', targetId: 'issue_sec_01' },
        ];
      } else if (lower.includes('merge') || lower.includes('conflict') || lower.includes('branch') || lower.includes('drift')) {
        respondingAgent = 'git_merge';
        replyContent = `**[Git & Merge Intelligence Agent]**:
Branch \`feat/stripe-elements-v3\` has **2 textual conflicts** and **2 semantic contract breaks** against \`main\`.
- **Textual Conflict**: \`server/routes/checkout.ts:32\` (Idempotency parameter clash)
- **Semantic Drift**: \`server/services/stripeService.ts\` renamed \`createPaymentIntent\` parameters without updating callers.`;

        jumpActions = [
          { label: 'Open 3-Way Conflict Resolver', type: 'merge_conflict', targetId: 'conflict_checkout_01' },
          { label: 'Inspect Semantic Drift Alerts', type: 'merge_conflict', targetId: 'conflict_checkout_01' },
        ];
      } else {
        respondingAgent = 'orchestrator';
        replyContent = `**[Review Orchestrator]**: Repository intelligence results for **"${content}"**:

- **Matched Source Files**: \`server/routes/checkout.ts\`, \`src/pages/Checkout.tsx\`, and \`prisma/schema.prisma\`.
- **Active Codebase Health**: 5 multi-agent audit findings, 2 branch merge conflicts, and full 6-layer dependency topology mapped.`;

        jumpActions = [
          { label: 'Inspect 5-Agent Review', type: 'finding', targetId: 'issue_sec_01' },
          { label: 'Explore Code in Studio', type: 'code', targetId: 'src/pages/Checkout.tsx', line: 1 },
          { label: 'View Dependency Graph', type: 'impact_node', targetId: 'api_create_intent' },
        ];
      }

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        respondingAgentId: respondingAgent,
        content: replyContent,
        timestamp: 'Just now',
        codeReferences,
        jumpActions,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);

      // Auto speech if enabled
      if (voiceSettings.autoPlayResponses) {
        speakAgentBriefing(replyContent.slice(0, 200), respondingAgent);
      }
    }, 350);
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

    branchComparison,
    selectedConflict,
    setSelectedConflict,
    selectedSemanticAlert,
    setSelectedSemanticAlert,
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
