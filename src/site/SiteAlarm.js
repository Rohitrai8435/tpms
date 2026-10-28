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
import { new_getDataByAlarmId } from '../service/ApiService';
import SampleSiteView from './SampleSiteView';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';

const HEADER_BLUE = '#0a478f';

// Alarm name -> date column used by the API
const ALARM_COLUMN = {
  'Cover Open': 'TPCOV_dt',
  'TPMS Supply Failed': 'VDCFL_dt',
  'TPMS Battery Low': 'SBTLO_dt',
  Hooter: 'HOTER_dt',
  'BB Loop Break': 'BBLBK_dt',
  'BB1 DisConnect': 'BTLV1_dt',
  'BB2 Disconnect': 'BTLV2_dt',
  'BB3 Disconnect': 'BTLV3_dt',
  'BB4 Disconnect': 'BTLV4_dt',
  'Extra Alarm': 'EXTAL_dt',
  HRT: 'HRT_dt',
  BTLV: 'BTLV_dt',
  DGON: 'DGON_dt',
  MNSF: 'MNSF_dt',
  FSMK: 'FSMK_dt',
  SOBT: 'SOBT_dt',
  MOTN: 'MOTN_dt',
  DOPN: 'DOPN_dt',
  COPN: 'COPN_dt',
  'Fiber Cut': 'DOPN_dt',
  'Door Open': 'DOOPN_dt',
};

const SiteAlarm = () => {
  const route = useRoute();
  const {
    name,
    active_imei,
    active_port,
    app_alarm_id,
    alarm_type,
    alarm,
    mode,
  } = route.params;

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
      const siteId = normalize(item.site_id_site);
      const stateName = normalize(item.state_name);
      const clusterName = normalize(item.cluster_name);
      const imei = item.imei ? item.imei.toString().toLowerCase() : '';

      return (
        (siteName !== '' && siteName.startsWith(match)) ||
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
      const cr = ALARM_COLUMN[name] || '';

      const response = await new_getDataByAlarmId(
        active_imei,
        app_alarm_id,
        cr,
      );

      if (response && response.data) {
        response.data.sort((a, b) => {
          const dateA = new Date(a.update_at);
          const dateB = new Date(b.update_at);
          return dateB - dateA;
        });
        setSiteStatusData(response.data);
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setError(err);
      setIsLoading(false);
    }
  };

  const filter = val => {
    setSelectedValue(val);
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
                placeholder={'Search ' + name + ' Alarm'}
                placeholderTextColor="#ded4d4"
                clearButtonMode="always"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchBox}
                value={searchQuery}
                onChangeText={handleSearch}
              />
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
                      state={item.state_name}
                      cluster={item.cluster_name}
                      imei={item.imei}
                      voltage={item.volt}
                      temperature={item.temp}
                      startAt={item.start_time}
                      updateAt={item.update_at}
                      mode={mode}
                      version={item.version}
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              )
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

export default SiteAlarm;
