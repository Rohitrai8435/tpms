import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Switch, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import User from '../../assets/svg/user.svg'
import Term from '../../assets/svg/term.svg'
import Call from '../../assets/svg/call.svg'
import Email from '../../assets/svg/email.svg'
import Help from '../../assets/svg/help.svg'
import Privacy from '../../assets/svg/policy.svg'
import Notification from '../../assets/svg/notification.svg'
import RealTimeAlarm from '../../assets/svg/realTimeAlarm.svg'
import Mode from '../../assets/svg/mode.svg'
import Dark from '../../assets/svg/dark.svg'
import Light from '../../assets/svg/light.svg'
import LogOut from '../../assets/svg/logout.svg'
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from './BottomSheet';
import Chat from '../../assets/svg/chat-icon.svg';
import { Linking, Alert } from 'react-native';


const DrawerIteam = ({ label, setStatus,setLogView }) => {
   const [email, setEmail] = useState('');
   const [call, setCall] = useState('');
   const [client, setClient] = useState('');
   const [user, setUser] = useState('');
 
   const [version2, setVersion2] = useState('');
   const [switchValue, setSwitchValue] = useState(false);
   const navigation = useNavigation();
   const [show, setShow] = useState(null);
   const color = switchValue?'#3f3f3f':'#cbe0f8';
   const logOutC = '#ff6866'

   useEffect(() => {
      setData();
      
   }, []);

   const setData = async () => {
      try {
         const userDataString = await AsyncStorage.getItem('user_data');
         if (userDataString) {
            const userData = JSON.parse(userDataString);
            const {
              user_type,
              emailid,
              client_type_name,
              client_name,
              mobile,
              ctmidv2,
            } = userData;
            // console.log(userData);
            
            setEmail(emailid);
            setCall(mobile ? mobile : 'Na');
            setClient(client_name);
            setUser(user_type);
            setVersion2(ctmidv2);
         }
      }
      catch (error) {

      }
   }

   const setSwitch = async () => {
      try {
         const mode = await AsyncStorage.getItem('darkMode');
         // If mode exists in AsyncStorage, update switchValue accordingly
         if (mode !== null) {
            setSwitchValue(JSON.parse(mode));

         }
      } catch (error) {
         console.error('Error retrieving mode:', error);
      }
   };

   const handleSwitchToggle = async (value) => {
      // Update switch value when toggled
      setSwitchValue(value);
      try {
         // Update AsyncStorage with the new switch value
         await AsyncStorage.setItem('darkMode', JSON.stringify(value));
         navigation.replace('Drawer');
      } catch (error) {
         console.error('Error saving mode:', error);
      }
   };



   const handlePress = (val) => {
      setShow(val);
    
      if (val === '5') {
        setStatus(true);
      } else if (val === '6') {
        navigation.navigate('PrivacyAndPolicy');
      } else if (val === '8') {
        callLogOut();
      } else if (val === '9') {
        navigation.navigate('NotificationReceive', {
          switchValue,
          noncom: '9',
        });
      } else if (val === '10') {
        navigation.navigate('NotificationReceive', {
          switchValue,
          noncom: '10',
        });
      } else if (val === '11') {
        navigation.navigate('RealTimeAlarm');
      } else if (val === '12') {
        const phone = '919755522181';
        const message =
          'Hi, I consent to receive WhatsApp alerts from Shroti Telecom';
        const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
          message,
        )}`;

        Linking.canOpenURL(url)
          .then(supported => {
            if (!supported) {
              Alert.alert(
                'Error',
                'WhatsApp is not installed or URL not supported',
              );
            } else {
              return Linking.openURL(url);
            }
          })
          .catch(err => console.error('An error occurred', err));
      }
   };
   const callLogOut = async () => {
      setLogView(true);
   }

   return (
     <View
       style={{
         marginTop: 10,
         backgroundColor: switchValue ? '#232323' : 'white',
       }}
     >
       {user !== 'Superadmin' && (
         <TouchableOpacity
           onPress={() => handlePress('1')}
           style={[
             styles.drawerItem,
             show === '1' ? { backgroundColor: color } : null,
           ]}
         >
           <User
             width={24}
             height={24}
             fill={switchValue ? 'white' : '#232323'}
           />
           <Text
             style={[
               styles.itemText,
               { color: switchValue ? 'white' : 'black' },
             ]}
           >
             {client}
           </Text>
         </TouchableOpacity>
       )}
 
       <TouchableOpacity
         onPress={() => handlePress('4')}
         style={[
           styles.drawerItem,
           show === '4' ? { backgroundColor: color } : null,
         ]}
       >
         <Email
           width={24}
           height={24}
           fill={switchValue ? 'white' : '#232323'}
         />
         <Text
           style={[styles.itemText, { color: switchValue ? 'white' : 'black' }]}
         >
           {email}
         </Text>
       </TouchableOpacity>
       <TouchableOpacity
         onPress={() => handlePress('5')}
         style={[
           styles.drawerItem,
           show === '5' ? { backgroundColor: color } : null,
         ]}
       >
         <Help
           width={24}
           height={24}
           fill={switchValue ? 'white' : '#232323'}
         />
         <Text
           style={[styles.itemText, { color: switchValue ? 'white' : 'black' }]}
         >
           Help & Support
         </Text>
       </TouchableOpacity>
       <TouchableOpacity
         onPress={() => handlePress('12')}
         style={[
           styles.drawerItem,
           show === '12' ? { backgroundColor: color } : null,
         ]}
       >
         <Chat width={24} height={24} />
         <Text style={[styles.itemText, { color: 'black' }]}>
           Chat Support
         </Text>
       </TouchableOpacity>
       <TouchableOpacity
         onPress={() => handlePress('6')}
         style={[
           styles.drawerItem,
           show === '6' ? { backgroundColor: color } : null,
         ]}
       >
         <Privacy
           width={24}
           height={24}
           fill={switchValue ? 'white' : '#232323'}
         />
         <Text
           style={[styles.itemText, { color: switchValue ? 'white' : 'black' }]}
         >
           Privacy & Policy
         </Text>
       </TouchableOpacity>
       <TouchableOpacity
         onPress={() => handlePress('9')}
         style={[
           styles.drawerItem,
           show === '9' ? { backgroundColor: color } : null,
         ]}
       >
         <Notification width={24} height={24} />
         <Text
           style={[styles.itemText, { color: switchValue ? 'white' : 'black' }]}
         >
           Alarm Notification
         </Text>
       </TouchableOpacity>
       <TouchableOpacity
         onPress={() => handlePress('10')}
         style={[
           styles.drawerItem,
           show === '10' ? { backgroundColor: color } : null,
         ]}
       >
         <Notification width={24} height={24} />
         <Text
           style={[styles.itemText, { color: switchValue ? 'white' : 'black' }]}
         >
           Non Comm Notification
         </Text>
       </TouchableOpacity>
       {client != 'CREST DIGITEL' && (
         <TouchableOpacity
           onPress={() => handlePress('11')}
           style={[
             styles.drawerItem,
             show === '11' ? { backgroundColor: color } : null,
           ]}
         >
           <RealTimeAlarm width={24} height={24} />
           <Text style={[styles.itemText, { color: 'black' }]}>
             Real Time Alarm
           </Text>
         </TouchableOpacity>
       )}

       {/* <TouchableOpacity
         onPress={() => handlePress('7')}
         style={[
           styles.drawerItem1,
           show === '7'
             ? { backgroundColor: color }
             : { backgroundColor: switchValue ? '#232323' : 'white' },
         ]}
       >
         <View style={{ flexDirection: 'row' }}>
           {switchValue ? (
             <Light width={24} height={24} fill={'yellow'}></Light>
           ) : (
             <Dark width={24} height={24} fill={'#55e3ea'} />
           )}
           <Text
             style={[
               styles.itemText,
               { color: switchValue ? 'white' : 'black' },
             ]}
           >
             {'Dark Mode'}
           </Text>
         </View>
         <Switch
           styles={{ alignItems: 'end' }}
           trackColor={{ false: '#767577', true: '#81b0ff' }}
           thumbColor={switchValue ? '#f5dd4b' : 'black'}
           ios_backgroundColor="#3e3e3e"
           onValueChange={handleSwitchToggle}
           value={switchValue}
         />
       </TouchableOpacity> */}
       <TouchableOpacity
         onPress={() => handlePress('8')}
         style={[
           styles.drawerItem,
           show === '8' ? { backgroundColor: logOutC } : null,
         ]}
       >
         <LogOut
           width={24}
           height={24}
           fill={switchValue ? 'white' : '#232323'}
         />
         <Text
           style={[styles.itemText, { color: switchValue ? 'white' : 'black' }]}
         >
           {'Logout'}
         </Text>
       </TouchableOpacity>
     </View>
   );
}
const styles = StyleSheet.create({
   drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,

      marginLeft: 10,
      marginRight: 10,
      marginBottom: 4,
      borderRadius: 26,
   },
   drawerItem1: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      backgroundColor: 'white',
      marginLeft: 10,
      marginRight: 10,
      marginBottom: 4,
      justifyContent: 'space-between',
      borderRadius: 26,

   },
   icon: {
      marginRight: 10,
   },
   itemText: {
      marginLeft: 16,
      fontSize: 16,
      fontFamily: 'AndadaPro-Regular',
      color: 'black'
   }
})

export default DrawerIteam;
