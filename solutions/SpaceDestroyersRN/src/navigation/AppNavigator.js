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