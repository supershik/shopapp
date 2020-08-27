/* *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext, version } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Button,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  TextInput
} from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { AuthContext } from '../../utils/authContext';
import { acc } from 'react-native-reanimated';
import moment from 'moment';

const VisitorHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);

  const reSignIn = async()=> {
    let mobile = null;
    let password = null;
    try {
      mobile = await AsyncStorage.getItem('mobile')
      password = await AsyncStorage.getItem('password')

    } catch (e) {
      console.log(e);
    }

    signIn({ mobile, password });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        const bootstrapAsync = async () => {
          let userToken = null;
          try {
            userToken = await AsyncStorage.getItem('userToken')
          } catch (e) {
            console.log(e);
          }
          if (userToken != null) {
            const onSuccess = ({ data }) => {
              console.log(data);
              setLoading(false);
              setVisitors(data.visitordata);
            }
            const onFailure = error => {
              setLoading(false);
              if(error.toString().includes('409')) {
                console.log(error);
              }
              else if(error.toString().includes('401')) {
                console.log( "error: Authentication failed");
                reSignIn();
                //Toast.show("error: Authentication failed");
              }
              else 
                  console.log(error);
            }
  
            setLoading(true);
            SHOPAPIKit.get('/shop/visitor/all')
              .then(onSuccess)
              .catch(onFailure);
          }
  
        };
        bootstrapAsync();
      });
      return unsubscribe;

  }, [navigation]);
  const renderItem = ({ item }) => {
    return (
      <View style={styles.item}>
          <View style={{flex: 1 }}>
        <View style={styles.itemGroup}>
            <View style={{flexDirection: "row", justifyContent: 'space-around', paddingVertical: 3}}>
              <Text style={{flex: 2,  fontSize: 15, textAlign: "left", paddingLeft: 5 }}>{moment.utc(item.visitdate).format("YYYY-MM-DD HH:mm:ss")}</Text>
              <Text style={{ flex: 3, fontSize: 15, textAlign: "center" }}>{item.mobile}</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-around", paddingVertical: 3}}>
              <Text style={{ flex: 2, fontSize: 15, textAlign: "left", paddingLeft: 5  }}>{item.name}</Text>
              <Text style={{flex: 3,  fontSize: 15, textAlign: "center" }}>{item.address}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <View style={{marginTop: 5}}/>
        <FlatList
          data={visitors}
          keyExtractor={(item, index) => index.toString()}
          renderItem={visitors ? renderItem : null} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginTop: 50
  },
  textBox: {
    borderWidth: 0.5,
    borderColor: 'black',
    color: "black",
    backgroundColor: "white",
    paddingLeft: 8,
    height: 40,
    textAlignVertical: "center"
  },
  textGroup: {
    marginHorizontal: 50,
    marginTop: 20,
    backgroundColor: "white",
    paddingLeft: 8,
    textAlignVertical: "center"
  },
  mh16: {
    marginHorizontal: 16,
  },
  textDescription: {
    marginTop: 16,
    marginHorizontal: 16,
    textAlign: "center",
    color: "gray",
  },
  btn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "green",
    alignItems: "center",
    justifyContent: 'center',
    marginBottom: 10
  },
  margin16: {
    marginBottom: 16, 
    marginHorizontal: 16
  },
  txt_white14: {
    fontSize: 14,
    color: '#FFF'
  },
  listContainer: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    marginVertical: 5,
    marginHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(62,163,244,1)',
    flexDirection: 'row',
    backgroundColor: 'rgba(210,240,255,1)',
  },
  itemGroup: {
    flexDirection: 'column',
    paddingHorizontal: 5,
    justifyContent: 'space-between',
  },
});

export default VisitorHistoryScreen;