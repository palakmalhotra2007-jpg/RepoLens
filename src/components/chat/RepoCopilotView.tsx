import React, { useState, useEffect, useRef } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileCode,
  ShieldAlert,
  Network,
  GitMerge,
  Users2,
  Bot,
  Sliders,
  ChevronRight,
  Code2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  HelpCircle,
} from 'lucide-react';

function renderInlineStyles(text: string): React.ReactNode {
  // Strip any remaining *** or leading ##
  const cleaned = text.replace(/\*\*\*/g, '').replace(/^##+\s*/, '');
  const parts = cleaned.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#0d1117] text-indigo-300 font-mono text-[11px] border border-[#30363d]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2.5 rounded-lg overflow-hidden bg-[#0d1117] border border-[#30363d]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
        <code className="text-slate-200 font-mono">{code}</code>
      </pre>
    </div>
  );
};

const FormattedChatMessage: React.FC<{ content: string }> = ({ content }) => {
  // Parse code blocks first
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    // Add code block
    parts.push({ type: 'code', content: match[2].trim(), language: match[1] || 'code' });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-200">
      {parts.map((part, partIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={partIdx} code={part.content} language={part.language} />;
        }

        const paragraphs = part.content.split('\n\n');
        return paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          // Clean headers: remove leading #, ##, ###, #### and render clean styled header
          const isHeader = /^#{1,4}\s+/.test(trimmed);
          const headerText = trimmed.replace(/^#{1,4}\s+/, '').replace(/\*\*\*/g, '').replace(/\*\*/g, '');

          if (isHeader) {
            return (
              <h4 key={`${partIdx}-${pIdx}`} className="font-bold text-slate-100 text-xs pt-2 pb-1 border-b border-[#30363d]/70 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{headerText}</span>
              </h4>
            );
          }

          const lines = trimmed.split('\n');
          return (
            <div key={`${partIdx}-${pIdx}`} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                if (!lineTrimmed) return null;

                let displayLine = lineTrimmed
                  .replace(/^#{1,4}\s+/, '')
                  .replace(/\*\*\*(.*?)\*\*\*/g, '$1');

                // Bullet list
                if (/^[*-]\s+/.test(displayLine)) {
                  const bulletContent = displayLine.replace(/^[*-]\s+/, '');
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
                      <span className="flex-1">{renderInlineStyles(bulletContent)}</span>
                    </div>
                  );
                }

                // Numbered list
                const numMatch = displayLine.match(/^(\d+\.)\s+(.*)/);
                if (numMatch) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                      <span className="text-indigo-400 font-mono font-bold text-[11px] mt-0.5">{numMatch[1]}</span>
                      <span className="flex-1">{renderInlineStyles(numMatch[2])}</span>
                    </div>
                  );
                }

                return <p key={lIdx}>{renderInlineStyles(displayLine)}</p>;
              })}
            </div>
          );
        });
      })}
    </div>
  );
};

