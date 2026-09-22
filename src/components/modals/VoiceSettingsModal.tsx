import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { reviewAgents } from '../../config/agents';
import { AgentId } from '../../types/agents';
import { Button } from '../../frontend';
import {
  X,
  Volume2,
  Play,
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

  const handleTestAgentVoice = (agentId: AgentId) => {
    const profile = reviewAgents.find((a) => a.id === agentId);
    if (!profile) return;
    setTestingAgent(agentId);
    speakAgentBriefing(profile.voicePersona.sampleIntro, agentId);
    setTimeout(() => setTestingAgent(null), 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-bg-surface border border-border-default rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-surface">
          <div className="flex items-center gap-2">
            <Volume2 strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
            <div>
              <h3 className="font-semibold text-xs text-text-primary">5-Agent Voice & Audio Engine</h3>
              <p className="text-[11px] text-text-secondary">
                Configure voice playback, pitch, rate, and speech synthesis.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAudioPlayback();
              setIsVoiceSettingsModalOpen(false);
            }}
            className="p-1 rounded-[6px] hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Master Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">Enable Agent Voice</div>
                <div className="text-[10px] text-text-secondary">Speech synthesis for briefings & debate</div>
              </div>
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) =>
                  setVoiceSettings({ ...voiceSettings, enabled: e.target.checked })
                }
                className="w-4 h-4 accent-[#4FA3D9] rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">Auto-Speak Responses</div>
                <div className="text-[10px] text-text-secondary">Automatically speak chat answers</div>
              </div>
              <input
                type="checkbox"
                checked={voiceSettings.autoPlayResponses}
                onChange={(e) =>
                  setVoiceSettings({
                    ...voiceSettings,
                    autoPlayResponses: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#4FA3D9] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 5-Agent Voice Selector Grid */}
          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em] block mb-2">
              Select Agent Persona to Preview
            </label>
            <div className="grid grid-cols-5 gap-1.5 font-mono">
              {reviewAgents.map((a) => {
                const isSelected = selectedAgentId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className={`p-2.5 rounded-[4px] border text-center transition-colors flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-bg-surface-2 border-accent text-text-primary font-medium'
                        : 'bg-bg-surface-2 border-border-default text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-[10px] truncate w-full">{a.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Voice Speed & Pitch Tuners */}
          <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-text-primary text-xs">
                  {reviewAgents.find((a) => a.id === selectedAgentId)?.name}
                </span>
                <p className="text-[11px] text-text-secondary font-mono">
                  {reviewAgents.find((a) => a.id === selectedAgentId)?.voicePersona.tone}
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleTestAgentVoice(selectedAgentId)}
                className="gap-1"
              >
                <Play strokeWidth={1.5} className="w-3 h-3 fill-current" />
                <span>{testingAgent === selectedAgentId ? 'Speaking...' : 'Test Voice'}</span>
              </Button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-text-secondary">Voice Volume</span>
                <span className="text-accent">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={voiceSettings.volume}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                className="w-full accent-[#4FA3D9] cursor-pointer"
              />
            </div>

            {/* Pitch Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-text-secondary">Voice Pitch</span>
                <span className="text-accent">{voiceSettings.pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                className="w-full accent-[#4FA3D9] cursor-pointer"
              />
            </div>

            {/* Rate / Speed Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-text-secondary">Speech Rate (Speed)</span>
                <span className="text-accent">{voiceSettings.rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={voiceSettings.rate}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })}
                className="w-full accent-[#4FA3D9] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-surface border-t border-border-default">
          <Button
            variant="primary"
            onClick={() => {
              stopAudioPlayback();
              setIsVoiceSettingsModalOpen(false);
            }}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
