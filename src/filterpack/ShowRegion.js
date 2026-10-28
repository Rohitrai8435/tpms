import React from 'react';
import { View, StyleSheet, Pressable ,TouchableOpacity} from 'react-native';
import { Text } from 'react-native-animatable';
// import { TouchableOpacity } from 'react-native-gesture-handler';

const ShowRegion = ({ name, id, type, pressInRegion, mode ,version}) => {
    const handleClick = () => {
        pressInRegion(name, id, type,version);
    }
    return (
        <TouchableOpacity onPress={handleClick}>
            <View style={{ backgroundColor: mode ? '#3f3f3f' : 'white', borderRadius: 28, paddingLeft: 20, paddingRight: 20, marginLeft: 12, marginRight: 12, marginTop: 6 }}>
                <Text style={{ padding: 10, fontFamily: 'AndadaPro-Regular', color: mode ? 'white' : 'black' }}>{name}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({})

export default ShowRegion;
