import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-animatable';
import Back from '../../assets/svg/back.svg';
import { useNavigation } from '@react-navigation/native';

const NotificationCard = ({ mode, title, site_name, Alarm, imei, version ,start,site_id,circle}) => {

  const navigation = useNavigation();
  const handleClick = () => {
    navigation.navigate("SiteDetail", {imei,mode,version});
  }
    return (
        <Pressable   onPress={handleClick}>
            <View style={[styles.container, { backgroundColor: mode ? '#3f3f3f' : '#fff' }]}>
                <View style={[styles.header, { backgroundColor: mode ? '#232323' : '#0a478f' }]}>
                    <Text style={[styles.title, { flex: 1 }]}>{title}</Text>
                    <View style={{ borderRadius: 10, backgroundColor: mode ? '#3f3f3f' : 'white', margin: 9, padding: 8 }}>
                        <Back width={18} height={18} rotation={180} />
                    </View>
                </View>
                <View style={styles.subContainer}>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>Site Name</Text>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>{site_name}</Text>
                </View>
                <View style={styles.subContainer}>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>Alarm</Text>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>{Alarm}</Text>
                </View>
                <View style={styles.subContainer}>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>Start Time</Text>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>{start}</Text>
                </View>
                <View style={styles.subContainer}>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>Site Id</Text>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>{site_id}</Text>
                </View>
                <View style={styles.subContainer}>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>Circle</Text>
                    <Text style={[styles.text, { color: mode ? 'white' : 'black' }]}>{circle}</Text>
                </View>
            </View>
        </Pressable>
    );
};

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

export default NotificationCard;
