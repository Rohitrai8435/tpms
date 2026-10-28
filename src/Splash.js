import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import accountlogo from '../assets/updated_logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { login } from './service/ApiService';
import NoInternet from './NoInternet';
import NetInfo from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import Orientation from 'react-native-orientation-locker';
import {
  initBackgroundTracking,
  stopBackgroundTracking,
} from './service/BackgroundLocationService';

export const topic = 'Shroti';

const Splash = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const unsubscribeFromTopics = async topics => {
    try {
      await messaging().unsubscribeFromTopic(topics);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');

        if (userData) {
          const data = JSON.parse(userData);
          const { password, login_id, aidv4, aidv2, aidv1 } = data;

          try {
            const response = await login(login_id, password);

            if (response.data) {
              // ✅ permissions requested + logged inside initBackgroundTracking
              try {
                await initBackgroundTracking();
              } catch (trackingError) {
                // ✅ tracking fail must not block navigation
                console.error('Tracking init failed:', trackingError);
              }
              navigation.replace('Home');
            } else if (isConnected) {
              // ✅ session expired — stop tracking + clear storage
              try {
                await stopBackgroundTracking();
              } catch (e) {
                console.error('Stop tracking error:', e);
              }

              await Promise.all([
                unsubscribeFromTopics(aidv4),
                unsubscribeFromTopics(aidv2),
                unsubscribeFromTopics(aidv1),
                unsubscribeFromTopics(topic),
                AsyncStorage.removeItem('user_data'),
              ]);

              navigation.replace('Login');
            }
          } catch (error) {
            console.error('Login or tracking error:', error);
            navigation.replace('Home');
          }
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Splash error:', error);
        navigation.replace('Login');
      }
    };

    setTimeout(() => {
      checkLoginStatus();
    }, 2000);
  }, [navigation, isConnected]);

  return isConnected ? (
    <View
      style={{
        backgroundColor: 'black',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animatable.Image
        source={accountlogo}
        style={{
          height: 120,
          width: 120,
          borderRadius: 100,
          marginBottom: 20,
        }}
        duration={2000}
        animation="zoomIn"
      />
      <Animatable.Text
        style={{
          color: 'white',
          fontSize: 24,
          fontWeight: '200',
          textAlign: 'center',
        }}
        duration={2000}
        animation="bounceInDown"
      >
        {'Welcome to Shroti Telecom \n Pvt Ltd'}
      </Animatable.Text>
    </View>
  ) : (
    <NoInternet />
  );
};

export default Splash;
