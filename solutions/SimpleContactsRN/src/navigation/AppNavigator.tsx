import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PeopleScreen from '../screens/PeopleScreen';
import EditPersonScreen from '../screens/EditPersonScreen';
import { RootStackParamList } from './Types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="People">
        <Stack.Screen
          name="People"
          component={PeopleScreen}
          options={{ title: 'My Contacts' }}
        />
        <Stack.Screen
          name="EditPerson"
          component={EditPersonScreen}
          options={{ title: 'Edit Person', headerBackTitle: 'My Contacts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;