import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import Menu from '../../assets/svg/menu.svg';
import { Text } from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { siteRunning } from '../service/ApiService';
import SampleSiteView from './SampleSiteView';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';

const HEADER_BLUE = '#0a478f';

const OnPieChartClick = () => {
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
  const [siteStatusDataPermanent, setSiteStatusDataPermanent] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [show, setShow] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const route = useRoute();
  const { mode } = route.params;
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
  }, []);

  useEffect(() => {
    if (siteStatusData) {
      setFilteredData(siteStatusData);
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
      const sourceName = normalize(item.source);
      const imei = item.imei ? item.imei.toString() : '';
      return (
        (siteName !== '' && siteName.startsWith(match)) ||
        (globalId !== '' && globalId.startsWith(match)) ||
        (siteId !== '' && siteId.startsWith(match)) ||
        (stateName !== '' && stateName.startsWith(match)) ||
        (clusterName !== '' && clusterName.startsWith(match)) ||
        (sourceName !== '' && sourceName.startsWith(match)) ||
        (imei !== '' && imei.endsWith(match)) ||
        (siteId !== '' && siteId.endsWith(match))
      );
    });
    setFilteredData(filtered);
  };

  const sortDataByUpdateAtDesc = data => {
    return [...data].sort(
      (a, b) => new Date(b.update_at) - new Date(a.update_at),
    );
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userDataString = await AsyncStorage.getItem('user_data');
      const userData = JSON.parse(userDataString);
      const {
        aidv4,
        ctmidv4,
        user_typev4,
        state,
        district,
        cluster,
        aidv2,
        ctmidv2,
        user_typev2,
      } = userData;

      const response = await siteRunning(
        aidv4,
        ctmidv4,
        user_typev4,
        state,
        district,
        cluster,
        aidv2,
        ctmidv2,
        user_typev2,
      );

      const sorted = sortDataByUpdateAtDesc(response.data);
      setSiteStatusData(sorted);
      setSiteStatusDataPermanent(sorted);
    } catch (err) {
      console.log(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filter = val => {
    if (!siteStatusDataPermanent || siteStatusDataPermanent.length === 0) {
      console.error('siteStatusDataPermanent is null or empty');
      return;
    }

    if (val === null) {
      setSiteStatusData(siteStatusDataPermanent);
    } else {
      const bysource = siteStatusDataPermanent.filter(
        item => item.source === val,
      );
      setSiteStatusData(bysource);
    }
    setSearchQuery('');
    setShow(!show);
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
              <TouchableOpacity
                onPress={click}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Menu width={24} height={24} fill={'white'} />
              </TouchableOpacity>
            </View>

            {error && !filteredData ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'AndadaPro-Regular',
                    color: mode ? 'white' : 'black',
                  }}
                >
                  Something Went wrong
                </Text>
              </View>
            ) : (
              filteredData && (
                <FlatList
                  data={filteredData}
                  renderItem={({ item }) => (
                    <SampleSiteView
                      title={item.site_name}
                      siteId={item.site_id_site}
                      startAt={item.start_time}
                      updateAt={item.update_at}
                      voltage={item.volt}
                      temperature={item.source}
                      imei={item.imei}
                      pie={'2'}
                      version={item.version}
                      mode={mode}
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              )
            )}

            {/* Filter dropdown: top offset includes the status bar height */}
            {show && (
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 80 + topInset,
                  padding: 8,
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                  backgroundColor: mode ? 'black' : 'white',
                }}
              >
                <Text style={[styles.text, { color: HEADER_BLUE }]}>
                  Filter Data By Source
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    filter(null);
                  }}
                >
                  <Text style={[styles.text, { color: '#1eb3eb' }]}>
                    ALL SOURCE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    filter('SOEB');
                  }}
                >
                  <Text style={[styles.text, { color: '#53cf17' }]}>SOEB</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    filter('SOBT');
                  }}
                >
                  <Text style={[styles.text, { color: '#ffc107' }]}>SOBT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    filter('SODG');
                  }}
                >
                  <Text style={[styles.text, { color: '#eb003d' }]}>SODG</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    filter('SODN');
                  }}
                >
                  <Text style={[styles.text, { color: '#000000' }]}>SODN</Text>
                </TouchableOpacity>
              </View>
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

export default OnPieChartClick;
