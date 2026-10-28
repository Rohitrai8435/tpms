import { DrawerContentScrollView, createDrawerNavigator } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import Main from './Main';
import accountlogo from "../../assets/updated_logo.png";
import Cross from "./../../assets/svg/cross.svg";
import SadLogOut from "../../assets/sadpng.png";
// import AppNavigator from '../AppNavigator';
import DrawerComponent from './DrawerComponent';
import { Image } from 'react-native-animatable';
import { blue } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import { useNavigation } from '@react-navigation/native';
import DrawerIteams from './DrawerIteams';
import Sites from '../site/Sites';
import { NavigationContainer } from '@react-navigation/native';
import BottomSheet from './BottomSheet';
import { useDrawerStatus } from '@react-navigation/drawer';
import { stopBackgroundTracking } from '../service/BackgroundLocationService';

import {
  getMessaging,
  unsubscribeFromTopic,
  requestPermission,
  getToken,
} from '@react-native-firebase/messaging';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({navigation}) => {
  const [visibility, setVisibility] = useState(false);
  const [mode, setMode] = useState(false);
  const [log, setLog] = useState(false);

  const handleDrawerPress = val => {
    setVisibility(val);
  };
  const handleLogPress = val => {
    setLog(val);
  };

  useEffect(() => {
    modeFun();
  }, []);
  const modeFun = async () => {
    try {
      const modeV = await AsyncStorage.getItem('darkMode');

      if (modeV !== null) {
        setMode(JSON.parse(modeV));
      }
    } catch (error) {
      console.error('Error retrieving mode:', error);
    }
  };
  const logNo = () => {
    setLog(false);
  };

  // ✅ Unsubscribe using Modular API
  const unsubscribeFromTopicModular = async topic => {
    if (!topic) return;
    try {
      const messaging = getMessaging();
      await unsubscribeFromTopic(messaging, topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Error unsubscribing from topic (${topic}):`, error);
    }
  };
  const logOut = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const { aidv4, aidv2, aidv1 } = userData;
        unsubscribeFromTopicModular(aidv4);
        unsubscribeFromTopicModular(aidv2);
        unsubscribeFromTopicModular(aidv1);
      }

      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('profile');
      stopBackgroundTracking();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Main"
      drawerContent={() => (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: mode ? '#232323' : 'white' }}
        >
          <DrawerContentScrollView style={{ flex: 1 }}>
            <CustomDrawerLabel mode={mode} />
            <DrawerIteams
              label="App"
              setStatus={handleDrawerPress}
              setLogView={handleLogPress}
            />
          </DrawerContentScrollView>

          {visibility && (
            <BottomSheet setStatus={handleDrawerPress} mode={mode} />
          )}

          {useDrawerStatus() === 'open' && log && (
            <SafeAreaView
              style={{
                position: 'absolute',
                flex: 1,
                top: 0,
                left: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: mode ? '#3f3f3f' : 'white',
                  borderRadius: 18,
                  width: 280,
                  height: 300,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    width: '100%',
                    marginRight: 29,
                    marginTop: 10,
                  }}
                >
                  <TouchableOpacity onPress={logNo}>
                    <Cross width={25} height={25} fill="white" />
                  </TouchableOpacity>
                </View>
                <Image
                  source={SadLogOut}
                  style={[styles.imageLog, { width: 120, height: 120 }]}
                />
                <Text
                  style={[
                    styles.text,
                    { fontSize: 15, color: mode ? 'white' : 'black' },
                  ]}
                >
                  Are you sure you want to log out!!
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.logoutStyle,
                      { backgroundColor: mode ? '#840000' : 'red' },
                    ]}
                    onPress={logOut}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 15,
                          color: 'white',
                          paddingLeft: 10,
                          paddingRight: 10,
                        },
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.logoutStyle,
                      { backgroundColor: mode ? '#033519' : 'green' },
                    ]}
                    onPress={logNo}
                  >
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 15,
                          color: 'white',
                          paddingLeft: 10,
                          paddingRight: 10,
                        },
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          )}
        </SafeAreaView>
      )}
    >
      <Drawer.Screen
        name="Main"
        component={Main}
        initialParams={{ mode: mode }}
        options={{
          drawerLabel: () => <CustomDrawerLabel />,
        }}
      />
    </Drawer.Navigator>
  );
}


const CustomDrawerLabel = ({mode}) => {
    const [log_id, setLog] = useState(null);
    const [fullName, setName] = useState(null);
    const [imageUri, setImage] = useState(null);
    useEffect(() => {
        fun();
    }, []);
    const fun = async () => {

        const userData = await AsyncStorage.getItem('profile');
        if (userData) {
            const data = JSON.parse(userData);
            const { login_id, fullname, client_logo } = data;
            setLog(login_id);
            setName(fullname);
            setImage(client_logo);
        }
    }
    return (
        <View style={styles.container}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />)
                : (<Image source={accountlogo} style={styles.imageLog}></Image>)}

            <Text style={[styles.text,{color:mode?'white':'black'}]}>{log_id}</Text>
            <Text style={{ fontSize: 16, fontFamily: 'AndadaPro-Regular',color:mode?'white':'black' }}>{fullName}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 100,
        marginTop: '12%',
        borderWidth: 1,
        borderColor: '#1eb3ea',
        shadowColor: '#1eb3ea',
        borderRadius: 8,
    },
    imageLog: {
        width: 100,
        height: 100,
        borderRadius: 100,
        shadowColor: '#060707',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        marginTop: '12%'
    },
    text: {
        marginTop: 6,
        fontSize: 20,
        color: 'black',
        fontFamily: 'AndadaPro-Regular'
    },
    text2: {
        fontSize: 15,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    icon: {
        marginRight: 10,
    },
    itemText: {
        marginLeft: 16,
        fontSize: 16,
    }, logoutStyle:{
         margin:8,
         borderRadius:8,
         padding:8,
         backgroundColor:'red'
      
    }

});
export default DrawerNavigator;