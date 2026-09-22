import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  Clock,
  User,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface MockCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  timeAgo: string;
  branch: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  verified: boolean;
  agentAuditStatus: 'clean' | 'hazards_flagged';
}

export const GitHistoryView: React.FC = () => {
  const { repo, selectFileByPath, setActiveView } = useRepoStore();
  const [selectedCommitHash, setSelectedCommitHash] = useState('8f1e29c');

  const commits: MockCommit[] = [
    {
      hash: '8f1e29c47281d29487b28a11394a108b98213812',
      shortHash: '8f1e29c',
      message: 'feat(checkout): implement Stripe Card Elements v3 with automated tokenization',
      author: 'alex-dev',
      timeAgo: '14 minutes ago',
      branch: 'feat/stripe-elements-v3',
      filesChanged: 4,
      insertions: 142,
      deletions: 28,
      verified: true,
      agentAuditStatus: 'hazards_flagged',
    },
    {
      hash: '4c81a29388102948b81239102839120391238912',
      shortHash: '4c81a29',
      message: 'fix(idempotency): enforce unique payment intent header key on checkout retry',
      author: 'sarah-platform',
      timeAgo: '2 hours ago',
      branch: 'fix/checkout-idempotency',
      filesChanged: 2,
      insertions: 34,
      deletions: 6,
      verified: true,
      agentAuditStatus: 'clean',
    },
    {
      hash: '3d91b82716294827162948192839182938192839',
      shortHash: '3d91b82',
      message: 'perf(db): add composite index on order items and products lookup',
      author: 'marcus-db',
      timeAgo: '1 day ago',
      branch: 'main',
      filesChanged: 3,
      insertions: 56,
      deletions: 12,
      verified: true,
      agentAuditStatus: 'clean',
    },
    {
      hash: '2a19b88271829481928391829381928391829381',
      shortHash: '2a19b88',
      message: 'chore(deps): upgrade Prisma ORM to 5.14 and PostgreSQL 16 dialect',
      author: 'devops-bot',
      timeAgo: '3 days ago',
      branch: 'main',
      filesChanged: 5,
      insertions: 210,
      deletions: 180,
      verified: true,
      agentAuditStatus: 'clean',
    },
    {
      hash: '1f00a98271829481928391829381928391829380',
      shortHash: '1f00a98',
      message: 'feat(auth): initial JWT bearer authentication middleware pipeline',
      author: 'alex-dev',
      timeAgo: '5 days ago',
      branch: 'main',
      filesChanged: 6,
      insertions: 420,
      deletions: 0,
      verified: true,
      agentAuditStatus: 'hazards_flagged',
    },
  ];

  const currentCommit = commits.find((c) => c.shortHash === selectedCommitHash) || commits[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 w-full">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#151f38] border border-slate-800 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5" /> Git Commit Lineage & PR Simulator
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Commit Graph & Branch Drift Intelligence
            </h2>
            <p className="text-xs text-slate-300">
              Track author activity, commit blast radii, and pull request safety scores.
            </p>
          </div>

          <button
            onClick={() => setActiveView('merge')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all w-max"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Simulate Pull Request Merge</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Commits List & Commit Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Commits List Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Recent Commits ({commits.length})
          </div>

          <div className="space-y-2">
            {commits.map((c) => {
              const isSelected = c.shortHash === currentCommit.shortHash;
              return (
                <div
                  key={c.hash}
                  onClick={() => setSelectedCommitHash(c.shortHash)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 group ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {c.shortHash}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-emerald-400" /> {c.branch}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {c.timeAgo}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {c.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" /> {c.author}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">+{c.insertions}</span>
                      <span className="text-rose-400">-{c.deletions}</span>
                      <span className="text-slate-500">({c.filesChanged} files)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commit Inspector Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-indigo-400" /> Commit Inspector
              </span>
              <span className="text-[11px] font-mono text-indigo-300 font-bold">
                {currentCommit.shortHash}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Commit Message</span>
              <h4 className="text-sm font-semibold text-white leading-snug">
                {currentCommit.message}
              </h4>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Author:</span>
                <span className="text-slate-200 font-semibold">{currentCommit.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch:</span>
                <span className="text-emerald-400 font-semibold">{currentCommit.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Files Changed:</span>
                <span className="text-slate-200">{currentCommit.filesChanged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diff Stats:</span>
                <span>
                  <span className="text-emerald-400">+{currentCommit.insertions}</span> /{' '}
                  <span className="text-rose-400">-{currentCommit.deletions}</span>
                </span>
              </div>
            </div>

            {/* Multi-Agent Audit of Commit */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Multi-Agent Audit
                </span>
                {currentCommit.agentAuditStatus === 'hazards_flagged' ? (
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold">
                    2 Hazards Flagged
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    Clean & Verified
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {currentCommit.agentAuditStatus === 'hazards_flagged'
                  ? 'The Security & Performance agents identified hardcoded secrets and unindexed database queries in this revision.'
                  : 'All 5 agents verified zero critical regressions in this commit.'}
              </p>
            </div>

            <button
              onClick={() => setActiveView('explore')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Browse Code at this Revision</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
