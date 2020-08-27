/* *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

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

import { TextInput, HelperText } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { AuthContext } from '../../utils/authContext';
import { acc } from 'react-native-reanimated';

const BankDetailsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const [account, setAccount] = useState("");
  const [accountConfirm, setAccountConfirm] = useState("");
  
  const [ifsc, setIFSC] = useState("");
  const [upi, setUPI] = useState("");
  const [updateallow, setAllow] = useState(false);

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
            setLoading(false);
            setAccount(data.account == null ? '' : data.account);
            setAccountConfirm(data.account == null ? '' : data.account);
            setIFSC(data.ifsc == null ? '' : data.ifsc);
            setUPI(data.upi == null ? '' : data.upi);
            setAllow(data.updateallow == 0 ? false: true);
            console.log(data);
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
          SHOPAPIKit.get('/shop/details/bank')
            .then(onSuccess)
            .catch(onFailure);
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const getSubscriptions = (subscriptions) => {
    setSubscriptions(subscriptions);
  }
  const onOrderPressed = (item, index) => {
    console.log(index)
    setSelectedIndex(index)
  }

  const updateBank = () => {
    if(account.length < 1 || ifsc.length < 1 || upi.length < 1)
    {
      Toast.show("Please enter a value");
      return;
    }

    if(account != accountConfirm)
    {
      Toast.show("Account number is not matched");
      return;
    }

    const payload = {account, ifsc, upi};
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
    SHOPAPIKit.patch('/shop/details/bank/update', payload)
      .then(onSuccess)
      .catch(onFailure);
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}></View>

          <TextInput style={styles.textBox}
            label="Bank Account Number"
            keyboardType="phone-pad"
            editable = {updateallow}
            maxLength={18}
            value={account}
            onChangeText={setAccount}
          >
          </TextInput>
          { updateallow ? 
            <TextInput
              style={styles.textBox}
              label="Confirm Bank Account Number"
              keyboardType="phone-pad"
              editable = {updateallow}
              maxLength={18}
              value={accountConfirm}
              onChangeText={setAccountConfirm}
            />
            :
            <TextInput
              style={styles.textBox}
              label="Confirm Bank Account Number"
              // keyboardType="phone-pad"
              secureTextEntry={true}
              editable = {updateallow}
              maxLength={18}
              value={accountConfirm}
              onChangeText={setAccountConfirm}
            />
          }
          <TextInput style={styles.textBox}
            label="IFSC code"
            editable = {updateallow}
            value={ifsc}
            onChangeText={setIFSC}
          >
          </TextInput>

          {updateallow ? <View style={styles.line}></View> : <View style={styles.lineLight}></View>}

          <TextInput style={styles.textBox}
            label="UPI ID"
            editable = {updateallow}
            value={upi}
            onChangeText={setUPI}
          >
          </TextInput>

          { updateallow ? 
              <Text style = {styles.textDescription}>
                *Updating existing account details will hold current all due payments, it will take up to 72 hours to reflect in payment system
              </Text>
            :
              <Text style = {styles.textDescription}>
                *Please contact support team for any update in bank details
              </Text>
          }
        </ScrollView>
        
        <View style={styles.mh16}>
          {updateallow ?
            <TouchableOpacity style={[styles.btn, styles.margin16]} onPress={() => updateBank()}>
              <Text style={styles.txt_white14}>Update bank details</Text>
            </TouchableOpacity>
            : null
          }
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
  line: {
    marginHorizontal: 30,
    marginVertical: 30,
    borderBottomColor: "black",
    borderBottomWidth: 2,
  },
  lineLight: {
    marginHorizontal: 30,
    marginVertical: 30,
    borderBottomColor: "gray",
    borderBottomWidth: 2,
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
});

export default BankDetailsScreen;