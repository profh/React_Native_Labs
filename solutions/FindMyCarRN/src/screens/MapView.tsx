import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Types";
import { useEffect, useRef, useState } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { CarCoordinate } from "../models/CarCoordinate";
import * as Location from 'expo-location';
import { View, Text } from "react-native";
import { colors, mapStyles } from "../styles/Styles";
import { MaterialIcons } from "@expo/vector-icons";

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

  const initialRegion: Region = {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

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