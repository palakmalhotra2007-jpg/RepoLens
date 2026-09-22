import React, { useState, useEffect, useRef } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Button, Badge } from '../../frontend';
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
  Zap,
} from 'lucide-react';

function renderInlineStyles(text: string): React.ReactNode {
  const cleaned = text.replace(/\*\*\*/g, '').replace(/^##+\s*/, '');
  const parts = cleaned.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-[4px] bg-bg-surface-2 text-accent font-mono text-[11px] border border-border-default">
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
    <div className="relative my-2.5 rounded-[6px] overflow-hidden bg-bg-surface border border-border-default">
      <div className="flex items-center justify-between px-3 py-1.5 bg-bg-surface-2 border-b border-border-default">
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-[10px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check strokeWidth={1.5} className="w-3.5 h-3.5 text-status-good" />
              <span className="text-status-good">Copied</span>
            </>
          ) : (
            <>
              <Copy strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-[11px] font-mono text-text-primary leading-relaxed bg-bg-surface">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

const FormattedChatMessage: React.FC<{ content: string }> = ({ content }) => {
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.substring(lastIndex, match.index);
      parts.push(
        <div key={lastIndex} className="whitespace-pre-wrap leading-relaxed space-y-1.5 font-sans">
          {textChunk.split('\n\n').map((para, pIdx) => (
            <p key={pIdx}>{renderInlineStyles(para)}</p>
          ))}
        </div>
      );
    }

    const language = match[1];
    const code = match[2];
    parts.push(<CodeBlock key={match.index} code={code.trim()} language={language} />);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textChunk = content.substring(lastIndex);
    parts.push(
      <div key={lastIndex} className="whitespace-pre-wrap leading-relaxed space-y-1.5 font-sans">
        {textChunk.split('\n\n').map((para, pIdx) => (
          <p key={pIdx}>{renderInlineStyles(para)}</p>
        ))}
      </div>
    );
  }

  return <div className="space-y-2">{parts}</div>;
};

export const RepoCopilotView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    selectFileByPath,
    setActiveView,
    setSelectedFinding,
    setActiveDebateFinding,
    setSelectedConflict,
    setSelectedImpactNodeId,
    speakAgentBriefing,
    stopAudioPlayback,
    voicePlayback,
    repo,
    setIsLLMSettingsModalOpen,
  } = useRepoStore();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecordingVoice(false);
        inputRef.current?.focus();
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        setIsRecordingVoice(true);
        recognitionRef.current.start();
      } catch {
        setIsRecordingVoice(false);
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendChatMessage(inputQuery);
    setInputQuery('');
  };

  const handleJumpAction = (action: { type: string; targetId?: string; file?: string; line?: number }) => {
    switch (action.type) {
      case 'code':
        if (action.file) {
          selectFileByPath(action.file, action.line);
          setActiveView('explore');
        }
        break;
      case 'finding':
        setActiveView('review');
        if (action.targetId) {
          setSelectedFinding({ id: action.targetId } as any);
        }
        break;
      case 'debate':
        setActiveView('debate');
        if (action.targetId) {
          setActiveDebateFinding({ id: action.targetId } as any);
        }
        break;
      case 'merge_conflict':
        setActiveView('merge');
        if (action.targetId) {
          setSelectedConflict({ id: action.targetId } as any);
        }
        break;
      case 'impact_node':
        setActiveView('impact');
        if (action.targetId) {
          setSelectedImpactNodeId(action.targetId);
        }
        break;
      default:
        break;
    }
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
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 w-full text-xs">
        {chatMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === 'orchestrator';

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 w-full ${
                isAssistant ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`p-4 rounded-[6px] max-w-4xl lg:max-w-5xl leading-relaxed w-fit border border-border-default ${
                  isAssistant
                    ? 'bg-bg-surface text-text-primary'
                    : 'bg-bg-surface-2 text-text-primary'
                }`}
              >
                {/* Assistant Header */}
                {isAssistant && (
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-default">
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
                  <div className="mt-3.5 pt-3 border-t border-border-default space-y-1.5 font-mono">
                    <div className="text-[10px] uppercase text-text-tertiary font-medium tracking-[0.04em]">
                      Referenced Files:
                    </div>
                    {msg.codeReferences.map((ref, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectFileByPath(ref.file, ref.lineStart)}
                        className="w-full text-left p-2 rounded-[4px] bg-bg-surface-2 hover:bg-[#262B31] border border-border-default text-text-primary text-[11px] flex items-center justify-between group transition-colors"
                      >
                        <span className="text-accent font-medium truncate">
                          {ref.file}:{ref.lineStart}
                        </span>
                        <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct Action Jump Buttons */}
                {msg.jumpActions && msg.jumpActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border-default flex flex-wrap gap-1.5">
                    {msg.jumpActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpAction(act)}
                        className="px-2.5 py-1 rounded-[4px] bg-bg-surface-2 hover:bg-[#262B31] border border-border-default text-text-secondary hover:text-text-primary text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                      >
                        {act.type === 'code' && <FileCode strokeWidth={1.5} className="w-3 h-3 text-text-secondary" />}
                        {act.type === 'finding' && <ShieldAlert strokeWidth={1.5} className="w-3 h-3 text-text-secondary" />}
                        {act.type === 'impact_node' && <Network strokeWidth={1.5} className="w-3 h-3 text-text-secondary" />}
                        {act.type === 'merge_conflict' && <GitMerge strokeWidth={1.5} className="w-3 h-3 text-text-secondary" />}
                        {act.type === 'debate' && <Users2 strokeWidth={1.5} className="w-3 h-3 text-text-secondary" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-text-tertiary px-1 font-mono">{msg.timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-border-default bg-bg-surface w-full flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={() => {
              if (isRecordingVoice) {
                stopVoiceInput();
              } else {
                startVoiceInput();
              }
            }}
            className={`p-2.5 rounded-[6px] border transition-colors ${
              isRecordingVoice
                ? 'bg-[#B54A4A]/12 text-status-critical border-status-critical'
                : 'bg-bg-surface-2 border-border-default text-text-secondary hover:text-text-primary'
            }`}
            title={isRecordingVoice ? 'Click to stop recording' : 'Voice Input (Speech-to-Text)'}
          >
            {isRecordingVoice ? (
              <MicOff strokeWidth={1.5} className="w-4 h-4 text-status-critical" />
            ) : (
              <Mic strokeWidth={1.5} className="w-4 h-4" />
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={
              isRecordingVoice
                ? 'Listening... Speak now.'
                : `Ask RepoLens Copilot anything about ${repo.name}...`
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-bg-surface-2 border border-border-default rounded-[6px] px-3.5 py-2 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-border-strong font-mono"
            disabled={isRecordingVoice}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!inputQuery.trim() || isRecordingVoice}
            className="gap-1.5"
          >
            <Send strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
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
