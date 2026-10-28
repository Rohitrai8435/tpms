import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Back from '../../assets/svg/back.svg';
import Graph from '../../assets/svg/graph.svg';
import { Text } from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import { dcem_analytics, getCurrentRunHours } from '../service/ApiService';
import NoData from '../../assets/loties/nodata.json';
import LottieView from 'lottie-react-native';
import RunHoursCard from './RunHoursCard';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';

const HEADER_BLUE = '#0a478f';

const RunHours = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imei, client, d, mode } = route.params;

  const insets = useSafeAreaInsets();
  // Status bar height: safe-area inset first, Android fallback if it reports 0
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRunhrs, setcurrentRunhrs] = useState([]);
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

  const aggregatedData = {};
  let sumTimeSobt = 0;
  let sumTimeSodn = 0;
  let sumTimeSodg = 0;
  let sumTimeSoeb = 0;
  let sumKwhSobt = 0;
  let sumKwhSodn = 0;
  let sumKwhSodg = 0;
  let sumKwhSoeb = 0;
  let totalTime = 0;
  let totalKwh = 0;

  useEffect(() => {
    fetchData();
    getRunHours();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getCurrentRunHours(imei);
      if (res.status === 200 && Array.isArray(res.data)) {
        setcurrentRunhrs(res?.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getRunHours = async () => {
    try {
      const response = await dcem_analytics(imei);

      setError(response.error);

      response.result.forEach(item => {
        const { event_date, source, total_running_time, total_kwh } = item;
        if (!aggregatedData[event_date]) {
          aggregatedData[event_date] = {
            date: event_date,
            timeSobt: '00:00:00',
            timeSodg: '00:00:00',
            timeSoeb: '00:00:00',
            timeSodn: '00:00:00',
            kwhSobt: 0.0,
            kwhSodg: 0.0,
            kwhSoeb: 0.0,
            kwhSodn: 0.0,
            totalRun: '00:00:00',
            totalKwh: 0.0,
          };
        }
        if (source === 'SOBT') {
          aggregatedData[event_date].timeSobt =
            total_running_time || '00:00:00';
          aggregatedData[event_date].kwhSobt += parseFloat(total_kwh) || 0.0;
        } else if (source === 'SODG') {
          aggregatedData[event_date].timeSodg =
            total_running_time || '00:00:00';
          aggregatedData[event_date].kwhSodg += parseFloat(total_kwh) || 0.0;
        } else if (source === 'SOEB') {
          aggregatedData[event_date].timeSoeb =
            total_running_time || '00:00:00';
          aggregatedData[event_date].kwhSoeb += parseFloat(total_kwh) || 0.0;
        } else if (source === 'SODN') {
          aggregatedData[event_date].timeSodn =
            total_running_time || '00:00:00';
          aggregatedData[event_date].kwhSodn += parseFloat(total_kwh) || 0.0;
        }
      });

      Object.values(aggregatedData).forEach(item => {
        const {
          timeSobt,
          timeSodg,
          timeSoeb,
          timeSodn,
          kwhSobt,
          kwhSodg,
          kwhSoeb,
          kwhSodn,
        } = item;
        const totalRunInSeconds =
          getTimeInSeconds(timeSobt) +
          getTimeInSeconds(timeSodg) +
          getTimeInSeconds(timeSoeb) +
          getTimeInSeconds(timeSodn);
        const totalKwh = kwhSobt + kwhSodg + kwhSoeb + kwhSodn;
        item.totalRun = formatTime(totalRunInSeconds);
        item.kwhSobt = kwhSobt.toFixed(2); // Ensure kWh values are formatted to two decimal places
        item.kwhSodg = kwhSodg.toFixed(2);
        item.kwhSoeb = kwhSoeb.toFixed(2);
        item.kwhSodn = kwhSodn.toFixed(2);
        item.totalKwh = totalKwh.toFixed(2);
      });

      const finalArray = Object.values(aggregatedData);
      const sortedResult = [...finalArray];
      sortedResult.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      setResult(sortedResult);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  function getTimeInSeconds(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Helper function to format time in seconds to HH:mm:ss format
  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`;
  }

  if (result && result.length > 0) {
    result.forEach(item => {
      sumTimeSobt += getTimeInSeconds(item.timeSobt);
      sumTimeSodg += getTimeInSeconds(item.timeSodg);
      sumTimeSoeb += getTimeInSeconds(item.timeSoeb);
      sumTimeSodn += getTimeInSeconds(item.timeSodn);
      sumKwhSobt += parseFloat(item.kwhSobt);
      sumKwhSodg += parseFloat(item.kwhSodg);
      sumKwhSoeb += parseFloat(item.kwhSoeb);
      sumKwhSodn += parseFloat(item.kwhSodn);
      totalKwh += parseFloat(item.totalKwh);
    });

    sumKwhSobt = sumKwhSobt.toFixed(2);
    sumKwhSodg = sumKwhSodg.toFixed(2);
    sumKwhSoeb = sumKwhSoeb.toFixed(2);
    sumKwhSodn = sumKwhSodn.toFixed(2);
    totalKwh = totalKwh.toFixed(2);
  }

  totalTime = formatTime(sumTimeSobt + sumTimeSodg + sumTimeSoeb + sumTimeSodn);
  sumTimeSobt = formatTime(sumTimeSobt);
  sumTimeSodg = formatTime(sumTimeSodg);
  sumTimeSoeb = formatTime(sumTimeSoeb);
  sumTimeSodn = formatTime(sumTimeSodn);

  const press = () => {
    navigation.navigate('GraphView', result);
  };

  // translucent so layout is identical on every Android version
  const statusBar = (
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="light-content"
    />
  );

  if (error == null) {
    return (
      <>
        {statusBar}
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
                {
                  backgroundColor: mode ? 'black' : 'white',
                  paddingBottom: insets.bottom,
                },
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
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={onBackPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Back width={24} height={24} />
                  </TouchableOpacity>
                  <Text style={styles.headerText}>Run Hours</Text>
                </View>
                <Pressable
                  onPress={press}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View
                    style={{ justifyContent: 'flex-end', alignItems: 'center' }}
                  >
                    <Graph width={24} height={24} fill={'white'} />
                    <Text style={styles.headerText}>Analytical View</Text>
                  </View>
                </Pressable>
              </View>
              <View
                style={[
                  styles.insideContainer,
                  { backgroundColor: mode ? '#3f3f3f' : 'white' },
                ]}
              >
                {currentRunhrs.length > 0 ? (
                  <View
                    style={[
                      styles.total,
                      { backgroundColor: mode ? '#232323' : HEADER_BLUE },
                      {
                        marginBottom: 10,
                      },
                    ]}
                  >
                    <Text style={styles.headerText}>
                      Today's Total Run Hours
                    </Text>
                    {/* Table Headers */}
                    <View style={styles.tableRow}>
                      <Text style={styles.tableHeader}>Source</Text>
                      <Text style={styles.tableHeader}>Total Hours</Text>
                      <Text style={styles.tableHeader}>Status</Text>
                    </View>

                    <FlatList
                      data={currentRunhrs}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => {
                        const isActive =
                          item.is_current_source.toLowerCase() === 'yes';
                        const source = item.source.toUpperCase(); // Normalize casing

                        // Dynamic color logic
                        let activeColor = '#ffc107'; // default (e.g., for SOBT)
                        if (source === 'SOEB') {
                          activeColor = '#53cf17'; // green
                        } else if (source === 'SODG') {
                          activeColor = '#eb003d'; // red
                        } else if (source === 'SODN') {
                          activeColor = '#eb003d'; // black
                        }

                        if (isActive) {
                          return (
                            <View style={styles.tableRow}>
                              <Text
                                style={[
                                  styles.tableCell,
                                  {
                                    color: activeColor,
                                    fontSize: 15,
                                  },
                                ]}
                              >
                                {item.source}
                              </Text>

                              <Text
                                style={[
                                  styles.tableCell,
                                  {
                                    color: activeColor,
                                    fontSize: 15,
                                  },
                                ]}
                              >
                                {item.run_hours_today}
                              </Text>

                              <Text
                                style={[
                                  styles.tableCell,
                                  {
                                    color: activeColor,
                                    fontSize: 15,
                                  },
                                ]}
                              >
                                Active
                              </Text>
                            </View>
                          );
                        } else {
                          return (
                            <View style={styles.tableRow}>
                              <Text style={styles.tableCell}>
                                {item.source}
                              </Text>
                              <Text style={styles.tableCell}>
                                {item.run_hours_today}
                              </Text>
                              <Text style={styles.tableCell}>Inactive</Text>
                            </View>
                          );
                        }
                      }}
                    />
                  </View>
                ) : null}

                <View
                  style={[
                    styles.total,
                    { backgroundColor: mode ? '#232323' : HEADER_BLUE },
                  ]}
                >
                  {result && result.length > 0 && (
                    <Text style={styles.headerText}>
                      {`Total from : ${result[result.length - 1].date} to ${
                        result[0].date
                      }`}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={[styles.totalText, { color: '#53cf17' }]}>
                        EB(Run Hrs)
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: '#53cf17' },
                          {
                            marginLeft: 2,
                            fontFamily: 'digital-7 (italic)',
                            fontSize: 15,
                          },
                        ]}
                      >
                        {sumTimeSoeb}
                      </Text>
                    </View>
                    {client != 'CREST DIGITEL' && (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={[styles.totalText, { color: '#eb003d' }]}
                          >
                            DG(Run Hrs)
                          </Text>
                          <Text
                            style={[
                              styles.totalText,
                              { color: '#eb003d' },
                              {
                                marginLeft: 2,
                                fontFamily: 'digital-7 (italic)',
                                fontSize: 15,
                              },
                            ]}
                          >
                            {sumTimeSodg}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text style={[styles.totalText, { color: '#000' }]}>
                            DN(Run Hrs)
                          </Text>
                          <Text
                            style={[
                              styles.totalText,
                              { color: '#000' },
                              {
                                marginLeft: 2,
                                fontFamily: 'digital-7 (italic)',
                                fontSize: 15,
                              },
                            ]}
                          >
                            {sumTimeSodn}
                          </Text>
                        </View>
                      </>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={[styles.totalText, { color: '#ffc107' }]}>
                        BT(Run Hrs)
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: '#ffc107' },
                          {
                            marginLeft: 2,
                            fontFamily: 'digital-7 (italic)',
                            fontSize: 15,
                          },
                        ]}
                      >
                        {sumTimeSobt}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={[
                          styles.totalText,
                          { color: mode ? '#1eb3eb' : HEADER_BLUE },
                        ]}
                      >
                        Total(Run Hrs)
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: mode ? '#1eb3eb' : HEADER_BLUE },
                          {
                            marginLeft: 2,
                            fontFamily: 'digital-7 (italic)',
                            fontSize: 15,
                          },
                        ]}
                      >
                        {totalTime}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={[styles.totalText, { color: '#53cf17' }]}>
                        EB(Kwh)
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: '#53cf17' },
                          { marginLeft: 2 },
                        ]}
                      >
                        {d === '1' ? sumKwhSoeb : 'NA'}
                      </Text>
                    </View>
                    {client != 'CREST DIGITEL' && (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={[styles.totalText, { color: '#eb003d' }]}
                          >
                            DG(Kwh)
                          </Text>
                          <Text
                            style={[
                              styles.totalText,
                              { color: '#eb003d' },
                              { marginLeft: 2 },
                            ]}
                          >
                            {d === '1' ? sumKwhSodg : 'NA'}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text style={[styles.totalText, { color: '#000' }]}>
                            DN(Kwh)
                          </Text>
                          <Text
                            style={[
                              styles.totalText,
                              { color: '#000' },
                              { marginLeft: 2 },
                            ]}
                          >
                            {d === '1' ? sumKwhSodn : 'NA'}
                          </Text>
                        </View>
                      </>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={[styles.totalText, { color: '#ffc107' }]}>
                        BT(Kwh)
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: '#ffc107' },
                          { marginLeft: 2 },
                        ]}
                      >
                        {d === '1' ? sumKwhSobt : 'NA'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={[
                          styles.totalText,
                          { color: mode ? '#1eb3eb' : HEADER_BLUE },
                        ]}
                      >
                        Total(Kwh)
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: mode ? '#1eb3eb' : HEADER_BLUE },
                          { marginLeft: 2 },
                        ]}
                      >
                        {d === '1' ? totalKwh : 'NA'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <FlatList
                data={result}
                renderItem={({ item }) => (
                  <RunHoursCard
                    dgK={d === '1' ? item.kwhSodg : 'NA'}
                    btK={d === '1' ? item.kwhSobt : 'NA'}
                    ebK={d === '1' ? item.kwhSoeb : 'NA'}
                    dnK={d === '1' ? item.kwhSodn : 'NA'}
                    ebR={item.timeSoeb}
                    dgR={item.timeSodg}
                    dnR={item.timeSodn}
                    btR={item.timeSobt}
                    tR={item.totalRun}
                    tK={d === '1' ? item.totalKwh : 'NA'}
                    date={item.date}
                    client={client}
                    mode={mode}
                  ></RunHoursCard>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )
        ) : (
          <NoInternet></NoInternet>
        )}
      </>
    );
  } else {
    return (
      <>
        {statusBar}
        {isConnected ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#c8dcf4',
            }}
          >
            <LottieView
              source={NoData}
              style={{
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
              }}
              autoPlay
              loop
            />
          </View>
        ) : (
          <NoInternet></NoInternet>
        )}
      </>
    );
  }
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
  headerText: {
    fontFamily: 'AndadaPro-Regular',
    color: 'white',
    alignItems: 'flex-start',
    marginLeft: 12,
    fontSize: 18,
  },
  total: {
    backgroundColor: HEADER_BLUE,
    padding: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  insideContainer: {
    marginLeft: 14,
    marginRight: 14,
    marginTop: 6,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  totalText: {
    fontFamily: 'AndadaPro-Regular',
    color: 'green',
    alignItems: 'flex-start',
    marginLeft: 12,
    marginRight: 12,
    fontSize: 15,
    fontWeight: 'bold',
  },
  animationContainer: {
    position: 'relative',
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  tableRow: {
    backgroundColor: HEADER_BLUE,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  tableHeader: {
    flex: 1,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    color: '#FFF',
    textAlign: 'center',
  },
});

export default RunHours;
