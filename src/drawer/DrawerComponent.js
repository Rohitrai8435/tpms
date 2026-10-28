import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

const DrawerComponent = () => {
    return (
        <View style={styles.parent}>
            <View style={styles.child}>
                <Text>Hello</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    parent: {
        flex: 1
    },
    child: {
        height: "20%",
        width: "100%",
    }
})

export default DrawerComponent;
