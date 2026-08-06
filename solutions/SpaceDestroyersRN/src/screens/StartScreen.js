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