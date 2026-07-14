# Lab 10: Space Destroyers (React Native)

For the final lab of the semester, you'll be building **Space Destroyers**, a classic arcade-style game for iOS and Android using React Native! (In the early 80s there was a popular video game called Space Invaders; this is a variation of that game from my younger days. 😏) This lab brings together everything you've learned about mobile development and introduces you to professional code organization practices used in real-world React Native apps. Here's a glimpse of what we are going to build.

<p align="center">
  <img src="https://i.imgur.com/hOKHyf8.png" width="35%">
</p>


## Project Architecture Overview

This project is organized following modern React Native development best practices. As we discussed in class, we are splitting up our code into logical modules so that functionality is grouped appropriately and can be easily understood and accessed. (If we didn't do that, we'd have one massive file that's impossible to maintain. 😣) Here's a tree of our structure to help you see the big picture:

```
SpaceDestroyersRN/
├── src/
│   ├── config/
│   │   └── Constants.js              # All game configuration values
│   ├── managers/
│   │   └── GameStateManager.js       # Manages level progression & state
│   ├── entities/
│   │   ├── Bullet.js                 # Base bullet class
│   │   ├── PlayerBullet.js           # Player's bullets
│   │   ├── InvaderBullet.js          # Enemy bullets
│   │   ├── Player.js                 # Player ship logic
│   │   └── Invader.js                # Enemy invader logic
│   ├── screens/
│   │   ├── StartScreen.js            # Opening menu screen
│   │   ├── GameScreen.js             # Main game screen
│   │   └── LevelCompleteScreen.js    # Between-level screen
│   ├── navigation/
│   │   └── AppNavigator.js           # Screen navigation setup
│   └── utils/
│       ├── CollisionDetection.js     # Collision detection logic
│       └── SoundManager.js           # Sound effect management
├── assets/
│   ├── images/                       # Game sprites and UI images
│   └── sounds/                       # Sound effects
├── App.js                            # Application entry point
├── package.json                      # Dependencies
└── app.json                          # Expo configuration
```

---

## Part 1: Project Setup

### 1.1 Install Prerequisites

Before we begin, make sure you have the following installed:

1. **Node.js** (v14 or newer) - Download from [nodejs.org](https://nodejs.org)
2. **Expo CLI** - Install globally:
   ```bash
   npm install -g expo-cli
   ```
3. **Expo Go App** - Install on your iOS/Android device from the App Store/Play Store

### 1.2 Create the Project

1. Navigate to your workspace directory in Terminal
2. Create the project directory:
   ```bash
   mkdir SpaceDestroyersRN
   cd SpaceDestroyersRN
   ```
3. Copy the provided project files into this directory (or create them following this lab)

### 1.3 Install Dependencies

1. Install all required packages:
   ```bash
   npm install
   ```
2. This will install:
   - Expo SDK
   - React Navigation
   - Expo Accelerometer (for tilt controls)
   - Expo AV (for sound)
   - Other supporting libraries

### 1.4 Add Assets

1. Download the [image assets](https://67443.cmuis.net/files/67442/lab9images.zip)
2. Extract and place them in `assets/images/`
3. Place the `laser.mp3` sound file in `assets/sounds/`

---

## Part 2: Core Architecture Components

### 2.1 Constants File

There are a lot of values we will have to use to manage the game and gameplay, and we will be tweaking and adjusting depending on the feedback we get from user tests. Centralizing these constants makes it easy to balance gameplay and change values without hunting through code later. Create `src/config/Constants.js` and add the following:

```javascript
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
```

### 2.2 Game State Manager

Encapsulating state in a manager prevents bugs from global variables and makes testing easier. This is the JavaScript equivalent of the singleton pattern we used in the Swift version of this lab. Create `src/managers/GameStateManager.js` and add the following:

```javascript
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
```

---

## Part 3: Building the Game Entities

### 3.1 Bullet Base Class

Everything in this game depends on bullets -- we use them to shoot at the invaders and they use them to shoot at us. Since there's a lot of commonality, let's create a parent class for all bullets. Create `src/entities/Bullet.js` and add the following:

```javascript
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
```

### 3.2 Player Bullet

Now create a subclass of bullets for the player. Add `src/entities/PlayerBullet.js` and add the following code:

```javascript
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
```

**Note:** We use negative speed to make the bullet move upward on the screen.

### 3.3 Invader Bullet

In a similar manner, we need to handle invader bullets. Create `src/entities/InvaderBullet.js` and add the following:

```javascript
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
```

### 3.4 Invader Class

With all this, we are ready to create our invaders. We have three sprite textures of invaders in our assets, so we'll randomly choose one. We also need some code to handle their position and state. To do this, create `src/entities/Invader.js` and add the following:

```javascript
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
```

### 3.5 Player Class

Now the more interesting (for us) is the Player class. We need to set our sprite texture with the spaceship image and then alternate with another image so that flames appear to be coming in/out and appear like we're moving. We also have to handle what happens when we get hit by a bullet (spawn a new life if possible) or have a collision with the aliens (game over; we have to destroy them before they successfully invade). We're also going to reduce rapid fire, using a constant we created earlier to manage just how fast you can shoot at the invaders. Start by creating `src/entities/Player.js` with the following:

```javascript
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
```

---

## Part 4: Utility Modules

### 4.1 Collision Detection

Since React Native doesn't have a built-in physics engine like SpriteKit, we need to implement our own collision detection. We'll use AABB (Axis-Aligned Bounding Box) collision detection, which is perfect for our rectangular game objects. Create `src/utils/CollisionDetection.js`:

```javascript
/**
 * Collision detection utilities
 * Provides AABB (Axis-Aligned Bounding Box) collision detection
 */

/**
 * Check if two bounding boxes intersect
 */
export const checkCollision = (bounds1, bounds2) => {
  return (
    bounds1.left < bounds2.right &&
    bounds1.right > bounds2.left &&
    bounds1.top < bounds2.bottom &&
    bounds1.bottom > bounds2.top
  );
};

/**
 * Find all collisions between entities in two arrays
 */
export const detectCollisions = (entities1, entities2) => {
  const collisions = [];

  for (const entity1 of entities1) {
    for (const entity2 of entities2) {
      if (checkCollision(entity1.getBounds(), entity2.getBounds())) {
        collisions.push({ entity1, entity2 });
      }
    }
  }

  return collisions;
};

/**
 * Check collision between a single entity and an array of entities
 */
export const detectEntityCollisions = (entity, entities) => {
  const entityBounds = entity.getBounds();

  for (const other of entities) {
    if (checkCollision(entityBounds, other.getBounds())) {
      return other;
    }
  }

  return null;
};
```

### 4.2 Sound Manager

We need a way to manage sound effects in our game. Expo provides the AV library for audio playback, but we'll wrap it in a manager to make it easier to use. Create `src/utils/SoundManager.js`:

```javascript
import { Audio } from 'expo-av';

/**
 * Sound manager for game audio
 * Handles loading and playing sound effects
 */
class SoundManager {
  constructor() {
    if (SoundManager.instance) {
      return SoundManager.instance;
    }

    this.sounds = {};
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load laser sound
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/laser.mp3')
      );
      this.sounds.laser = sound;

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize sound:', error);
    }
  }

  /**
   * Play a sound effect
   */
  async playSound(soundName) {
    if (!this.initialized || !this.sounds[soundName]) return;

    try {
      await this.sounds[soundName].replayAsync();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Clean up sound resources
   */
  async cleanup() {
    for (const sound of Object.values(this.sounds)) {
      await sound.unloadAsync();
    }
    this.sounds = {};
    this.initialized = false;
  }
}

export default SoundManager;
```

---

## Part 5: Building the Screens

### 5.1 Start Screen

We need a welcome screen where players can start the game. Create `src/screens/StartScreen.js`:

```javascript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import GameStateManager from '../managers/GameStateManager';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Start screen component
 * Displays game title and start button
 */
const StartScreen = ({ navigation }) => {
  const gameStateManager = GameStateManager.getInstance();

  const handleStartGame = () => {
    gameStateManager.resetGame();
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPACE</Text>
      <Text style={styles.title}>DESTROYERS</Text>

      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/player1.png')}
          style={styles.playerImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity onPress={handleStartGame} style={styles.buttonContainer}>
        <Image
          source={require('../../assets/images/start_btn.png')}
          style={styles.button}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.instructions}>Tilt to move</Text>
      <Text style={styles.instructions}>Tap to fire</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#00FF00',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  imageContainer: {
    marginVertical: 40,
  },
  playerImage: {
    width: 80,
    height: 80,
  },
  buttonContainer: {
    marginVertical: 30,
  },
  button: {
    width: SCREEN_WIDTH * 0.6,
    height: 60,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default StartScreen;
```

### 5.2 Level Complete Screen

We also need a screen to show when a level is complete. Create `src/screens/LevelCompleteScreen.js`:

```javascript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import GameStateManager from '../managers/GameStateManager';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Level complete screen component
 * Displays level completion message and next level button
 */
const LevelCompleteScreen = ({ navigation }) => {
  const gameStateManager = GameStateManager.getInstance();
  const currentLevel = gameStateManager.currentLevel;

  const handleNextLevel = () => {
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LEVEL {currentLevel - 1}</Text>
      <Text style={styles.subtitle}>COMPLETE!</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {gameStateManager.score}</Text>
        <Text style={styles.scoreText}>Lives: {gameStateManager.lives}</Text>
      </View>

      <TouchableOpacity onPress={handleNextLevel} style={styles.buttonContainer}>
        <Image
          source={require('../../assets/images/nextlevelbtn.png')}
          style={styles.button}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.nextLevelText}>Next: Level {currentLevel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#00FF00',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  subtitle: {
    color: '#00FF00',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  scoreContainer: {
    marginVertical: 30,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 5,
  },
  buttonContainer: {
    marginVertical: 30,
  },
  button: {
    width: SCREEN_WIDTH * 0.6,
    height: 60,
  },
  nextLevelText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LevelCompleteScreen;
```

### 5.3 Main Game Screen

Now for the heart of our game - the main game screen. This is where all the action happens! It manages the game loop, entity updates, collision detection, and rendering. Create `src/screens/GameScreen.js`:

**Note:** This is a really long file.  I've added some comments to help you understand what is happening and I _strongly_ encourage you to at least read the comments and review the code.

```javascript
import React, { Component } from 'react';
import { View, Dimensions, Image, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-accelerometer';
import Player from '../entities/Player';
import Invader from '../entities/Invader';
import PlayerBullet from '../entities/PlayerBullet';
import InvaderBullet from '../entities/InvaderBullet';
import Constants from '../config/Constants';
import GameStateManager from '../managers/GameStateManager';
import SoundManager from '../utils/SoundManager';
import { detectCollisions, detectEntityCollisions } from '../utils/CollisionDetection';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * Main game screen component
 * Handles game loop, entity management, and rendering
 */
class GameScreen extends Component {
  constructor(props) {
    super(props);

    this.gameStateManager = GameStateManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.state = {
      player: new Player(SCREEN_WIDTH, SCREEN_HEIGHT),
      invaders: [],
      playerBullets: [],
      invaderBullets: [],
      invaderSpeed: Constants.Invader.initialSpeed,
      lastUpdate: Date.now(),
      score: this.gameStateManager.score,
      lives: this.gameStateManager.lives,
      level: this.gameStateManager.currentLevel,
    };

    this.accelerometerSubscription = null;
    this.gameLoop = null;
    this.invaderFireInterval = null;
    this.accelerationX = 0;
  }

  async componentDidMount() {
    await this.soundManager.initialize();
    this.setupInvaders();
    this.setupAccelerometer();
    this.startGameLoop();
    this.startInvaderFiring();
  }

  componentWillUnmount() {
    this.stopGameLoop();
    this.stopInvaderFiring();
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
    }
  }

  /**
   * Setup accelerometer for tilt controls
   */
  setupAccelerometer = () => {
    Accelerometer.setUpdateInterval(Constants.Input.accelerometerUpdateInterval);

    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.accelerationX = data.x;
    });
  };

  /**
   * Create invader grid based on current level
   */
  setupInvaders = () => {
    const invaders = [];
    const currentLevel = this.gameStateManager.currentLevel;
    const numberOfInvaders =
      currentLevel * Constants.Invader.invadersPerLevelMultiplier +
      Constants.Invader.invadersPerLevelBase;

    for (let row = 0; row < Constants.Invader.rows; row++) {
      for (let col = 0; col < numberOfInvaders; col++) {
        const invaderWidth = Constants.Invader.width;
        const invaderHalfWidth = invaderWidth / 2;
        const xStart =
          SCREEN_WIDTH / 2 -
          invaderHalfWidth -
          currentLevel * invaderWidth +
          Constants.Invader.horizontalSpacing;

        const x =
          xStart +
          (invaderWidth + Constants.Invader.horizontalSpacing) * col;
        const y = 50 + row * Constants.Invader.verticalSpacing;

        invaders.push(new Invader(row, col, x, y));
      }
    }

    this.setState({ invaders });
  };

  /**
   * Start the main game loop
   */
  startGameLoop = () => {
    this.gameLoop = setInterval(() => {
      this.update();
    }, 1000 / Constants.Game.fps);
  };

  /**
   * Stop the game loop
   */
  stopGameLoop = () => {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  };

  /**
   * Start invader firing interval
   */
  startInvaderFiring = () => {
    this.invaderFireInterval = setInterval(() => {
      this.fireInvaderBullet();
    }, Constants.Invader.fireInterval);
  };

  /**
   * Stop invader firing
   */
  stopInvaderFiring = () => {
    if (this.invaderFireInterval) {
      clearInterval(this.invaderFireInterval);
      this.invaderFireInterval = null;
    }
  };

  /**
   * Main game update loop
   */
  update = () => {
    const { player, invaders, playerBullets, invaderBullets } = this.state;

    // Update player
    player.setVelocity(this.accelerationX);
    player.update();

    // Move invaders
    this.moveInvaders();

    // Update bullets
    playerBullets.forEach((bullet) => bullet.update());
    invaderBullets.forEach((bullet) => bullet.update());

    // Remove off-screen bullets
    const activePlayerBullets = playerBullets.filter(
      (b) => !b.isOffScreen(SCREEN_HEIGHT)
    );
    const activeInvaderBullets = invaderBullets.filter(
      (b) => !b.isOffScreen(SCREEN_HEIGHT)
    );

    // Handle collisions
    this.handleCollisions();

    // Remove marked entities
    const activeInvaders = invaders.filter((i) => !i.shouldRemove);
    const finalPlayerBullets = activePlayerBullets.filter((b) => !b.shouldRemove);
    const finalInvaderBullets = activeInvaderBullets.filter((b) => !b.shouldRemove);

    // Check for level complete
    if (activeInvaders.length === 0) {
      this.levelComplete();
      return;
    }

    this.setState({
      player,
      invaders: activeInvaders,
      playerBullets: finalPlayerBullets,
      invaderBullets: finalInvaderBullets,
    });
  };

  /**
   * Move invaders horizontally and drop when reaching edges
   */
  moveInvaders = () => {
    const { invaders, invaderSpeed } = this.state;
    let changeDirection = false;

    // Move all invaders
    invaders.forEach((invader) => {
      invader.move(invaderSpeed, 0);

      // Check if any invader reached screen edge
      if (invader.isAtEdge(Constants.Layout.leftBounds, SCREEN_WIDTH - 20)) {
        changeDirection = true;
      }
    });

    // Reverse direction and drop all invaders
    if (changeDirection) {
      const newSpeed = -invaderSpeed;
      invaders.forEach((invader) => {
        invader.move(0, Constants.Invader.dropDistance);
      });
      this.setState({ invaderSpeed: newSpeed });
    }
  };

  /**
   * Fire bullet from random invader in bottom row
   */
  fireInvaderBullet = () => {
    const { invaders, invaderBullets } = this.state;

    if (invaders.length === 0) return;

    // Find invaders that can fire (bottom-most in each column)
    const invadersByColumn = {};
    invaders.forEach((invader) => {
      if (
        !invadersByColumn[invader.column] ||
        invader.row > invadersByColumn[invader.column].row
      ) {
        invadersByColumn[invader.column] = invader;
      }
    });

    const invadersWhoCanFire = Object.values(invadersByColumn);

    if (invadersWhoCanFire.length > 0) {
      const randomInvader =
        invadersWhoCanFire[Math.floor(Math.random() * invadersWhoCanFire.length)];
      const pos = randomInvader.getBulletSpawnPosition();
      const bullet = new InvaderBullet(pos.x, pos.y);
      this.soundManager.playSound('laser');

      this.setState({
        invaderBullets: [...invaderBullets, bullet],
      });
    }
  };

  /**
   * Handle player tap to fire
   */
  handleTap = () => {
    const { player, playerBullets } = this.state;

    if (!player.isAlive || !player.canFire()) return;

    const pos = player.getBulletSpawnPosition();
    const bullet = new PlayerBullet(pos.x, pos.y);
    this.soundManager.playSound('laser');

    // Toggle player image for animation
    player.toggleImage();

    this.setState({
      playerBullets: [...playerBullets, bullet],
      player,
    });
  };

  /**
   * Handle all collision detection
   */
  handleCollisions = () => {
    const { player, invaders, playerBullets, invaderBullets } = this.state;

    // Player bullets vs Invaders
    const invaderHits = detectCollisions(playerBullets, invaders);
    invaderHits.forEach(({ entity1: bullet, entity2: invader }) => {
      bullet.remove();
      invader.remove();
      this.gameStateManager.addScore(10);
      this.setState({ score: this.gameStateManager.score });
    });

    // Invader bullets vs Player
    if (player.isAlive) {
      const playerHit = detectEntityCollisions(player, invaderBullets);
      if (playerHit) {
        this.handlePlayerHit();
      }

      // Direct invader collision with player
      const invaderHit = detectEntityCollisions(player, invaders);
      if (invaderHit) {
        this.handlePlayerHit();
      }
    }
  };

  /**
   * Handle player being hit
   */
  handlePlayerHit = () => {
    const { player } = this.state;

    player.kill();
    const remainingLives = this.gameStateManager.loseLife();

    this.setState({
      player,
      lives: remainingLives,
    });

    if (remainingLives <= 0) {
      this.gameOver();
    } else {
      // Respawn player after delay
      setTimeout(() => {
        player.respawn(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.setState({ player });
      }, Constants.Player.respawnDelay);
    }
  };

  /**
   * Handle level completion
   */
  levelComplete = () => {
    this.stopGameLoop();
    this.stopInvaderFiring();

    if (!this.gameStateManager.isMaxLevelReached()) {
      this.gameStateManager.advanceToNextLevel();
      this.props.navigation.navigate('LevelComplete');
    } else {
      this.gameStateManager.resetLevel();
      this.props.navigation.navigate('Start');
    }
  };

  /**
   * Handle game over
   */
  gameOver = () => {
    this.stopGameLoop();
    this.stopInvaderFiring();
    this.gameStateManager.resetGame();
    this.props.navigation.navigate('Start');
  };

  /**
   * Render the game scene
   */
  render() {
    const { player, invaders, playerBullets, invaderBullets, score, lives, level } = this.state;

    return (
      <View style={styles.container} onTouchStart={this.handleTap}>
        {/* HUD */}
        <View style={styles.hud}>
          <Text style={styles.hudText}>Score: {score}</Text>
          <Text style={styles.hudText}>Level: {level}</Text>
          <Text style={styles.hudText}>Lives: {lives}</Text>
        </View>

        {/* Player */}
        {player.isAlive && (
          <Image
            source={
              player.imageIndex === 1
                ? require('../../assets/images/player1.png')
                : require('../../assets/images/player2.png')
            }
            style={[
              styles.player,
              { left: player.x, top: player.y, width: player.width, height: player.height },
            ]}
          />
        )}

        {/* Invaders */}
        {invaders.map((invader) => (
          <Image
            key={invader.id}
            source={
              invader.imageType === 1
                ? require('../../assets/images/invader1.png')
                : invader.imageType === 2
                ? require('../../assets/images/invader2.png')
                : require('../../assets/images/invader3.png')
            }
            style={[
              styles.invader,
              {
                left: invader.x,
                top: invader.y,
                width: invader.width,
                height: invader.height,
              },
            ]}
          />
        ))}

        {/* Player Bullets */}
        {playerBullets.map((bullet) => (
          <View
            key={bullet.id}
            style={[
              styles.bullet,
              {
                left: bullet.x,
                top: bullet.y,
                width: bullet.width,
                height: bullet.height,
                backgroundColor: bullet.color,
              },
            ]}
          />
        ))}

        {/* Invader Bullets */}
        {invaderBullets.map((bullet) => (
          <View
            key={bullet.id}
            style={[
              styles.bullet,
              {
                left: bullet.x,
                top: bullet.y,
                width: bullet.width,
                height: bullet.height,
                backgroundColor: bullet.color,
              },
            ]}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  hudText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  player: {
    position: 'absolute',
  },
  invader: {
    position: 'absolute',
  },
  bullet: {
    position: 'absolute',
  },
});

export default GameScreen;
```

---

## Part 6: Navigation Setup

### 6.1 Navigation Configuration

React Native uses React Navigation to handle moving between screens. Create `src/navigation/AppNavigator.js`:

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartScreen from '../screens/StartScreen';
import GameScreen from '../screens/GameScreen';
import LevelCompleteScreen from '../screens/LevelCompleteScreen';

const Stack = createStackNavigator();

/**
 * Navigation configuration for the app
 * Manages screen transitions between Start, Game, and Level Complete
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          cardStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="LevelComplete" component={LevelCompleteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 6.2 Main App Entry Point

Finally, create the main `App.js` file in the root directory:

```javascript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Main application component
 * Entry point for the Space Destroyers game
 */
export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
```

---

## Part 7: Testing & Running

Time for the fun part -- let's see it in action!

### 7.1 Start the Development Server

1. Open Terminal in your project directory
2. Run:
   ```bash
   npm start
   ```
3. A QR code will appear in your terminal and browser; use that to test on your device.


### 7.2 Testing Controls

- **Tilt your device left/right** to move the player
- **Tap anywhere** on the screen to fire
- Destroy all invaders to advance to the next level!

### 7.3 Common Issues

- **Accelerometer not working**: Make sure you're testing on a physical device, not a simulator
- **Sounds not playing**: Check that `laser.mp3` is in `assets/sounds/`
- **Images not showing**: Verify all images are in `assets/images/`
- **"Module not found" errors**: Run `npm install` again

---

## Part 8: Understanding Key Concepts

### Why This Architecture?

**Separation of Concerns**: Each file has one job. Want to change how bullets work? Look in the `entities` folder. Need to adjust gameplay? Check `Constants.js`.

**Singleton Pattern**: Both `GameStateManager` and `SoundManager` use the singleton pattern. This ensures there's only one instance managing state or sound throughout the app, preventing bugs from multiple instances.

**Component Lifecycle**: React Native components have lifecycle methods (`componentDidMount`, `componentWillUnmount`) that we use to start/stop the game loop and clean up resources.

**Game Loop Pattern**: The `setInterval` in `startGameLoop` creates a traditional game loop that updates 60 times per second (60 FPS). Each update moves entities, checks collisions, and updates the display.

**AABB Collision Detection**: We use Axis-Aligned Bounding Box collision detection - a simple but effective method for rectangular objects. It checks if rectangles overlap by comparing their edges.

### React Native vs SpriteKit

If you've seen the Swift version of this game, you'll notice some differences:

- **No Built-in Physics**: React Native doesn't have SpriteKit's physics engine, so we built our own collision detection
- **Manual Game Loop**: We use `setInterval` instead of SpriteKit's built-in update loop
- **Absolute Positioning**: We position elements manually with x/y coordinates
- **Class vs Functional Components**: GameScreen uses a class component to manage complex state and lifecycle

---

## Part 9: Additional Challenges

You have a working game and it's fun to play. We could definitely add more to this and make it more interesting. Extending the game functionality is also a good way to learn React Native and mobile app development even better. Here are a couple of ideas to get you started:

1. **Add Power-ups**: Create a PowerUp entity that drops from destroyed invaders
2. **Add Particle Effects**: Use animated components for explosions
3. **Add High Scores**: Use AsyncStorage to persist high scores
4. **Add Background Music**: Load and loop background music in SoundManager
5. **Add More Levels**: Increase invader speed and count per level in Constants
6. **Add Boss Fight**: Create a large invader that takes multiple hits
7. **Add Shields**: Create destructible barriers for the player to hide behind
8. **Add Different Weapons**: Give the player different bullet types with different effects

---

## Conclusion

Congratulations! You've made it through the final (and admittedly long) lab, but hopefully you've learned a lot, in this lab and in this course. You've built a complete cross-platform game using modern React Native development practices, and in the process you've learned:

- React Native mobile development
- Custom game loop implementation
- Collision detection algorithms
- Code organization with modules
- State management patterns
- Singleton pattern
- Component lifecycle management
- Professional JavaScript coding standards

These principles apply to all React Native development, not just games. Clean architecture, separation of concerns, and proper state management are essential for any production app.

**Great work this semester! Qapla'** 👊
