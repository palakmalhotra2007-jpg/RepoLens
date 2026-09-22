import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { FileNode } from '../../types/repository';
import { useRepoStore } from '../../store/useRepoStore';
import { Button } from '../../frontend';
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
        { token: 'comment', foreground: '676E77', fontStyle: 'italic' },
        { token: 'keyword', foreground: '4FA3D9', fontStyle: 'bold' },
        { token: 'string', foreground: '4C9A6A' },
        { token: 'number', foreground: 'C99A3C' },
        { token: 'type', foreground: 'E8EAED' },
        { token: 'function', foreground: 'E8EAED' },
      ],
      colors: {
        'editor.background': '#0B0D10',
        'editor.foreground': '#E8EAED',
        'editor.lineHighlightBackground': '#1B1F24',
        'editorLineNumber.foreground': '#676E77',
        'editorLineNumber.activeForeground': '#E8EAED',
        'editorCursor.foreground': '#4FA3D9',
        'editor.selectionBackground': '#383F47',
        'editorGutter.background': '#0B0D10',
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
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-base text-text-tertiary p-8 text-xs font-mono">
        <FileCode strokeWidth={1.5} className="w-8 h-8 mb-2 text-text-tertiary" />
        <p className="text-text-secondary">Select a file from the tree to inspect source code.</p>
      </div>
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const monacoLang = getMonacoLang(ext);
  const lineCount = file.content ? file.content.split('\n').length : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden text-xs font-mono">
      {/* File Header Toolbar */}
      <div className="h-10 bg-bg-surface border-b border-border-default px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode strokeWidth={1.5} className="w-4 h-4 text-text-secondary flex-shrink-0" />
          <span className="text-text-primary font-medium truncate text-xs">
            {file.path}
          </span>
          <span className="text-[11px] text-text-tertiary">
            ({lineCount} lines)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              sendChatMessage(`Explain the architecture and role of \`${file.path}\``);
            }}
            title="Ask AI to explain this file"
          >
            <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
            <span>AI Explain</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setActiveView('impact');
            }}
            title="Calculate blast radius in dependency graph"
          >
            <Network strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" />
            <span>Blast Radius</span>
          </Button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-[6px] hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
            title="Copy file content"
          >
            {copied ? <Check strokeWidth={1.5} className="w-4 h-4 text-status-good" /> : <Copy strokeWidth={1.5} className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={monacoLang}
          value={file.content || '// Empty file content'}
          theme="repolens-dark"
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', monospace",
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
