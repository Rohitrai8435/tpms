import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, Text,TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
// import { TouchableOpacity } from 'react-native-gesture-handler';
const AlarmListShow = ({ name, value, active_imei, active_port, app_alarm_id, alarm ,mode}) => {
    const navigation = useNavigation();
   
    const handlePress = () => {
        if (value != '0') {
            
            navigation.navigate('SiteAlarm', { name, active_imei, active_port, app_alarm_id, alarm ,mode});
        }

    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Animatable.View style={{ flex: 1 }} animation={'lightSpeedIn'} duration={500}>
                <View style={styles.container}>
                    <Text style={[styles.title,{color:mode?'white' :'black'}]}>{name}</Text>
                    <Text style={[styles.title,{color:mode?'white' :'black'}]}>{value}</Text>
                </View>
                <View style={{ marginHorizontal: 18, height: 1, backgroundColor: mode?'white':'black'}}></View>
            </Animatable.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        justifyContent: 'space-between',

    },
    title: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        fontFamily: 'AndadaPro-Regular',
        color: 'black',
        fontSize: 15,
    }
})

export default AlarmListShow;
