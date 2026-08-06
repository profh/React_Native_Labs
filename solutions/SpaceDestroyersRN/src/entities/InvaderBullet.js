import Bullet from './Bullet';
import Constants from '../config/Constants';

/**
 * Invader bullet - travels downward
 * Extends base Bullet class with invader-specific behavior
 */
class InvaderBullet extends Bullet {
  constructor(x, y) {
    const { speed, width, height, color } = Constants.InvaderBullet;

    super(
      x - width / 2,
      y,
      speed, // positive speed for downward movement
      width,
      height,
      color,
      Constants.CollisionCategories.invaderBullet,
      Constants.CollisionCategories.player
    );
  }
}

export default InvaderBullet;