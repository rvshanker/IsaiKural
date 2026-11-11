// High-Fidelity Human Audio Player for Thirukkural recitation
import { audioUrlFor } from '../config';
// Universal compatibility for Mobile (iOS Safari, Android Chrome) and Desktop

export type KuralVoice = 'Charon' | 'Kore';

export interface AudioState {
  kuralNumber: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  voice: KuralVoice;
}

type AudioStateListener = (state: AudioState) => void;

class KuralAudioPlayer {
  private currentKuralNumber: number | null = null;
  private isPlaying = false;
  private isLoading = false;
  private currentVoice: KuralVoice = 'Charon';
  private listeners: Set<AudioStateListener> = new Set();
  
  // Reusable audio element and Web Audio API context for mobile gesture unlocking
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentObjectUrl: string | null = null;
  private activeRequestId = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('thirukkural_voice_preference');
        if (saved && (saved === 'Charon' || saved === 'Kore')) {
          this.currentVoice = saved as KuralVoice;
        }
      } catch {
        // ignore
      }

      // Initialize persistent HTMLAudioElement
      try {
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';
      } catch {
        // ignore
      }
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener({
      kuralNumber: this.currentKuralNumber,
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      error: null,
      voice: this.currentVoice,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(error: string | null = null) {
    const state: AudioState = {
      kuralNumber: this.currentKuralNumber,
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      error,
      voice: this.currentVoice,
    };
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error notifying audio listener:', err);
      }
    });
  }

  public setVoice(voice: KuralVoice) {
    if (this.currentVoice === voice) return;
    this.currentVoice = voice;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('thirukkural_voice_preference', voice);
      } catch {
        // ignore
      }
    }
    if (this.isPlaying || this.isLoading) {
      this.stop();
    } else {
      this.notify();
    }
  }

  public getVoice(): KuralVoice {
    return this.currentVoice;
  }

  private getOrCreateAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx && AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public async playKural(kuralNumber: number, line1: string, line2: string) {
    // If the same kural is currently playing or loading, toggle to stop
    if (this.currentKuralNumber === kuralNumber && (this.isPlaying || this.isLoading)) {
      this.stop();
      return;
    }

    this.stop();

    const requestId = ++this.activeRequestId;
    this.currentKuralNumber = kuralNumber;
    this.isLoading = true;
    this.isPlaying = false;
    this.notify();

    // 1. Immediately unlock browser audio context synchronously within the user-click event frame
    const ctx = this.getOrCreateAudioContext();
    if (this.audioElement) {
      // Warm up HTMLAudioElement
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {
        // ignore
      }
    }

    // Pre-recorded MP3 shipped with the site: public/audio/0001.mp3 … 1330.mp3
    const ttsUrl = audioUrlFor(kuralNumber);

    try {
      // 2. Fetch the audio buffer via HTTP - avoids iOS AVPlayer streaming & Range bugs
      const response = await fetch(ttsUrl);
      if (requestId !== this.activeRequestId) return; // User stopped or switched kural

      if (!response.ok) {
        throw new Error(`குரல் ஏற்றுவதில் தாமதம் (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      if (requestId !== this.activeRequestId) return;

      if (!blob || blob.size < 500) {
        throw new Error('ஒலிக் கோப்பு முழுமையாகப் பெறப்படவில்லை');
      }

      // 3. First priority: Play via in-memory Object URL (fast & native)
      const objectUrl = URL.createObjectURL(blob);
      this.currentObjectUrl = objectUrl;

      let playedViaAudioElement = false;

      if (this.audioElement) {
        try {
          this.audioElement.src = objectUrl;
          this.audioElement.onended = () => {
            if (this.activeRequestId === requestId) {
              this.isPlaying = false;
              this.isLoading = false;
              this.currentKuralNumber = null;
              this.cleanupObjectUrl();
              this.notify();
            }
          };
          this.audioElement.onerror = () => {
            // If HTMLAudio fails, attempt Web Audio API buffer fallback
            this.playViaWebAudio(blob, requestId);
          };

          await this.audioElement.play();
          if (this.activeRequestId === requestId) {
            playedViaAudioElement = true;
            this.isLoading = false;
            this.isPlaying = true;
            this.notify();
          }
        } catch {
          // Playback promise was rejected (common on iOS when unmuted after fetch)
          playedViaAudioElement = false;
        }
      }

      // 4. Fallback: If HTMLAudioElement couldn't start, decode directly with Web Audio API
      if (!playedViaAudioElement && this.activeRequestId === requestId) {
        await this.playViaWebAudio(blob, requestId);
      }
    } catch (err: any) {
      if (this.activeRequestId === requestId) {
        console.warn('Audio recitation playback error:', err?.message || err);
        this.isPlaying = false;
        this.isLoading = false;
        this.currentKuralNumber = null;
        this.cleanupObjectUrl();
        this.notify('குரல் ஏற்றுவதில் தற்காலிகத் தாமதம். மீண்டும் ஒருமுறை தொடவும்.');
      }
    }
  }

  private async playViaWebAudio(blob: Blob, requestId: number) {
    try {
      const ctx = this.getOrCreateAudioContext();
      if (!ctx) {
        throw new Error('Web Audio API not supported on this browser');
      }

      const arrayBuffer = await blob.arrayBuffer();
      if (this.activeRequestId !== requestId) return;

      // Decode audio data into native hardware PCM buffer
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (this.activeRequestId !== requestId) return;

      if (this.currentSourceNode) {
        try {
          this.currentSourceNode.stop();
          this.currentSourceNode.disconnect();
        } catch {
          // ignore
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => {
        if (this.activeRequestId === requestId) {
          this.isPlaying = false;
          this.isLoading = false;
          this.currentKuralNumber = null;
          this.currentSourceNode = null;
          this.cleanupObjectUrl();
          this.notify();
        }
      };

      source.start(0);
      this.currentSourceNode = source;
      this.isLoading = false;
      this.isPlaying = true;
      this.notify();
    } catch (err: any) {
      if (this.activeRequestId === requestId) {
        console.warn('Web Audio fallback failed:', err);
        this.isPlaying = false;
        this.isLoading = false;
        this.currentKuralNumber = null;
        this.cleanupObjectUrl();
        this.notify('குரல் ஏற்றுவதில் தாமதம். மீண்டும் ஒருமுறை தொடவும்.');
      }
    }
  }

  private cleanupObjectUrl() {
    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {
        // ignore
      }
      this.currentObjectUrl = null;
    }
  }

  public stop() {
    this.activeRequestId++;

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.onended = null;
        this.audioElement.onerror = null;
        this.audioElement.src = '';
      } catch {
        // ignore
      }
    }

    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.currentSourceNode = null;
    }

    this.cleanupObjectUrl();
    this.isPlaying = false;
    this.isLoading = false;
    this.currentKuralNumber = null;
    this.notify();
  }

  public getCurrentKuralNumber(): number | null {
    return this.currentKuralNumber;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const kuralAudio = new KuralAudioPlayer();
