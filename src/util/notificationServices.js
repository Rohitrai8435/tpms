import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  onMessage,
  getInitialNotification,
  AuthorizationStatus,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import NavigationService from './NavigationService';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

const app = getApp();
const messaging = getMessaging(app);

/**
 * Request Notification Permission (Modular API)
 */
export async function requestUserPermission() {
  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

/**
 * Display Notification on Foreground/Background
 */
export async function Screen(
  title,
  message_txt,
  channel_id,
  imei,
  site_name,
  version,
) {
  if (Platform.OS === 'ios') {
    await notifee.requestPermission();
  }

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
    title,
    body:
      priority === '111'
        ? `You have '${imei}' Non Active Sites`
        : `You have '${message_txt}' Alarm , Site Name: ${site_name} and imei: ${imei} version: ${version}`,
    android: {
      channelId,
      actions: [
        {
          title: 'Open',
          icon: version,
          pressAction: { id: 'snooze' },
        },
      ],
      pressAction: { id: 'default' },
      data: { i: imei, v: version },
    },
  });
}

/**
 * Foreground Notification Listener
 */
export function notificationListeners() {
  const unsubscribe = onMessage(messaging, async remoteMessage => {
    console.log('Foreground FCM message:', remoteMessage);
    const { title, message_txt, channel_id, imei, site_name, version } =
      remoteMessage.data;
    await Screen(title, message_txt, channel_id, imei, site_name, version);
  });

  return unsubscribe;
}

/**
 * Handle App Killed → Notification Tap
 */
export async function notificationListenersKillMode() {
  const initialNotification = await getInitialNotification(messaging);
  if (initialNotification) {
    console.log('Initial notification received:', initialNotification);
    const { title, message_txt, channel_id, imei, site_name, version } =
      initialNotification.data;
    await Screen(title, message_txt, channel_id, imei, site_name, version);
  }
}


/**background Event */
export async function setupBackgroundHandler() {
  setBackgroundMessageHandler(messaging, async remoteMessage => {
    console.log(messaging, 'notification check', remoteMessage);
    const { title, message_txt, channel_id, imei, site_name, version } =
      remoteMessage.data;
    await Screen(title, message_txt, channel_id, imei, site_name, version);
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background event received:', type, detail);
    try {
      if (type === EventType.ACTION_PRESS && detail.notification?.android) {
        const { body } = detail.notification;
        const regex = /imei:\s*(\d+)\s*version:\s*(\d+)/i;
        const match = body?.match(regex);

        if (match) {
          const imei = match[1];
          const version = match[2];
          const url = `myapp://siteDetail/${imei}/${version}`;
          await Linking.openURL(url); // triggers navigation when app foregrounds
        } else {
          console.log('IMEI or Version not found in notification body');
        }
      }
    } catch (e) {
      console.error('Error handling Notifee background event:', e);
    }
  });

  // notifee.onBackgroundEvent(async ({ type, detail }) => {
  //   console.log('Background event received:', type, detail);
  //   try {
  //     switch (type) {
  //       case 1:
  //         console.log(
  //           'Notification action pressed:',
  //           detail.notification?.body,
  //         );
  //         await updateNotificationStatusAsync(
  //           detail.notification?.body?.notification_id ||
  //             detail.notification?.id,
  //         );
  //         break;
  //     }
  //   } catch (error) {
  //     console.log('Error handling background event:', error);
  //   }
  // });
}