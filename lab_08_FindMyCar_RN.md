# Lab 8: FindMyCar (React Native)

---

This week, we will make an app that allows users to track where their car is parked and where they are relative to the car. We will be using `react-native-maps`, Expo's Location and AsyncStorage APIs, and React Navigation to save car data. Here is a sneak peek of the final app we're going to build...

<p float="left" align="center">
  <img src="PLACEHOLDER_SCREENSHOT_1.png" width="25%"/>
  <img src="PLACEHOLDER_SCREENSHOT_2.png" width="25%"/>
  <img src="PLACEHOLDER_SCREENSHOT_3.png" width="25%"/>
</p>

The way this app works is that when we are ready to leave our car, we press the "Here's My Car" button and the location is saved. When I want to go back to my car, I press "Where's My Car" and it will show a map with my car marked. (_Aside:_ this is the same app the Swift version of this lab was based on -- one of the first apps I ever built for this course, back when it was Objective-C and there was no Swift yet, and I actually used it regularly to help me keep track of where I parked. Apple has integrated this functionality into their Maps app now so it isn't strictly necessary today, but it's still a good learning exercise and will teach us about maps, locations, permissions, and simple persistence.)

Begin by creating a new Expo project called `FindMyCarRN`:

```
npx create-expo-app FindMyCarRN --template blank-typescript
cd FindMyCarRN
```

Install the packages we'll need for maps, location, persistent storage, navigation, and icons:

```
npx expo install expo-location @react-native-async-storage/async-storage react-native-maps @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context @expo/vector-icons
```

Within `src`, create three folders -- `models`, `services`, `screens`, and `navigation`. This maps onto the Swift version's Models/Views split, with one addition: React Navigation asks us to declare our screen stack in its own file, which is why we're adding a `navigation` folder as well.

## Part 1: Models and Services

#### CarCoordinate

Create a new file called `CarCoordinate.ts` inside `models`. In the Swift version, this was a `Codable` struct with `latitude` and `longitude` fields so it could be persisted to a plist. TypeScript doesn't need a `Codable`-style protocol at all -- a plain interface (a shape, with no behavior) is enough, since any object matching that shape can be serialized with `JSON.stringify()`:

```typescript
export interface CarCoordinate {
  latitude: number;
  longitude: number;
}

export const defaultCarCoordinate: CarCoordinate = {
  latitude: 0.0,
  longitude: 0.0,
};

export const isValidCoordinate = (coordinate: CarCoordinate): boolean => {
  return coordinate.latitude !== 0 || coordinate.longitude !== 0;
};
```

Notice we've also pulled out a couple of small helper values/functions here (`defaultCarCoordinate` and `isValidCoordinate`) rather than making them methods on a class the way the Swift struct's `init()` and computed properties might have. TypeScript interfaces can't hold behavior the way Swift structs can, so free-standing functions like these are the idiomatic way to keep coordinate-related logic near the type it operates on.

You'll notice the Swift version actually used two separate types here -- `CarLocation` (an `Identifiable` struct used for map annotations) and `CarCoordinate` (a `Codable` struct used for persistence). We don't need that split in React Native: `react-native-maps`'s `Marker` component is happy to take a plain `{latitude, longitude}` object directly as its `coordinate` prop, so one `CarCoordinate` type covers both jobs.

#### LocationManager

Now it's time to build our main service, `LocationManager`. In Swift, this class wrapped `CLLocationManager`, the Core Location framework class that manages the delivery of location events to an application, and it inherited SwiftUI's automatic view-refreshing behavior by conforming to `ObservableObject`. Expo's `expo-location` package gives us an equivalent API, but with a very different shape: rather than a delegate-based class that pushes location updates to us over time, it's a set of `async` functions we call directly and `await` a result from -- much closer to a simple request/response than an ongoing subscription.

Create a new file called `LocationManager.ts` inside `services`:

```typescript
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

  private constructor() {}

  static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  // More to come...
}

export default LocationManager.getInstance();
```

#### Understanding the Code

- **Singleton pattern**: Rather than SwiftUI's `@StateObject` (which creates and owns a single instance of an `ObservableObject` for the lifetime of a view), we're using a plain old singleton here -- a private constructor plus a static `getInstance()` method ensures there's only ever one `LocationManager` in the app, and any screen that imports the default export from this file gets that same shared instance.
- **`LocationAuthorizationStatus` enum**: This plays the same role Swift's `CLAuthorizationStatus` did, just trimmed down to the three states we actually care about here.
- We're skipping `@Published` properties entirely -- since this isn't an `ObservableObject`, our screens will hold their own `useState` for whatever data they need to display, and just call into this service to fetch or save it. We'll see that pattern in the Views section.

Now let's add the permission and location-fetching methods:

```typescript
  /**
   * Requests location permissions from the user
   * Returns the permission status
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
   * Gets the current device location
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
        accuracy: Location.Accuracy.Best,
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
```

