import React, { useEffect } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/Home';
import Splash from './src/Splash';
import Login from './src/Login';
import SiteDetail from './src/site/SiteDetail';
import NavigationService from './src/util/NavigationService';
import {
  notificationListeners,
  notificationListenersKillMode,
  requestUserPermission,
} from './src/util/notificationServices';
import VersionCheck from 'react-native-version-check';

const Stack = createStackNavigator();

const App = () => {
  const app = getApp();
  const messaging = getMessaging(app);

  // ✅ Check for app update
  const checkForUpdate = async () => {
    try {
      const currentVersion = VersionCheck.getCurrentVersion();
      const latestVersion = await VersionCheck.getLatestVersion({
        forceUpdate: true,
      });
      const updateNeeded = await VersionCheck.needUpdate({ forceUpdate: true });

      console.log('🔍 Current App Version:', currentVersion);
      console.log('🆕 Latest Store Version:', latestVersion);
      console.log('📲 Update Needed:', updateNeeded?.isNeeded);

      if (updateNeeded?.isNeeded) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Please update to continue.',
          [
            {
              text: 'Update',
              onPress: () => Linking.openURL(updateNeeded.storeUrl),
            },
            { text: 'Later', style: 'cancel' },
          ],
          { cancelable: false },
        );
      }
    } catch (error) {
      console.log('❌ Error checking for update:', error);
    }
  };

  // ✅ Permission + listeners
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            await requestUserPermission();
            notificationListeners();
            notificationListenersKillMode();
          } else {
            console.log('Notification permission denied.');
          }
        } else {
          await requestUserPermission();
          notificationListeners();
          notificationListenersKillMode();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    checkForUpdate();
    requestNotificationPermission();

    // ✅ Foreground event handler
    const unsubscribeForeground = notifee.onForegroundEvent(
      async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS) {
          const { body, channelId } = detail.notification;
          const regex = /imei:\s(\d+)\sversion:\s(\d+)/;
          const match = body?.match(regex);

          if (match) {
            const imei = match[1];
            const version = match[2];

            setTimeout(() => {
              if (channelId !== '111') {
                NavigationService.navigate('SiteDetail', {
                  imei,
                  version:
                    version === '4' ? 'v4' : version === '2' ? 'v2' : 'v1',
                  mode: false,
                });
              }
            }, 500);
          }
        }
      },
    );

    // ✅ Handle background state
    const unsubscribeBackground = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        if (remoteMessage?.data) {
          const { imei, version, channel_id } = remoteMessage.data;
          console.log('App opened from background state:', remoteMessage);
          if (channel_id !== '111') {
            NavigationService.navigate('SiteDetail', {
              imei,
              version: version === '4' ? 'v4' : version === '2' ? 'v2' : 'v1',
              mode: false,
            });
          }
        }
      },
    );

    // ✅ Handle killed state
    (async () => {
      const remoteMessage = await getInitialNotification(messaging);
      if (remoteMessage?.data) {
        const { imei, version, channel_id } = remoteMessage.data;
        console.log('App opened from killed state:', remoteMessage);
        if (channel_id !== '111') {
          setTimeout(() => {
            NavigationService.navigate('SiteDetail', {
              imei,
              version: version === '4' ? 'v4' : version === '2' ? 'v2' : 'v1',
              mode: false,
            });
          }, 1000);
        }
      }
    })();

    // ✅ Cleanup
    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  return (
    <NavigationContainer
      ref={ref => NavigationService.setTopLevelNavigator(ref)}
      fallback={<ActivityIndicator animating />}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SiteDetail" component={SiteDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
