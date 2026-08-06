import Constants from '../config/Constants';

/**
 * Invader entity
 * Manages invader state, position, and image variant
 */
class Invader {
  constructor(row, column, x, y) {
    this.id = `invader_${row}_${column}`;
    this.row = row;
    this.column = column;
    this.x = x;
    this.y = y;
    this.width = Constants.Invader.width;
    this.height = Constants.Invader.height;
    this.shouldRemove = false;
    this.categoryBitMask = Constants.CollisionCategories.invader;
    this.contactTestBitMask = Constants.CollisionCategories.playerBullet;

    // Random invader image (1, 2, or 3)
    const { min, max } = Constants.Invader.imageTypeRange;
    this.imageType = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Update invader position
   */
  move(dx, dy = 0) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Check if invader has reached screen edge
   */
  isAtEdge(leftBound, rightBound) {
    const halfWidth = (Constants.Invader.widthMultiplier * this.width) / 2;
    return this.x < leftBound + halfWidth || this.x > rightBound - halfWidth;
  }

  /**
   * Get bullet spawn position (center bottom of invader)
   */
  getBulletSpawnPosition() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height,
    };
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
   * Mark invader for removal
   */
  remove() {
    this.shouldRemove = true;
  }
}

export default Invader;