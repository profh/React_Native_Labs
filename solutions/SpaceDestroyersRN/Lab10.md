Lab 10

- Render Error
The render error is being thrown by react-native-gesture-handler v 3.x, downgrading to 2.31.2 fixes this error, need to update package.json manually, npm install all deps throws separate handler error
  npm install @react-navigation/native @react-navigation/stack expo-sensors expo-audio react-native-gesture-handler@2.31.2 react-native-safe-area-context react-native-screens

Exact dependencies that work currently -> 
  "dependencies": {
    "@react-navigation/native": "^7.3.15",
    "@react-navigation/stack": "^7.10.20",
    "expo": "~57.0.11",
    "expo-audio": "~57.0.3",
    "expo-sensors": "^57.0.2",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-native": "0.86.2",
    "react-native-gesture-handler": "^2.31.2",
    "react-native-safe-area-context": "^5.8.1",
    "react-native-screens": "^4.27.0"
  },

  npm install with package.json

- Expo AV is depricated as of Expo v55
  expo-av or expo-audio, expo-av --> expo-audio, refactored SoundManager to use expo-audio

- initial xStart Order of Operations bug with levels > 1 ->
  const xStart =
          SCREEN_WIDTH / 2 -
          invaderHalfWidth -
          currentLevel * invaderWidth +
          Constants.Invader.horizontalSpacing;

const xStart =
          SCREEN_WIDTH / 2 -
          invaderHalfWidth -
          currentLevel * (invaderWidth +
          Constants.Invader.horizontalSpacing);