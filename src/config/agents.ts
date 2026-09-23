import { AgentProfile } from '../types/agents';
import { AGENT_CONFIG } from './constants';

/**
 * Agent Configuration - NOT mock data
 * These are the actual agent definitions used throughout the application
 */

// All 6 agents (5 specialized + 1 orchestrator)
const allAgents: AgentProfile[] = [
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
    shortName: 'Git Intel',
    role: 'Branch Conflict, Schema Drift & Intent Reviewer',
    avatar: '🌿',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: '#10b981',
    description: 'Detects 3-way merge conflicts, semantic contract breaks, Prisma migration divergence, and unaligned branch intent.',
    focusAreas: [
      'Semantic & Textual Merge Collisions',
      'Prisma Schema Migration Drift',
      'Breaking API Contract Changes',
      'Dependency Version Conflicts',
      'Divergent Branch Intent'
    ],
    voicePersona: {
      pitch: 0.95,
      rate: 1.0,
      tone: 'Pragmatic, branch-aware release engineer',
      sampleIntro: "Git and Merge Intelligence Agent active. Scanning branch drift, merge conflicts, and semantic contract breaks.",
    }
  },
  {
    id: AGENT_CONFIG.defaultAgentId,
    name: AGENT_CONFIG.orchestrator.name,
    shortName: AGENT_CONFIG.orchestrator.shortName,
    role: 'Consensus Synthesis & Final Verdict Authority',
    avatar: AGENT_CONFIG.orchestrator.avatar,
    color: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.12)',
    badgeBorder: '#6366f1',
    description: 'Aggregates agent findings, resolves inter-agent disputes, and issues final production readiness verdict.',
    focusAreas: [
      'Cross-Agent Consensus Rules',
      'False Positive Elimination',
      'Production Readiness Score',
      'Severity Prioritization',
      'Review Sign-off Authority'
    ],
    voicePersona: {
      pitch: 1.0,
      rate: 1.0,
      tone: 'Authoritative consensus orchestrator',
      sampleIntro: "Central Review Orchestrator. Synthesizing multi-agent findings and issuing production readiness verdict.",
    }
  }
];

// Export only the first 5 agents (excluding orchestrator) for UI display
export const reviewAgents: AgentProfile[] = allAgents.slice(0, 5);

// Export all agents for internal use
export const allReviewAgents: AgentProfile[] = allAgents;

// Export orchestrator separately for direct access
export const orchestratorAgent: AgentProfile = allAgents[5];
