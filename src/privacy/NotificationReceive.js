import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-animatable';
import Back from '../../assets/svg/back.svg';
import NoData from '../../assets/loties/nodata.json';
import { notification } from '../service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationCard from './NotificationCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';
import LottieView from 'lottie-react-native';

const HEADER_BLUE = '#0a478f';

const NotificationReceive = () => {
  const route = useRoute();
  const { switchValue, noncom } = route.params;

  const insets = useSafeAreaInsets();
  // Status bar height: safe-area inset first, Android fallback if it reports 0
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const navigation = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const userDate = await AsyncStorage.getItem('user_data');
      if (userDate) {
        const userData = JSON.parse(userDate);
        const { aidv1, aidv2, aidv4, user_typev1, user_typev2, user_typev4 } =
          userData;

        const type = noncom == '9' ? '1' : '99';
        const response = await notification(
          aidv1,
          aidv2,
          aidv4,
          user_typev1,
          user_typev2,
          user_typev4,
          type,
        );
        setData(response.data);
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // translucent so layout is identical on every Android version
  const statusBar = (
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="light-content"
    />
  );

  if (!isConnected) {
    return (
      <>
        {statusBar}
        <NoInternet />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        {statusBar}
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: switchValue ? 'black' : 'white' },
          ]}
        >
          <ActivityIndicator size="large" color={HEADER_BLUE} />
          <Text
            style={[
              styles.loadingText,
              { color: switchValue ? 'white' : 'black' },
            ]}
          >
            Data is loading...
          </Text>
        </View>
      </>
    );
  }

  const isEmpty = !data || data.length < 1;

  return (
    <>
      {statusBar}
      <View
        style={[
          styles.mainContainer,
          {
            backgroundColor: switchValue ? 'black' : 'white',
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header: paddingTop pushes content below the status bar */}
        <View
          style={[
            styles.subContainer,
            {
              backgroundColor: switchValue ? 'black' : HEADER_BLUE,
              paddingTop: 18 + topInset,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Back width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Notification</Text>
        </View>

        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <LottieView source={NoData} style={styles.lottie} autoPlay loop />
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <NotificationCard
                title={item.title}
                site_name={item.site_name}
                Alarm={item.message_txt}
                imei={item.imei}
                circle={item.state_name}
                site_id={item.site_id}
                version={item.version}
                start={item.alarm_start_time}
                mode={switchValue}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: HEADER_BLUE,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginLeft: 16,
    fontFamily: 'AndadaPro-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'AndadaPro-Regular',
    marginTop: 10,
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c8dcf4',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default NotificationReceive;
