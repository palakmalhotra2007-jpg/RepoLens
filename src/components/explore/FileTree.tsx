import React, { useState } from 'react';
import { FileNode } from '../../types/repository';
import { useRepoStore } from '../../store/useRepoStore';
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
  Flame,
  Trash2,
  Copy,
  Layers,
} from 'lucide-react';

interface FileTreeProps {
  nodes: FileNode[];
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes }) => {
  const {
    activeFile,
    setActiveFile,
    setActiveLine,
    repo,
    selectFileByPath,
  } = useRepoStore();

  const [activeExplorerTab, setActiveExplorerTab] = useState<'files' | 'hotspots' | 'deadcode' | 'duplicates'>('files');
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
        <FolderOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
      ) : (
        <Folder className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      );
    }

    const ext = node.name.split('.').pop()?.toLowerCase();
    if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
      return <FileCode className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
    }
    if (ext === 'prisma' || ext === 'sql') {
      return <Database className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
    }
    if (ext === 'json') {
      return <FileJson className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
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
              // Use selectFileByPath to properly load content from GitHub if needed
              selectFileByPath(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          className={`flex items-center gap-1.5 py-1 px-1.5 rounded text-xs font-mono cursor-pointer transition-colors ${
            isSelected
              ? 'bg-[#21262d] text-white font-semibold border-l-2 border-indigo-500'
              : 'text-slate-400 hover:bg-[#161b22] hover:text-slate-200'
          }`}
        >
          {isDir && (
            <span className="text-slate-500">
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          )}
          {getFileIcon(node)}
          <span className="truncate">{node.name}</span>
          {node.symbols && node.symbols.length > 0 && (
            <span className="ml-auto text-[9px] text-slate-500 font-mono">
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
    <div className="w-64 bg-[#0d1117] border-r border-[#30363d] flex flex-col h-full flex-shrink-0 text-xs">
      {/* Tab Switcher: Files, Hotspots, Dead Code, Duplication */}
      <div className="flex border-b border-[#30363d] bg-[#161b22] p-1 gap-1 font-mono text-[10px]">
        <button
          onClick={() => setActiveExplorerTab('files')}
          className={`flex-1 py-1 text-center rounded transition-all ${
            activeExplorerTab === 'files'
              ? 'bg-[#21262d] text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveExplorerTab('hotspots')}
          className={`flex-1 py-1 text-center rounded transition-all ${
            activeExplorerTab === 'hotspots'
              ? 'bg-[#21262d] text-orange-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hotspots
        </button>
        <button
          onClick={() => setActiveExplorerTab('deadcode')}
          className={`flex-1 py-1 text-center rounded transition-all ${
            activeExplorerTab === 'deadcode'
              ? 'bg-[#21262d] text-rose-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dead Code
        </button>
      </div>

      {/* Explorer Content */}
      {activeExplorerTab === 'files' && (
        <>
          <div className="p-2 border-b border-[#30363d]">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded pl-7 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
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
          <div className="text-[10px] uppercase font-mono text-slate-500 px-1">
            Top Maintenance Hotspots ({repo.hotspots.length})
          </div>
          {repo.hotspots.map((h) => (
            <div
              key={h.id}
              onClick={() => selectFileByPath(h.file)}
              className="p-2 rounded bg-[#161b22] border border-[#30363d] hover:border-orange-500/50 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-indigo-300 text-[11px]">{h.functionName}()</span>
                <span className="text-orange-400 text-[10px] font-bold">CC: {h.cyclomaticComplexity}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{h.file}</div>
              <p className="text-[10px] text-slate-400 leading-snug">{h.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dead Code Tab */}
      {activeExplorerTab === 'deadcode' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="text-[10px] uppercase font-mono text-slate-500 px-1">
            Unreferenced AST Exports ({repo.deadCodeItems.length})
          </div>
          {repo.deadCodeItems.map((d) => (
            <div
              key={d.id}
              onClick={() => selectFileByPath(d.file, d.line)}
              className="p-2 rounded bg-[#161b22] border border-[#30363d] hover:border-rose-500/50 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-rose-300 text-[11px]">{d.symbolName}</span>
                <span className="text-slate-400 text-[10px]">L{d.line}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{d.file}</div>
              <p className="text-[10px] text-slate-400 leading-snug">{d.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
