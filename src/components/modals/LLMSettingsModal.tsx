import React, { useState, useEffect } from 'react';
import { X, Cpu, Cloud, Check, AlertCircle, Download, ExternalLink } from 'lucide-react';
import { llmService } from '../../services/llm/llmService';
import { LLMProviderStatus, LLMProviderType } from '../../services/llm/types';

interface LLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LLMSettingsModal: React.FC<LLMSettingsModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<LLMProviderStatus | null>(null);
  const [activeProvider, setActiveProvider] = useState<LLMProviderType>('ollama');
  const [loading, setLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setActiveProvider(llmService.getActiveProvider());
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const providerStatus = await llmService.checkProviderStatus();
      setStatus(providerStatus);
    } catch (error) {
      console.error('Failed to check provider status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (provider: LLMProviderType) => {
    setLoading(true);
    try {
      const success = await llmService.setProvider(provider);
      if (success) {
        setActiveProvider(provider);
      } else {
        alert(`Failed to switch to ${provider}. Please check the provider is available.`);
      }
    } catch (error) {
      alert(`Error switching provider: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeminiKey = () => {
    if (!geminiApiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }
    
    alert('To save Gemini API key, add it to your .env file:\n\nVITE_GEMINI_API_KEY=' + geminiApiKey + '\n\nThen restart the application.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1117] rounded-2xl border border-[#30363d] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d1117] border-b border-[#30363d] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              LLM Provider Settings
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure local or cloud AI providers for repository analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Provider Status
            </h3>

            {/* Ollama */}
            <div
              onClick={() => status?.ollama.available && handleProviderChange('ollama')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeProvider === 'ollama' && status?.ollama.available
                  ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/30'
                  : status?.ollama.available
                  ? 'bg-[#161b22] border-[#30363d] hover:border-indigo-500/40'
                  : 'bg-[#161b22] border-[#30363d] opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    status?.ollama.available ? 'bg-indigo-500/20' : 'bg-slate-700/20'
                  }`}>
                    <Cpu className={`w-5 h-5 ${status?.ollama.available ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">Ollama (Local)</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        FREE • DEFAULT
                      </span>
                      {activeProvider === 'ollama' && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Run AI models locally with no API costs or rate limits
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {status?.ollama.available ? (
                        <>
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Running • {status.ollama.model}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-amber-400">{status?.ollama.error || 'Not running'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!status?.ollama.available && (
                <div className="mt-3 pt-3 border-t border-[#30363d] space-y-2">
                  <p className="text-xs text-slate-300">
                    📥 Install Ollama to run local AI models for free:
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="https://ollama.com/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Ollama
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        checkStatus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-medium transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    After installing, run: <code className="px-1 py-0.5 rounded bg-[#0d1117] text-indigo-300">ollama pull qwen2.5:3b</code>
                  </p>
                </div>
              )}
            </div>

            {/* Gemini */}
            <div
              onClick={() => status?.gemini.available && handleProviderChange('gemini')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeProvider === 'gemini' && status?.gemini.available
                  ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500/30'
                  : status?.gemini.available
                  ? 'bg-[#161b22] border-[#30363d] hover:border-purple-500/40'
                  : 'bg-[#161b22] border-[#30363d] opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    status?.gemini.available ? 'bg-purple-500/20' : 'bg-slate-700/20'
                  }`}>
                    <Cloud className={`w-5 h-5 ${status?.gemini.available ? 'text-purple-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">Google Gemini (Cloud)</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        FREE TIER
                      </span>
                      {activeProvider === 'gemini' && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Cloud-based AI with free tier for development
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {status?.gemini.available ? (
                        <>
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Configured • {status.gemini.model}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-400">{status?.gemini.error || 'Not configured'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!status?.gemini.hasApiKey && (
                <div className="mt-3 pt-3 border-t border-[#30363d] space-y-2">
                  <p className="text-xs text-slate-300">
                    🔑 Configure Gemini API key for cloud processing:
                  </p>
                  <input
                    type="password"
                    placeholder="Enter Gemini API Key..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                    >
                      Get Free API Key
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveGeminiKey();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-medium transition-colors"
                    >
                      Save Instructions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">💡 Recommendation</h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li>• <strong>Ollama (Local):</strong> Best for privacy, no costs, unlimited usage</li>
              <li>• <strong>Gemini (Cloud):</strong> Faster setup, no local installation needed</li>
              <li>• Both providers are 100% free for development use</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0d1117] border-t border-[#30363d] px-6 py-4 flex justify-end gap-2">
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
