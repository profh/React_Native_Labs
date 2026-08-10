import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

/**
 * Sound manager for game audio
 * Handles loading and playing sound effects
 */
class SoundManager {
  constructor() {
    if (SoundManager.instance) {
      return SoundManager.instance;
    }

    this.initialized = false;

    SoundManager.instance = this;
  }

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize audio system
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await setAudioModeAsync({
        allowsBackgroundRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        allowsRecording: false,
        shouldRouteThroughEarpiece: true
      });

      this.playerLaser = createAudioPlayer(require('../../assets/sounds/laser.mp3'));
      this.invaderLaser = createAudioPlayer(require('../../assets/sounds/laser.mp3'));

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize sound:', error);
    }
  }

  /**
   * Play a sound effect
   */
  playSound(side) {
    if (side === 'player') {
      this.playerLaser.seekTo(0);
      this.playerLaser.play();
    } else {
      this.invaderLaser.seekTo(0);
      this.invaderLaser.play();
    }
    
  }

  /**
   * Clean up sound resources
   */
  cleanup() {
    this.playerLaser.cleanup();
    this.invaderLaser.cleanup();
    this.initialized = false;
  }
}

export default SoundManager;