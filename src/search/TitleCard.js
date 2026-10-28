import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList,TouchableOpacity } from 'react-native';
import { Image, Text } from 'react-native-animatable';
import menu from "../../assets/menu.png";
import Drop from '../../assets/svg/drop.svg'
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AlarmListShow from '../drawer/AlarmListShow';
const AnimatedFlatList = Animatable.createAnimatableComponent(FlatList);
const TitleCard = ({ name, syst, thef, oper, alarm ,mode}) => {
  const navigation = useNavigation();
  const [show, setShow] = useState(false);
  const [initial, setRotation] = useState(0);
  const [tempData, setTempData] = useState(null);
  const [sys, setSys] = useState(null);
  const [the, setThe] = useState(null);
  const [ope, setOpe] = useState(null);
  
  useEffect(() => {
    if (syst) {
      setSys(syst);
    } else if (thef) {
      setThe(thef);
    } else if (oper) {
      setOpe(oper);
    }
  }, [syst, thef, oper]);

  useEffect(() => {
    if (show) {
      if (sys)
        setTempData(sys);
      else if (the) {
        // console.log(the)
        setTempData(the);
      }
      else if (ope) {
        //  console.log(ope);
        setTempData(ope);
      }
      setRotation(180);
    } else {
      setTempData(null);
      setRotation(0);
    }
  }, [show, sys, the, ope]);



  const handlePress = () => {
    setShow(!show);
  }

  return (
    <View>
      <TouchableOpacity onPress={handlePress}>
        <View style={[styles.container,{backgroundColor:mode?'#232323':'#0a478f'}]}>
          <View>
            <Text style={styles.title}>{name}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Drop width={18} height={18} fill={'white'} rotation={initial} />
          </View>
        </View>
      </TouchableOpacity>
      {tempData && (
        <AnimatedFlatList
        scrollEnabled={false}
          data={tempData}
          renderItem={({ item }) => (
          <AlarmListShow name={item.name} value={item.count} active_imei={item.active_imei} active_port={item.active_port} app_alarm_id={item.app_alarm_id} alarm={alarm}  mode={mode}/>
          )}
        keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    backgroundColor: '#0a478f',
    borderRadius: 8,
    marginLeft: 18,
    marginTop: 8,
    marginRight: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: 'white',
    fontFamily: 'AndadaPro-SemiBold'
  },

})

export default TitleCard;
