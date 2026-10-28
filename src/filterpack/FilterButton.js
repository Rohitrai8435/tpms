import React from 'react';
import {View, StyleSheet,TouchableOpacity} from 'react-native';
import { Text } from 'react-native-animatable';
// import { TouchableOpacity } from 'react-native-gesture-handler';

const FilterButton = ({ onPressSearch,mode }) => {
    return (
            <View style={styles.container}>
            <TouchableOpacity style={[styles.login,{backgroundColor:mode?'#232323':'#0a478f'}]} onPress={onPressSearch}>
            <Text style={styles.textColor}>Search</Text>
            </TouchableOpacity>
        </View>
       
    );
}

const styles = StyleSheet.create({
    container:{
        width:'85%',
        marginTop:'12%',
    },
    login:{
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#0a478f',
    padding:17,
    borderRadius:28
    },
    textColor:{
     color:'white',
     fontSize:15
    }
})

export default FilterButton;
