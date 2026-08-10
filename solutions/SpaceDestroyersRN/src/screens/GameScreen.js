import React, { Component } from 'react';
import { View, Dimensions, Image, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Player from '../entities/Player';
import Invader from '../entities/Invader';
import PlayerBullet from '../entities/PlayerBullet';
import InvaderBullet from '../entities/InvaderBullet';
import Constants from '../config/Constants';
import GameStateManager from '../managers/GameStateManager';
import SoundManager from '../managers/SoundManager';
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
    this.soundManager.cleanup();
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
          currentLevel * (invaderWidth +
          Constants.Invader.horizontalSpacing);

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
      this.soundManager.playSound('invader');

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
    this.soundManager.playSound('player');

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