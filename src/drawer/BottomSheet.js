import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-animatable';
import Email from '../../assets/svg/email.svg';
import Call from '../../assets/svg/call.svg';
import WhatsApp from '../../assets/svg/WhatsApp.svg';
import Telegram_logo from '../../assets/svg/Telegram_logo.svg';
import * as Animatable from 'react-native-animatable';
import { get_support_detail } from '../service/ApiService';
const BottomSheet = ({ setStatus, mode }) => {
  const [supportDetail, setSupportDetail] = useState(null);
  // console.log('Support Detail:', supportDetail);

  const openTelegram = async () => {
    try {
      await Linking.openURL('tg://resolve?domain=Shroti_Internal_Bot');
    } catch (e) {
      await Linking.openURL('https://t.me/Shroti_Internal_Bot');
    }
  };

  useEffect(() => {
    const fetchSupportDetail = async () => {
      try {
        const data = await get_support_detail();
        console.log('Support Detail:', data);
        setSupportDetail(data.data);
      } catch (error) {
        console.error('Error fetching support detail:', error);
      }
    };
    fetchSupportDetail();
  }, []);

  const handlePress = (open, application) => {
    Linking.openURL(`${open}${application}`);
  };
  const closeBottomSheet = () => {
    setStatus(false);
  };

  return (
    <View style={styles.backDrop}>
      <Pressable
        onPress={closeBottomSheet}
        style={{ height: '70%', width: '100%' }}
      ></Pressable>
      <Animatable.View
        style={[
          styles.bottomSheet,
          { backgroundColor: mode ? 'black' : 'white' },
        ]}
        duration={500}
        animation={'bounce'}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: mode ? '#3f3f3f' : '#0a478f' },
          ]}
        >
          <Text style={styles.title}>Help & Support</Text>
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => handlePress('tel:', supportDetail?.number1)}
          >
            <View
              style={[styles.box, { borderColor: mode ? 'white' : 'black' }]}
            >
              <Call width={24} height={24} fill={mode ? 'white' : '#0a478f'} />
              <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
                {supportDetail?.number1}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlePress('tel:', supportDetail?.number2)}
          >
            <View
              style={[styles.box, { borderColor: mode ? 'white' : 'black' }]}
            >
              <Call width={24} height={24} fill={mode ? 'white' : '#0a478f'} />
              <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
                {supportDetail?.number2}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlePress('mailto:', supportDetail?.email1)}
          >
            <View
              style={[styles.box, { borderColor: mode ? 'white' : 'black' }]}
            >
              <Email
                width={24}
                height={24}
                fill={mode ? 'white' : '#0a478f'}
              ></Email>
              <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
                {supportDetail?.email1}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handlePress(`whatsapp://send?phone=${supportDetail?.whatsapp}`)
            }
          >
            <View
              style={[styles.box, { borderColor: mode ? 'white' : 'black' }]}
            >
              <WhatsApp
                width={24}
                height={24}
                fill={mode ? 'white' : '#0a478f'}
              ></WhatsApp>
              <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
                {supportDetail?.whatsapp}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={openTelegram}>
            <View
              style={[styles.box, { borderColor: mode ? 'white' : 'black' }]}
            >
              <Telegram_logo
                width={24}
                height={24}
                fill={mode ? 'white' : '#0a478f'}
              ></Telegram_logo>
              <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
                Shroti Bot
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backDrop: {
    position: 'absolute',
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    width: '100%',
    height: '45%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    paddingLeft: 12,
    paddingRight: 10,
    justifyContent: 'center',
  },
  header: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'AndadaPro-Regular',
    color: 'white',
  },
  text: {
    fontSize: 15,
    fontFamily: 'AndadaPro-Regular',
    marginLeft: 8,
    color: 'black',
  },
  box: {
    flexDirection: 'row',
    padding: 12,
    marginTop: 10,
    borderRadius: 4,
    borderColor: 'black',
    borderWidth: 1,
  },
});

export default BottomSheet;
