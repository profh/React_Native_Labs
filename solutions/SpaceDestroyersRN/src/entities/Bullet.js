/**
 * Base class for all bullet types
 * Provides common bullet behavior and properties
 */
class Bullet {
  constructor(x, y, speed, width, height, color, categoryBitMask, contactTestBitMask) {
    this.id = `bullet_${Date.now()}_${Math.random()}`;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.color = color;
    this.categoryBitMask = categoryBitMask;
    this.contactTestBitMask = contactTestBitMask;
    this.shouldRemove = false;
  }

  /**
   * Update bullet position
   */
  update() {
    this.y += this.speed;
  }

  /**
   * Check if bullet is off screen
   */
  isOffScreen(screenHeight) {
    return this.y < -this.height || this.y > screenHeight + this.height;
  }

  /**
   * Mark bullet for removal
   */
  remove() {
    this.shouldRemove = true;
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
}

export default Bullet;