import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Button, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-animatable';
import Back from '../../assets/svg/back.svg';
import FilterButton from './FilterButton';
import FilterContainer from './FilterContainer';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import ShowRegion from './ShowRegion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';
import { useRoute } from '@react-navigation/native';
import { getClients, getClusterList, getClusterListClient, getDistrictList, getDistrictListClient, getStateList, getStateListClient } from '../service/ApiService';
import { CommonActions } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
const Filter = ({ navigation }) => {
  const route = useRoute();
  const { mode } = route.params;

  const [client, setClient] = useState(null);
  const [state, setState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [cluster, setCluster] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [status, setStatus] = useState(false);
  const [userType, setUserType] = useState(null);
  const [show, setShow] = useState(null);
  const [full, setFullName] = useState(null);
  const [clickVersion, setClickVersion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteStatusData, setSiteStatusData] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ctmval,setCtm]=useState([]);
  const [aidval,setAid]=useState([]);
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
  useEffect(() => {
    Orientation.lockToPortrait(); // Lock to portrait mode
  }, []);

  const closeBottomSheet = () => {
    setStatus(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userDate = await AsyncStorage.getItem('user_data');
      if (userDate) {
        const data = JSON.parse(userDate);
        const {ctmidv1,ctmidv2,ctmidv4, user_type, state, district, cluster, stateNameF, districtNameF, clusterNameF, clientNameF, fullname ,aidv4,aidv2,aidv1,user_typev1,user_typev2,user_typev4} = data;
        setFullName(fullname);
       
        setCtm({C1:ctmidv4,C2:ctmidv2,C3:ctmidv1});
        setAid({A1:aidv1,A2:aidv2,A4:aidv4,U1:user_typev1,U2:user_typev2,U4:user_typev4});

        // console.log("C is call", ctmidv1, user_type);
        const getValidCtmId = (ctmidv1, ctmidv2, ctmidv4) =>{
          if (ctmidv4 && ctmidv4 !== "0") return ctmidv4;
          if (ctmidv2 && ctmidv2 !== "0") return ctmidv2;
          if (ctmidv1 && ctmidv1 !== "0") return ctmidv1;
          return null; 
      };
      const validCtmId = getValidCtmId(ctmidv1, ctmidv2, ctmidv4);
        if (ctmidv1 == "0" && ctmidv4 == "0" && ctmidv2 == "0") {
          setClient({ ctmId: "0", name: "Pan India Client" });
        } else {
          setClient({ ctmId: validCtmId, name: clientNameF });
        }
        if (state === "0") {
          setState({ stateId: "0", name: "Pan India" });
        } else {
          setState({ stateId: state, name: stateNameF });
        }
        if (district === "0") {
          setDistrict({ districtId: "0", name: "All" });
        } else {
          setDistrict({ districtId: district, name: districtNameF });
        }
        if (cluster === "0") {
          setCluster({ clusterId: "0", name: "All" });
        } else {
          setCluster({ clusterId: cluster, name: clusterNameF });
        }
        setUserType(user_type);
      }
    } catch (error) {

    }
  }
  const fetchClientData = async () => {
    setStatus(true);
    setIsLoading(true);
    try {
      const response = await getClients();
      // console.log("Client is call", response);
      response.data.unshift({ ctmid: "0", client_type_name: "Pan India Client" });
      setState({ stateId: "0", name: "Pan India" });
      setDistrict({ districtId: "0", name: "All" });
      setCluster({ clusterId: "0", name: "All" });
      setShow("client");
      setSiteStatusData(response?.data);
      setIsLoading(false); 
    } catch (error) {
      setIsLoading(false);
      return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}><Text style={{ fontFamily: 'AndadaPro-Regular' }}>
        Something Went wrong</Text></View>)

    }

  }
  const fetchStateData = async () => {
    setStatus(true);
    setIsLoading(true);
    try {
        let response;
        if(full === "Super Admin") {
            response = await getStateList(client.ctmId, "0", "0");
        } else {
          //response =   await getStateList(ctmval.C1, ctmval.C2, ctmval.C3);
          response =   await getStateListClient(aidval.A4,aidval.A2,aidval.A1,aidval.U4,aidval.U2,aidval.U1,ctmval.C1,ctmval.C2, ctmval.C3);
          console.log(aidval.A4,aidval.A2,aidval.A1,aidval.U4,aidval.U2,aidval.U1,ctmval.C1,ctmval.C2, ctmval.C3);
        
        }
        // console.log("API response :", response);
        
        // Ensure response and response.data are defined
        if (response && response?.data && Array.isArray(response.data)) {
            response.data.unshift({ state_id: "0", state_name: "Pan India" });
            setSiteStatusData(response?.data);
        } else {
            console.error("Invalid response format:", response);
            throw new Error("Invalid response format");
        }
        setDistrict({ districtId: "0", name: "All" });
        setCluster({ clusterId: "0", name: "All" });
        setShow("state");
        // console.log("State data call successful", response);
        // console.log("ctmid", client.ctmId);
    } catch (error) {
        console.error("Error fetching state data:", error);
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontFamily: 'AndadaPro-Regular' }}>Something Went wrong</Text>
            </View>
        );
    } finally {
        setIsLoading(false);
    }
};

  const fetchDistrictData = async () => {
    setStatus(true);
    setIsLoading(true);
    try {
      let response;
      if(full === "Super Admin") {
          response = await getDistrictList(client.ctmId, "0", "0",state.stateId);
      } else {
        response =  await getDistrictListClient(aidval.A4,aidval.A2,aidval.A1,aidval.U4,aidval.U2,aidval.U1,ctmval.C1,ctmval.C2, ctmval.C3,state.stateId);
      }
      // console.log("C is call", response);
      //setState({ stateId: "0", name: "Pan India" });
      //setDistrict({ districtId: "0", name: "All" });
      response.data.unshift({ dist_id: "0", district_name: "All" });
      setCluster({ clusterId: "0", name: "All" });
      setShow("district");
      setSiteStatusData(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}><Text style={{ fontFamily: 'AndadaPro-Regular' }}>
        Something Went wrong</Text></View>)

    }

  }
  const fetchClusterData = async () => {
    setStatus(true);
    setIsLoading(true);
    try {
      let response;
      if(full === "Super Admin") {
          response =  await getClusterList(client.ctmId, "0", "0",district.districtId);
      } else {
        response =   await getClusterListClient(aidval.A4,aidval.A2,aidval.A1,aidval.U4,aidval.U2,aidval.U1,ctmval.C1,ctmval.C2, ctmval.C3,district.districtId);
      }
      // console.log("Client is call", response);
      response.data.unshift({ cluster_id: "0", cluster_name: "All" });
      setShow("cluster");
      setSiteStatusData(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}><Text style={{ fontFamily: 'AndadaPro-Regular' }}>
        Something Went wrong</Text></View>)
    }
  }
  const pressInRegion = (name, id, type, version) =>{
    if (type === 'client' && version ==="v2") {
      setClient({ ctmId: id, name: name });
      setClickVersion("v2");
    } else if (type === 'client' && version ==="v4") {
      setClient({ ctmId: id, name: name });
      setClickVersion("v4");
    }
    else if (type === 'client' && version ==="v1") {
      setClient({ ctmId: id, name: name });
      setClickVersion("v1");
    }
    else if (type === 'state') {
      setState({ stateId: id, name: name });
      // console.log(id);
    } else if (type === 'district') {
      setDistrict({ districtId: id, name: name });
    } else if (type === 'cluster') {
      setCluster({ clusterId: id, name: name });
    }
    setStatus(false);
  }

  const onPressSearch = () => {
    search();
  };

  const search = async () => {
    try {
      const userDate = await AsyncStorage.getItem('user_data');
      if (userDate) {
        const data = JSON.parse(userDate);
        if(clickVersion ==="v2"){
          data.ctmidv2 = client.ctmId;
          data.aidv1='-1';
          data.aidv4='-1';
          data.aidv2='1';
        }else if(clickVersion ==="v4"){
          data.ctmidv4 = client.ctmId;
          data.aidv1='-1';
          data.aidv2='-1';
          data.aidv4='1';
        }else if(clickVersion ==="v1"){
          data.ctmidv1 = client.ctmId;
          data.aidv2='-1';
          data.aidv4='-1';
          data.aidv1='1';
        }  
        data.clientNameF = client.name;
        data.state = state.stateId;
        data.stateNameF = state.name;
        data.district = district.districtId;
        data.districtNameF = district.name;
        data.cluster = cluster.clusterId;
        data.clusterNameF = cluster.name;
        if (data.fullname === "Super Admin") {
          data.type = client.name;
        } else {
          data.type = state.name;
        }
        await AsyncStorage.setItem('user_data', JSON.stringify(data));
        // console.log(data);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Drawer' }],
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = siteStatusData.filter((item) => {
      const match = query.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim();
      const client = item.client_type_name ? item.client_type_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim() : '';
      const state = item.state_name ? item.state_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim() : '';
      const district = item.district_name ? item.district_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim() : '';
      const cluster = item.cluster_name ? item.cluster_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim() : '';
      return (
        (client !== '' && client.startsWith(match)) ||
        (state !== '' && state.startsWith(match)) ||
        (district !== '' && district.startsWith(match)) ||
        (cluster !== '' && cluster.startsWith(match))

      );
    });
    setFilteredData(filtered);
  };
  useEffect(() => {
    setFilteredData(siteStatusData);
  }, [siteStatusData]);

  return (
    <>{isConnected ? (isLoading ?
      (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: mode ? 'black' : 'white' }}>
        <ActivityIndicator size="large" width={50} height={50} color={['#0a478f', '#54c9b2', '#e8c592', '#e861af']} />
        <Text style={{ fontFamily: 'AndadaPro-Regular', marginTop: 10, fontSize: 20, color: mode ? 'white' : 'black' }}>Data is loading...</Text>

      </View>) : (<View style={[styles.mainContainer, { backgroundColor: mode ? 'black' : 'white' }]}>
        <View style={[styles.subContainer, { backgroundColor: mode ? 'black' : '#0a478f' }]}>
          <TouchableOpacity onPress={onBackPress}>
          <Back width={24} height={24}></Back>
          </TouchableOpacity>
          <Text style={styles.title}>Filter Data!</Text>
        </View>
        {full != null && full === "Super Admin" &&
          (<Pressable onPress={fetchClientData}>
            <FilterContainer heading={"Client"} value={client ? client.name : ''} mode={mode} ></FilterContainer>
          </Pressable>)}
        <Pressable onPress={fetchStateData}>
          <FilterContainer heading={"State/Circle"} value={state ? state.name : ''} mode={mode}></FilterContainer>
        </Pressable>
        <Pressable onPress={fetchDistrictData}>
          <FilterContainer heading={"Zone"} value={district ? district.name : ''} mode={mode}></FilterContainer>
        </Pressable>
        <Pressable onPress={fetchClusterData}>
          <FilterContainer heading={"Cluster"} value={cluster ? cluster.name : ''} mode={mode}></FilterContainer>
        </Pressable>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <FilterButton onPressSearch={onPressSearch} mode={mode} />
        </View>
        {status && (<View style={styles.backDrop}>
          <Pressable onPress={closeBottomSheet} style={{ height: '100%', width: '25%' }}></Pressable>
          <View style={[styles.bottomSheet, { backgroundColor: mode ? '#232323' : '#acaca7' }]}>
            <View style={[styles.subContainer, { backgroundColor: mode ? 'black' : '#0a478f' }]}>

              <TextInput
                placeholder='Search'
                placeholderTextColor={mode?'white':'black'}
                clearButtonMode='always'
                autoCapitalize='none'
                autoCorrect={false}
                style={{ backgroundColor: mode ? '#3f3f3f' : 'white', flex: 1, borderRadius: 28, paddingLeft: 20, paddingRight: 20, color: mode ? 'white' : 'black' }}
                value={searchQuery}
                onChangeText={handleSearch} />

            </View>
            {show === "client" && filteredData && (
              <FlatList
                data={filteredData}
                renderItem={({ item }) => (<ShowRegion name={item.client_type_name} id={item.ctmid} type={"client"} pressInRegion={pressInRegion} mode={mode} version={item.client_version}></ShowRegion>)}
                keyExtractor={(item, index) => index.toString()} />
            )}
            {show === "state" && filteredData && (
              <FlatList
                data={filteredData}
                renderItem={({ item }) => (<ShowRegion name={item.state_name} id={item.state_id} type={"state"} pressInRegion={pressInRegion} mode={mode}></ShowRegion>)}
                keyExtractor={(item, index) => index.toString()} />
                
                )}
            {show === "district" && filteredData && (
              <FlatList
                data={filteredData}
                renderItem={({ item }) => (<ShowRegion name={item.district_name} id={item.dist_id} type={"district"} pressInRegion={pressInRegion} mode={mode}></ShowRegion>)}
                keyExtractor={(item, index) => index.toString()} />
            )}
            {show === "cluster" && filteredData && (
              <FlatList
                data={filteredData}
                renderItem={({ item }) => (<ShowRegion name={item.cluster_name} id={item.cluster_id} type={"cluster"} pressInRegion={pressInRegion} mode={mode}></ShowRegion>)}
                keyExtractor={(item, index) => index.toString()} />
            )}
          </View>
        </View>)}

      </View>)) : (<NoInternet></NoInternet>)}</>

  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a478f',
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    elevation: 2,
    marginBottom: 10,
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 28,
    flex: 1,
    marginLeft: 18,
    color: 'white',
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginLeft: 16
  },
  backDrop: {
    position: 'absolute',
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    flexDirection: 'row'

  },
  bottomSheet: {
    width: '75%',
    height: '100%',
    backgroundColor: '#acaca7',
    borderTopLeftRadius: 20,

  },
})

export default Filter;