export const RepoCopilotView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    handleJumpAction,
    selectFileByPath,
    isRecordingVoice,
    startVoiceInput,
    stopVoiceInput,
    voicePlayback,
    speakAgentBriefing,
    stopAudioPlayback,
    setIsLLMSettingsModalOpen,
    repo,
  } = useRepoStore();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendChatMessage(inputQuery);
    setInputQuery('');
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden select-none w-full">
      {/* Top Header: Unified Copilot Bar - Thin Lambda Design */}
      <div className="h-10 bg-gradient-to-r from-[#0a0e14] via-[#0d1117] to-[#0a0e14] border-b border-[#21262d]/50 px-4 flex items-center justify-between flex-shrink-0 w-full backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Sparkles className="w-3 h-3" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex items-center gap-3">
            <span className="font-semibold text-white text-xs truncate tracking-tight">
              RepoLens Copilot
            </span>
            <div className="text-[10px] font-mono text-slate-500 truncate flex items-center gap-1.5">
              <span className="text-slate-400">{repo.name}</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-500">{repo.currentBranch}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: LLM Settings - Minimal */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsLLMSettingsModalOpen(true)}
            className="px-2.5 py-1 rounded-md bg-[#161b22] hover:bg-[#1c2128] text-slate-400 hover:text-white text-[10px] flex items-center gap-1.5 font-medium border border-[#30363d] hover:border-indigo-500/50 transition-all duration-200"
            title="Configure Ollama / Gemini LLM Provider"
          >
            <Bot className="w-3 h-3" strokeWidth={1.5} />
            <span className="hidden sm:inline">AI</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 w-full text-xs">
        {chatMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === 'orchestrator';

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 w-full ${
                isAssistant ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`p-4 rounded-2xl max-w-4xl lg:max-w-5xl leading-relaxed w-fit ${
                  isAssistant
                    ? 'bg-[#161b22] border border-[#30363d] text-slate-200 shadow-sm rounded-bl-none'
                    : 'bg-indigo-600 text-white shadow-md rounded-br-none'
                }`}
              >
                {/* Assistant Header */}
                {isAssistant && (
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-100 text-xs">RepoLens Copilot</span>
                    </div>
                  </div>
                )}

                {/* Formatted Content */}
                <FormattedChatMessage content={msg.content} />

                {/* Code Reference Citations */}
                {msg.codeReferences && msg.codeReferences.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#30363d] space-y-1.5 font-mono">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-indigo-400" /> Referenced Files & Call-Sites:
                    </div>
                    {msg.codeReferences.map((ref, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectFileByPath(ref.file, ref.lineStart)}
                        className="w-full text-left p-2 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-indigo-500/40 text-slate-300 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-indigo-300 font-medium truncate">
                          {ref.file}:{ref.lineStart}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct Action Jump Buttons */}
                {msg.jumpActions && msg.jumpActions.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-[#30363d] flex flex-wrap gap-1.5">
                    {msg.jumpActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpAction(act)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 text-[11px] font-mono flex items-center gap-1.5 transition-all"
                      >
                        {act.type === 'code' && <FileCode className="w-3 h-3 text-cyan-400" />}
                        {act.type === 'finding' && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                        {act.type === 'impact_node' && <Network className="w-3 h-3 text-emerald-400" />}
                        {act.type === 'merge_conflict' && <GitMerge className="w-3 h-3 text-amber-400" />}
                        {act.type === 'debate' && <Users2 className="w-3 h-3 text-purple-400" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 px-1 font-mono">{msg.timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22] w-full flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2.5">
          {/* Voice Mic Button with Help */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                if (isRecordingVoice) {
                  stopVoiceInput();
                } else {
                  startVoiceInput();
                }
              }}
              className={`p-3 rounded-xl border transition-all relative ${
                isRecordingVoice
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                  : 'bg-[#0d1117] border-[#30363d] text-slate-300 hover:text-white hover:border-indigo-500'
              }`}
              title={isRecordingVoice ? 'Click to stop recording' : 'Voice Input (Speech-to-Text) - Click to speak'}
            >
              {isRecordingVoice ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                </>
              ) : (
                <Mic className="w-4 h-4 text-indigo-400" />
              )}
            </button>
            
            {/* Help tooltip - shown on hover */}
            {!isRecordingVoice && (
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 shadow-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="text-[10px] text-slate-300 space-y-1">
                      <p className="font-semibold text-slate-100">Voice Input Tips:</p>
                      <ul className="space-y-0.5 text-slate-400">
                        <li>• Click mic and speak clearly</li>
                        <li>• Allow microphone permission</li>
                        <li>• Works best in Chrome/Edge</li>
                        <li>• Need help? Check VOICE_TROUBLESHOOTING.md</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={
              isRecordingVoice
                ? '🎤 Listening... Speak now!'
                : `Ask RepoLens Copilot anything about ${repo.name} (architecture, security, implementation, refactoring)...`
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
            disabled={isRecordingVoice}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isRecordingVoice}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 font-medium text-xs font-mono"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        
        {/* Voice recording hint */}
        {isRecordingVoice && (
          <div className="mt-2 text-center space-y-1">
            <p className="text-xs text-rose-400 font-mono flex items-center justify-center gap-2">
              <span className="animate-pulse">●</span>
              Recording... Speak clearly into your microphone
              <span className="animate-pulse">●</span>
            </p>
            <p className="text-[10px] text-slate-500">
              Check browser console (F12) for detailed status
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

