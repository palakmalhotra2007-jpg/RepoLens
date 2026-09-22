import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
import { voiceEngine } from '../../services/voiceService';
import { AgentId } from '../../types/agents';
import {
  X,
  Volume2,
  VolumeX,
  Mic,
  Sliders,
  Play,
  Key,
  Check,
  RotateCcw,
} from 'lucide-react';

export const VoiceSettingsModal: React.FC = () => {
  const {
    isVoiceSettingsModalOpen,
    setIsVoiceSettingsModalOpen,
    voiceSettings,
    setVoiceSettings,
    speakAgentBriefing,
    stopAudioPlayback,
  } = useRepoStore();

  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('security');
  const [testingAgent, setTestingAgent] = useState<AgentId | null>(null);

  if (!isVoiceSettingsModalOpen) return null;

  const currentProfile = voiceSettings.agentProfiles[selectedAgentId];

  const handleTestAgentVoice = (agentId: AgentId) => {
    const profile = reviewAgents.find((a) => a.id === agentId);
    if (!profile) return;
    setTestingAgent(agentId);
    speakAgentBriefing(profile.voicePersona.sampleIntro, agentId);
    setTimeout(() => setTestingAgent(null), 3500);
  };

  const handleUpdateProfile = (field: 'pitch' | 'rate', value: number) => {
    setVoiceSettings((prev) => ({
      ...prev,
      agentProfiles: {
        ...prev.agentProfiles,
        [selectedAgentId]: {
          ...prev.agentProfiles[selectedAgentId],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white">5-Agent Voice & Audio Engine</h3>
              <p className="text-[11px] text-slate-400">
                Configure distinct voice personas, pitch, rate, and speech recognition.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAudioPlayback();
              setIsVoiceSettingsModalOpen(false);
            }}
            className="p-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Master Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-200">Enable Agent Voice</div>
                <div className="text-[10px] text-slate-400">Speech synthesis for briefings & debate</div>
              </div>
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-200">Auto-Speak Responses</div>
                <div className="text-[10px] text-slate-400">Automatically speak chat answers</div>
              </div>
              <input
                type="checkbox"
                checked={voiceSettings.autoPlayResponses}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    autoPlayResponses: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 5-Agent Voice Selector Grid */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Select Agent Voice Persona
            </label>
            <div className="grid grid-cols-5 gap-1.5 font-mono">
              {reviewAgents.map((a) => {
                const isSelected = selectedAgentId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-[#0d1117] border-[#30363d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{a.avatar}</span>
                    <span className="text-[10px] truncate w-full">{a.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Agent Voice Tuner */}
          {currentProfile && (
            <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 text-xs">
                    {reviewAgents.find((a) => a.id === selectedAgentId)?.name}
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {currentProfile.toneDescription}
                  </p>
                </div>
                <button
                  onClick={() => handleTestAgentVoice(selectedAgentId)}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{testingAgent === selectedAgentId ? 'Speaking...' : 'Test Voice'}</span>
                </button>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Voice Pitch</span>
                  <span className="text-indigo-400">{currentProfile.pitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={currentProfile.pitch}
                  onChange={(e) => handleUpdateProfile('pitch', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Rate / Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Speech Rate</span>
                  <span className="text-indigo-400">{currentProfile.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={currentProfile.rate}
                  onChange={(e) => handleUpdateProfile('rate', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            Provider: Web Speech Synthesis API
          </span>
          <button
            onClick={() => {
              stopAudioPlayback();
              setIsVoiceSettingsModalOpen(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
