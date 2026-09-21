import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../data/mockReviewAgents';
import { AgentId } from '../../types/agents';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  FileCode,
  ShieldAlert,
  GitMerge,
  Network,
  Users2,
  ArrowRight,
  Bot,
} from 'lucide-react';

export const RepoChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    handleJumpAction,
    isRecordingVoice,
    startVoiceInput,
    stopVoiceInput,
    voicePlayback,
    speakAgentBriefing,
    stopAudioPlayback,
    setIsVoiceSettingsModalOpen,
  } = useRepoStore();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedAgentTarget, setSelectedAgentTarget] = useState<AgentId | 'all'>('all');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendChatMessage(inputQuery, selectedAgentTarget === 'all' ? undefined : selectedAgentTarget);
    setInputQuery('');
  };

  const quickPrompts = [
    { prompt: 'Where is authentication handled?', agent: 'security' as AgentId },
    { prompt: 'How does the Stripe checkout flow work?', agent: 'performance_db' as AgentId },
    { prompt: 'What breaks if I modify prisma/schema.prisma?', agent: 'git_merge' as AgentId },
    { prompt: 'Audit code coupling and dead code items', agent: 'code_quality_arch' as AgentId },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden select-none">
      {/* Top Header: Voice & Agent Target Controls */}
      <div className="h-12 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">Repository Intelligence Chat</span>
          </div>

          <div className="hidden md:flex items-center gap-1 pl-4 border-l border-[#30363d]">
            <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Target Agent:</span>
            <button
              onClick={() => setSelectedAgentTarget('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                selectedAgentTarget === 'all'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All (Orchestrator)
            </button>
            {reviewAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentTarget(a.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                  selectedAgentTarget === a.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{a.avatar}</span>
                <span>{a.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Settings Button */}
        <button
          onClick={() => setIsVoiceSettingsModalOpen(true)}
          className="p-1.5 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 font-mono transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Voice Engine Settings</span>
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs max-w-4xl mx-auto w-full">
        {chatMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const agentProfile = msg.respondingAgentId
            ? reviewAgents.find((a) => a.id === msg.respondingAgentId)
            : null;
          const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === msg.respondingAgentId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                isAssistant ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`p-4 rounded-xl max-w-3xl leading-relaxed text-xs ${
                  isAssistant
                    ? 'bg-[#161b22] border border-[#30363d] text-slate-200 shadow-md'
                    : 'bg-indigo-600 text-white shadow-md'
                }`}
              >
                {/* Agent Header if Assistant */}
                {isAssistant && agentProfile && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agentProfile.avatar}</span>
                      <span className="font-bold text-slate-100">{agentProfile.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        • {agentProfile.role}
                      </span>
                    </div>

                    {/* Speak Answer Button */}
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stopAudioPlayback();
                        } else {
                          speakAgentBriefing(msg.content, agentProfile.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-[#21262d] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono text-[10px]"
                      title="Speak response aloud in agent voice"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Voice Narration</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Code Reference Citations */}
                {msg.codeReferences && msg.codeReferences.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#30363d] space-y-1.5 font-mono">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">
                      Referenced Code Call-sites:
                    </div>
                    {msg.codeReferences.map((ref, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleJumpAction({ label: ref.file, type: 'code', targetId: ref.file, line: ref.lineStart })}
                        className="p-2 rounded bg-[#0d1117] border border-[#30363d] hover:border-indigo-500 cursor-pointer flex items-center justify-between group transition-all"
                      >
                        <span className="text-indigo-300 font-semibold truncate">
                          {ref.file}:{ref.lineStart}-{ref.lineEnd}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Jump Buttons */}
                {msg.jumpActions && msg.jumpActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#30363d] flex flex-wrap gap-1.5">
                    {msg.jumpActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpAction(act)}
                        className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-indigo-300 text-[11px] font-mono flex items-center gap-1.5 transition-all"
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
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2 border-t border-[#30363d] bg-[#161b22]/50 flex gap-2 overflow-x-auto no-scrollbar max-w-4xl mx-auto w-full">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendChatMessage(qp.prompt, qp.agent)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-slate-300 text-[11px] transition-all"
          >
            {qp.prompt}
          </button>
        ))}
      </div>

      {/* Input Bar with Voice Mic */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22] max-w-4xl mx-auto w-full">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Microphone Voice Input Button */}
          <button
            type="button"
            onClick={() => {
              if (isRecordingVoice) {
                stopVoiceInput();
              } else {
                startVoiceInput(selectedAgentTarget === 'all' ? undefined : selectedAgentTarget);
              }
            }}
            className={`p-2.5 rounded-lg border transition-all ${
              isRecordingVoice
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-[#0d1117] border-[#30363d] text-slate-300 hover:text-white hover:border-indigo-500'
            }`}
            title={isRecordingVoice ? 'Stop voice recording' : 'Speak via microphone (Speech-to-Text)'}
          >
            {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
          </button>

          <input
            type="text"
            placeholder={
              isRecordingVoice
                ? 'Listening to your voice...'
                : selectedAgentTarget === 'all'
                ? 'Ask RepoLens intelligence...'
                : `Ask ${reviewAgents.find((a) => a.id === selectedAgentTarget)?.name}...`
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
