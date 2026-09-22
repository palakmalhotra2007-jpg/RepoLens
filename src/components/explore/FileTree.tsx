import React, { useState } from 'react';
import { FileNode } from '../../types/repository';
import { useRepoStore } from '../../store/useRepoStore';
import { Badge } from '../../frontend';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown,
  Search,
  Database,
} from 'lucide-react';

interface FileTreeProps {
  nodes: FileNode[];
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes }) => {
  const {
    activeFile,
    repo,
    selectFileByPath,
  } = useRepoStore();

  const [activeExplorerTab, setActiveExplorerTab] = useState<'files' | 'hotspots' | 'deadcode'>('files');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    src: true,
    'src/pages': true,
    server: true,
    'server/routes': true,
    prisma: true,
  });

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'directory') {
      return openFolders[node.path] ? (
        <FolderOpen strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />
      ) : (
        <Folder strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />
      );
    }

    const ext = node.name.split('.').pop()?.toLowerCase();
    if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
      return <FileCode strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />;
    }
    if (ext === 'prisma' || ext === 'sql') {
      return <Database strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />;
    }
    if (ext === 'json') {
      return <FileJson strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />;
    }
    return <FileText strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />;
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isDir = node.type === 'directory';
    const isOpen = openFolders[node.path];
    const isSelected = activeFile?.path === node.path;

    if (searchTerm.trim()) {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const childMatches = isDir && node.children?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch && !childMatches) return null;
    }

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => {
            if (isDir) {
              toggleFolder(node.path);
            } else {
              selectFileByPath(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`flex items-center gap-1.5 py-1 px-2 rounded-[4px] text-xs font-mono cursor-pointer transition-colors ${
            isSelected
              ? 'bg-bg-surface-2 text-text-primary font-medium border-l-2 border-accent'
              : 'text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
          }`}
        >
          {isDir && (
            <span className="text-text-tertiary">
              {isOpen ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5" />}
            </span>
          )}
          {getFileIcon(node)}
          <span className="truncate">{node.name}</span>
          {node.symbols && node.symbols.length > 0 && (
            <span className="ml-auto text-[10px] text-text-tertiary font-mono">
              {node.symbols.length}s
            </span>
          )}
        </div>

        {isDir && isOpen && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-bg-base border-r border-border-default flex flex-col h-full flex-shrink-0 text-xs">
      {/* Tab Switcher */}
      <div className="flex border-b border-border-default bg-bg-surface px-2 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveExplorerTab('files')}
          className={`pb-2 pt-2.5 transition-colors border-b-2 -mb-px ${
            activeExplorerTab === 'files'
              ? 'border-accent text-text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveExplorerTab('hotspots')}
          className={`pb-2 pt-2.5 transition-colors border-b-2 -mb-px ${
            activeExplorerTab === 'hotspots'
              ? 'border-accent text-text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Hotspots
        </button>
        <button
          onClick={() => setActiveExplorerTab('deadcode')}
          className={`pb-2 pt-2.5 transition-colors border-b-2 -mb-px ${
            activeExplorerTab === 'deadcode'
              ? 'border-accent text-text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Dead Code
        </button>
      </div>

      {/* Explorer Content */}
      {activeExplorerTab === 'files' && (
        <>
          <div className="p-2 border-b border-border-default">
            <div className="relative">
              <Search strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-surface-2 border border-border-default rounded-[6px] pl-7 pr-2 py-1 text-[11px] text-text-primary placeholder-text-tertiary focus:outline-none focus:border-border-strong font-mono"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {nodes.map((node) => renderNode(node, 0))}
          </div>
        </>
      )}

      {/* Hotspots Tab */}
      {activeExplorerTab === 'hotspots' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="text-[11px] uppercase font-medium text-text-tertiary px-1 tracking-[0.04em]">
            Top Maintenance Hotspots ({repo.hotspots.length})
          </div>
          {repo.hotspots.map((h) => (
            <div
              key={h.id}
              onClick={() => selectFileByPath(h.file)}
              className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default hover:bg-[#262B31] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-medium text-text-primary text-[12px]">{h.functionName}()</span>
                <Badge variant="warn">CC: {h.cyclomaticComplexity}</Badge>
              </div>
              <div className="text-[11px] text-text-tertiary font-mono truncate">{h.file}</div>
              <p className="text-[12px] text-text-secondary leading-snug">{h.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dead Code Tab */}
      {activeExplorerTab === 'deadcode' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="text-[11px] uppercase font-medium text-text-tertiary px-1 tracking-[0.04em]">
            Unreferenced AST Exports ({repo.deadCodeItems.length})
          </div>
          {repo.deadCodeItems.map((d) => (
            <div
              key={d.id}
              onClick={() => selectFileByPath(d.file, d.line)}
              className="p-3 rounded-[6px] bg-bg-surface-2 border border-border-default hover:bg-[#262B31] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-medium text-text-primary text-[12px]">{d.symbolName}</span>
                <Badge variant="neutral">L{d.line}</Badge>
              </div>
              <div className="text-[11px] text-text-tertiary font-mono truncate">{d.file}</div>
              <p className="text-[12px] text-text-secondary leading-snug">{d.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
