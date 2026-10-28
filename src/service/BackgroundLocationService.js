import Geolocation from 'react-native-geolocation-service';
import { updateLocation, savePermissionLog } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform, AppState } from 'react-native';

// ─── Distance calculator ───────────────────────────────────────────
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── State ────────────────────────────────────────────────────────
let watchId = null;
let lastLocation = null;
let lastSyncTime = 0;
let isMoving = true;
let consecutiveIdleCount = 0;
let appStateSubscription = null;

// ─── Config ────────────────────────────────────────────────────────
const CONFIG = {
  moving: {
    enableHighAccuracy: true,
    distanceFilter: 20,
    interval: 10000,
    fastestInterval: 5000,
    accuracyThreshold: 50,
    minSyncInterval: 15000,
    minDist: 20,
  },
  idle: {
    enableHighAccuracy: false,
    distanceFilter: 100,
    interval: 60000,
    fastestInterval: 30000,
    accuracyThreshold: 100,
    minSyncInterval: 300000,
    minDist: 100,
  },
};

// ─── Request foreground permissions only ───────────────────────────
const requestLocationPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      // ✅ No ACCESS_BACKGROUND_LOCATION — foreground only
    ]);

    const fineGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    const coarseGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    console.log(`📍 Fine   : ${fineGranted ? 'GRANTED' : 'DENIED'}`);
    console.log(`📍 Coarse : ${coarseGranted ? 'GRANTED' : 'DENIED'}`);

    // ─── Save permission log ───────────────────────────────────────
    try {
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : {};
      await savePermissionLog({
        login_id: user?.login_id || 'unknown',
        fullname: user?.fullname || '',
        mobile: user?.mobile || '',
        emailid: user?.emailid || '',
        fine_location: fineGranted ? 'GRANTED' : 'DENIED',
        coarse_location: coarseGranted ? 'GRANTED' : 'DENIED',
        background_location: 'NOT_REQUESTED',
        overall_status: fineGranted ? 'OK' : 'MISSING_PERMISSIONS',
        tracking_running: watchId !== null,
        platform: Platform.OS,
        android_version: String(Platform.Version),
        event: 'permission_request',
        device_info: '',
      });
    } catch (_) {}

    return fineGranted;
  } catch (e) {
    console.warn('Permission error:', e);
    return false;
  }
};

// ─── Watch position ────────────────────────────────────────────────
const startWatch = async mode => {
  stopWatch();
  console.log(`🔁 Watch mode: ${mode.toUpperCase()}`);

  const cfg = CONFIG[mode];

  watchId = Geolocation.watchPosition(
    async position => {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        stopWatch();
        return;
      }

      const user = JSON.parse(userData);
      const { latitude, longitude, accuracy, speed } = position.coords;
      const now = Date.now();

      // ─── Moving / idle detection ───────────────────────────────
      let movingNow = true;
      if (speed !== null && speed !== undefined) {
        movingNow = speed > 0.5;
      } else if (lastLocation) {
        movingNow =
          getDistance(lastLocation.lat, lastLocation.lng, latitude, longitude) >
          15;
      }

      movingNow ? (consecutiveIdleCount = 0) : consecutiveIdleCount++;

      if (consecutiveIdleCount >= 3 && isMoving) {
        console.log('😴 → IDLE mode');
        isMoving = false;
        startWatch('idle');
        return;
      }
      if (movingNow && !isMoving) {
        console.log('🏃 → MOVING mode');
        isMoving = true;
        consecutiveIdleCount = 0;
        startWatch('moving');
        return;
      }

      // ─── Accuracy filter ───────────────────────────────────────
      if (accuracy > cfg.accuracyThreshold) {
        console.log(`⚠️ Low accuracy: ${accuracy}m — skipped`);
        return;
      }

      // ─── Time filter ───────────────────────────────────────────
      if (now - lastSyncTime < cfg.minSyncInterval) return;

      // ─── Distance filter ───────────────────────────────────────
      if (lastLocation) {
        const dist = getDistance(
          lastLocation.lat,
          lastLocation.lng,
          latitude,
          longitude,
        );
        if (dist < cfg.minDist) {
          console.log(`⏸️ Only ${Math.round(dist)}m moved — skipped`);
          return;
        }
      }

      // ─── Send to API ───────────────────────────────────────────
      try {
        await updateLocation(user, latitude, longitude);
        lastLocation = { lat: latitude, lng: longitude };
        lastSyncTime = now;
        console.log(
          `✅ [${isMoving ? 'MOVING' : 'IDLE'}] ` +
            `${latitude.toFixed(5)}, ${longitude.toFixed(
              5,
            )} | acc: ${Math.round(accuracy)}m`,
        );
      } catch (e) {
        console.log('❌ API failed:', e?.message);
      }
    },
    error => {
      console.log('📡 Location error:', error.code, error.message);
    },
    {
      enableHighAccuracy: cfg.enableHighAccuracy,
      distanceFilter: cfg.distanceFilter,
      interval: cfg.interval,
      fastestInterval: cfg.fastestInterval,
      forceRequestLocation: true,
      showLocationDialog: true,
    },
  );
};

const stopWatch = () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
    console.log('🛑 Watch cleared');
  }
};

// ─── App state listener — pause when backgrounded ─────────────────
const setupAppStateListener = () => {
  // Remove any existing listener first
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }

  appStateSubscription = AppState.addEventListener('change', nextState => {
    if (nextState === 'active') {
      console.log('📱 App foregrounded — resuming tracking');
      startWatch(isMoving ? 'moving' : 'idle');
    } else if (nextState === 'background' || nextState === 'inactive') {
      console.log('📱 App backgrounded — pausing tracking');
      stopWatch(); // ✅ stop GPS when app goes to background
    }
  });
};

// ─── Public API ────────────────────────────────────────────────────
export const initBackgroundTracking = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    if (!userData) {
      console.log('No user data — tracking skipped');
      return;
    }

    if (watchId !== null) {
      console.log('Already tracking');
      return;
    }

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.log('❌ Permission denied — tracking not started');
      return;
    }

    // Initial position sync
    Geolocation.getCurrentPosition(
      async position => {
        const user = JSON.parse(await AsyncStorage.getItem('user_data'));
        const { latitude, longitude, accuracy } = position.coords;
        if (accuracy <= 50) {
          try {
            await updateLocation(user, latitude, longitude);
            lastLocation = { lat: latitude, lng: longitude };
            lastSyncTime = Date.now();
            console.log('✅ Initial location synced');
          } catch (e) {
            console.log('❌ Initial sync failed:', e);
          }
        }
      },
      error => console.log('❌ Initial location error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    // Start watching + listen to app state
    await startWatch('moving');
    setupAppStateListener();

    console.log('✅ Foreground tracking started');
  } catch (e) {
    console.error('initBackgroundTracking error:', e);
  }
};

export const stopBackgroundTracking = async () => {
  try {
    stopWatch();

    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }

    // Reset state
    lastLocation = null;
    lastSyncTime = 0;
    isMoving = true;
    consecutiveIdleCount = 0;

    console.log('🛑 Tracking stopped');
  } catch (e) {
    console.error('stopBackgroundTracking error:', e);
  }
};
