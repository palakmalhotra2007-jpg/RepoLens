import { AgentId } from '../types/agents';
import { AgentVoiceProfile, VoiceSettings } from '../types/voice';

export const defaultAgentVoiceProfiles: Record<AgentId, AgentVoiceProfile> = {
  security: {
    agentId: 'security',
    pitch: 0.9,
    rate: 1.05,
    lang: 'en-US',
    gender: 'male',
    toneDescription: 'Firm, assertive security analyst voice',
  },
  performance_db: {
    agentId: 'performance_db',
    pitch: 1.1,
    rate: 1.15,
    lang: 'en-US',
    gender: 'male',
    toneDescription: 'Fast-paced, metric-focused optimizer voice',
  },
  code_quality_arch: {
    agentId: 'code_quality_arch',
    pitch: 1.0,
    rate: 1.0,
    lang: 'en-US',
    gender: 'female',
    toneDescription: 'Methodical, structured software architect voice',
  },
  testing_reliability: {
    agentId: 'testing_reliability',
    pitch: 1.15,
    rate: 1.05,
    lang: 'en-US',
    gender: 'female',
    toneDescription: 'Precise, cautious QA reliability engineer voice',
  },
  git_merge: {
    agentId: 'git_merge',
    pitch: 0.95,
    rate: 1.0,
    lang: 'en-US',
    gender: 'male',
    toneDescription: 'Pragmatic, release engineer voice',
  },
  orchestrator: {
    agentId: 'orchestrator',
    pitch: 1.0,
    rate: 1.0,
    lang: 'en-US',
    gender: 'neutral',
    toneDescription: 'Authoritative consensus synthesis voice',
  },
  final_reviewer: {
    agentId: 'final_reviewer',
    pitch: 0.95,
    rate: 0.98,
    lang: 'en-US',
    gender: 'neutral',
    toneDescription: 'Executive sign-off verdict voice',
  },
};

export class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public speak(
    text: string,
    agentId: AgentId = 'orchestrator',
    settings?: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this environment.');
      onEnd?.();
      return;
    }

    this.stopSpeaking();

    const cleanText = text.replace(/[*#`_~[\]]/g, '').trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const profile = settings?.agentProfiles?.[agentId] || defaultAgentVoiceProfiles[agentId] || defaultAgentVoiceProfiles.orchestrator;

    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    utterance.volume = settings?.globalVolume ?? 1.0;

    const voices = this.getAvailableVoices();
    if (voices.length > 0) {
      // Pick voice based on agent characteristics
      let matchedVoice = voices.find(v => v.lang.startsWith('en'));
      if (profile.gender === 'female') {
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('victoria'));
        if (femaleVoice) matchedVoice = femaleVoice;
      } else if (profile.gender === 'male') {
        const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('george'));
        if (maleVoice) matchedVoice = maleVoice;
      }
      if (matchedVoice) utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public startListening(
    onResult: (transcript: string) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition API is not supported in this browser. Please use Chrome/Edge or type your question.');
      onError?.(new Error('SpeechRecognition not supported'));
      return false;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event);
        this.isListening = false;
        onError?.(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd?.();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      this.isListening = false;
      onError?.(err);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceEngine = new VoiceEngine();
