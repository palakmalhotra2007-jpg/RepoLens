import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { parseZipArchive } from '../../services/zipExtractor';
import { fetchGitHubRepository } from '../../services/githubFetcher';
import { comprehensiveDemoRepo } from '../../data/comprehensiveDemoRepo';
import { mockShopFlowRepository } from '../../data/mockShopFlowRepo';
import { Button, Badge, TabsList, TabsTrigger } from '../../frontend';
import {
  X,
  GitBranch,
  Upload,
  FolderGit2,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Globe,
} from 'lucide-react';

export const ConnectRepoModal: React.FC = () => {
  const { isConnectModalOpen, setIsConnectModalOpen, switchRepo } = useRepoStore();

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
    } catch {
      setError('Failed to extract and parse ZIP archive.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-bg-surface border border-border-default rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-default flex items-center justify-between bg-bg-surface">
          <div className="flex items-center gap-2.5">
            <FolderGit2 strokeWidth={1.5} className="w-5 h-5 text-text-secondary" />
            <div>
              <h3 className="font-semibold text-sm text-text-primary">Connect & Explore Repository</h3>
              <p className="text-[11px] text-text-secondary">
                Import from GitHub, upload a ZIP archive, or load pre-built demo repos.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsConnectModalOpen(false)}
            className="p-1.5 rounded-[6px] hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-border-default">
          <TabsList>
            <TabsTrigger active={activeTab === 'demo'} onClick={() => { setActiveTab('demo'); setError(null); }}>
              Demo Repositories
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'github'} onClick={() => { setActiveTab('github'); setError(null); }}>
              GitHub URL Importer
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'zip'} onClick={() => { setActiveTab('zip'); setError(null); }}>
              Upload ZIP Archive
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="m-4 p-3 rounded-[6px] bg-[#B54A4A]/12 border border-[#B54A4A]/24 text-status-critical text-xs flex items-center gap-2">
            <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* Tab 1: Demo Repositories */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-text-secondary mb-4">
                Select a pre-built demo repository with realistic code structure and multiple branches
              </p>

              {/* TaskFlow Demo */}
              <button
                onClick={() => switchRepo(comprehensiveDemoRepo)}
                className="w-full p-4 rounded-[6px] bg-bg-surface-2 border border-border-default hover:bg-[#262B31] transition-colors text-left group space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">TaskFlow - Full-Stack App</h4>
                    <p className="text-[11px] text-text-tertiary font-mono">demo/taskflow</p>
                  </div>
                  <Badge variant="good">RECOMMENDED</Badge>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {comprehensiveDemoRepo.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-text-tertiary font-mono">
                  <div className="flex items-center gap-1">
                    <GitBranch strokeWidth={1.5} className="w-3 h-3 text-text-tertiary" />
                    <span>{comprehensiveDemoRepo.branches.length} branches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers strokeWidth={1.5} className="w-3 h-3 text-text-tertiary" />
                    <span>{comprehensiveDemoRepo.stats.filesCount} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 strokeWidth={1.5} className="w-3 h-3 text-status-good" />
                    <span>{comprehensiveDemoRepo.stats.testCoverage}% coverage</span>
                  </div>
                </div>
              </button>

              {/* ShopFlow Demo */}
              <button
                onClick={() => switchRepo(mockShopFlowRepository)}
                className="w-full p-4 rounded-[6px] bg-bg-surface-2 border border-border-default hover:bg-[#262B31] transition-colors text-left group space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">ShopFlow - E-commerce Platform</h4>
                    <p className="text-[11px] text-text-tertiary font-mono">demo/shopflow</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {mockShopFlowRepository.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-text-tertiary font-mono">
                  <div className="flex items-center gap-1">
                    <GitBranch strokeWidth={1.5} className="w-3 h-3 text-text-tertiary" />
                    <span>{mockShopFlowRepository.branches.length} branches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers strokeWidth={1.5} className="w-3 h-3 text-text-tertiary" />
                    <span>{mockShopFlowRepository.stats.filesCount} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{mockShopFlowRepository.stats.healthScore}/100 health</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Tab 2: GitHub URL Importer */}
          {activeTab === 'github' && (
            <form onSubmit={handleGitHubImport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  GitHub Public Repository
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe strokeWidth={1.5} className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. facebook/react or https://github.com/shadcn-ui/ui"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-bg-surface-2 border border-border-default rounded-[6px] pl-9 pr-3 py-2 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-border-strong font-mono"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || !githubUrl.trim()}
                    className="gap-2"
                  >
                    {isLoading ? <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin" /> : <ArrowRight strokeWidth={1.5} className="w-4 h-4" />}
                    <span>Fetch</span>
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default text-xs text-text-secondary space-y-2">
                <div className="font-semibold text-text-primary flex items-center gap-1.5">
                  How to connect your repository:
                </div>
                <ul className="space-y-1 text-text-secondary">
                  <li>• Enter the repository name (e.g., username/repo) or paste full GitHub URL</li>
                  <li>• Works with public repositories</li>
                </ul>
              </div>
            </form>
          )}

          {/* Tab 3: Upload ZIP Archive */}
          {activeTab === 'zip' && (
            <div className="space-y-4">
              <label className="border border-dashed border-border-strong hover:border-accent rounded-[6px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-bg-surface-2 group">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleZipUpload}
                  className="hidden"
                />
                <Upload strokeWidth={1.5} className="w-8 h-8 text-text-secondary mb-3 group-hover:text-accent transition-colors" />
                <span className="font-semibold text-sm text-text-primary mb-1">
                  Drop or click to upload ZIP archive
                </span>
                <span className="text-xs text-text-secondary">
                  Processed entirely locally in browser
                </span>
              </label>

              <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default text-xs text-text-secondary space-y-2">
                <div className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Database strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> 
                  Upload instructions:
                </div>
                <ul className="space-y-1 text-text-secondary">
                  <li>1. Download repository as ZIP or compress folder</li>
                  <li>2. Upload the ZIP file here for instant analysis</li>
                  <li>3. 100% private client-side processing</li>
                </ul>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-xs text-accent font-mono p-4 bg-bg-surface-2 rounded-[6px] border border-border-default">
                  <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin" />
                  <span>Extracting archive & parsing code structure...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-surface-2 border-t border-border-default text-xs text-text-tertiary flex items-center justify-between">
          <span className="font-mono text-[11px]">Client-side secure sandbox</span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsConnectModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
