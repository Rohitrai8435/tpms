import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModeFun = () => {
    const [mode, setMode] = useState(false);

    useEffect(() => {
        fetchMode();
    }, []);

    const fetchMode = async () => {
        try {
            const modeData = await AsyncStorage.getItem('darkMode');
            if (modeData !== null) {
                const userData = JSON.parse(modeData);
                setMode(userData);
            }
        } catch (error) {
            console.error('Error fetching mode:', error);
        }
    };

    return mode;
}

const styles = StyleSheet.create({})

export default ModeFun;
