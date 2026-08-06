import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import appStyles from './styles';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function InfoScreen() {

  return (
    <SafeAreaProvider style={appStyles.appContainer}>
      <View>
        <Text style={appStyles.info}>The only TempConverter app you'll ever need!</Text>
      </View>
    </SafeAreaProvider>
  );
    
}