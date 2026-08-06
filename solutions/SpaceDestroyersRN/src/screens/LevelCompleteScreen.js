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