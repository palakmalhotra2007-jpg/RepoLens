import { ReviewFinding, DebateStageItem, OrchestrationSummary } from '../types/agents';
import { mockReviewFindings, mockOrchestrationSummary } from '../data/mockReviewAgents';

export async function runMultiAgentReviewSimulation(
  onProgress?: (step: string, percent: number) => void
): Promise<{ findings: ReviewFinding[]; summary: OrchestrationSummary }> {
  const steps = [
    { label: 'Initializing 5 Autonomous Review Agents...', percent: 15 },
    { label: 'Security Agent scanning auth boundaries & HMAC webhooks...', percent: 35 },
    { label: 'Performance & DB Agent analyzing N+1 queries & indexes...', percent: 55 },
    { label: 'Testing & Git Agents checking branch drift & replay risks...', percent: 75 },
    { label: 'Central Orchestrator conducting cross-verification debate...', percent: 90 },
    { label: 'Final Reviewer synthesizing consensus & diff fixes...', percent: 100 },
  ];

  for (const step of steps) {
    onProgress?.(step.label, step.percent);
    await new Promise((r) => setTimeout(r, 400));
  }

  return {
    findings: mockReviewFindings.map(f => ({ ...f, status: 'open' })),
    summary: mockOrchestrationSummary,
  };
}
