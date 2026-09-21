import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { FileNode } from '../../types/repository';
import { useRepoStore } from '../../store/useRepoStore';
import {
  Sparkles,
  Network,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';

interface CodeViewerProps {
  file: FileNode | null;
  targetLine?: number | null;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file, targetLine }) => {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = React.useState(false);
  const { sendChatMessage, setActiveView } = useRepoStore();

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('repolens-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f97583', fontStyle: 'bold' },
        { token: 'string', foreground: '9ecbff' },
        { token: 'number', foreground: '79b8ff' },
        { token: 'type', foreground: 'b392f0' },
        { token: 'function', foreground: 'e1e4e8' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#e6edf3',
        'editorCursor.foreground': '#58a6ff',
        'editor.selectionBackground': '#264f78',
        'editorGutter.background': '#0d1117',
      },
    });

    monaco.editor.setTheme('repolens-dark');

    if (targetLine) {
      editor.revealLineInCenter(targetLine);
      editor.setPosition({ lineNumber: targetLine, column: 1 });
    }
  };

  useEffect(() => {
    if (editorRef.current && targetLine) {
      editorRef.current.revealLineInCenter(targetLine);
      editorRef.current.setPosition({ lineNumber: targetLine, column: 1 });
    }
  }, [targetLine]);

  const handleCopy = () => {
    if (file?.content) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMonacoLang = (ext?: string) => {
    if (!ext) return 'typescript';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'json') return 'json';
    if (ext === 'prisma' || ext === 'sql') return 'sql';
    if (ext === 'md') return 'markdown';
    if (ext === 'py') return 'python';
    if (ext === 'yaml' || ext === 'yml') return 'yaml';
    return 'plaintext';
  };

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] text-slate-500 p-8 text-xs font-mono">
        <FileCode className="w-8 h-8 mb-2 opacity-40" />
        <p>Select a file from the tree to inspect source code.</p>
      </div>
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const monacoLang = getMonacoLang(ext);
  const lineCount = file.content ? file.content.split('\n').length : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden text-xs font-mono">
      {/* File Header Toolbar */}
      <div className="h-9 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="text-slate-200 font-semibold truncate text-[11px]">
            {file.path}
          </span>
          <span className="text-[10px] text-slate-500">
            ({lineCount} lines)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sendChatMessage(`Explain the architecture and role of \`${file.path}\``);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-indigo-300 text-[11px] font-sans transition-all"
            title="Ask AI to explain this file"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI Explain</span>
          </button>

          <button
            onClick={() => {
              setActiveView('impact');
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-[11px] font-sans transition-all"
            title="Calculate blast radius in dependency graph"
          >
            <Network className="w-3 h-3 text-cyan-400" />
            <span>Blast Radius</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy file content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={monacoLang}
          value={file.content || '// Empty file content'}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
            minimap: { enabled: true, maxColumn: 80 },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
};
