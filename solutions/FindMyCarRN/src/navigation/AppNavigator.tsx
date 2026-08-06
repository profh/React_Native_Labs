import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import MapViewScreen from '../screens/MapView';
import { RootStackParamList } from './Types';
import AppView from '../screens/AppView';
import MapViewScreen from '../screens/MapView';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="App"
        screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="App"
          component={AppView}
          options={{ title: 'Find My Car', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="Map"
          component={MapViewScreen}
          options={{ title: 'Map View', headerTitleAlign: 'center' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;