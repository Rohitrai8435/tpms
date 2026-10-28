
import React, { createContext, useState, useContext, useEffect } from 'react';

import {
  notificationListenersKillMode,
  notificationListeners,
  requestUserPermission,
  setupBackgroundHandler,
} from '../notificationServices';
const AppContext = createContext();

import NetInfo from '@react-native-community/netinfo';



export const AppProvider = ({ children }) => {
 const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = notificationListeners();
    setupBackgroundHandler();
    notificationListenersKillMode();
    return () => unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ isConnected }}>
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => {
  return useContext(AppContext);
};
