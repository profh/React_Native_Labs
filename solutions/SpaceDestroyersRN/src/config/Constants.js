/**
 * Game configuration constants
 * Centralized configuration makes it easy to tune gameplay and maintain consistency
 */

const Constants = {
  Game: {
    maxLevels: 3,
    screenWidth: 375,
    screenHeight: 667,
    fps: 60,
  },

  Invader: {
    rows: 4,
    initialSpeed: 2,
    invadersPerLevelBase: 4,
    invadersPerLevelMultiplier: 2,
    horizontalSpacing: 10,
    verticalSpacing: 60,
    widthMultiplier: 1.5,
    dropDistance: 10,
    fireInterval: 1500, // milliseconds
    imageTypeRange: { min: 1, max: 3 },
    width: 30,
    height: 30,
  },

  Player: {
    lives: 3,
    width: 40,
    height: 40,
    bottomOffset: 50,
    fireInterval: 500, // milliseconds
    respawnDelay: 1000, // milliseconds
    bullet: {
      speed: 5,
      width: 5,
      height: 20,
      color: '#00FF00',
    },
  },

  InvaderBullet: {
    speed: 3,
    width: 5,
    height: 20,
    color: '#FF0000',
  },

  Input: {
    accelerometerUpdateInterval: 100,
    tiltSensitivity: 15,
    maxSpeed: 300,
  },

  Layout: {
    leftBounds: 20,
    rightBounds: 355,
  },

  CollisionCategories: {
    invader: 1,
    player: 2,
    invaderBullet: 4,
    playerBullet: 8,
    edgeBody: 16,
  },
};

export default Constants;