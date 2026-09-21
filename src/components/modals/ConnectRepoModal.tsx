import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { parseZipArchive } from '../../services/zipExtractor';
import { fetchGitHubRepository } from '../../services/githubFetcher';
import { mockShopFlowRepository } from '../../data/mockShopFlowRepo';
import {
  X,
  GitBranch,
  Upload,
  FolderArchive,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Globe,
} from 'lucide-react';

export const ConnectRepoModal: React.FC = () => {
  const { isConnectModalOpen, setIsConnectModalOpen, switchRepo, repo } = useRepoStore();

  const [activeTab, setActiveTab] = useState<'demo' | 'github' | 'zip'>('demo');
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConnectModalOpen) return null;

  const handleGitHubImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedRepo = await fetchGitHubRepository(githubUrl);
      switchRepo(fetchedRepo);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repository from GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const extractedRepo = await parseZipArchive(file);
      switchRepo(extractedRepo);
    } catch (err: any) {
      setError('Failed to extract and parse ZIP archive.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Connect & Explore Repository</h3>
              <p className="text-[11px] text-slate-400">
                Import from GitHub, upload a ZIP archive, or load pre-built demo repos.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConnectModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('demo');
              setError(null);
            }}
            className={`pb-2.5 px-3 font-medium transition-all relative ${
              activeTab === 'demo'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Demo Repositories</span>
            {activeTab === 'demo' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('github');
              setError(null);
            }}
            className={`pb-2.5 px-3 font-medium transition-all relative ${
              activeTab === 'github'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>GitHub URL Importer</span>
            {activeTab === 'github' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('zip');
              setError(null);
            }}
            className={`pb-2.5 px-3 font-medium transition-all relative ${
              activeTab === 'zip'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Upload ZIP Archive</span>
            {activeTab === 'zip' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded" />
            )}
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* Tab 1: Demo Repositories */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <div
                onClick={() => switchRepo(mockShopFlowRepository)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between group ${
                  repo.id === 'repo_shopflow_01'
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-indigo-300">
                      ShopFlow E-Commerce Core
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                      Featured Demo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    React 18 + Node.js/Express + PostgreSQL/Prisma + Stripe Elements + Redis.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1">
                    <span>26 files</span>
                    <span>•</span>
                    <span>4,820 LOC</span>
                    <span>•</span>
                    <span>5-Agent Audit Ready</span>
                  </div>
                </div>

                {repo.id === 'repo_shopflow_01' && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Tab 2: GitHub URL Importer */}
          {activeTab === 'github' && (
            <form onSubmit={handleGitHubImport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  GitHub Public Repository
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. facebook/react or https://github.com/shadcn-ui/ui"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !githubUrl.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Fetch</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">💡 Instant Try:</div>
                <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                  <button
                    type="button"
                    onClick={() => setGithubUrl('shadcn-ui/ui')}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800"
                  >
                    shadcn-ui/ui
                  </button>
                  <button
                    type="button"
                    onClick={() => setGithubUrl('facebook/react')}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800"
                  >
                    facebook/react
                  </button>
                  <button
                    type="button"
                    onClick={() => setGithubUrl('vercel/next.js')}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800"
                  >
                    vercel/next.js
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tab 3: Upload ZIP Archive */}
          {activeTab === 'zip' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleZipUpload}
                  className="hidden"
                />
                <FolderArchive className="w-10 h-10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs text-slate-200">
                  Select a repository .ZIP archive
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Extracted and parsed 100% locally in your browser memory
                </span>
              </label>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unpacking archive & extracting AST symbols...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-[11px]">Client-side secure sandbox</span>
          <button
            onClick={() => setIsConnectModalOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
