import Bullet from './Bullet';
import Constants from '../config/Constants';

/**
 * Player bullet - travels upward
 * Extends base Bullet class with player-specific behavior
 */
class PlayerBullet extends Bullet {
  constructor(x, y) {
    const { speed, width, height, color } = Constants.Player.bullet;

    super(
      x - width / 2,
      y,
      -speed, // negative speed for upward movement
      width,
      height,
      color,
      Constants.CollisionCategories.playerBullet,
      Constants.CollisionCategories.invader
    );
  }
}

export default PlayerBullet;