import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarCoordinate, defaultCarCoordinate } from '../models/CarCoordinate';

const STORAGE_KEY = '@FindMyCar:coordinates';

export enum LocationAuthorizationStatus {
  NOT_DETERMINED = 'notDetermined',
  DENIED = 'denied',
  GRANTED = 'granted',
}

export class LocationManager {
  private static instance: LocationManager;

  private constructor() { }

  static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  /**
   * @function Requests location permissions from the user
   * @returns {Promise<LocationAuthorizationStatus>} The permission status
   */
  async requestLocationPermissions(): Promise<LocationAuthorizationStatus> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        return LocationAuthorizationStatus.GRANTED;
      } else if (status === 'denied') {
        return LocationAuthorizationStatus.DENIED;
      }
      return LocationAuthorizationStatus.NOT_DETERMINED;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      throw new Error('Failed to request location permissions');
    }
  }

  /**
   * @function Gets the current device location
   * @returns {Promise<CarCoordinate>} The current location
   * Throws an error if location services are not available or permission is denied
   */
  async getCurrentLocation(): Promise<CarCoordinate> {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location access denied. Please enable in Settings.');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get location');
    }
  }

  /**
   * @function Saves the current device location to AsyncStorage
   * @returns {Promise<CarCoordinate>} The saved coordinate
   */
  async saveCurrentLocation(): Promise<CarCoordinate> {
    try {
      const coordinate = await this.getCurrentLocation();
      await this.saveLocationToStorage(coordinate);
      return coordinate;
    } catch (error) {
      console.error('Error saving current location:', error);
      throw error;
    }
  }

  /**
   * @function Saves a coordinate to AsyncStorage
   * @param {CarCoordinate} coordinate - The coordinate to save
   * @returns {Promise<void>}
   */
  private async saveLocationToStorage(coordinate: CarCoordinate): Promise<void> {
    try {
      const jsonValue = JSON.stringify(coordinate);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving location to storage:', error);
      throw new Error('Failed to save location');
    }
  }

  /**
   * @function Loads the saved car coordinate from AsyncStorage
   * @returns {Promise<CarCoordinate>} The loaded coordinate
   * @returns {CarCoordinate} The default coordinate (0, 0) if no location is saved
   */
  async loadLocation(): Promise<CarCoordinate> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        return JSON.parse(jsonValue) as CarCoordinate;
      }
      return defaultCarCoordinate;
    } catch (error) {
      console.error('Error loading location:', error);
      return defaultCarCoordinate;
    }
  }

  /**
   * @function Clears the saved car location from AsyncStorage
   */
  async clearLocation(): Promise<void> {
    try {
      await this.saveLocationToStorage(defaultCarCoordinate);
    } catch (error) {
      console.error('Error clearing location:', error);
      throw new Error('Failed to clear location');
    }
  }

  /**
   * @function Checks if location permissions are granted
   * @returns {Promise<boolean>} The permission status
   */
  async hasLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }
}

export default LocationManager.getInstance();