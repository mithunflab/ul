// Voice Service for ElevenLabs Integration
// Handles both Text-to-Speech and Speech-to-Text functionality

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
  labels?: { [key: string]: string };
}

export interface SpeechToTextResult {
  text: string;
  language_code?: string;
  language_probability?: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    type: 'word' | 'spacing' | 'audio_event';
    speaker_id?: string;
  }>;
}

export interface VoiceServiceConfig {
  apiKey: string;
  baseUrl?: string;
}

export class VoiceService {
  private apiKey: string;
  private baseUrl: string;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: Blob[] = [];
  private isRecording = false;

  // Default voice settings optimized for conversational AI
  private defaultVoiceSettings: VoiceSettings = {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true
  };

  // Popular voice IDs for quick access
  public static readonly VOICES = {
    RACHEL: 'JBFqnCBsd6RMkjVDRZzb', // Female, American
    ADAM: 'pNInz6obpgDQGcFmaJgB',   // Male, American
    ANTONI: 'ErXwobaYiN019PkySvjV',  // Male, American
    ARNOLD: 'VR6AewLTigWG4xSOukaG',  // Male, American
    BELLA: 'EXAVITQu4vr4xnSDxMaL',   // Female, American
    DOMI: 'AZnzlk1XvdvUeBnXmlld',    // Female, American
    ELLI: 'MF3mGyEYCl7XYWbV9V6O',    // Female, American
    JOSH: 'TxGEqnHWrfWFTfGW9XjX',    // Male, American
    SAM: 'yoZ06aMxZJJ28mfd3POQ'      // Male, American
  } as const;

  constructor(config: VoiceServiceConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io/v1';
    
    // Initialize AudioContext for better audio handling
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(
    text: string,
    voiceId: string = VoiceService.VOICES.RACHEL,
    options: {
      model?: string;
      voiceSettings?: Partial<VoiceSettings>;
      outputFormat?: string;
      streaming?: boolean;
    } = {}
  ): Promise<Blob | ReadableStream> {
    const {
      model = 'eleven_flash_v2_5', // Fast, low-latency model
      voiceSettings = {},
      outputFormat = 'mp3_44100_128',
      streaming = false
    } = options;

    const finalVoiceSettings = {
      ...this.defaultVoiceSettings,
      ...voiceSettings
    };

    const requestBody = {
      text,
      model_id: model,
      voice_settings: finalVoiceSettings,
      output_format: outputFormat
    };

    const endpoint = streaming 
      ? `${this.baseUrl}/text-to-speech/${voiceId}/stream`
      : `${this.baseUrl}/text-to-speech/${voiceId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS API error: ${response.status} - ${error}`);
      }

      if (streaming && response.body) {
        return response.body;
      } else {
        return await response.blob();
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error(`Failed to convert text to speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream text to speech and play immediately
   */
  async streamAndPlayTTS(
    text: string,
    voiceId: string = VoiceService.VOICES.RACHEL,
    options: {
      model?: string;
      voiceSettings?: Partial<VoiceSettings>;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<HTMLAudioElement> {
    const { onStart, onEnd, onError } = options;

    try {
      onStart?.();

      const audioBlob = await this.textToSpeech(text, voiceId, {
        ...options,
        streaming: false // Use non-streaming for simplicity in web apps
      }) as Blob;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        const error = new Error('Audio playback failed');
        onError?.(error);
      };

      await audio.play();
      return audio;

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown TTS error');
      onError?.(err);
      throw err;
    }
  }

  /**
   * Start recording audio for speech-to-text
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.recordingChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  /**
   * Stop recording and return the audio blob
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Not currently recording');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not available'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        this.recordingChunks = [];
        this.isRecording = false;
        
        // Stop all tracks to release microphone
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error(`Recording failed: ${event}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Convert speech to text using ElevenLabs Scribe API
   */
  async speechToText(
    audioBlob: Blob,
    options: {
      model?: string;
      language?: string;
      response_format?: 'json' | 'verbose_json';
    } = {}
  ): Promise<SpeechToTextResult> {
    const {
      model = 'scribe_v1',
      response_format = 'json'
    } = options;

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model_id', model);
    formData.append('response_format', response_format);

    try {
      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs STT API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw new Error(`Failed to convert speech to text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record audio and convert to text in one step
   */
  async recordAndTranscribe(
    options: {
      maxDuration?: number;
      onRecordingStart?: () => void;
      onRecordingStop?: () => void;
      onTranscriptionStart?: () => void;
      onTranscriptionComplete?: (text: string) => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<string> {
    const {
      maxDuration = 30000, // 30 seconds max
      onRecordingStart,
      onRecordingStop,
      onTranscriptionStart,
      onTranscriptionComplete,
      onError
    } = options;

    try {
      onRecordingStart?.();
      await this.startRecording();

      // Auto-stop after maxDuration
      const timeoutId = setTimeout(async () => {
        if (this.isRecording) {
          await this.stopRecording();
        }
      }, maxDuration);

      // Wait for manual stop or timeout
      const audioBlob = await this.stopRecording();
      clearTimeout(timeoutId);
      
      onRecordingStop?.();
      onTranscriptionStart?.();

      const result = await this.speechToText(audioBlob);
      const text = result.text.trim();
      
      onTranscriptionComplete?.(text);
      return text;

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown recording error');
      onError?.(err);
      throw err;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];

    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }

  /**
   * Check if browser supports required features
   */
  static checkBrowserSupport(): {
    mediaRecorder: boolean;
    audioContext: boolean;
    getUserMedia: boolean;
    webAudio: boolean;
  } {
    return {
      mediaRecorder: typeof MediaRecorder !== 'undefined',
      audioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webAudio: typeof Audio !== 'undefined'
    };
  }

  /**
   * Get current recording status
   */
  get recordingStatus(): {
    isRecording: boolean;
    isSupported: boolean;
  } {
    return {
      isRecording: this.isRecording,
      isSupported: VoiceService.checkBrowserSupport().mediaRecorder
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// Export singleton instance factory
let voiceServiceInstance: VoiceService | null = null;

export const createVoiceService = (config: VoiceServiceConfig): VoiceService => {
  if (!voiceServiceInstance) {
    voiceServiceInstance = new VoiceService(config);
  }
  return voiceServiceInstance;
};

export const getVoiceService = (): VoiceService | null => {
  return voiceServiceInstance;
};

// Helper function to check if ElevenLabs API key is configured
export const isVoiceServiceConfigured = (): boolean => {
  return !!(
    typeof process !== 'undefined' && 
    process.env && 
    process.env.ELEVENLABS_API_KEY
  ) || !!(
    typeof import.meta !== 'undefined' && 
    import.meta.env && 
    import.meta.env.VITE_ELEVENLABS_API_KEY
  );
};

 