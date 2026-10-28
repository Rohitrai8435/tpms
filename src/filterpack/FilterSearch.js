import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const FilterSearch = ({ data, onClientPress }) => {
  useEffect(() => {
    console.log('Data received1:', data);
  }, [data]);


  if (!data) {
    return <Text>Loading...</Text>;
  }

  if (!Array.isArray(data)) {
    return <Text>Error: Unable to fetch data</Text>;
  }
  const handleClientPress = (item) => {
    // Call the onClientPress callback with the selected item's data
    onClientPress(item);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.subContainer}>
        <TextInput
          placeholder='Search'
          placeholderTextColor='white'
          clearButtonMode='always'
          autoCapitalize='none'
          autoCorrect={false}
          style={styles.searchBox}
        />
      </View>
      {data.map((item, index) => (
        <View key={index} style={{ marginTop: 8, marginLeft: 5, marginRight: 5 }}>
          <TouchableOpacity style={{ borderRadius: 28, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }} onPress={() => handleClientPress(item)}>
            <Text style={{ padding: 10, fontSize: 16 }}>{item.client_type_name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#c9ddf5'
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a478f',
    padding: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: -4
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 28,
    flex: 1,
    color: 'white',
  },
});

export default FilterSearch;
