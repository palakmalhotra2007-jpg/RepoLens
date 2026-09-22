import React, { useState, useEffect } from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import {
  X,
  Settings,
  Shield,
  Bot,
  Sliders,
  Check,
  Key,
  Database,
  Cpu,
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">RepoLens Configuration</h3>
              <p className="text-[11px] text-slate-400">
                Configure 5-agent rules, semantic drift sensitivity, and model parameters.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Agent Sensitivity */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Review Agent Strictness
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
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Inter-Agent Cross Verification</div>
              <div className="text-[11px] text-slate-400">
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
            <span className="text-[10px] text-slate-500 font-mono">
              Lower detects subtle contract divergences; higher requires near-certain runtime failure.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
