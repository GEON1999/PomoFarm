import { Howl, Howler } from 'howler';
import { notificationService } from './notifications';

// Sound effect paths
const SOUND_PATHS = {
  // UI Sounds
  buttonClick: '/sounds/ui/button-click.mp3',
  buttonHover: '/sounds/ui/button-hover.mp3',
  notification: '/sounds/ui/notification.mp3',
  success: '/sounds/ui/success.mp3',
  error: '/sounds/ui/error.mp3',
  
  // Game Sounds
  plantSeed: '/sounds/game/plant-seed.mp3',
  waterPlant: '/sounds/game/water-plant.mp3',
  harvest: '/sounds/game/harvest.mp3',
  animalFeed: '/sounds/game/animal-feed.mp3',
  collectItem: '/sounds/game/collect-item.mp3',
  
  // Timer Sounds
  timerStart: '/sounds/timer/start.mp3',
  timerPause: '/sounds/timer/pause.mp3',
  timerComplete: '/sounds/timer/complete.mp3',
  timerTick: '/sounds/timer/tick.mp3',
  
  // Shop Sounds
  purchase: '/sounds/shop/purchase.mp3',
  gachaOpen: '/sounds/shop/gacha-open.mp3',
  rareItem: '/sounds/shop/rare-item.mp3',
  
  // Background Music
  bgmMain: '/sounds/music/main-theme.mp3',
  bgmFarm: '/sounds/music/farm-theme.mp3',
  bgmShop: '/sounds/music/shop-theme.mp3',
  bgmRelax: '/sounds/music/relax-theme.mp3',
} as const;

type SoundKey = keyof typeof SOUND_PATHS;
type MusicKey = 'bgmMain' | 'bgmFarm' | 'bgmShop' | 'bgmRelax';

interface SoundManagerOptions {
  soundVolume?: number;
  musicVolume?: number;
  soundEnabled?: boolean;
  musicEnabled?: boolean;
}

/**
 * Sound Manager class for handling all audio in the game
 */
class SoundManager {
  private static instance: SoundManager;
  private sounds: Record<string, Howl> = {};
  private currentMusic: Howl | null = null;
  private currentMusicKey: MusicKey | null = null;
  private options: Required<SoundManagerOptions> = {
    soundVolume: 0.7,
    musicVolume: 0.5,
    soundEnabled: true,
    musicEnabled: true,
  };
  private isInitialized = false;
  private isMuted = false;
  private audioContext: AudioContext | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the SoundManager
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize the sound manager with options
   */
  public async initialize(options: SoundManagerOptions = {}): Promise<void> {
    if (this.isInitialized) return;

    // Update options
    this.options = { ...this.options, ...options };

    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Set Howler volume
      Howler.volume(this.options.soundVolume);
      
      // Load essential sounds first
      await this.loadSounds([
        'buttonClick',
        'notification',
        'success',
        'error',
      ]);
      
      this.isInitialized = true;
      notificationService.info('Audio system initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      notificationService.error('Failed to initialize audio system');
    }
  }

  /**
   * Load a single sound
   */
  private loadSound(key: SoundKey): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip if already loaded
      if (this.sounds[key]) {
        resolve();
        return;
      }

      const sound = new Howl({
        src: [SOUND_PATHS[key]],
        volume: key.startsWith('bgm') ? this.options.musicVolume : this.options.soundVolume,
        preload: true,
        html5: true, // Required for streaming music
        onload: () => {
          console.log(`Sound loaded: ${key}`);
          resolve();
        },
        onloaderror: (_, error) => {
          console.error(`Failed to load sound: ${key}`, error);
          reject(new Error(`Failed to load sound: ${key}`));
        },
      });

