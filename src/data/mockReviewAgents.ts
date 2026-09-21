import { AgentProfile, ReviewFinding, OrchestrationSummary } from '../types/agents';

export const reviewAgents: AgentProfile[] = [
  {
    id: 'code_quality_arch',
    name: 'Code Quality & Architecture Agent',
    shortName: 'Architecture',
    role: 'System Modularity, SOLID, Dead Code & Hotspot Auditor',
    avatar: '🏛️',
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.12)',
    badgeBorder: '#8b5cf6',
    description: 'Audits architectural modularity, SOLID principles, cyclomatic complexity, coupling, dead code, code duplication, and hotspots.',
    focusAreas: [
      'Layered Architecture & Coupling',
      'Cyclomatic Complexity & Hotspots',
      'Dead Code & Unused Exports',
      'Code Duplication & DRY Violations',
      'SOLID & Design Patterns'
    ],
    voicePersona: {
      pitch: 1.0,
      rate: 1.0,
      tone: 'Structured, methodical software architect',
      sampleIntro: "I'm the Code Quality and Architecture Agent. I enforce clean modular boundaries and identify maintenance hotspots.",
    }
  },
  {
    id: 'security',
    name: 'Security Guardian Agent',
    shortName: 'Security',
    role: 'Vulnerabilities, Auth, Secrets, & Threat Modeler',
    avatar: '🛡️',
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.12)',
    badgeBorder: '#ef4444',
    description: 'Scans for hardcoded secrets, authentication bypasses, HMAC signature leaks, SQL injection, IDOR, XSS, and dangerous fallbacks.',
    focusAreas: [
      'JWT Hygiene & Hardcoded Credentials',
      'Stripe HMAC Webhook Signature Guards',
      'SQL & Parameter Injection Vectors',
      'Authorization Bypass & IDOR',
      'Cryptographic Weaknesses'
    ],
    voicePersona: {
      pitch: 0.9,
      rate: 1.05,
      tone: 'Firm, analytical security auditor',
      sampleIntro: "Security Guardian Agent online. Analyzing cryptographic boundaries, secrets, and auth vectors.",
    }
  },
  {
    id: 'performance_db',
    name: 'Performance & Database Agent',
    shortName: 'Performance',
    role: 'Query Optimizer, Index Coverage & Latency Analyst',
    avatar: '⚡',
    color: '#eab308',
    accentBg: 'rgba(234, 179, 8, 0.12)',
    badgeBorder: '#eab308',
    description: 'Pinpoints database N+1 queries, un-indexed table scans, connection pool bottlenecks, memory leaks, and Redis caching gaps.',
    focusAreas: [
      'Prisma N+1 Query Scenarios',
      'PostgreSQL Index Coverage',
      'Redis Cache Invalidation & TTLs',
      'P99 Latency Spikes & Bottlenecks',
      'Memory Leaks & Big-O Inefficiencies'
    ],
    voicePersona: {
      pitch: 1.1,
      rate: 1.15,
      tone: 'Fast-paced, metric-focused database tuner',
      sampleIntro: "Performance and Database Agent ready. Detecting query bottlenecks, table scans, and caching gaps.",
    }
  },
  {
    id: 'testing_reliability',
    name: 'Testing & Reliability Agent',
    shortName: 'Testing',
    role: 'Chaos, Resilience, & Edge-Case Validator',
    avatar: '🧪',
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    badgeBorder: '#06b6d4',
    description: 'Audits branch test coverage, unhandled async promise rejections, payment failure fallbacks, and webhook replay idempotency.',
    focusAreas: [
      'Missing Negative Edge Case Tests',
      'Async Error Handling & Fallbacks',
      'Webhook Replay Protection',
      'Mock Fidelity & Test Flakiness',
      'Regression Risk Boundaries'
    ],
    voicePersona: {
      pitch: 1.15,
      rate: 1.05,
      tone: 'Precise, cautious QA reliability engineer',
      sampleIntro: "Testing and Reliability Agent reporting. Auditing edge cases, failure fallbacks, and test coverage.",
    }
  },
  {
    id: 'git_merge',
    name: 'Git & Merge Intelligence Agent',
    shortName: 'Git & Merge',
    role: 'Branch Drift, Semantic Hazard, & Intent Detective',
    avatar: '🌿',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: '#10b981',
    description: 'Detects silent semantic divergence, Prisma schema migration collisions, breaking API payload contracts, and branch hazards.',
    focusAreas: [
      'Prisma Schema Migration Collisions',
      'Silent API Contract Divergence',
      'Concurrent Branch Collisions',
      'Commit Lineage & Blast Radii',
      '3-Way Merge Synthesis'
    ],
    voicePersona: {
      pitch: 0.95,
      rate: 1.0,
      tone: 'Pragmatic, release engineer',
      sampleIntro: "Git and Merge Intelligence Agent active. Monitoring branch intent, schema drift, and semantic conflicts.",
    }
  }
];

