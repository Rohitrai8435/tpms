import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Animated, Platform, Alert, Vibration } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';

const DGButton = ({name,color}) => {
  const [backgroundColor] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundColor, {
          toValue: 1,
          duration: 1000, // Duration for each color change
          useNativeDriver: false,
        }),
        Animated.timing(backgroundColor, {
          toValue: 0,
          duration: 1000, // Duration for each color change
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [backgroundColor]);

  const interpolatedColor = backgroundColor.interpolate({
    inputRange: [0.3, 0.6,1],
    outputRange: [ '#48cae4', '#00b4d8','#0076b6']  // Colors to transition between
  });

  const handlePress = () => {
    if (HapticFeedback) {
      HapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } else {
      // Fallback for platforms where haptic feedback is not available
      if (Platform.OS === 'android') {
        // Android vibration fallback
        Vibration.vibrate(100);
      } else {
        // iOS fallback
        Alert.alert('Haptic feedback not available');
      }
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedColor }]}>
      <TouchableOpacity
        style={[styles.button,{backgroundColor:color}]}
        onPress={handlePress}
        activeOpacity={0.7}>
        <Text style={styles.buttonText}>{name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width:100,
    height:100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 46,
  },
  button: {
    width: 90,
    height: 90,
    borderRadius: 50, // Makes the button circular
    backgroundColor: '#4CAF50', // Button color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
     fontFamily: 'AndadaPro-Regular',
    textAlign:'center',
  },
});

export default DGButton;
