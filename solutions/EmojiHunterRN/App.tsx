import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameViewModel } from './src/models/GameViewModel';
import { EmojiSearchStatus } from './src/models/Types';
import { CustomCamera } from './src/screens/CustomCamera';
import { emojiObjects } from './src/models/Emoji';
import React from 'react';

const App = () => {
  const {
    currentLevel,
    emojiSearchStatus,
    timeRemaining,
    showNext,
    startSearch,
    setEmojiSearchStatus,
    setTensorLoaded,
    restartGame,
  } = GameViewModel();

  const handleEmojiFound = (status: EmojiSearchStatus) => {
    setEmojiSearchStatus(status);
  };

  return (
    <View style={appStyles.container}>
      {
        emojiSearchStatus === EmojiSearchStatus.GameOver ? (
          <TouchableOpacity onPress={restartGame}>
            <Text style={{ fontSize: 40, color: "red" }}>Game Over! Restart?</Text>
          </TouchableOpacity>
        ) : emojiSearchStatus === EmojiSearchStatus.Found || showNext ? (
          <TouchableOpacity onPress={startSearch}>
            <Text style={{ fontSize: 40, color: "green" }}>Next Emoji!</Text>
          </TouchableOpacity>
        ) : (
          <CustomCamera
            emojiNames={emojiObjects[currentLevel]?.emojiNames || []}
            onEmojiFound={handleEmojiFound}
            setTensorLoaded={setTensorLoaded}
          />
        )
      }
      {
        emojiSearchStatus !== EmojiSearchStatus.GameOver && (
          <Text>Time Remaining: {timeRemaining}</Text>
        )
      }
      {
        emojiSearchStatus === EmojiSearchStatus.Found ? (
          <Text>FOUND! {emojiObjects[currentLevel].emoji}</Text>
        ) : emojiSearchStatus === EmojiSearchStatus.NotFound ? (
          <Text>Find: {emojiObjects[currentLevel].emoji}</Text>
        ) : <></>
      }

    </View>
  );
};

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  info: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  timer: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emojiText: {
    fontSize: 50,
    fontWeight: "bold",
  },
});

export default App;