      this.sounds[key] = sound;
    });
  }

  /**
   * Load multiple sounds
   */
  public async loadSounds(keys: SoundKey[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.loadSound(key)));
    } catch (error) {
      console.error('Error loading sounds:', error);
      throw error;
    }
  }

  /**
   * Play a sound effect
   */
  public play(key: SoundKey, options: {
    volume?: number;
    loop?: boolean;
    onEnd?: () => void;
  } = {}): number | null {
    if (!this.options.soundEnabled || this.isMuted) return null;
    
    const sound = this.sounds[key];
    if (!sound) {
      console.warn(`Sound not loaded: ${key}`);
      return null;
    }

    try {
      const soundId = sound.play();
      
      // Apply options
      if (options.volume !== undefined) {
        sound.volume(options.volume, soundId);
      }
      
      if (options.loop) {
        sound.loop(true, soundId);
      }
      
      if (options.onEnd) {
        sound.once('end', options.onEnd, soundId);
      }
      
      return soundId;
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
      return null;
    }
  }

  /**
   * Play background music
   */
  public playMusic(key: MusicKey, options: {
    fadeIn?: number;
    loop?: boolean;
    volume?: number;
  } = {}): void {
    if (!this.options.musicEnabled || this.isMuted) return;
    
    // Don't restart the same music
    if (this.currentMusicKey === key && this.currentMusic?.playing()) {
      return;
    }
    
    // Fade out current music if playing
    if (this.currentMusic) {
      const fadeOutDuration = options.fadeIn || 1000;
      this.currentMusic.fade(
        this.currentMusic.volume(),
        0,
        fadeOutDuration
      );
      
      // Stop after fade out
      setTimeout(() => {
        if (this.currentMusic) {
          this.currentMusic.stop();
        }
      }, fadeOutDuration);
    }
    
    // Load and play new music if not already loaded
    if (!this.sounds[key]) {
      this.loadSound(key).then(() => {
        this.playMusic(key, options);
      }).catch(error => {
        console.error(`Failed to load music: ${key}`, error);
      });
      return;
    }
    
    // Play the new music
    const music = this.sounds[key];
    this.currentMusic = music;
    this.currentMusicKey = key;
    
    const volume = options.volume ?? this.options.musicVolume;
    
    if (options.fadeIn) {
      music.volume(0).play();
      music.fade(0, volume, options.fadeIn);
    } else {
      music.volume(volume).play();
    }
    
    if (options.loop !== false) {
      music.loop(true);
    }
  }

  /**
   * Stop all sounds and music
   */
  public stopAll(): void {
    Howler.stop();
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  /**
   * Stop a specific sound
   */
  public stop(key: SoundKey): void {
    const sound = this.sounds[key];
    if (sound) {
      sound.stop();
      
      if (this.currentMusicKey === key) {
        this.currentMusic = null;
        this.currentMusicKey = null;
      }
    }
  }

  /**
   * Set the master volume for sound effects
   */
  public setSoundVolume(volume: number): void {
    this.options.soundVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.options.soundVolume);
  }

  /**
   * Set the volume for background music
   */
  public setMusicVolume(volume: number): void {
    this.options.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(this.options.musicVolume);
    }
  }

  /**
   * Toggle sound effects on/off
   */
  public toggleSound(enabled?: boolean): boolean {
    this.options.soundEnabled = enabled ?? !this.options.soundEnabled;
    return this.options.soundEnabled;
  }

  /**
   * Toggle background music on/off
   */
  public toggleMusic(enabled?: boolean): boolean {
    this.options.musicEnabled = enabled ?? !this.options.musicEnabled;
    
    if (this.options.musicEnabled && this.currentMusicKey) {
      this.playMusic(this.currentMusicKey);
    } else if (this.currentMusic) {
      this.currentMusic.pause();
    }
    
    return this.options.musicEnabled;
  }

  /**
   * Toggle mute all sounds
   */
  public toggleMute(muted?: boolean): boolean {
    this.isMuted = muted ?? !this.isMuted;
    
    if (this.isMuted) {
      Howler.mute(true);
      if (this.currentMusic) {
        this.currentMusic.pause();
      }
    } else {
      Howler.mute(false);
      if (this.options.musicEnabled && this.currentMusicKey) {
        this.playMusic(this.currentMusicKey);
      }
    }
    
    return this.isMuted;
  }

  /**
   * Get the current options
   */
  public getOptions(): Readonly<SoundManagerOptions> {
    return { ...this.options };
  }

  /**
   * Preload all game sounds (for loading screen)
   */
  public async preloadAllSounds(onProgress?: (progress: number) => void): Promise<void> {
    const soundKeys = Object.keys(SOUND_PATHS) as SoundKey[];
    const totalSounds = soundKeys.length;
    let loadedCount = 0;
    
    // Update progress for already loaded sounds
    soundKeys.forEach(key => {
      if (this.sounds[key]) {
        loadedCount++;
        onProgress?.(loadedCount / totalSounds);
      }
    });
    
    // Load remaining sounds
    for (const key of soundKeys) {
      if (!this.sounds[key]) {
        try {
          await this.loadSound(key);
          loadedCount++;
          onProgress?.(loadedCount / totalSounds);
        } catch (error) {
          console.error(`Failed to preload sound: ${key}`, error);
        }
      }
    }
  }
}

// Export a singleton instance
export const soundManager = SoundManager.getInstance();

export default soundManager;
