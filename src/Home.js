import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './drawer/DrawerNavigator';
import Sites from './site/Sites';
import Filter from './filterpack/Filter';
import SiteDetail from './site/SiteDetail';
import SiteAlarm from './site/SiteAlarm';
import PrivacyAndPolicy from './privacy/PrivacyAndPolicy';
import OnPieChartClick from './site/OnPieChartClick';
import RunHours from './run/RunHours';
import GrahView from './run/GraphView';
import NotificationReceive from './privacy/NotificationReceive';
import RealTimeAlarm from './RealTimeAlarm';

const Stack = createStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }} // Hide the navigation header
      />
      <Stack.Screen
        name="Filter"
        component={Filter}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Site"
        component={Sites}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SiteDetail"
        component={SiteDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SiteAlarm"
        component={SiteAlarm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyAndPolicy"
        component={PrivacyAndPolicy}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationReceive"
        component={NotificationReceive}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RealTimeAlarm"
        component={RealTimeAlarm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnPieChartClick"
        component={OnPieChartClick}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RunHours"
        component={RunHours}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GraphView"
        component={GrahView}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default Home;
