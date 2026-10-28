import { AppRegistry, Linking } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  setBackgroundMessageHandler,
  onMessage,
} from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import NavigationService from './src/util/NavigationService';
import { Screen } from './src/util/notificationServices';

// ✅ ADD THIS
import { startLocationWatch } from './src/service/BackgroundLocationService';

// Initialize Firebase App + Messaging
const app = getApp();
const messaging = getMessaging(app);

// ✅ Background message handler
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log(messaging, 'notification check', remoteMessage);
  const { title, message_txt, channel_id, imei, site_name, version } =
    remoteMessage.data;
  await Screen(title, message_txt, channel_id, imei, site_name, version);
});

onMessage(messaging, async remoteMessage => {
  console.log(messaging, 'notification check', remoteMessage);
  await displayNotifications(remoteMessage);
});

// ✅ Display notification handler (unchanged)
const displayNotifications = async remoteMessage => {
  await notifee.requestPermission();

  const { title, message_txt, channel_id, imei, site_name, version } =
    remoteMessage.data;

  let priority = channel_id;
  let channename = message_txt;
  let channelsound = 'default';

  switch (priority) {
    case '1':
      channename = 'Battery Loop Break';
      channelsound = 'theft';
      break;
    case '2':
      channename = 'Notification for Battery Bank Disconnect';
      channelsound = 'theft';
      break;
    case '3':
      channename = 'Notification For Shelter Loop Break , Ext Alarm ON';
      channelsound = 'theft';
      break;
    case '4':
      channename =
        'Notification For RRU Disconnect , BB Cabinet Door Open , BTS Cabinet Open';
      channelsound = 'theft';
      break;
    case '5':
      channename = 'Notification For Fiber cut , RTN Open , Fiber Cabinet open';
      channelsound = 'theft';
      break;
    case '6':
      channename =
        'Notification For DG Battery Disconnected,RTN cabinet open,airtel odc rack opened,cable loop break';
      channelsound = 'theft';
      break;
    case '7':
      channename =
        'Notification For Solar 48V Disconnect,Solar Loop Break Disconnect,Starter Cabinet Open,Moter 1,2 Loop Break Disconnected';
      channelsound = 'theft';
      break;
    case '8':
      channename =
        'Notification For BTS Cabinet Open,BTS Cabinet 1-2 Open ,BTS Cable Cut,Airtel BTS Cabinet Opened';
      channelsound = 'theft';
      break;
    case '9':
      channename =
        'Notification For DG Battery loop break,RF Cable disconnec,Servo cabinet open,BB Cabinet Open';
      channelsound = 'theft';
      break;
    case '9999':
      channename =
        'Non-Communication Alert: Site Not Communicated for Over 2 Hours';
      channelsound = 'noncom';
      break;
    case '11':
      channename = 'CRITICAL IAMS Notification';
      channelsound = 'alarm2';
      break;
    case '12':
      channename = 'Major IAMS Notification';
      channelsound = 'alarm2';
      break;
    case '111':
      channename = 'General Notification For Total Non Communication Sites';
      channelsound = 'noncom';
      break;
    default:
      channename = message_txt;
      channelsound = 'alarm3';
      break;
  }

  const channelId = await notifee.createChannel({
    id: priority,
    name: channename,
    sound: channelsound,
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: title,
    body:
      priority === '111'
        ? `You have '${imei}' Non Active Site`
        : `You have '${message_txt}' Alarm , Site Name: ${site_name} and imei: ${imei} version: ${version}`,
    android: {
      channelId,
      style: {
        type: 'BIGTEXT',
        text:
          priority === '111'
            ? `You have '${imei}' Non Active Site`
            : `You have '${message_txt}' Alarm, Site Name: ${site_name}, imei: ${imei}, version: ${version}`,
      },
      actions: [
        {
          title: 'Open',
          icon: 'https://my-cdn.com/icons/snooze.png',
          pressAction: { id: 'snooze' },
        },
      ],
      pressAction: { id: 'default' },
      data: { imei, version },
    },
  });
};

// ✅ Notifee background event (unchanged + location restart added)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Background event received:', type, detail);

  // 🔥 ADD THIS — restarts location when app wakes up from kill
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    await startLocationWatch();
  }

  try {
    if (type === EventType.ACTION_PRESS && detail.notification?.android) {
      const { body } = detail.notification;
      const regex = /imei:\s*(\d+)\s*version:\s*(\d+)/i;
      const match = body?.match(regex);

      if (match) {
        const imei = match[1];
        const version = match[2];
        const url = `myapp://siteDetail/${imei}/${version}`;
        await Linking.openURL(url);
      } else {
        console.log('IMEI or Version not found in notification body');
      }
    }
  } catch (e) {
    console.error('Error handling Notifee background event:', e);
  }
});

// // ✅ ADD THIS — Headless task registration (runs when app is killed)
// AppRegistry.registerHeadlessTask(
//   'BackgroundLocationTask',
//   () => require('./src/service/HeadlessTask').default,
// );

AppRegistry.registerComponent(appName, () => App);
