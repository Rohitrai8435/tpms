import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import Menu from '../../assets/loties/menuanim.json'
import LottieView from 'lottie-react-native';
import account from '../../assets/updated_logo.png';
import { useNavigation } from '@react-navigation/native';
const DrawerHeader = ({ name,type,mode }) => {
    const navigation = useNavigation();

    const openDrawer = () => {
        navigation.openDrawer();
    };
  
    return (
        <View style={[styles.container,{ backgroundColor: mode ? 'black' : '#0a478f' }]}>
            <TouchableOpacity onPress={openDrawer}>
                <LottieView source={Menu} style={styles.animation} autoPlay loop />
            </TouchableOpacity>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.title}>{name}</Text>
                <Text style={{ color: 'white', fontFamily: 'AndadaPro-Regular' }}>{type}</Text>
            </View>
            <Image source={account} style={styles.image}></Image>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
      
        shadowColor: '#000',
        padding: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 17,
        color: 'white',
        fontFamily: 'AndadaPro-Regular'
    },
    animation: {
        width: 35,
        height: 35,
        marginLeft: 8
    },
    image: {
        width: 35,
        height: 35,
        borderRadius: 200,
        marginRight: 8
    }
})

export default DrawerHeader;
