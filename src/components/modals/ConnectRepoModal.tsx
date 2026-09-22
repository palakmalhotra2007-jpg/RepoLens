import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { parseZipArchive } from '../../services/zipExtractor';
import { fetchGitHubRepository } from '../../services/githubFetcher';
import { comprehensiveDemoRepo } from '../../data/comprehensiveDemoRepo';
import { mockShopFlowRepository } from '../../data/mockShopFlowRepo';
import {
  X,
  GitBranch,
  Upload,
  FolderArchive,
  FolderGit2,
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
              <p className="text-xs text-slate-400 mb-4">
                Select a pre-built demo repository with realistic code structure and multiple branches
              </p>

              {/* TaskFlow Demo */}
              <button
                onClick={() => switchRepo(comprehensiveDemoRepo)}
                className="w-full p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">TaskFlow - Full-Stack App</h4>
                      <p className="text-[11px] text-slate-400 font-mono">demo/taskflow</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {comprehensiveDemoRepo.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span>{comprehensiveDemoRepo.branches.length} branches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{comprehensiveDemoRepo.stats.filesCount} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{comprehensiveDemoRepo.stats.testCoverage}% coverage</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {comprehensiveDemoRepo.languages.slice(0, 4).map((lang) => (
                    <span 
                      key={lang.name}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300"
                    >
                      {lang.name}
                    </span>
                  ))}
                </div>
              </button>

              {/* ShopFlow Demo */}
              <button
                onClick={() => switchRepo(mockShopFlowRepository)}
                className="w-full p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <FolderArchive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">ShopFlow - E-commerce Platform</h4>
                      <p className="text-[11px] text-slate-400 font-mono">demo/shopflow</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {mockShopFlowRepository.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span>{mockShopFlowRepository.branches.length} branches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{mockShopFlowRepository.stats.filesCount} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>{mockShopFlowRepository.stats.healthScore}/100 health</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mockShopFlowRepository.languages.slice(0, 4).map((lang) => (
                    <span 
                      key={lang.name}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300"
                    >
                      {lang.name}
                    </span>
                  ))}
                </div>
              </button>
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

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-2">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 
                  How to connect your repository:
                </div>
                <ul className="space-y-1 text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>Enter the repository name (e.g., username/repo)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>Or paste the full GitHub URL</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>Works with public repositories only</span>
                  </li>
                </ul>
                <div className="font-semibold text-slate-300 mt-2">💡 Quick Examples:</div>
                <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                  <button
                    type="button"
                    onClick={() => setGithubUrl('shadcn-ui/ui')}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition-colors"
                  >
                    shadcn-ui/ui
                  </button>
                  <button
                    type="button"
                    onClick={() => setGithubUrl('facebook/react')}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition-colors"
                  >
                    facebook/react
                  </button>
                  <button
                    type="button"
                    onClick={() => setGithubUrl('vercel/next.js')}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition-colors"
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
                <Upload className="w-12 h-12 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-100 mb-1">
                  Drop or click to upload ZIP archive
                </span>
                <span className="text-xs text-slate-400">
                  Your repository files will be processed locally in the browser
                </span>
              </label>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-2">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> 
                  How to prepare your repository ZIP:
                </div>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400">1.</span>
                    <span>Download your repository as a ZIP file from GitHub</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400">2.</span>
                    <span>Or compress your local repository folder into a ZIP</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400">3.</span>
                    <span>Upload the ZIP file here for instant analysis</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400">✓</span>
                    <span>All processing happens in your browser - no data sent to servers</span>
                  </li>
                </ul>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 font-mono p-4 bg-indigo-950/20 rounded-xl border border-indigo-500/20">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting archive & parsing code structure...</span>
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
