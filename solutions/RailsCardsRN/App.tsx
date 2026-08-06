import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import CommandController from './controllers/commandController';
import DefinitionController from './controllers/definitionController';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={CommandController} />
                <Stack.Screen name="Definition" component={DefinitionController} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;