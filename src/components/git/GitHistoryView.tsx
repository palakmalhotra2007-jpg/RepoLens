import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Button, Badge, Card } from '../../frontend';
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  Clock,
  User,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

interface GitCommitItem {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  timeAgo: string;
  branch: string;
  insertions: number;
  deletions: number;
  filesChanged: number;
  agentAuditStatus: 'clean' | 'hazards_flagged';
}

export const GitHistoryView: React.FC = () => {
  const { setActiveView } = useRepoStore();
  const [selectedCommitHash, setSelectedCommitHash] = useState('c9a41b2');

  const commits: GitCommitItem[] = [
    {
      hash: 'c9a41b2e84d720b0857f12e8412093e18a09b341',
      shortHash: 'c9a41b2',
      message: 'feat(auth): add OAuth2 multi-tenant organization callback handler',
      author: 'Sarah Chen',
      timeAgo: '2 hours ago',
      branch: 'main',
      insertions: 142,
      deletions: 18,
      filesChanged: 4,
      agentAuditStatus: 'hazards_flagged',
    },
    {
      hash: '7b81f40d12e8412093e18a09b3419a41b2e84d72',
      shortHash: '7b81f40',
      message: 'refactor(db): optimize user organization permission query with composite index',
      author: 'Alex Rivera',
      timeAgo: '5 hours ago',
      branch: 'feature/perf-audit',
      insertions: 48,
      deletions: 89,
      filesChanged: 2,
      agentAuditStatus: 'clean',
    },
    {
      hash: '12e8412093e18a09b341c9a41b2e84d720b0857f',
      shortHash: '12e8412',
      message: 'fix(stripe): add webhook signature validation replay guard',
      author: 'Elena Rostova',
      timeAgo: '1 day ago',
      branch: 'hotfix/stripe-hmac',
      insertions: 34,
      deletions: 6,
      filesChanged: 1,
      agentAuditStatus: 'clean',
    },
    {
      hash: '9a41b2e84d720b0857f12e8412093e18a09b3410',
      shortHash: '9a41b2e',
      message: 'perf(cache): implement distributed redis token bucket rate limiter',
      author: 'Marcus Vance',
      timeAgo: '2 days ago',
      branch: 'main',
      insertions: 210,
      deletions: 45,
      filesChanged: 5,
      agentAuditStatus: 'hazards_flagged',
    },
    {
      hash: '84d720b0857f12e8412093e18a09b341c9a41b2e',
      shortHash: '84d720b',
      message: 'chore: upgrade dependencies and typescript 5.5 compiler targets',
      author: 'DevOps Bot',
      timeAgo: '3 days ago',
      branch: 'main',
      insertions: 12,
      deletions: 12,
      filesChanged: 2,
      agentAuditStatus: 'clean',
    },
  ];

  const currentCommit = commits.find((c) => c.shortHash === selectedCommitHash) || commits[0];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 text-text-primary w-full bg-bg-base select-none">
      {/* Top Banner */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="good">
                Git Lineage & PR Simulator
              </Badge>
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary tracking-tight">
              Commit Graph & Branch Drift Intelligence
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Track author activity, commit blast radii, and pull request safety scores.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setActiveView('merge')}
            className="w-max gap-2"
          >
            <GitPullRequest strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
            <span>Simulate Pull Request Merge</span>
          </Button>
        </div>
      </Card>

      {/* Main Grid: Commits List & Commit Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Commits List Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
            Recent Commits ({commits.length})
          </div>

          <div className="space-y-2">
            {commits.map((c) => {
              const isSelected = c.shortHash === currentCommit.shortHash;
              return (
                <div
                  key={c.hash}
                  onClick={() => setSelectedCommitHash(c.shortHash)}
                  className={`p-4 rounded-[6px] border cursor-pointer transition-colors space-y-2 group ${
                    isSelected
                      ? 'bg-bg-surface-2 border-accent'
                      : 'bg-bg-surface border-border-default hover:bg-bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-primary font-medium bg-bg-surface-2 px-2 py-0.5 rounded-[4px] border border-border-default">
                        {c.shortHash}
                      </span>
                      <span className="text-[11px] font-mono text-text-secondary flex items-center gap-1">
                        <GitBranch strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" /> {c.branch}
                      </span>
                    </div>

                    <span className="text-[11px] text-text-tertiary font-mono flex items-center gap-1">
                      <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" /> {c.timeAgo}
                    </span>
                  </div>

                  <p className="text-[13px] font-medium text-text-primary">
                    {c.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border-default text-[11px] font-mono text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <User strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary" /> {c.author}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-status-good">+{c.insertions}</span>
                      <span className="text-status-critical">-{c.deletions}</span>
                      <span className="text-text-tertiary">({c.filesChanged} files)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commit Inspector Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <span className="text-xs font-semibold text-text-primary font-mono flex items-center gap-1.5">
                <GitCommit strokeWidth={1.5} className="w-4 h-4 text-text-secondary" /> Commit Inspector
              </span>
              <span className="text-[11px] font-mono text-text-primary font-medium">
                {currentCommit.shortHash}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">Commit Message</span>
              <h4 className="text-[14px] font-medium text-text-primary leading-snug">
                {currentCommit.message}
              </h4>
            </div>

            <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Author:</span>
                <span className="text-text-primary font-medium">{currentCommit.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Branch:</span>
                <span className="text-text-primary font-medium">{currentCommit.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Files Changed:</span>
                <span className="text-text-primary">{currentCommit.filesChanged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Diff Stats:</span>
                <span>
                  <span className="text-status-good">+{currentCommit.insertions}</span> /{' '}
                  <span className="text-status-critical">-{currentCommit.deletions}</span>
                </span>
              </div>
            </div>

            {/* Multi-Agent Audit of Commit */}
            <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                  <ShieldCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> Multi-Agent Audit
                </span>
                {currentCommit.agentAuditStatus === 'hazards_flagged' ? (
                  <Badge variant="critical">2 Hazards Flagged</Badge>
                ) : (
                  <Badge variant="good">Clean & Verified</Badge>
                )}
              </div>
              <p className="text-text-secondary text-[12px] leading-relaxed">
                {currentCommit.agentAuditStatus === 'hazards_flagged'
                  ? 'The Security & Performance agents identified hardcoded secrets and unindexed database queries in this revision.'
                  : 'All 5 agents verified zero critical regressions in this commit.'}
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => setActiveView('explore')}
              className="w-full gap-2"
            >
              <FileCode strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
              <span>Browse Code at this Revision</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
