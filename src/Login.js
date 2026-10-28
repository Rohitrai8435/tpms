import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Image, Text } from 'react-native-animatable';
import Account from '../assets/updated_logo.png';

import LottieView from 'lottie-react-native';
import LoginLoties from '../assets/loties/login.json';
import LoginEditField from './LoginEditField';
import LoginButton from './LoginButton';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Email from '../assets/svg/emaillog.svg';
import Lock from '../assets/svg/lock.svg';
import { useState } from 'react';
import ShowPassword from '../assets/svg/showpassword.svg';
import Hidepassword from '../assets/svg/hidepassword.svg';
import { login } from './service/ApiService';
import { getApp } from '@react-native-firebase/app';
import { PermissionsAndroid, Platform } from 'react-native'; 
import {
  getMessaging,
  subscribeToTopic,
} from '@react-native-firebase/messaging';
import Orientation from 'react-native-orientation-locker';
import { topic } from './Splash';
import { initBackgroundTracking } from './service/BackgroundLocationService';
const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  var version = {
    login_id: null,
    emailid: null,
    fullname: null,
    client_type_name: null,
    lowest_level: '0',
    client_logo: null,
    mobile: null,
    emp_typev1: null,
    user_typev1: null,
    type: 'Pan India',
    state: '0',
    district: '0',
    cluster: '0',
    aidv1: '-1',
    client_versionv1: 'v1',
    ctmidv1: null,
    emp_typev2: null,
    user_typev2: null,
    aidv2: '-1',
    client_versionv2: 'v2',
    ctmidv2: null,
    emp_typev4: null,
    user_typev4: null,
    aidv4: '-1',
    client_versionv4: 'v4',
    ctmidv4: null,
    password: null,
  };
  const mode = false;
  // get modular messaging instance once
  const app = getApp();
  const messaging = getMessaging(app);


  const requestLocationPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const fineGranted =
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (!fineGranted) return false;

      // background location — separate request required on Android 11+
      if (Platform.Version >= 29) {
        const bgGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location',
            message: 'Allow tpmsapp to track your location in the background?',
            buttonPositive: 'Allow always',
            buttonNegative: 'Deny',
          },
        );
        return bgGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (e) {
      console.warn('Permission error:', e);
      return false;
    }
  };

  // modular subscribe
  const subscribeToFcmTopic = async topicName => {
    try {
      // modular API: subscribeToTopic(messaging, topic)
      await subscribeToTopic(messaging, topicName);
      console.log(`Subscribed to topic ${topicName}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topicName}:`, error);
    }
  };

  useEffect(() => {
    Orientation.lockToPortrait(); // Lock to portrait mode
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await login(username, password);
      console.log(response);
      if (response.status === 200) {
        subscribeToFcmTopic('test1');

        if (response && response?.data && response?.data.length > 0) {
          // console.log(response.data.length);
          version.password = password;

          for (var i = 0; i < response.data.length; i++) {
            if (
              response.data[i].login_id === username &&
              response.data[i].user_password === password
            ) {
              profile = response.data[i];
              await AsyncStorage.setItem('profile', JSON.stringify(profile));
              console.log(await AsyncStorage.getItem('profile'), 'profile');
            }
            if (response.data[i].fullname == 'Super Admin') {
              const userData = response.data[i];
              version.aidv1 = '1';
              version.aidv2 = '1';
              version.aidv4 = '1';
              version.ctmidv1 = '0';
              version.ctmidv2 = '0';
              version.ctmidv4 = '0';
              version.lowest_level = userData.lowest_level;
              version.user_typev4 = 'Superadmin';
              version.user_typev2 = 'Superadmin';
              version.user_typev1 = 'Superadmin';
              version.client_versionv4 = 'v4';
              version.client_versionv2 = 'v2';
              version.client_versionv1 = 'v1';
              version.client_type_name = 'SuperAdmin';
              version.client_name = 'SuperAdmin';
              version.mobile = userData.mobile;
              version.login_id = userData.login_id;
              version.emailid = userData.emailid;
              version.fullname = userData.fullname;
              version.emp_typev4 = '0';
              version.emp_typev1 = '0';
              version.emp_typev2 = '0';
            } else if (response.data[i].client_version == 'v4') {
              const userData = response.data[i];
              if (userData.fullname === 'Super Admin') {
                version.ctmidv4 = '0';
              }
              version.aidv4 = userData.aid;
              subscribeToFcmTopic(userData.aid);
              version.emp_typev4 = userData.emp_type;
              version.user_typev4 = userData.user_type;
              if (userData.fullname != 'Super Admin') {
                version.ctmidv4 = userData.ctmid;
              }
              version.login_id = userData.login_id;
              version.emailid = userData.emailid;
              version.fullname = userData.fullname;
              version.client_type_name = userData.client_type_name;
              version.client_name = userData.client_name;
              version.client_logo = userData.client_logo;
              version.mobile = userData.mobile;
              version.lowest_level = userData.lowest_level;
            } else if (response.data[i].client_version == 'v1') {
              const userData = response.data[i];
              version.aidv1 = userData.aid;
              subscribeToFcmTopic(userData.aid);
              version.emp_typev1 = userData.emp_type;
              version.user_typev1 = userData.user_type;
              version.ctmidv1 = userData.ctmid;
              version.login_id = userData.login_id;
              version.emailid = userData.emailid;
              version.fullname = userData.fullname;
              version.client_type_name = userData.client_type_name;
              version.client_name = userData.client_name;
              version.client_logo = userData.client_logo;
              version.mobile = userData.mobile;
              // console.log('Login Response v1: ', userData);
            } else if (response.data[i].client_version == 'v2') {
              const userData = response.data[i];
              subscribeToFcmTopic(userData.aid);
              version.aidv2 = userData.aid;
              version.emp_typev2 = userData.emp_type;
              version.user_typev2 = userData.user_type;
              version.ctmidv2 = userData.ctmid;
              version.login_id = userData.login_id;
              version.emailid = userData.emailid;
              version.fullname = userData.fullname;
              version.client_type_name = userData.client_type_name;
              version.client_name = userData.client_name;
              version.client_logo = userData.client_logo;
              version.mobile = userData.mobile;
            }
          }
          await AsyncStorage.setItem('user_data', JSON.stringify(version));
          console.log('Version Log', version);
          subscribeToFcmTopic(topic);
          await AsyncStorage.setItem('darkMode', JSON.stringify(mode));

          // ✅ Step 1: request permissions first
          await requestLocationPermissions();

          // ✅ Step 2: await tracking — crash will now be caught below
          try {
            await initBackgroundTracking();
          } catch (trackingError) {
            console.log('Tracking failed but continuing:', trackingError);
            // ✅ don't let tracking crash block navigation
          }
          navigation.replace('Home');
        } else {
          console.log('Login failed:', response.message);
          Toast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Error',
            text2: response.message || 'Invalid username or password.',
          });
        }
      }
    } catch (error) {
      console.log('Login Error:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <View style={styles.container}>
      <LottieView source={LoginLoties} style={styles.animation} autoPlay loop />
      <View style={styles.textEditBox}>
        <ScrollView style={{ flex: 1, marginTop: 40, width: '100%' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image source={Account} style={styles.image}></Image>
            <Text style={{ marginBottom: 10, color: 'black', fontSize: 18 }}>
              Welcome to Shroti Telecom Pvt.Ltd
            </Text>
            <LoginEditField
              iconLeft={
                <Email
                  width={24}
                  height={24}
                  style={{ marginLeft: 16 }}
                ></Email>
              }
              placeholder={'UserId'}
              secure={false}
              onChangeText={text => setUsername(text)}
            ></LoginEditField>
            <LoginEditField
              iconRight={
                <ShowPassword
                  width={24}
                  height={24}
                  style={{ marginRight: 16 }}
                ></ShowPassword>
              }
              iconLeft={
                <Lock width={24} height={24} style={{ marginLeft: 16 }}></Lock>
              }
              placeholder={'Password'}
              secure={true}
              hide={
                <Hidepassword
                  width={24}
                  height={24}
                  style={{ marginRight: 16 }}
                ></Hidepassword>
              }
              onChangeText={text => setPassword(text)}
            ></LoginEditField>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#007bff"
                style={{ marginTop: 20 }}
              />
            ) : (
              <LoginButton onPress={handleLogin} />
            )}
            <Toast />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: 10,
  },
  container: {
    backgroundColor: '#cbe0f8',
    height: '100%',
  },
  textEditBox: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },

  animation: {
    width: '100%',
    height: 200,
    marginTop: '10%',
  },
  login: {
    flexDirection: 'row',
  },
});

export default Login;