Compare this to the Swift version's `saveCurrentLocation(completion:)`, which had to branch on `authorizationStatus` (`.notDetermined`, `.restricted`, `.denied`, `.authorizedWhenInUse`, `.authorizedAlways`) and then kick off `startLocationUpdates()`, waiting for the `CLLocationManagerDelegate` callback `didUpdateLocations` to eventually fire with a result. Here, `getCurrentPositionAsync()` handles all of that internally and just gives us back a coordinate (or throws) once it's done -- there's no delegate protocol to implement at all, since `async`/`await` already gives us a straightforward way to wait for an asynchronous result.

Before this will work, we need to give the app permission to access location -- the React Native equivalent of adding "Privacy - Location When in Use Usage Description" to your Xcode project's Info tab. Open `app.json` and add the following inside the `expo` object:

```json
"ios": {
  "supportsTablet": true,
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "This app needs your location to save where you parked the car."
  }
},
"android": {
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION"
  ]
},
"plugins": [
  [
    "expo-location",
    {
      "locationAlwaysAndWhenInUsePermission": "This app needs your location to save where you parked the car."
    }
  ]
]
```

Notice we need both an `ios` entry (the same permission-description string as the Swift version) and an `android` entry, since we're now targeting two platforms instead of just iOS. The `plugins` entry configures the `expo-location` config plugin, which wires these permission strings into the native project files for us automatically when you build -- there's no separate "Info tab" step to click through the way there was in Xcode.

Now let's go back to `LocationManager.ts` and add the persistence methods. The Swift version used `PropertyListEncoder`/`PropertyListDecoder` to read and write a `Coordinates.plist` file in the documents directory. React Native doesn't have a plist-based storage API, but `AsyncStorage` gives us the same basic idea -- simple, asynchronous key/value persistence -- and since JSON already round-trips through `JSON.stringify()`/`JSON.parse()` cleanly, we don't need `Codable`-style encoding/decoding machinery at all:

```typescript
  /**
   * Saves the current device location to AsyncStorage
   * Returns the saved coordinate
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
   * Saves a coordinate to AsyncStorage
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
   * Loads the saved car coordinate from AsyncStorage
   * Returns the default coordinate (0, 0) if no location is saved
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
   * Clears the saved car location from AsyncStorage
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
   * Checks if location permissions are granted
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
```

Finally, export the shared singleton instance at the bottom of the file (this is the line we already stubbed in above): `export default LocationManager.getInstance();`. Any screen that needs location data will `import locationManager from '../services/LocationManager'` and call methods directly on it -- no delegate protocol, no `CLLocationManagerDelegate` extension required. We've traded the Swift version's push-based delegate callbacks for a much shorter list of `async` methods you call and `await` directly.

## Part 2: Navigation

Before building our screens, let's set up the navigation stack that connects them, since our `MapView` screen will need to receive the saved coordinate as a navigation parameter (the React Navigation equivalent of passing `locationManager` into `MapView(locationManager: locationManager)` in the Swift version).

Create `types.ts` inside `navigation`:

```typescript
import { CarCoordinate } from '../models/CarCoordinate';

export type RootStackParamList = {
  App: undefined;
  Map: {
    coordinate: CarCoordinate;
  };
};
```

Then create `AppNavigator.tsx` inside `navigation`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppView from '../screens/AppView';
import MapViewScreen from '../screens/MapView';
import { RootStackParamList } from './types';

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
```

And wire it up in `App.tsx` at the root of your project:

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
```

## Part 3: Views

We really only have two screens to worry about here, just like the Swift version. The first is `AppView`, which gives us the two buttons we need to (1) save the data and (2) move to the map screen with the car location marked.

#### AppView

