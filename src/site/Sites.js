import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Back from '../../assets/svg/back.svg';
import { Text } from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { siteStatusList } from '../service/ApiService';
import SampleSiteView from './SampleSiteView';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';

const HEADER_BLUE = '#0a478f';

const Sites = () => {
  const route = useRoute();
  const { status, mode } = route.params;
  const statusValue = status;

  const insets = useSafeAreaInsets();
  // Status bar height: safe-area inset first, Android fallback if it reports 0
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const [selectedValue, setSelectedValue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteStatusData, setSiteStatusData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [show, setShow] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const navigation = useNavigation();

  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const click = () => {
    setShow(!show);
  };

  useEffect(() => {
    fetchData();
  }, [selectedValue]);

  useEffect(() => {
    if (siteStatusData) {
      setFilteredData(siteStatusData);
      setIsLoading(false);
    }
  }, [siteStatusData]);

  const normalize = value =>
    value
      ? value
          .toString()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, '')
          .trim()
      : '';

  const handleSearch = query => {
    setSearchQuery(query);
    if (!siteStatusData) return;

    const match = normalize(query);
    const filtered = siteStatusData.filter(item => {
      const siteName = normalize(item.site_name);
      const globalId = normalize(item.global_id);
      const siteId = normalize(item.site_id_site);
      const stateName = normalize(item.state_name);
      const clusterName = normalize(item.cluster_name);
      const imei = item.imei ? item.imei.toString().toLowerCase() : '';
      return (
        (siteName !== '' && siteName.startsWith(match)) ||
        (globalId !== '' && globalId.startsWith(match)) ||
        (siteId !== '' && siteId.startsWith(match)) ||
        (stateName !== '' && stateName.startsWith(match)) ||
        (clusterName !== '' && clusterName.startsWith(match)) ||
        (imei !== '' && imei.endsWith(match)) ||
        (siteId !== '' && siteId.endsWith(match))
      );
    });
    setFilteredData(filtered);
  };

  const fetchData = async () => {
    try {
      const userDate = await AsyncStorage.getItem('user_data');
      if (userDate) {
        const data = JSON.parse(userDate);

        setIsLoading(true);

        const {
          login_id,
          aidv4,
          ctmidv4,
          ctmidv1,
          ctmidv2,
          user_typev4,
          client_versionv4,
          state,
          district,
          cluster,
          aidv1,
          user_typev1,
          aidv2,
          user_typev2,
        } = data;

        const response = await siteStatusList(
          login_id,
          aidv4,
          ctmidv4,
          user_typev4,
          client_versionv4,
          state,
          district,
          cluster,
          '10',
          '0',
          statusValue,
          aidv1,
          ctmidv1,
          user_typev1,
          aidv2,
          ctmidv2,
          user_typev2,
        );
        if (response && response.data) {
          response.data.sort((a, b) => {
            const dateA = new Date(a.last_comm_dt);
            const dateB = new Date(b.last_comm_dt);
            return dateB - dateA;
          });
          setSiteStatusData(response.data);
        }
      }
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const filter = val => {
    setSelectedValue(val);
    setShow(!show);
  };

  const calculateAging = lastCommDate => {
    const now = new Date();
    const lastComm = new Date(lastCommDate);

    const diffInSeconds = Math.floor((now - lastComm) / 1000);

    const days = Math.floor(diffInSeconds / (3600 * 24));
    if (days > 0) {
      return `${days} Day${days > 1 ? 's' : ''} Ago`;
    }

    const hours = Math.floor(diffInSeconds / 3600);
    if (hours > 0) {
      return `${hours} Hour${hours > 1 ? 's' : ''} Ago`;
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes > 0) {
      return `${minutes} Minute${minutes > 1 ? 's' : ''} Ago`;
    }

    return `${diffInSeconds} Second${diffInSeconds > 1 ? 's' : ''} Ago`;
  };

  return (
    <>
      {/* translucent so layout is identical on every Android version */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {isConnected ? (
        isLoading ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              backgroundColor: mode ? 'black' : 'white',
            }}
          >
            <ActivityIndicator size="large" color={HEADER_BLUE} />
            <Text
              style={{
                fontFamily: 'AndadaPro-Regular',
                marginTop: 10,
                fontSize: 20,
                color: mode ? 'white' : 'black',
              }}
            >
              Data is loading...
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.mainContainer,
              { backgroundColor: mode ? 'black' : 'white' },
            ]}
          >
            {/* Header: paddingTop pushes content below the status bar */}
            <View
              style={[
                styles.subContainer,
                {
                  backgroundColor: mode ? 'black' : HEADER_BLUE,
                  paddingTop: 16 + topInset,
                },
              ]}
            >
              <TouchableOpacity
                onPress={onBackPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Back width={24} height={24} />
              </TouchableOpacity>
              <TextInput
                placeholder="Search Sites"
                placeholderTextColor="white"
                clearButtonMode="always"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchBox}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {filteredData && (
              <FlatList
                data={filteredData}
                renderItem={({ item }) => (
                  <SampleSiteView
                    title={item.site_name}
                    siteId={item.site_id_site}
                    cluster={item.cluster_name}
                    imei={item.imei}
                    version={item.version ? item.version : '0'}
                    lastcom={item.last_comm_dt}
                    aging={calculateAging(item.last_comm_dt)}
                    show={'1'}
                    mode={mode}
                  />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            )}

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingBottom: insets.bottom,
              }}
            >
              <Text
                style={{
                  fontFamily: 'AndadaPro-Regular',
                  color: mode ? 'white' : 'black',
                }}
              >
                Result Found :
              </Text>
              <Text
                style={{
                  fontFamily: 'AndadaPro-Regular',
                  color: mode ? 'white' : 'black',
                }}
              >
                {filteredData && filteredData.length}
              </Text>
            </View>
          </View>
        )
      ) : (
        <NoInternet />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: HEADER_BLUE,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 28,
    flex: 1,
    marginLeft: 18,
    marginRight: 8,
    color: 'white',
  },
  text: {
    padding: 8,
    paddingRight: 50,
  },
  view: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#000',
  },
});

export default Sites;
