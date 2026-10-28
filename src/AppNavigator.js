import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer ,DarkTheme} from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-animatable';
import Sites from './site/Sites';
import Filter from './filterpack/Filter';
import SiteAlarm from './site/SiteAlarm';
import PrivacyAndPolicy from './privacy/PrivacyAndPolicy';
import RunHours from './run/RunHours';
import DrawerNavigator from './drawer/DrawerNavigator';
const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator>
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
            <Stack.Screen name="Sites" component={Sites} /> 
            <Stack.Screen name='Filter' component={Filter} />
            <Stack.Screen name='SiteAlarm' component={SiteAlarm} />
            <Stack.Screen name='PrivacyAndPolicy' component={PrivacyAndPolicy} />
            <Stack.Screen name='RunHours' component={RunHours}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({})

export default AppNavigator;
