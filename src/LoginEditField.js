import React from 'react';
import { View, StyleSheet, TextInput,TouchableOpacity } from 'react-native';
import { Image } from 'react-native-animatable';
import Total from '../assets/svg/total.svg'

import { useState } from 'react';
import Hidepassword from '../assets/svg/hidepassword.svg'
const LoginEditField = ({ iconLeft, iconRight, placeholder, secure, hide, onChangeText }) => {
    const [pass, setShowPassword] = useState(secure);
    const [text, setText] = useState('');

    const handleChangeText = (inputText) => {
        setText(inputText);
        onChangeText(inputText);
    };

    const show = () => {
        setShowPassword(!pass);
    }
    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
          {iconLeft}
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#999"
            secureTextEntry={pass}
            onChangeText={handleChangeText}
            value={text}
          />
          <TouchableOpacity onPress={show}>
            {pass ? iconRight : hide}
          </TouchableOpacity>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'col',
        width: '85%',
        marginTop: 10,
    },
    subContainer: {
        flexDirection: 'row',
        flex: 1,
        borderRadius: 200,
        borderColor: '#0a478f',
        borderWidth: 1,
        padding: 4,
        alignItems: 'center'



    },
    image: {
        marginLeft: 12
    },
    input: {
        marginLeft: 6,
        flex: 1,
        color:'#232323'
    }


})

export default LoginEditField;
