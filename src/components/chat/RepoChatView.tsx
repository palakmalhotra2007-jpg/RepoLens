import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
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
    { prompt: 'Explain the checkout flow.', agent: 'performance_db' as AgentId },
    { prompt: 'What depends on this function?', agent: 'code_quality_arch' as AgentId },
    { prompt: 'What happens if I change this?', agent: 'git_merge' as AgentId },
    { prompt: 'What security issues exist?', agent: 'security' as AgentId },
    { prompt: 'Why does this merge conflict exist?', agent: 'git_merge' as AgentId },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden">
      {/* Top Header: Voice & Agent Target Controls */}
      <div className="h-14 bg-[#161b22] border-b border-[#30363d] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-white text-sm">Repository Intelligence Chat</span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#30363d]">
            <span className="text-xs font-mono text-slate-400 uppercase mr-1">Target Agent:</span>
            <button
              onClick={() => setSelectedAgentTarget('all')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedAgentTarget === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-[#0d1117] text-slate-300 hover:text-slate-100 border border-[#30363d]'
              }`}
            >
              All (Orchestrator)
            </button>
            {reviewAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentTarget(a.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  selectedAgentTarget === a.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-[#0d1117] text-slate-300 hover:text-slate-100 border border-[#30363d]'
                }`}
              >
                <span className="text-sm">{a.avatar}</span>
                <span>{a.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Settings Button */}
        <button
          onClick={() => setIsVoiceSettingsModalOpen(true)}
          className="px-3 py-2 rounded-lg hover:bg-[#21262d] text-slate-300 hover:text-slate-100 text-xs flex items-center gap-2 font-mono transition-colors border border-[#30363d] hover:border-indigo-500/40"
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Voice Settings</span>
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {chatMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const agentProfile = msg.respondingAgentId
            ? reviewAgents.find((a) => a.id === msg.respondingAgentId)
            : null;
          const isSpeaking = voicePlayback.isPlaying && voicePlayback.speakingAgentId === msg.respondingAgentId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-2 ${
                isAssistant ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`p-5 rounded-2xl max-w-3xl leading-relaxed ${
                  isAssistant
                    ? 'bg-[#161b22] border border-[#30363d] text-slate-200 shadow-sm rounded-bl-none'
                    : 'bg-indigo-600 text-white shadow-md rounded-br-none'
                }`}
              >
                {/* Agent Header if Assistant */}
                {isAssistant && agentProfile && (
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{agentProfile.avatar}</span>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{agentProfile.name}</div>
                        <div className="text-xs font-mono text-slate-400">
                          {agentProfile.role}
                        </div>
                      </div>
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
                      className="px-3 py-1.5 rounded-lg hover:bg-[#21262d] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-mono text-xs border border-[#30363d] hover:border-indigo-500/40 transition-all"
                      title="Speak response aloud in agent voice"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-400">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>Play Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>

                {/* Code Reference Citations */}
                {msg.codeReferences && msg.codeReferences.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#30363d] space-y-2 font-mono">
                    <div className="text-xs uppercase text-slate-400 font-semibold">
                      Referenced Code Call-sites:
                    </div>
                    {msg.codeReferences.map((ref, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleJumpAction({ label: ref.file, type: 'code', targetId: ref.file, line: ref.lineStart })}
                        className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-indigo-500 cursor-pointer flex items-center justify-between group transition-all"
                      >
                        <span className="text-indigo-300 font-semibold truncate text-xs">
                          {ref.file}:{ref.lineStart}-{ref.lineEnd}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Jump Buttons */}
                {msg.jumpActions && msg.jumpActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#30363d] flex flex-wrap gap-2">
                    {msg.jumpActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpAction(act)}
                        className="px-3 py-2 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 text-xs font-mono flex items-center gap-2 transition-all"
                      >
                        {act.type === 'code' && <FileCode className="w-3.5 h-3.5 text-cyan-400" />}
                        {act.type === 'finding' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                        {act.type === 'impact_node' && <Network className="w-3.5 h-3.5 text-emerald-400" />}
                        {act.type === 'merge_conflict' && <GitMerge className="w-3.5 h-3.5 text-amber-400" />}
                        {act.type === 'debate' && <Users2 className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs text-slate-500 px-1 font-mono">{msg.timestamp}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-3 border-t border-[#30363d] bg-[#161b22]/50 flex gap-2 overflow-x-auto no-scrollbar max-w-5xl mx-auto w-full">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendChatMessage(qp.prompt, qp.agent)}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-indigo-500/40 text-slate-300 hover:text-slate-100 text-xs transition-all"
          >
            {qp.prompt}
          </button>
        ))}
      </div>

      {/* Input Bar with Voice Mic */}
      <div className="p-5 border-t border-[#30363d] bg-[#161b22] max-w-5xl mx-auto w-full">
        <form onSubmit={handleSend} className="flex items-center gap-3">
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
            className={`p-3 rounded-xl border transition-all ${
              isRecordingVoice
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-[#0d1117] border-[#30363d] text-slate-300 hover:text-white hover:border-indigo-500'
            }`}
            title={isRecordingVoice ? 'Stop voice recording' : 'Speak via microphone (Speech-to-Text)'}
          >
            {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-400" />}
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
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
