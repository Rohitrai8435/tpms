import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import menu from "../../assets/menu.png";
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Sites from '../site/Sites';
const Stack = createStackNavigator();
const Active = ({ icon, name, count, status,mode }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (count > 0) {
     
      navigation.navigate('Site', { status,mode});
    }
  };

  return (

    <View style={{ flex: 1, flexDirection: 'col', justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={handlePress}>
        <View style={{ flexDirection: 'row' }}>
          {icon}
          <Text style={{ fontSize: 16, marginLeft: 6, color: 'black', fontFamily: 'AndadaPro-SemiBold',color:mode?'white':'black' }}>{count}</Text>
        </View>
        <Text style={{ marginTop: 3, color: 'black', fontFamily: 'AndadaPro-Regular',color:mode?'white':'black' }}>{name}</Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({})

export default Active;
