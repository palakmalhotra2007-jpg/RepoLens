import React, { useState, useEffect } from 'react';
import { X, Cpu, Cloud, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { llmService } from '../../services/llm/llmService';
import { LLMProviderStatus, LLMProviderType } from '../../services/llm/types';
import { Button, Badge } from '../../frontend';

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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-[8px] border border-border-default max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface border-b border-border-default px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
              <Cpu strokeWidth={1.5} className="w-4 h-4 text-text-secondary" />
              LLM Provider Settings
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Configure local or cloud AI providers for repository analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-surface-2 rounded-[6px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Status */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.04em]">
              Provider Status
            </h3>

            {/* Ollama */}
            <div
              onClick={() => status?.ollama.available && handleProviderChange('ollama')}
              className={`p-4 rounded-[6px] border transition-colors cursor-pointer ${
                activeProvider === 'ollama' && status?.ollama.available
                  ? 'bg-bg-surface-2 border-accent'
                  : status?.ollama.available
                  ? 'bg-bg-surface-2 border-border-default hover:border-border-strong'
                  : 'bg-bg-surface-2 border-border-default opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Cpu strokeWidth={1.5} className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary text-xs">Ollama (Local AI)</h4>
                      <Badge variant="good">Recommended</Badge>
                      {activeProvider === 'ollama' && (
                        <Check strokeWidth={1.5} className="w-4 h-4 text-status-good" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Local LLM running on your machine (100% private, zero cost)
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {status?.ollama.available ? (
                        <div className="flex items-center gap-1.5 text-status-good text-xs">
                          <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
                          <span>Connected • {status.ollama.model}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
                          <AlertCircle strokeWidth={1.5} className="w-3.5 h-3.5" />
                          <span>{status?.ollama.error || 'Not running'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini */}
            <div
              onClick={() => status?.gemini.available && handleProviderChange('gemini')}
              className={`p-4 rounded-[6px] border transition-colors cursor-pointer ${
                activeProvider === 'gemini' && status?.gemini.available
                  ? 'bg-bg-surface-2 border-accent'
                  : status?.gemini.available
                  ? 'bg-bg-surface-2 border-border-default hover:border-border-strong'
                  : 'bg-bg-surface-2 border-border-default opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Cloud strokeWidth={1.5} className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary text-xs">Google Gemini (Cloud)</h4>
                      <Badge variant="neutral">Free Tier</Badge>
                      {activeProvider === 'gemini' && (
                        <Check strokeWidth={1.5} className="w-4 h-4 text-status-good" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Cloud-based AI with free tier for development
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {status?.gemini.available ? (
                        <div className="flex items-center gap-1.5 text-status-good text-xs">
                          <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
                          <span>Configured • {status.gemini.model}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
                          <AlertCircle strokeWidth={1.5} className="w-3.5 h-3.5" />
                          <span>{status?.gemini.error || 'Not configured'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!status?.gemini.hasApiKey && (
                <div className="mt-3 pt-3 border-t border-border-default space-y-2">
                  <p className="text-xs text-text-secondary">
                    Configure Gemini API key for cloud processing:
                  </p>
                  <input
                    type="password"
                    placeholder="Enter Gemini API Key..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-[6px] bg-bg-surface border border-border-default text-text-primary text-xs focus:outline-none focus:border-border-strong font-mono"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-bg-surface-2 hover:bg-[#262B31] border border-border-strong text-text-primary text-xs font-medium transition-colors"
                    >
                      Get Free API Key
                      <ExternalLink strokeWidth={1.5} className="w-3 h-3" />
                    </a>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveGeminiKey();
                      }}
                    >
                      Save Instructions
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-[6px] bg-bg-surface-2 border border-border-default">
            <h4 className="text-xs font-semibold text-text-primary mb-1.5">Recommendation</h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• <strong>Ollama (Local):</strong> Best for privacy, no costs, unlimited usage</li>
              <li>• <strong>Gemini (Cloud):</strong> Faster setup, no local installation needed</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-surface border-t border-border-default px-6 py-4 flex justify-end gap-2">
          <Button
            variant="primary"
            onClick={checkStatus}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
