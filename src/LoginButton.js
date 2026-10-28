import React from 'react';
import { View, StyleSheet,TouchableOpacity } from 'react-native';
import { Text } from 'react-native-animatable';


const LoginButton = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.login} onPress={onPress}>
                <Text style={styles.textColor}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '85%',
        marginTop: '12%',


    },
    login: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a478f',
        padding: 17,
        borderRadius: 28
    },
    textColor: {
        color: 'white',
        fontSize: 15
    }

})

export default LoginButton;
