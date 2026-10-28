import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SiteStatusCard from '../search/SiteStatusCard';
import TitleCard from '../search/TitleCard';
import PieChartHeader from '../search/PieChartHeader';

import SearchBar from '../search/SearchBar';
import DrawerHeader from './DrawerHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  alarmList,
  getSiteRunningSource,
  siteStatus,
} from '../service/ApiService';

import NoInternet from '../NoInternet';
import Orientation from 'react-native-orientation-locker';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

const HEADER_BLUE = '#0a478f';

const Main = ({ route }) => {
  const insets = useSafeAreaInsets();
  // Status bar height: safe-area inset first, Android fallback if it reports 0
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const [sys, setSys] = useState(null);
  const [the, setThe] = useState(null);
  const [ope, setOpe] = useState(null);
  const [pieDatav2, setpieDatav2] = useState(null);
  const [pieDatav4, setpieDatav4] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [mode, setMode] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showS, setShowS] = useState(true);
  const [showT, setShowT] = useState(true);
  const [showO, setShowO] = useState(true);
  const [siteCount, setSiteCount] = useState(null);
  const [dataRes, setDataRes] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const app = getApp();
  const messaging = getMessaging(app);

  // ✅ Ask for permission and get FCM token
  async function requestUserPermission() {
    try {
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('FCM permission denied');
        return;
      }

      let retries = 3;
      while (retries > 0) {
        try {
          const fcmToken = await getToken(messaging);
          console.log('FCM Token:', fcmToken);
          break;
        } catch (err) {
          retries--;
          if (retries === 0) {
            console.log('Could not get FCM token:', err.message);
          } else {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }
    } catch (error) {
      console.error('FCM permission error:', error);
    }
  }

  // ✅ Foreground listener
  function notificationListeners() {
    onMessage(messaging, async remoteMessage => {
      console.log('🔔 Foreground message received:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a message.',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
        },
      });
    });
  }

  // ✅ Background / killed-state handler
  function notificationListenersKillMode() {
    setBackgroundMessageHandler(messaging, async remoteMessage => {
      console.log('🕒 Background message received:', remoteMessage);
    });
  }

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    fetchSiteDetail();
  }, [refresh]);

  useEffect(() => {
    const fetchMode = async () => {
      try {
        const modeData = await AsyncStorage.getItem('darkMode');
        if (modeData) {
          const userData = JSON.parse(modeData);
          setMode(userData);
        }
      } catch (error) {
        console.error('Error fetching mode data:', error);
      }
    };
    fetchMode();
  }, []);

  useEffect(() => {
    Orientation.lockToPortrait(); // Lock to portrait mode
  }, []);

  const fetchSiteDetail = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('user_data');

      if (userDataString) {
        const userData = JSON.parse(userDataString);

        const {
          login_id,
          aidv4,
          ctmidv4,
          ctmidv1,
          user_typev4,
          client_versionv4,
          state,
          district,
          cluster,
          aidv1,
          user_typev1,
          aidv2,
          user_typev2,
          fullname,
          client_type_name,
          client_name,
          ctmidv2,
          client_versionv2,
          type,
        } = userData;
        setType(type);
        let syspending = [];
        let tpmspending = [];
        let iamspending = [];
        let sysResponse;
        try {
          sysResponse = await alarmList(
            login_id,
            aidv4,
            ctmidv4,
            user_typev4,
            client_versionv4,
            state,
            district,
            cluster,
            'SYS',
            aidv1,
            user_typev1,
            aidv2,
            user_typev2,
            ctmidv1,
            ctmidv2,
          );
          setSys(sysResponse.data);
          syspending =
            sysResponse.pending != 'Not Applicable' ? sysResponse.pending : [];
          sysResponse.data === 'Not Applicable'
            ? setShowS(false)
            : setShowS(true);
        } catch (error) {
          console.error('Error fetching SYS alarm list:', error);
        }

        let tpmsResponse;
        try {
          tpmsResponse = await alarmList(
            login_id,
            aidv4,
            ctmidv4,
            user_typev4,
            client_versionv4,
            state,
            district,
            cluster,
            'TPMS',
            aidv1,
            user_typev1,
            aidv2,
            user_typev2,
            ctmidv1,
            ctmidv2,
          );
          console.log(tpmsResponse.data);
          setThe(tpmsResponse.data);
          tpmspending =
            tpmsResponse.pending != 'Not Applicable'
              ? tpmsResponse.pending
              : [];
          tpmsResponse.data === 'Not Applicable'
            ? setShowT(false)
            : setShowT(true);
        } catch (error) {
          console.error('Error fetching TPMS alarm list:', error);
        }
        let iamsResponse;
        try {
          iamsResponse = await alarmList(
            login_id,
            aidv4,
            ctmidv4,
            user_typev4,
            client_versionv4,
            state,
            district,
            cluster,
            'IAMS',
            aidv1,
            user_typev1,
            aidv2,
            user_typev2,
            ctmidv1,
            ctmidv2,
          );
          setOpe(iamsResponse.data);
          iamspending =
            iamsResponse.pending != 'Not Applicable'
              ? iamsResponse.pending
              : [];
          iamsResponse.data === 'Not Applicable'
            ? setShowO(false)
            : setShowO(true);
        } catch (error) {
          console.error('Error fetching IAMS alarm list:', error);
        }

        const combinedList = [...syspending, ...tpmspending, ...iamspending];
        setPending(combinedList);

        let siteStatusResponse;
        try {
          siteStatusResponse = await siteStatus(
            login_id,
            aidv4,
            ctmidv4,
            user_typev4,
            client_versionv4,
            state,
            district,
            cluster,
            aidv1,
            ctmidv1,
            user_typev1,
            aidv2,
            ctmidv2,
            ctmidv2,
            user_typev2,
            client_versionv2,
            client_type_name,
          );

          setSiteCount(siteStatusResponse);
        } catch (error) {
          console.error('Error fetching site status:', error);
        }
        let pieDataResponse;
        try {
          pieDataResponse = await getSiteRunningSource(
            aidv4,
            ctmidv4,
            user_typev4,
            state,
            district,
            cluster,
            aidv2,
            ctmidv2,
            user_typev2,
          );

          setpieDatav2(pieDataResponse.datav2);
          setpieDatav4(pieDataResponse.datav4);
        } catch (error) {
          console.error('Error fetching site running source:', error);
        }
        setName(fullname === 'Super Admin' ? fullname : client_name);
      }
    } catch (error) {
      console.error('Error fetching site detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    await restFun();
  };

  const restFun = async () => {
    try {
      const userDate = await AsyncStorage.getItem('user_data');
      if (userDate) {
        const data = JSON.parse(userDate);
        data.state = '0';
        data.district = '0';
        data.cluster = '0';
        data.type = 'Pan India';
        if (data.fullname === 'Super Admin') {
          data.ctmidv2 = '0';
          data.ctmidv1 = '0';
          data.ctmidv4 = '0';
          data.aidv1 = '1';
          data.aidv2 = '1';
          data.aidv4 = '1';
        }
        await AsyncStorage.setItem('user_data', JSON.stringify(data));
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      {/* translucent so layout is identical on every Android version */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {isConnected ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: mode ? 'black' : '#cbe0f8' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={topInset}
              colors={['#0a478f', '#54c9b2', '#e8c592', '#e861af']}
            />
          }
        >
          <View style={{ flex: 1, flexDirection: 'column' }}>
            {/* Fills the area behind the status bar with the header colour */}
            <View
              style={{
                height: topInset,
                backgroundColor: mode ? 'black' : HEADER_BLUE,
              }}
            />

            <DrawerHeader name={name} type={type} mode={mode} />
            <SearchBar name={'deder'} reset={reset} mode={mode} />
            <SiteStatusCard mode={mode} siteSts={siteCount} />
            {showS && (
              <TitleCard
                name={'System Health'}
                syst={sys}
                alarm={'SYS'}
                show={'1'}
                mode={mode}
              />
            )}
            {showT && (
              <TitleCard
                name={'Theft Alarm'}
                thef={the}
                alarm={'TPMS'}
                show={'1'}
                mode={mode}
              />
            )}
            {showO && (
              <TitleCard
                name={'Operational Alarm'}
                oper={ope}
                alarm={'IAMS'}
                show={'1'}
                mode={mode}
              />
            )}
            {pending !== null && (
              <TitleCard
                name={'Pending Alarm'}
                oper={pending}
                alarm={'Pen'}
                show={'1'}
                mode={mode}
              />
            )}
            {(pieDatav2 || pieDatav4) && (
              <PieChartHeader
                mode={mode}
                dataRes={dataRes}
                datav2={pieDatav2}
                datav4={pieDatav4}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        <NoInternet />
      )}
    </>
  );
};

Main.navigationOptions = {
  headerTitle: () => (
    <Text style={styles.customHeaderTitle}>Custom Header Title</Text>
  ),
  headerLeft: () => null,
};

const styles = StyleSheet.create({
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    marginLeft: 16,
  },
});

export default Main;
