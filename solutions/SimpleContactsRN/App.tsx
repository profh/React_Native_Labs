import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PeopleProvider } from './src/components/PeopleProvider';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <PeopleProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </PeopleProvider>
  );
};

export default App;