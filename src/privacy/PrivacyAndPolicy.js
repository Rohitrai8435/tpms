import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Back from '../../assets/svg/back.svg';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const HEADER_BLUE = '#0a478f';

const PrivacyAndPolicy = () => {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();
  // Status bar height: safe-area inset first, Android fallback if it reports 0
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <>
      {/* translucent so layout is identical on every Android version */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={[styles.mainContainer, { paddingBottom: insets.bottom }]}>
        {/* Header: paddingTop pushes content below the status bar */}
        <View style={[styles.subContainer, { paddingTop: 18 + topInset }]}>
          <TouchableOpacity
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Back width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy & Policy</Text>
        </View>
        <WebView
          source={{ uri: 'https://dashboard.shrotitele.com/policy/' }}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
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
});

export default PrivacyAndPolicy;
