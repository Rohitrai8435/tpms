import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text,TouchableOpacity } from 'react-native';
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;

import { PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { getSiteRunningSource } from '../service/ApiService';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const chartConfig = {
  backgroundGradientFrom: "#0a478f",
  backgroundGradientTo: "#0a478f",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const PieChartHeader = ({ refresh ,mode,dataRes,datav2,datav4}) => {
  const [formattedData, setFormattedData] = useState([]);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const margin = 18;
  // console.log(datav4);

  const onClick = () => {
    navigation.navigate('OnPieChartClick',{mode});
  }
  useEffect(() => {
    const combineData = (data1, data2) => {
        const combinedResults = {};

        const processItem = (item, data) => {
            const { site_status, status_count } = item;
            if (!combinedResults[site_status]) {
                combinedResults[site_status] = parseInt(status_count, 10);
            } else {
                combinedResults[site_status] += parseInt(status_count, 10);
            }
        };

        if (data1) {
            data1.forEach(item => processItem(item, data1));
        }
        if (data2) {
            data2.forEach(item => processItem(item, data2));
        }

        return Object.entries(combinedResults).map(([site_status, population]) => ({
            name: site_status,
            population: population,
            color: site_status === "SOEB" ? "#53cf17" : site_status === "SODG" ? "#eb003d" :site_status === "SODN" ? "#000000": "#ffc107",
            legendFontColor: site_status === "SOEB" ? "#53cf17" : site_status === "SODG" ? "#eb003d" :site_status === "SODN" ? "#000000": "#ffc107",
            legendFontSize: 14
        }));
    };

    let combinedData = [];
    if (datav4 || datav2) {
        combinedData = combineData(datav4, datav2);
    }
    setFormattedData(combinedData);
}, [datav4, datav2]);


   
  

  return (
    <View style={{ flexDirection: 'column', marginBottom: 10 }}>
      <View>
        <View style={[styles.container,{backgroundColor:mode?'#232323':'#0a478f'}]}>
          <View>
            <Text style={styles.title}>Site Running On</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onClick}>
        <View style={{ marginLeft: margin, marginRight: margin, backgroundColor: mode ?'#3f3f3f':'white', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
          <PieChart
            data={formattedData}
            width={screenWidth - margin * 2}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0a478f',
    borderTopLeftRadius: 8,
    borderTopEndRadius: 8,
    marginTop: 8,
    marginLeft: 18,
    marginRight: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: 'white',
    fontFamily: 'AndadaPro-SemiBold'
  },
  gradientContainer: {
    flex: 1,
    width: '100%',
    marginLeft: 18,
    marginRight: 18,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PieChartHeader;