export const mockReviewFindings: ReviewFinding[] = [
  {
    id: 'issue_sec_01',
    title: 'Hardcoded Fallback Secret in JWT Verification Pipeline',
    severity: 'critical',
    primaryAgent: 'security',
    agentsInvolved: ['security', 'code_quality_arch', 'testing_reliability', 'orchestrator'],
    confidence: 98,
    file: 'server/middleware/authGuard.ts',
    lineRange: { start: 4, end: 5 },
    ruleId: 'SEC-JWT-004',
    cweOrStandard: 'CWE-798: Use of Hard-coded Credentials',
    evidence: "const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_secret_key_change_me';",
    affectedComponents: ['server/middleware/authGuard.ts', 'server/routes/auth.ts', 'server/routes/checkout.ts'],
    impactSummary: 'Allows attackers to forge arbitrary JWT administrator tokens if process.env.JWT_SECRET is unset or misconfigured in production environments.',
    suggestedResolution: 'Enforce strict runtime assertion that throws an immediate fatal error during server bootstrap if JWT_SECRET is undefined, removing the hardcoded fallback.',
    originalCodeSnippet: `const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_secret_key_change_me';`,
    fixedCodeSnippet: `const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('FATAL SECURITY CONFIGURATION: JWT_SECRET must be set in environment variables with at least 32 characters.');
}`,
    status: 'open',
    audioBriefingScript: 'Security Guardian Agent alert: I flagged a critical vulnerability in server/middleware/authGuard.ts. A hardcoded default JWT secret string is used as a fallback. An attacker knowing this string can forge arbitrary administrator tokens. The proposed fix asserts the secret is defined at startup.',
    agreementMatrix: [
      { agentId: 'security', agentName: 'Security Guardian Agent', vote: 'agree', reasonSummary: 'CWE-798 credential exposure allows total auth bypass in production.' },
      { agentId: 'code_quality_arch', agentName: 'Code Quality & Architecture Agent', vote: 'agree', reasonSummary: 'Violates centralized config architecture; env vars must be strictly typed and validated.' },
      { agentId: 'testing_reliability', agentName: 'Testing & Reliability Agent', vote: 'agree', reasonSummary: 'Unit tests currently pass because they secretly rely on this fallback string.' },
      { agentId: 'performance_db', agentName: 'Performance & Database Agent', vote: 'neutral', reasonSummary: 'Negligible performance impact; security fix is strictly required.' },
      { agentId: 'git_merge', agentName: 'Git & Merge Intelligence Agent', vote: 'agree', reasonSummary: 'Safe backward-compatible fix before merging into main.' },
    ],
    debateStages: [
      {
        stage: 'independent_analysis',
        stageNumber: 1,
        stageTitle: '1. Independent Static Analysis',
        agentId: 'security',
        agentName: 'Security Guardian Agent',
        timestamp: '14:22:01',
        stance: 'flagged',
        argumentText: 'CRITICAL ALERT: Detected hardcoded default JWT secret fallback string in authGuard.ts. An attacker knowing this string can sign valid tokens granting full CUSTOMER or ADMIN privileges.',
        audioSpeechText: 'In stage one analysis, I detected a hardcoded default JWT secret fallback string in authGuard.ts. This allows privilege escalation.',
        evidenceCode: "const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_secret_key_change_me';",
        evidenceTokens: ['process.env.JWT_SECRET', 'dev_insecure_fallback_secret_key_change_me'],
      },
      {
        stage: 'cross_agent_challenge',
        stageNumber: 2,
        stageTitle: '2. Cross-Agent Challenge & Scope Check',
        agentId: 'testing_reliability',
        agentName: 'Testing & Reliability Agent',
        timestamp: '14:22:04',
        stance: 'disagree_challenge',
        argumentText: 'Challenge: Removing the fallback string will immediately break `tests/auth.test.ts` if test runners do not inject `process.env.JWT_SECRET` prior to module evaluation.',
        audioSpeechText: 'Testing agent challenge: Removing the fallback without updating test environment setups will break integration tests.',
        confidenceDelta: -5,
      },
      {
        stage: 'debate_rebuttal',
        stageNumber: 3,
        stageTitle: '3. Rebuttal & Architecture Defense',
        agentId: 'code_quality_arch',
        agentName: 'Code Quality & Architecture Agent',
        timestamp: '14:22:08',
        stance: 'agree',
        argumentText: 'Rebuttal to Testing Agent: Tests relying on insecure production fallbacks represent mock fidelity debt. We should inject a typed test secret in `vitest.setup.ts` while enforcing strict fatal crashes in application code.',
        audioSpeechText: 'Architecture agent rebuttal: We must inject test secrets in test setup files rather than compromising production safety.',
        confidenceDelta: +7,
      },
      {
        stage: 'evidence_verification',
        stageNumber: 4,
        stageTitle: '4. Evidence Verification & AST Trace',
        agentId: 'git_merge',
        agentName: 'Git & Merge Intelligence Agent',
        timestamp: '14:22:11',
        stance: 'verified',
        argumentText: 'Verified AST across 3 branches: `server/routes/auth.ts` and `server/routes/checkout.ts` import the same authGuard. The fix is 100% self-contained.',
        audioSpeechText: 'Git intelligence verified: AST call-sites in auth and checkout are fully compatible with this patch.',
        confidenceDelta: +4,
      },
      {
        stage: 'consensus_ruling',
        stageNumber: 5,
        stageTitle: '5. Final Orchestrator Consensus Ruling',
        agentId: 'orchestrator',
        agentName: 'Central Review Orchestrator',
        timestamp: '14:22:14',
        stance: 'ruling',
        argumentText: 'Consensus Reached: Unanimous agreement across all 5 agents. Severity rated CRITICAL with 98% confidence. Patch diff verified and ready for 1-click application.',
        audioSpeechText: 'Consensus ruling: High urgency blocker confirmed with 98 percent confidence. Automated patch is generated and verified.',
      }
    ]
  },
  {
    id: 'issue_perf_02',
    title: 'Missing Database Index on stripePaymentIntentId & Catalog N+1 Query',
    severity: 'high',
    primaryAgent: 'performance_db',
    agentsInvolved: ['performance_db', 'git_merge', 'testing_reliability', 'orchestrator'],
    confidence: 94,
    file: 'server/routes/products.ts',
    lineRange: { start: 22, end: 28 },
    ruleId: 'PERF-DB-018',
    cweOrStandard: 'Database Query Optimization & Table Scans',
    evidence: `const items = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
  include: { category: true }
});`,
    affectedComponents: ['server/routes/products.ts', 'prisma/schema.prisma', 'server/services/redisCache.ts'],
    impactSummary: 'Unindexed sorting on createdAt combined with unbounded category joins causes sequential table scans as catalog scales past 50,000 SKUs (P99 latency > 850ms).',
    suggestedResolution: 'Add composite index [createdAt(sort: Desc), categoryId] in prisma/schema.prisma and implement selective projection.',
    originalCodeSnippet: `const items = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
  include: {
    category: true,
  }
});`,
    fixedCodeSnippet: `const items = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    title: true,
    price: true,
    inventoryCount: true,
    sku: true,
    createdAt: true,
    category: { select: { id: true, name: true } }
  }
});`,
    status: 'open',
    audioBriefingScript: 'Performance and Database Agent alert: In server/routes/products.ts, product querying lacks composite indexing and performs unbounded relation fetching. This will cause severe latency spikes under high storefront traffic.',
    agreementMatrix: [
      { agentId: 'performance_db', agentName: 'Performance & Database Agent', vote: 'agree', reasonSummary: 'Eliminates unindexed table scans and limits returned payload size.' },
      { agentId: 'git_merge', agentName: 'Git & Merge Intelligence Agent', vote: 'agree', reasonSummary: 'Checked migration history; adding index is fully backwards compatible.' },
      { agentId: 'code_quality_arch', agentName: 'Code Quality & Architecture Agent', vote: 'agree', reasonSummary: 'Explicit selection prevents leaky ORM abstractions.' },
      { agentId: 'security', agentName: 'Security Guardian Agent', vote: 'agree', reasonSummary: 'Mitigates Denial-of-Service via resource exhaustion on un-paginated queries.' },
      { agentId: 'testing_reliability', agentName: 'Testing & Reliability Agent', vote: 'agree', reasonSummary: 'Vitest catalog tests remain compatible with the projected payload.' },
    ],
    debateStages: [
      {
        stage: 'independent_analysis',
        stageNumber: 1,
        stageTitle: '1. Independent Query Profiling',
        agentId: 'performance_db',
        agentName: 'Performance & Database Agent',
        timestamp: '14:22:18',
        stance: 'flagged',
        argumentText: 'Detected missing composite index on product catalog query with unbounded join on category relation.',
        audioSpeechText: 'Performance agent analysis: Catalog query performs full table scan on createdAt order.',
      },
      {
        stage: 'cross_agent_challenge',
        stageNumber: 2,
        stageTitle: '2. Cache Redundancy Challenge',
        agentId: 'testing_reliability',
        agentName: 'Testing & Reliability Agent',
        timestamp: '14:22:21',
        stance: 'disagree_challenge',
        argumentText: 'Challenge: The route already has Redis caching configured for 300s TTL. Is database optimization urgent if 95% of hits hit cache?',
        audioSpeechText: 'Testing agent challenge: Redis caching mitigates database load for hot pages.',
        confidenceDelta: -3,
      },
      {
        stage: 'debate_rebuttal',
        stageNumber: 3,
        stageTitle: '3. Cache Stampede & Cold Cache Rebuttal',
        agentId: 'performance_db',
        agentName: 'Performance & Database Agent',
        timestamp: '14:22:24',
        stance: 'agree',
        argumentText: 'Rebuttal: On cache expiry or invalidation after inventory updates, concurrent requests trigger a cache stampede. Unindexed queries cause connection pool exhaustion.',
        audioSpeechText: 'Performance agent rebuttal: Cache stampedes on cold cache events crash the database pool without index coverage.',
        confidenceDelta: +6,
      },
      {
        stage: 'evidence_verification',
        stageNumber: 4,
        stageTitle: '4. Schema & Migration Verification',
        agentId: 'git_merge',
        agentName: 'Git & Merge Intelligence Agent',
        timestamp: '14:22:27',
        stance: 'verified',
        argumentText: 'Verified Prisma schema: Target branch `main` has no conflicting migration locks. Adding this composite index is clean.',
        audioSpeechText: 'Git merge agent verified: Migration is non-blocking and safe.',
      },
      {
        stage: 'consensus_ruling',
        stageNumber: 5,
        stageTitle: '5. Orchestrator Ruling',
        agentId: 'orchestrator',
        agentName: 'Central Review Orchestrator',
        timestamp: '14:22:30',
        stance: 'ruling',
        argumentText: 'Consensus Reached: High severity accepted with 94% confidence. Query projection optimization approved.',
        audioSpeechText: 'Orchestrator consensus: Approved high severity performance fix with 94 percent confidence.',
      }
    ]
  },
  {
    id: 'issue_sec_03',
    title: 'Raw Request Body Requirement for Stripe HMAC Webhook Validation',
    severity: 'critical',
    primaryAgent: 'security',
    agentsInvolved: ['security', 'testing_reliability', 'orchestrator'],
    confidence: 96,
    file: 'server/routes/webhooks.ts',
    lineRange: { start: 10, end: 17 },
    ruleId: 'SEC-STRIPE-002',
    cweOrStandard: 'CWE-353: Missing Support for Integrity Check',
    evidence: `event = stripeService.constructEvent(req.body, signature, webhookSecret);`,
    affectedComponents: ['server/index.ts', 'server/routes/webhooks.ts', 'server/services/stripeService.ts'],
    impactSummary: 'Missing guard on empty signature header causes unhandled exception before HMAC validation, leading to silent failure on malformed payloads.',
    suggestedResolution: 'Assert signature header exists prior to cryptographic verification and return 400 Bad Request immediately.',
    originalCodeSnippet: `let event;
try {
  event = stripeService.constructEvent(req.body, signature, webhookSecret);
} catch (err: any) {`,
    fixedCodeSnippet: `if (!signature) {
  return res.status(400).json({ error: 'Missing stripe-signature header' });
}

let event;
try {
  event = stripeService.constructEvent(req.body, signature, webhookSecret);
} catch (err: any) {`,
    status: 'open',
    audioBriefingScript: 'Security Guardian Agent alert: In server/routes/webhooks.ts, the webhook listener must check for the presence of the stripe signature header before invoking the cryptographic validation function.',
    agreementMatrix: [
      { agentId: 'security', agentName: 'Security Guardian Agent', vote: 'agree', reasonSummary: 'Prevents unhandled runtime TypeError when signature header is missing.' },
      { agentId: 'testing_reliability', agentName: 'Testing & Reliability Agent', vote: 'agree', reasonSummary: 'Allows adding clean test assertions for malformed HTTP requests.' },
      { agentId: 'code_quality_arch', agentName: 'Code Quality & Architecture Agent', vote: 'agree', reasonSummary: 'Adheres to defensive programming principles at network boundary.' },
      { agentId: 'git_merge', agentName: 'Git & Merge Intelligence Agent', vote: 'agree', reasonSummary: 'Zero breaking changes for existing webhook clients.' },
      { agentId: 'performance_db', agentName: 'Performance & Database Agent', vote: 'agree', reasonSummary: 'Avoids wasteful exception stack trace creation.' },
    ],
    debateStages: [
      {
        stage: 'independent_analysis',
        stageNumber: 1,
        stageTitle: '1. Webhook Signature Guard Inspection',
        agentId: 'security',
        agentName: 'Security Guardian Agent',
        timestamp: '14:22:33',
        stance: 'flagged',
        argumentText: 'Missing header presence check before invoking constructEvent cryptographic function.',
        audioSpeechText: 'Security agent analysis: Missing guard on stripe signature header.',
      },
      {
        stage: 'cross_agent_challenge',
        stageNumber: 2,
        stageTitle: '2. Try/Catch Fallback Check',
        agentId: 'testing_reliability',
        agentName: 'Testing & Reliability Agent',
        timestamp: '14:22:36',
        stance: 'agree',
        argumentText: 'Agreed with Security Agent. constructEvent throws an obscure error if signature is undefined.',
        audioSpeechText: 'Testing agent agrees: constructEvent fails obscurely without explicit check.',
        confidenceDelta: +4,
      },
      {
        stage: 'consensus_ruling',
        stageNumber: 5,
        stageTitle: '5. Consensus Ruling',
        agentId: 'orchestrator',
        agentName: 'Central Review Orchestrator',
        timestamp: '14:22:40',
        stance: 'ruling',
        argumentText: 'Consensus Reached: High urgency blocker confirmed with 96% confidence.',
        audioSpeechText: 'Orchestrator consensus: Verified critical webhook integrity guard.',
      }
    ]
  },
  {
    id: 'issue_test_04',
    title: 'Missing Idempotency Key Handling in Failed Payment Retry Branch',
    severity: 'medium',
    primaryAgent: 'testing_reliability',
    agentsInvolved: ['testing_reliability', 'performance_db', 'code_quality_arch'],
    confidence: 91,
    file: 'src/hooks/usePayment.ts',
    lineRange: { start: 30, end: 42 },
    ruleId: 'REL-RETRY-009',
    cweOrStandard: 'Payment Resiliency & Double-Charge Prevention',
    evidence: `const res = await apiClient.post('/api/checkout/confirm', { paymentIntentId: clientSecret, billingDetails });`,
    affectedComponents: ['src/hooks/usePayment.ts', 'src/pages/Checkout.tsx', 'server/routes/checkout.ts'],
    impactSummary: 'Rapid user clicks on slow connections could attempt duplicate order finalization if network drops prior to response.',
    suggestedResolution: 'Include a client-generated UUID idempotency key in the confirmation payload and disable the submit button until state settles.',
    originalCodeSnippet: `const res = await apiClient.post('/api/checkout/confirm', {
  paymentIntentId: clientSecret,
  billingDetails,
});`,
    fixedCodeSnippet: `const res = await apiClient.post('/api/checkout/confirm', {
  paymentIntentId: clientSecret,
  billingDetails,
  idempotencyKey: \`confirm_\${clientSecret}_\${Date.now()}\`,
});`,
    status: 'open',
    audioBriefingScript: 'Testing and Reliability Agent alert: In usePayment.ts, double-clicking during slow network connections can dispatch duplicate confirmation requests. We should pass a client idempotency key.',
    agreementMatrix: [
      { agentId: 'testing_reliability', agentName: 'Testing & Reliability Agent', vote: 'agree', reasonSummary: 'Guarantees reliable recovery from client-side network dropouts.' },
      { agentId: 'performance_db', agentName: 'Performance & Database Agent', vote: 'agree', reasonSummary: 'Prevents redundant insert queries into orders table.' },
      { agentId: 'code_quality_arch', agentName: 'Code Quality & Architecture Agent', vote: 'agree', reasonSummary: 'Standard practice for distributed financial transactions.' },
      { agentId: 'security', agentName: 'Security Guardian Agent', vote: 'agree', reasonSummary: 'Prevents race-condition exploitation.' },
      { agentId: 'git_merge', agentName: 'Git & Merge Intelligence Agent', vote: 'agree', reasonSummary: 'Aligns with the fix/checkout-idempotency branch intent.' },
    ],
    debateStages: [
      {
        stage: 'independent_analysis',
        stageNumber: 1,
        stageTitle: '1. Network Retry Resilience Analysis',
        agentId: 'testing_reliability',
        agentName: 'Testing & Reliability Agent',
        timestamp: '14:22:42',
        stance: 'flagged',
        argumentText: 'usePayment confirm hook does not generate unique client-side idempotency keys for retried requests.',
        audioSpeechText: 'Testing agent analysis: Missing client-side idempotency key on confirmation retry.',
      },
      {
        stage: 'consensus_ruling',
        stageNumber: 5,
        stageTitle: '5. Consensus Ruling',
        agentId: 'orchestrator',
        agentName: 'Central Review Orchestrator',
        timestamp: '14:22:46',
        stance: 'ruling',
        argumentText: 'Consensus Reached: Medium severity accepted with 91% confidence.',
        audioSpeechText: 'Orchestrator consensus: Approved idempotency key fix with 91 percent confidence.',
      }
    ]
  },
  {
    id: 'issue_arch_05',
    title: 'Tight Coupling: Frontend Directly Dispatches Raw Address to Intent API',
    severity: 'low',
    primaryAgent: 'code_quality_arch',
    agentsInvolved: ['code_quality_arch'],
    confidence: 87,
    file: 'src/pages/Checkout.tsx',
    lineRange: { start: 50, end: 60 },
    ruleId: 'ARCH-COUPLING-012',
    cweOrStandard: 'Clean Architecture Domain Isolation',
    evidence: `const result = await confirmPayment({ clientSecret, billingDetails: { name: shippingAddress.fullName, address: shippingAddress } });`,
    affectedComponents: ['src/pages/Checkout.tsx', 'src/hooks/usePayment.ts'],
    impactSummary: 'Domain models for shipping address should be normalized through an adapter rather than passed directly as unstructured generic records.',
    suggestedResolution: 'Refactor to utilize a typed StripeAddressAdapter to sanitize postal codes and country ISO-3166-1 alpha-2 format.',
    originalCodeSnippet: `const result = await confirmPayment({
  clientSecret,
  billingDetails: {
    name: shippingAddress.fullName,
    address: shippingAddress,
  },
});`,
    fixedCodeSnippet: `const result = await confirmPayment({
  clientSecret,
  billingDetails: {
    name: shippingAddress.fullName,
    address: {
      line1: shippingAddress.street,
      city: shippingAddress.city,
      postal_code: shippingAddress.postalCode,
      country: shippingAddress.country.toUpperCase(),
    },
  },
});`,
    status: 'open',
    audioBriefingScript: 'Code Quality and Architecture Agent alert: In Checkout.tsx, raw address state is passed without adapter normalization. Using a typed address adapter ensures clean domain boundaries.',
    agreementMatrix: [
      { agentId: 'code_quality_arch', agentName: 'Code Quality & Architecture Agent', vote: 'agree', reasonSummary: 'Improves maintainability and decoupling from external SDK formats.' },
      { agentId: 'security', agentName: 'Security Guardian Agent', vote: 'agree', reasonSummary: 'Sanitizes input parameters.' },
      { agentId: 'testing_reliability', agentName: 'Testing & Reliability Agent', vote: 'agree', reasonSummary: 'Simplifies mock unit testing.' },
      { agentId: 'performance_db', agentName: 'Performance & Database Agent', vote: 'neutral', reasonSummary: 'No noticeable latency impact.' },
      { agentId: 'git_merge', agentName: 'Git & Merge Intelligence Agent', vote: 'agree', reasonSummary: 'Safe non-breaking change.' },
    ],
    debateStages: [
      {
        stage: 'independent_analysis',
        stageNumber: 1,
        stageTitle: '1. Coupling Analysis',
        agentId: 'code_quality_arch',
        agentName: 'Code Quality & Architecture Agent',
        timestamp: '14:22:48',
        stance: 'flagged',
        argumentText: 'Unsanitized direct domain pass-through creates coupling between React form state and Stripe SDK format.',
        audioSpeechText: 'Architecture agent analysis: Form state is tightly coupled to Stripe SDK parameter format.',
      },
      {
        stage: 'consensus_ruling',
        stageNumber: 5,
        stageTitle: '5. Consensus Ruling',
        agentId: 'orchestrator',
        agentName: 'Central Review Orchestrator',
        timestamp: '14:22:52',
        stance: 'ruling',
        argumentText: 'Consensus Reached: Low severity architecture improvement approved.',
        audioSpeechText: 'Orchestrator consensus: Low severity architecture normalization approved.',
      }
    ]
  }
];

export const mockOrchestrationSummary: OrchestrationSummary = {
  totalIssuesFound: 5,
  criticalCount: 2,
  highCount: 1,
  mediumCount: 1,
  lowCount: 1,
  infoCount: 0,
  crossAgentVerifications: 8,
  challengesResolved: 3,
  overallHealthScore: 84,
  readinessVerdict: 'needs_critical_fixes',
  finalReviewerNotes: 'Review Orchestration Complete: 5 findings synthesized across 5 specialized agents. Two critical blockers identified (JWT fallback secret & webhook signature validation guard). Applying the suggested automated diffs will elevate repository health score to 96/100 and allow safe merge into main.',
  orchestratorAudioSummary: 'Review Orchestration completed across 5 specialized agents. We identified two critical security blockers and one high-priority performance bottleneck. Applying the automated diff patches will make the repository ready to merge into main.'
};
