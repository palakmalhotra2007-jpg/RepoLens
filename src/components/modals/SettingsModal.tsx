import React, { useState, useEffect } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { Button } from '../../frontend';
import {
  X,
  Settings,
  Shield,
  Check,
} from 'lucide-react';

// Settings type definition
type ReviewStrictness = 'strict' | 'standard' | 'relaxed';

interface AppSettings {
  reviewStrictness: ReviewStrictness;
  enableCrossVerification: boolean;
  semanticDriftThreshold: number;
}

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useRepoStore();

  // Load settings from localStorage or use defaults
  const loadSettings = (): AppSettings => {
    try {
      const stored = localStorage.getItem('repolens_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return {
      reviewStrictness: 'relaxed',
      enableCrossVerification: true,
      semanticDriftThreshold: 0.71,
    };
  };

  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [saved, setSaved] = useState(false);

  // Sync settings when modal opens
  useEffect(() => {
    if (isSettingsModalOpen) {
      setSettings(loadSettings());
    }
  }, [isSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    // Save to localStorage
    try {
      localStorage.setItem('repolens_settings', JSON.stringify(settings));
      console.log('Settings saved:', settings);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }

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
                  onClick={() => setSettings({ ...settings, reviewStrictness: s })}
                  className={`p-2.5 rounded-xl border capitalize transition-all ${
                    settings.reviewStrictness === s
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
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
              checked={settings.enableCrossVerification}
              onChange={(e) => setSettings({ ...settings, enableCrossVerification: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Semantic Drift Sensitivity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-200">Semantic Conflict Sensitivity</span>
              <span className="text-indigo-400 font-bold">{settings.semanticDriftThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={settings.semanticDriftThreshold}
              onChange={(e) => setSettings({ ...settings, semanticDriftThreshold: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
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
