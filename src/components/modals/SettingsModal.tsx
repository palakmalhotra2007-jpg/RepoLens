import React, { useState } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Button } from '../../frontend';
import {
  X,
  Settings,
  Shield,
  Check,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useRepoStore();

  const [sensitivity, setSensitivity] = useState<'strict' | 'standard' | 'relaxed'>('strict');
  const [autoDebate, setAutoDebate] = useState(true);
  const [semanticDriftThreshold, setSemanticDriftThreshold] = useState('0.85');
  const [saved, setSaved] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-bg-surface border border-border-default rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border-default flex items-center justify-between bg-bg-surface">
          <div className="flex items-center gap-2.5">
            <Settings strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
            <div>
              <h3 className="font-semibold text-sm text-text-primary">RepoLens Configuration</h3>
              <p className="text-[11px] text-text-secondary">
                Configure 5-agent rules, semantic drift sensitivity, and model parameters.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-[6px] hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Agent Sensitivity */}
          <div className="space-y-2">
            <label className="font-medium text-text-primary flex items-center gap-1.5">
              <Shield strokeWidth={1.5} className="w-3.5 h-3.5 text-text-secondary" /> Review Agent Strictness
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['strict', 'standard', 'relaxed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSensitivity(s)}
                  className={`p-2.5 rounded-[6px] border capitalize transition-colors ${
                    sensitivity === s
                      ? 'bg-bg-surface-2 border-accent text-text-primary font-medium'
                      : 'bg-bg-surface-2 border-border-default text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Debate Toggle */}
          <div className="p-3.5 rounded-[6px] bg-bg-surface-2 border border-border-default flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">Inter-Agent Cross Verification</div>
              <div className="text-[11px] text-text-secondary">
                Enables agents to challenge and corroborate each other before final consensus.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoDebate}
              onChange={(e) => setAutoDebate(e.target.checked)}
              className="w-4 h-4 accent-[#4FA3D9] rounded cursor-pointer"
            />
          </div>

          {/* Semantic Drift Sensitivity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="font-medium text-text-primary">Semantic Conflict Sensitivity</span>
              <span className="text-accent font-medium">{semanticDriftThreshold}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={semanticDriftThreshold}
              onChange={(e) => setSemanticDriftThreshold(e.target.value)}
              className="w-full accent-[#4FA3D9] cursor-pointer"
            />
            <span className="text-[10px] text-text-tertiary font-mono block">
              Lower detects subtle contract divergences; higher requires near-certain runtime failure.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-surface border-t border-border-default flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsSettingsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            className="gap-1.5"
          >
            {saved ? <Check strokeWidth={1.5} className="w-3.5 h-3.5 text-status-good" /> : null}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
