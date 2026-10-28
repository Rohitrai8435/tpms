import { startLocationWatch } from './BackgroundLocationService';
import notifee from '@notifee/react-native';
import { AndroidImportance } from '@notifee/react-native';

// This runs when Android wakes your app in the background
const HeadlessTask = async () => {
  console.log('Headless task started');

  // Restart foreground notification
  const channelId = await notifee.createChannel({
    id: 'location_tracking',
    name: 'Location Tracking',
    importance: AndroidImportance.LOW,
  });

  await notifee.displayNotification({
    title: 'Tracking Active',
    body: 'Your location is being tracked',
    android: {
      channelId,
      asForegroundService: true,
      ongoing: true,
      smallIcon: 'ic_launcher',
    },
  });

  // Restart location watch
  await startLocationWatch();
};

export default HeadlessTask;
