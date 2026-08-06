import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import locationManager from '../services/LocationManager';
import { CarCoordinate, isValidCoordinate } from '../models/CarCoordinate';
import { appStyles, colors } from '../styles/Styles';
import { RootStackParamList } from '../navigation/Types';

type AppViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'App'>;

const AppView: React.FC = () => {
  const navigation = useNavigation<AppViewNavigationProp>();
  const [savedCoordinate, setSavedCoordinate] = useState<CarCoordinate>({ latitude: 0, longitude: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const coordinate = await locationManager.loadLocation();
      setSavedCoordinate(coordinate);
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
  };

  const generateLocationMessage = (coordinate: CarCoordinate): string => {
    const lat = coordinate.latitude.toFixed(6);
    const lon = coordinate.longitude.toFixed(6);
    return `Your car is at:\n(${lat}, ${lon})\n\nTap 'Where's My Car?' to view on the map.`;
  };

  const handleSaveLocation = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const hasPermission = await locationManager.hasLocationPermission();
      if (!hasPermission) {
        const status = await locationManager.requestLocationPermissions();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location access denied. Please enable location permissions in Settings.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        }
      }

      const coordinate = await locationManager.saveCurrentLocation();
      setSavedCoordinate(coordinate);

      Alert.alert('Location Saved', generateLocationMessage(coordinate), [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error saving location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      Alert.alert('Location Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMap = () => {
    if (isValidCoordinate(savedCoordinate)) {
      navigation.navigate('Map', { coordinate: savedCoordinate });
    }
  };

  const hasValidLocation = isValidCoordinate(savedCoordinate);

  return (
    <View style={appStyles.container}>
      <View style={appStyles.spacer} />

      <View style={appStyles.titleContainer}>
        <Text style={appStyles.title}>Find My Car</Text>
        {hasValidLocation && <Text style={appStyles.subtitle}>Location Saved</Text>}
      </View>

      <View style={appStyles.spacer} />

      <View style={appStyles.buttonContainer}>
        <TouchableOpacity
          style={[appStyles.button, appStyles.primaryButton]}
          onPress={handleSaveLocation}
          disabled={isLoading}
        >
          <Ionicons name="car" size={24} color={colors.white} style={appStyles.buttonIcon} />
          <Text style={appStyles.buttonText}>
            {isLoading ? "Getting Location..." : "Here's My Car"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={appStyles.buttonContainer}>
        <TouchableOpacity
          style={[
            appStyles.button,
            hasValidLocation ? appStyles.successButton : appStyles.disabledButton,
          ]}
          onPress={handleViewMap}
          disabled={!hasValidLocation}
        >
          <Ionicons name="map" size={24} color={colors.white} style={appStyles.buttonIcon} />
          <Text style={appStyles.buttonText}>Where's My Car?</Text>
        </TouchableOpacity>
      </View>

      <View style={appStyles.spacer} />
    </View>
  );
};

export default AppView;