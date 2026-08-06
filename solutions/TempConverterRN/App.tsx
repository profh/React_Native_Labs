import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import appStyles from './styles';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Input from './Input';
import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import InfoScreen from './InfoScreen';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Info" component={InfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen() {
  const [displayTemp, setDisplayTemp] = useState<number>(0);
  const [tempInput, setTempInput] = useState<number>(0);
  const [unit, setUnit] = useState<boolean>(true);
  const navigation = useNavigation();

  const convertTemp = (unit: boolean, tempInput: number): number => {
    return unit ? (tempInput - 32) * 5 / 9 : (tempInput * 9 / 5) + 32;
  };

  return (
    <SafeAreaProvider style={appStyles.appContainer}>
      <View>
        <Text style={appStyles.temperature}>{Number.isNaN(displayTemp) ? '0' : parseFloat(displayTemp.toFixed(2)) + ' ' + (unit ? 'C' : 'F')}</Text>
      </View>
      <Switch
        value={unit}
        style={appStyles.switch}
        onValueChange={() => { setUnit(!unit); setDisplayTemp(convertTemp(!unit, tempInput)); }}
      />
      <Input setTemp={setTempInput} />
      <TouchableOpacity
        onPress={() => { setDisplayTemp(convertTemp(unit, tempInput)); }}
        style={appStyles.buttonContainer}>
        <Text style={appStyles.buttonText}>Convert!</Text>
      </TouchableOpacity>
      <AntDesign
        name="info-circle"
        style={appStyles.infoIcon}
        size={36}
        color="black"
        onPress={() => navigation.navigate('Info' as never)}
      />
    </SafeAreaProvider>
  );
}