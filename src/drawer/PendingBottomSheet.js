import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, FlatList, TouchableOpacity } from 'react-native';
const { height: screenHeight } = Dimensions.get('window');
import Clear from '../../assets/svg/cross.svg'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const capitalizeAndReplace = (str) => {
    // Capitalize first letter of each word
    const capitalized = str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    return capitalized;
  };

const PendingBottomSheet = React.forwardRef(({ mode , data,name ,close}) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    const gesture = Gesture.Pan().onStart(() => {
        context.value = { y: translateY.value }
    }).onUpdate((event) => {
        //console.log(event.translationY);
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, -screenHeight);
    });

    useEffect(() => {
        translateY.value = withSpring(-screenHeight / 4, { damping: 50 })
    })
    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }]
        }
    })
    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle,{backgroundColor:mode?'black':'white'}]}>
                <View style={[styles.title, { backgroundColor: mode ? '#232323' : '#29c5f6' }]}>
                    <Text style={{ fontFamily: 'AndadaPro-Regular', color: 'white', fontSize: 16 }}>{name}</Text>
                    <TouchableOpacity onPress={close}>
                    <Clear width={24} height={24} fill={'white'}></Clear>
                    </TouchableOpacity>
                </View>
                <FlatList
              data={data}
              renderItem={({ item }) => (
                <View >
                {Object.entries(item).map(([key, value], index) => (
               <View key={index}>
                <View style={{flexDirection:'row' ,paddingLeft:18,paddingRight:18,padding:8,justifyContent:'space-between',alignItems:'center',backgroundColor:index%2==0?(mode?'#3f3f3f':'#add8e6'):(mode?'#232323':'white')}}>
                <Text style={{fontFamily: 'AndadaPro-Regular',color:mode?'white':'black',fontSize:18,padding:4}}> {capitalizeAndReplace(key)}</Text>
              <Text style={{fontFamily: 'AndadaPro-Regular',color:mode?'white':'black',fontSize:18,padding:4}}> {value}</Text>
                </View>
             
              
            </View>
          ))}
                </View>)}
              keyExtractor={(item, index) => index.toString()} />
            </Animated.View>
        </GestureDetector>
    );
})

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: screenHeight,
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        top: screenHeight,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    title: {
        width: '100%',
        backgroundColor: '#29c5f6',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18
    }
})

export default PendingBottomSheet;