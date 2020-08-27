/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  ToastAndroid,
} from 'react-native';

import { AuthContext } from '../../utils/authContext';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import {ORDERAPIKit, setOrderClientToken} from '../../utils/apikit';
import SwitchSelector from 'react-native-switch-selector';

const OrderHistoryScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [ordersAll, setOrders] = useState([]);
  const [ordersCompleted, setOrdersCompleted] = useState([]);
  const [ordersCancelled, setOrdersCancelled] = useState([]);
  const [ordersRefunded, setOrdersRefunded] = useState([]);
  const [switchIndex, setSwitchIndex] = useState(0);

  const options = [
    { label: 'Completed', value: "0" },
    { label: 'Cancelled', value: "1" },
    { label: 'Refunded', value: "2" }
  ];

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
  const setPartialOrders = (orders) => {
    let completedOrders = [];
    let cancelledOrders = [];
    let refundedOrders = [];
    orders.forEach(element => {
      if( element.orderstatus == "Completed" )
        completedOrders.push(element);
      else if( element.orderstatus == "Cancelled" )
        cancelledOrders.push(element);
      else if( element.orderstatus == "Refunded" )
        refundedOrders.push(element);
    });

    setOrders(orders);
    setOrdersCompleted(completedOrders);
    setOrdersCancelled(cancelledOrders);
    setOrdersRefunded(refundedOrders);

    onSwitchChange(0);  // All data
  }
  const onSwitchChange = (value) => {
    if(switchIndex == value)
      return;
    setSwitchIndex(value);
  }
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const bootstrapAsync = async () => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            setPartialOrders(data.orders);
            //console.log(data.orders);
            console.log('success')
          }
          const onFailure = (error) => {
            setLoading(false);
            if(error.toString().includes('409')) {
              console.log( "message: No order");
              Toast.show("message: No order");
            }
            else if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
              reSignIn();
              Toast.show("error: Authentication failed");
            }
            else
              console.log(error);
          }
          setLoading(true);
          ORDERAPIKit.get('/shoporder/orders')
            .then(onSuccess)
            .catch(onFailure);
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const onOrderPressed = (item) => {
    //console.log(item.orderref);
    navigation.navigate('Order Detail', item)
  }
  const renderItem = ({ item }) => {
    return (
      // <View style={styles.item}>
      //   <TouchableOpacity onPress={() => onOrderPressed(item)}>
      //     <View style={styles.itemGroup}>
      //       <Text style={{ fontSize: 15 }}>Order Ref         {item.orderref}</Text>
      //       <Text style={{ fontSize: 15 }}>Quantity           {item.orderquantity}</Text>
      //       <Text style={{ fontSize: 15 }}>Sub Total         ₹{item.ordertotal}</Text>
      //       <Text style={{ fontSize: 15 }}>Order Date      {item.orderdate}</Text>
      //     </View>
      //   </TouchableOpacity>
      // </View>
      <View style={styles.item}>
          <View style={{flex: 1 }}>
            <TouchableOpacity onPress={() => onOrderPressed(item)}>
              <View style={styles.itemGroup}>
                <View style={{flexDirection: "row", justifyContent: 'space-around', paddingVertical: 3}}>
                    <Text style={{ flex: 2, fontSize: 15, textDecorationLine: "underline",textAlign: "center" }}>{item.orderref}</Text>
                    <Text style={{ flex: 2, fontSize: 15, textAlign: "center" }}>{item.orderdate}</Text>
                  </View>
                  <View style={{flexDirection: "row", justifyContent: "space-around", paddingVertical: 3}}>
                    <Text style={{flex: 2,  fontSize: 15, textAlign: "center" }}>₹ {item.ordertotal}</Text>
                    <Text style={{flex: 2,  fontSize: 15, textAlign: "center" }}>{item.orderquantity} pc</Text>
                  </View>
              </View>
            </TouchableOpacity>
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
        {
          switchIndex == 1 ?
            <FlatList
            data={ordersCancelled}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ordersCancelled ? renderItem : null} />
          : switchIndex == 2 ?
            <FlatList
            data={ordersRefunded}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ordersRefunded ? renderItem : null} />
            : 
            <FlatList
            data={ordersCompleted}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ordersCompleted ? renderItem : null} />
        }
        <SwitchSelector
          textColor={'#2396f3'} //'#7a44cf'
          selectedColor={"white"}
          buttonColor={'#2396f3'}
          borderColor={'#146fb9'}
          backgroundColor={'#f2f2f2'}
          style={{backgroundColor: '#f2f2f2', opacity: 1, borderWidth: 1, borderColor: "lightgray"}}
          // hasPadding
          options={options}
          initial={0}
          onPress={value => onSwitchChange(value)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default OrderHistoryScreen;