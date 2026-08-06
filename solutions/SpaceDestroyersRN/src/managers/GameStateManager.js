import Constants from '../config/Constants';

/**
 * Singleton class managing global game state
 * Centralizes level progression and game state to avoid global variables
 */
class GameStateManager {
  constructor() {
    // Implement singleton pattern
    if (GameStateManager.instance) {
      return GameStateManager.instance;
    }

    this.currentLevel = 1;
    this.score = 0;
    this.lives = Constants.Player.lives;

    GameStateManager.instance = this;
  }

  /**
   * Get the singleton instance
   */
  static getInstance() {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Advance to the next level
   */
  advanceToNextLevel() {
    this.currentLevel += 1;
  }

  /**
   * Reset to level 1
   */
  resetLevel() {
    this.currentLevel = 1;
  }

  /**
   * Check if maximum level has been reached
   */
  isMaxLevelReached() {
    return this.currentLevel > Constants.Game.maxLevels;
  }

  /**
   * Reset the entire game state
   */
  resetGame() {
    this.currentLevel = 1;
    this.score = 0;
    this.lives = Constants.Player.lives;
  }

  /**
   * Add to the player's score
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Decrease player lives
   */
  loseLife() {
    this.lives -= 1;
    return this.lives;
  }

  /**
   * Get current game state
   */
  getState() {
    return {
      currentLevel: this.currentLevel,
      score: this.score,
      lives: this.lives,
    };
  }
}

export default GameStateManager;