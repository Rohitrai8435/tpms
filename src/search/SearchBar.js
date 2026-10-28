import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import SearchIcon from '../../assets/svg/search.svg';
import LottieView from 'lottie-react-native';
import Reset from '../../assets/loties/reset.json'
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Stack = createStackNavigator();
const SearchBar = ({reset,mode}) => {
 //   const [navigateTo, setNavigate] = useState(false);
    const navigation = useNavigation();
   

   /* useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await AsyncStorage.getItem('user_data');
                if (userData) {
                    const Data = JSON.parse(userData);
                    const { fullname } = Data;
                    if (fullname === "Super Admin") {
                        setNavigate(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();

    }, []);*/
    const handlePress = () => {

        navigation.navigate("Filter",{mode});

    };
    return (
        <View style={styles.container}>
            <TouchableOpacity style={{ flex: 1 }} onPress={handlePress}>
                <View style={[styles.searchContainer,{backgroundColor:mode?'#3f3f3f': '#fff'}]}>
                    <View style={styles.searchIconContainer}>
                        <SearchIcon width={22} height={22} fill={'white'}  />
                    </View>
                    <Text style={[styles.title,{color:mode?'white':'black'}]}>Search By Region</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={reset}>
            <View style={styles.animationContainer}>
                <LottieView source={Reset} style={styles.animation} autoPlay loop />
                <View style={styles.textContainer}>
                    <Text style={styles.text}>Reset</Text>
                </View>
            </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginRight: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchContainer: {
        flexDirection: 'row',
        flex: 1,
     
        borderRadius: 26,
        marginLeft: 18,
        marginTop: 8,
        marginRight: 18,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    searchIconContainer: {
        marginRight: 6
    },
    animationContainer: {
        position: 'relative',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    animation: {
        width: 40,
        height: 40,
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    text: {
        fontSize: 10,
        color: 'orange'
    },
});

export default SearchBar;
