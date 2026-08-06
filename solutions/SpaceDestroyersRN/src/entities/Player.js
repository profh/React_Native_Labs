import Constants from '../config/Constants';

/**
 * Player entity
 * Manages player state, movement, and shooting
 */
class Player {
  constructor(screenWidth, screenHeight) {
    this.id = 'player';
    this.width = Constants.Player.width;
    this.height = Constants.Player.height;
    this.x = (screenWidth - this.width) / 2;
    this.y = screenHeight - this.height - Constants.Player.bottomOffset;
    this.velocityX = 0;
    this.isAlive = true;
    this.lastFireTime = 0;
    this.imageIndex = 1; // Alternates between 1 and 2
    this.categoryBitMask = Constants.CollisionCategories.player;
    this.contactTestBitMask = Constants.CollisionCategories.invaderBullet | Constants.CollisionCategories.invader;
    this.screenWidth = screenWidth;
  }

  /**
   * Update player position based on velocity
   */
  update() {
    this.x += this.velocityX;

    // Keep player within screen bounds
    const leftBound = Constants.Layout.leftBounds;
    const rightBound = this.screenWidth - this.width - 20;

    if (this.x < leftBound) {
      this.x = leftBound;
    } else if (this.x > rightBound) {
      this.x = rightBound;
    }
  }

  /**
   * Set player velocity from accelerometer data
   */
  setVelocity(accelerationX) {
    this.velocityX = accelerationX * Constants.Input.tiltSensitivity;

    // Clamp velocity
    const maxSpeed = Constants.Input.maxSpeed / Constants.Game.fps;
    if (this.velocityX > maxSpeed) {
      this.velocityX = maxSpeed;
    } else if (this.velocityX < -maxSpeed) {
      this.velocityX = -maxSpeed;
    }
  }

  /**
   * Check if player can fire (rate limiting)
   */
  canFire() {
    const now = Date.now();
    if (now - this.lastFireTime > Constants.Player.fireInterval) {
      this.lastFireTime = now;
      return true;
    }
    return false;
  }

  /**
   * Get bullet spawn position (center top of player)
   */
  getBulletSpawnPosition() {
    return {
      x: this.x + this.width / 2,
      y: this.y,
    };
  }

  /**
   * Toggle player image for animation effect
   */
  toggleImage() {
    this.imageIndex = this.imageIndex === 1 ? 2 : 1;
  }

  /**
   * Get bounding box for collision detection
   */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  /**
   * Handle player death
   */
  kill() {
    this.isAlive = false;
  }

  /**
   * Respawn player
   */
  respawn(screenWidth, screenHeight) {
    this.x = (screenWidth - this.width) / 2;
    this.y = screenHeight - this.height - Constants.Player.bottomOffset;
    this.velocityX = 0;
    this.isAlive = true;
    this.imageIndex = 1;
  }
}

export default Player;