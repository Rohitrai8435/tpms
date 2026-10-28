import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-animatable';
import Drop from '../../assets/svg/drop.svg';
const FilterContainer = ({heading,value,mode}) => {
    return (
        <View style={{ marginLeft: 18, marginRight: 18, marginTop: 5 }}>
            <Text style={{fontSize: 14,fontFamily: 'AndadaPro-Regular',color: mode?'white':'black',padding:10,paddingTop:5}}>{heading}</Text>
             <View style={{borderColor:'#1ee0ac',borderRadius:8,borderWidth:1 ,flexDirection:'row' ,justifyContent:'space-between',alignItems:'center'}}>
                <Text style={{padding:13,fontFamily:  'AndadaPro-Regular',color: mode?'white':'black'}}>{value}</Text>
                <Drop style={{marginRight:10}} width={24} height={24} fill={'#1ee0ac'}></Drop>
             </View>
        </View>
    );
}

const styles = StyleSheet.create({})

export default FilterContainer;
