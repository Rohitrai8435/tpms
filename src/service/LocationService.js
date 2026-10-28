import Geolocation from 'react-native-geolocation-service';
import { updateLocation } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

let watchId = null;

export const startLocationTracking = async () => {
  if (watchId !== null) return; // prevent duplicate tracking

  const userData = await AsyncStorage.getItem('user_data');
  if (!userData) return;

  const user = JSON.parse(userData);
  const tech_id = user.login_id;

  watchId = Geolocation.watchPosition(
    async position => {
      const { latitude, longitude, accuracy } = position.coords;

      if (accuracy > 50) return;

      console.log('Tracking:', latitude, longitude);

      try {
        await updateLocation(tech_id, latitude, longitude);
      } catch (e) {
        console.log('Location API failed');
      }
    },
    error => console.log(error),
    {
      enableHighAccuracy: true,
      distanceFilter: 10,
      interval: 15000,
      fastestInterval: 10000,
      showsBackgroundLocationIndicator: true,
    },
  );
};

export const stopLocationTracking = () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
};
