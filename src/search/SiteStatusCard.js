import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native-animatable';
import menu from "../../assets/menu.png";
import Active from './Active';
import Activesite from '../../assets/svg/active.svg'
import Total from '../../assets/svg/total.svg'
import NonActive from '../../assets/svg/noactive.svg'
import { siteStatus } from '../service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SiteStatusCard = ({ navigation,mode,siteSts}) => {
  //console.log("status card ",siteSts)
  return (
    <View style={[styles.container,{backgroundColor:mode?'#3f3f3f':'#fff'}]}>
      <View style={[styles.header,{backgroundColor:mode?'#232323':'#0a478f'}]}>
        <Text style={styles.title}>SITE STATUS</Text>
      </View>
      <View style={styles.align}>
        <Active name={"Total Site"} count={siteSts?.data[0]} icon={<Total width={24} height={24} />} navigation={navigation} mode={mode} />
        <Active name={"Active Site"} count={siteSts?.data[1]} icon={<Activesite width={24} height={24} navigation={navigation} />} status={"1"}  mode={mode}/>
        <Active name={"Non-Active"} count={siteSts?.data[2]} icon={<NonActive width={24} height={24} navigation={navigation} />} status={"2"}  mode={mode}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'col',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginLeft: 18,
    marginTop: 8,
    marginRight: 18,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#0a478f'
  },
  title: {
    fontSize: 16,
    fontFamily: 'AndadaPro-SemiBold',
    padding: 10,
    color: 'white'
  },
  align: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
});

export default SiteStatusCard;
