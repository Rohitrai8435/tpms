import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Pressable,TouchableOpacity } from 'react-native';
import Back from '../../assets/svg/back.svg';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import { useState } from 'react';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const SampleSiteView = ({ title, siteId, cluster, imei, show, state, voltage, temperature, startAt, updateAt, pie ,mode,version,lastcom,aging}) => {
  const [duration, setDuration] = useState(null);
  const [color, setColor] = useState(null);
  const navigation = useNavigation();
  const handleClick = () => {
    navigation.navigate("SiteDetail", {imei,mode,version});
  }
  useEffect(() => {
    calculateTimeDuration(startAt, updateAt);
  }, [startAt, updateAt])
  function calculateTimeDuration(startTime, updateTime) {

    const start = new Date(startTime);
    const update = new Date(updateTime);

   
    const timeDifference = update - start;

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    setDuration(duration);
    if (temperature === 'SOEB') {
      setColor("#53CF17");
    } else if (temperature === 'SOBT') {
      setColor("#ffc107");
    }
      else if (temperature === 'SODG') {  
      setColor("#eb003d");
     } else if (temperature === 'SODN') {
      setColor("#000000");
     }
    
    else {
      setColor("#eb003d");
    }
  }

  if (show === '1') {
    return (
      <Pressable onPress={handleClick}>
        <View style={[styles.container,{backgroundColor:mode?'#3f3f3f':'#fff'}]} >
          <View style={[styles.header,{backgroundColor:mode?'#232323':'#0a478f'}]}>
            <Text style={[styles.title,{flex:1}]}>{title}</Text>
            <View style={{ borderRadius: 10, backgroundColor:mode?'#3f3f3f':'white', margin: 9, padding: 8 }}>
              <Back width={18} height={18} rotation={180} />
            </View>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Site id</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{siteId}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Cluster</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{cluster}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Last Communication</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{lastcom}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Aging</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{aging}</Text>
          </View>
        </View>
      </Pressable>

    );
  }
  else if (pie === '2') {
    return (
      <Pressable onPress={handleClick}>
        <View
          style={[
            styles.container,
            { backgroundColor: mode ? '#232323' : '#fff' },
          ]}
        >
          <View style={[styles.header, { backgroundColor: color }]}>
            <Text style={styles.title}>{title}</Text>
            <View
              style={{
                borderRadius: 10,
                backgroundColor: 'white',
                margin: 9,
                padding: 8,
              }}
            >
              <Back width={18} height={18} rotation={180} />
            </View>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              Site id
            </Text>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {siteId}
            </Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              Current Start Time
            </Text>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {startAt}
            </Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              Last Communication
            </Text>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {updateAt}
            </Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              Voltage
            </Text>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {voltage}
            </Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {temperature === 'SODN' ? 'Site is Down' : 'Site Running on'}
            </Text>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {temperature}
            </Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              Duration
            </Text>
            <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>
              {duration}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  else {
    return (
      <TouchableOpacity onPress={handleClick}>
        <Animatable.View style={[styles.container,{backgroundColor:mode?'#3f3f3f':'#fff'}]} duration={1000} animation="bounceInDown">
          <View style={[styles.header,{backgroundColor:mode?'#232323':'#0a478f'}]}>
            <Text style={styles.title}>{title}</Text>
            <View style={{ borderRadius: 10, backgroundColor:mode?'#3f3f3f':'white', margin: 9, padding: 8 }}>
              <Back width={18} height={18} rotation={180} />
            </View>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Site id</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{siteId}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>State</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{state}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Cluster</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{cluster}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Voltage</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{voltage}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Temperature</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{temperature}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Start At</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{startAt}</Text>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Update At</Text>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{updateAt}</Text>
          </View>
        </Animatable.View>
      </TouchableOpacity>);
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 18,
    marginLeft: 15,
    marginTop: 6,
    marginRight: 15,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,

  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#0a478f',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  title: {
    fontSize: 16,
    padding: 10,
    color: 'white',
    flexWrap: 'wrap',
    fontFamily: 'AndadaPro-SemiBold'

  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 14,
    fontFamily: 'AndadaPro-Regular',
    color: 'black'

  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SampleSiteView;
