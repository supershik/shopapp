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
} from 'react-native';


import { TextInput } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { AuthContext } from '../../utils/authContext';
import { acc } from 'react-native-reanimated';

const RegisterVisitorScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

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
      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const RegisterVisitor = () => {
    if(mobile.length !=  10)
    {
      Toast.show("Valid phone number");
      return;
    }

    const payload = {mobile, name, address};
    const onSuccess = ({ data }) => {
      setLoading(false);
      console.log(data);
      Toast.show(data.message);
      navigation.navigate('Home');
    }
    const onFailure = error => {
      setLoading(false);
      if(error.toString().includes('409')) {
        Toast.show('Failed to update.');
      }
      else if(error.toString().includes('401')) {
        console.log( "error: Authentication failed");
        reSignIn();
       // Toast.show("error: Authentication failed");
      }
      else
          console.log(error);
    }

    setLoading(true);
    SHOPAPIKit.post('/shop/visitor/register', payload)
      .then(onSuccess)
      .catch(onFailure);
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}></View>
          <View style={[styles.textGroup]}>
            <TextInput style={styles.textBox}
              label="Mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
            />
            <Text style={{position: "absolute", top: 30, right: 40}}>*</Text>
          </View>
          <View style={styles.textGroup}>
            <TextInput style={styles.textBox}
              label="Name"
              maxLength={50}
              value={name}
              onChangeText={setName}
            >
            </TextInput>
          </View>
          <View style={styles.textGroup}>
            <TextInput style={styles.textBox}
              label="Address"
              value={address}
              onChangeText={setAddress}
            >
            </TextInput>
          </View>
        </ScrollView>
        
        <View style={styles.mh16}>
            <TouchableOpacity style={[styles.btn, styles.margin16]} onPress={() => RegisterVisitor()}>
              <Text style={styles.txt_white14}>Register Visitor</Text>
            </TouchableOpacity>
        </View>
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
  // textBox: {
  //   borderWidth: 0.5,
  //   borderColor: 'black',
  //   color: "black",
  //   backgroundColor: "white",
  //   paddingLeft: 8,
  //   height: 40,
  //   textAlignVertical: "center"
  // },
  textBox: {
    marginHorizontal: 50,
    marginVertical: 10,
    // borderWidth: 0.5,
    // borderColor: 'black',
    color: "black",
    backgroundColor: "white",
    paddingLeft: 8,
    height: 55,
    textAlignVertical: "center"
  },
  textGroup: {
    marginHorizontal: 10,
    marginTop: 0,
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
    backgroundColor: "rgba(34,150,243,1)",
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
  row: {
    position: "relative"
    // flexDirection: "row",
    // justifyContent: "space-between"
  }
});

export default RegisterVisitorScreen;