Create `AppView.tsx` inside `screens`. Since we don't have `@StateObject`/`@Published` automatically pushing data into this screen, we'll load the saved coordinate ourselves with a `useEffect` when the screen first mounts, and keep it in local state:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import locationManager from '../services/LocationManager';
import { CarCoordinate, isValidCoordinate } from '../models/CarCoordinate';
import { appStyles, colors } from '../styles/styles';
import { RootStackParamList } from '../navigation/types';

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
```

Notice `generateLocationMessage` reads almost identically to the Swift version's helper of the same name -- `toFixed(6)` here is playing the same role `String(format: "%.6f", ...)` did there.

Now let's add the handler for the "Here's My Car" button. This is where our earlier decision to skip the delegate/completion-handler pattern really pays off -- since `saveCurrentLocation()` is `async`, we can just `await` it directly instead of passing in a completion closure the way the Swift version's `saveCurrentLocation(completion:)` needed to:

```typescript
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
```

Notice `handleViewMap` passes `savedCoordinate` as a navigation param -- this is the React Navigation equivalent of the Swift version's `NavigationLink(destination: MapView(locationManager: locationManager))`. Rather than handing the whole service instance to the destination screen, we just pass along the specific data (`coordinate`) that screen actually needs, the same pattern we used back in the RailsCards lab.

Finally, the JSX for the screen itself:

```typescript
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
```

#### Understanding the Code

- **`useState` in place of `@StateObject`**: Rather than a single shared `ObservableObject` instance owning the coordinate and pushing updates automatically, this screen owns its own `savedCoordinate` state and refreshes it by explicitly calling `locationManager.loadLocation()`/`saveCurrentLocation()`. This is a common pattern difference between SwiftUI and React Native apps -- SwiftUI leans on shared observable state, while React components more often fetch what they need and hold it locally.
- **Generating location/error messages**: Just like the Swift version, it's important to give the user feedback on saving location to reduce the Gulf of Evaluation, and to handle possible errors gracefully -- simulators and emulators are sometimes wonky with location, so we need to surface that to the user rather than failing silently.
- Add the styles referenced above (`appStyles`, `colors`) to a new file called `styles.ts` inside `src/styles`. Feel free to design your own button colors and layout, or match the blue "primary" / green "success" scheme shown in the screenshots at the top of this lab.

#### MapView

Once we press the "Where's My Car" button, we are taken to a map screen which shows the local area and drops a marker where the car is. Create a new file called `MapView.tsx` inside `screens`, and import `react-native-maps` alongside `expo-location`:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CarCoordinate } from '../models/CarCoordinate';
import { mapStyles, colors } from '../styles/styles';
import { RootStackParamList } from '../navigation/types';

type MapViewRouteProp = RouteProp<RootStackParamList, 'Map'>;

const MapViewScreen: React.FC = () => {
  const route = useRoute<MapViewRouteProp>();
  const { coordinate } = route.params;
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<CarCoordinate | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };
```

Notice `coordinate` comes in via `route.params` here rather than through an `@ObservedObject` -- this is the same `RouteProp` pattern we used in the RailsCards lab's `DefinitionController` to receive data passed through `navigation.navigate()`.

Next, let's set up the initial map region. In the Swift version, this was a computed helper (`updateMapPosition()`) that built an `MKCoordinateRegion` and assigned it to `@State private var position`. `react-native-maps` takes a very similar `Region` shape directly as a prop:

```typescript
  const initialRegion: Region = {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
```

Now let's build the map itself. `react-native-maps`'s `MapView` component plays the same role SwiftUI's `Map` did, and its `showsUserLocation` prop is the equivalent of SwiftUI's `UserAnnotation()` -- both drop a blue dot at the device's current location automatically, without us having to place it ourselves:

```typescript
  return (
    <View style={mapStyles.container}>
      <MapView
        ref={mapRef}
        style={mapStyles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        <Marker
          coordinate={{
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          }}
          title="Your Car"
          description="Your car is parked here"
        >
          <View style={mapStyles.markerContainer}>
            <View style={mapStyles.markerIconContainer}>
              <MaterialIcons name="directions-car" size={30} color={colors.danger} />
            </View>
            <View style={mapStyles.markerLabel}>
              <Text style={mapStyles.markerLabelText}>Your Car</Text>
            </View>
          </View>
        </Marker>
      </MapView>

      <View style={mapStyles.infoCard}>
        <Text style={mapStyles.infoTitle}>Your Car Location</Text>
        <Text style={mapStyles.infoText}>
          Lat: {coordinate.latitude.toFixed(6)}
        </Text>
        <Text style={mapStyles.infoText}>
          Lon: {coordinate.longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );
};

export default MapViewScreen;
```

Notice the custom `Marker` here is built the same way the Swift version's custom `Annotation` was -- rather than using the platform's default pin, we're supplying our own `View` (a car icon in a white circle, with a small label underneath) as the marker's content, which `react-native-maps` will render in place of the default marker glyph.

Add the corresponding `mapStyles` (`container`, `map`, `infoCard`, `infoTitle`, `infoText`, `markerContainer`, `markerIconContainer`, `markerLabel`, `markerLabelText`) to `styles.ts` alongside the `appStyles` you added earlier -- shadows and rounded corners on the info card go a long way toward matching the polished look from the Swift screenshots.

#### We're done! 🎉

At this point, you can run the app (`npx expo start`) and see that it works. To set a location in the iOS Simulator, go to "Features > Location" and pick a location -- you can add a custom location (CMU is latitude: 40.444644, longitude: -79.945424, if you want) or pick one of Apple's preset locations. For an Android emulator, use the "..." (extended controls) panel's Location tab instead. You may occasionally get an error the first time you request a location in a simulator/emulator -- if so, just background the app and relaunch it and it should clear up. (There shouldn't be a problem on a physical device, but like the Swift version noted, simulators and emulators are sometimes wonky about location. 🤷‍♂️)

If you have time, use a Gen AI tool to help generate tests for your `LocationManager` service -- good practice, and this service is easy to test since it's mostly small, focused `async` functions. (Skip UI tests; not worth the hassle IMO.)

#### Qapla'
