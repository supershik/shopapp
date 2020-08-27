/* *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import {ORDERAPIKit, setOrderClientToken} from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { Card } from 'react-native-paper';
import { AuthContext } from '../../utils/authContext';
import SwitchSelector from 'react-native-switch-selector';
import { ConfirmDialog } from 'react-native-simple-dialogs';

const HomeScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const [ordersAll, setOrdersAll] = useState([]);
  const [ordersNew, setOrdersNew] = useState([]);
  const [ordersProcessing, setOrdersProcessing] = useState([]);
  const [ordersReady, setOrdersReady] = useState([]);
  const [ordersPickup, setOrdersPickup] = useState([]);
  const [switchIndex, setSwitchIndex] = useState(0);
  const [isAlertSearch, setAlertSearch] = useState(false);
  const [errMessage, setErrMessage] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [managedshop, setManagedShop] = useState(0);

  const options = [
    { label: 'All', value: "0" },
    { label: 'New', value: "1" },
    { label: 'Processing', value: "2" },
    { label: 'Ready', value: "3" },
    { label: 'Pickup', value: "4" },
  ];

  const navigationOptions = () => {
    navigation.setOptions({ 
      title : "",
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <MaterialCommunityIcons.Button name="menu" size={25}
          backgroundColor={colors.primary}
          onPress={() => navigation.openDrawer()}
        ></MaterialCommunityIcons.Button>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignSelf: "center", marginRight: 5 }}>
          
          <MaterialCommunityIcons.Button name="refresh" size={25}
                backgroundColor={colors.primary}
                onPress={() => RefreshProducts()}
              ></MaterialCommunityIcons.Button>
          <MaterialCommunityIcons.Button name="magnify" size={25}
                backgroundColor={colors.primary}
                onPress={() => Search()}
              ></MaterialCommunityIcons.Button>
            {/*   <Button
            onPress={() => 
              RefreshProducts()
            }
            title="Refresh"
            color="rgba(35,150,243,1)"
          />
          <Button
            onPress={() => 
              Search()
            }
            title="Search"
            color="rgba(35,150,243,1)"
          /> */}
        </View>
      )
     });
  }

  const Search = () => {
    setOrderId("");
    setErrMessage('');
    setAlertSearch(true);
  }

  const RefreshProducts = async() => {
    let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
          let managedshop = await AsyncStorage.getItem('managedshop');
          setManagedShop(managedshop);
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            console.log(data);
            setLoading(false);
            setPartialOrders(data.liveorders);
            console.log('success');
          }
          const onFailure = (error) => {
            setLoading(false);
            setOrdersAll([]);
            setOrdersNew([]);
            setOrdersProcessing([]);
            setOrdersReady([]);

            if(error.toString().includes('409')) {
              console.log( "message: No liveorders");
              // Toast.show("message: No liveorders");
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
          ORDERAPIKit.get('/shoporder/orders/live/')
            .then(onSuccess)
            .catch(onFailure);
        }
  }
  const setPartialOrders = (orders) => {
    let ordersNew = [];
    let ordersProcessing = [];
    let ordersReady = [];
    let ordersPickup = [];

    //console.log(orders);
    orders.forEach(element => {
      if( element.orderstatusid <= 12 )
        ordersNew.push(element);
      else if( element.orderstatusid == 13 )
        ordersProcessing.push(element);
      else if( element.orderstatusid == 14 )
        ordersReady.push(element);
      else if( element.orderstatusid == 17 )
        ordersPickup.push(element);
    });

    setOrdersAll(orders);
    setOrdersNew(ordersNew);
    setOrdersProcessing(ordersProcessing);
    setOrdersReady(ordersReady);
    setOrdersPickup(ordersPickup);

    onSwitchChange(0);  // All data
  }
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
      navigationOptions();
      const bootstrapAsync = async () => {
        RefreshProducts();
      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const onOrderPressed = (item) => {
    console.log(item.orderref);
    navigation.navigate('Update Order Detail', item)
  }

  const renderItem = ({ item, index }) => {
    return (
        <TouchableOpacity onPress={() => onOrderPressed(item, index)}>
        <View style={ styles.card }>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Ref</Text>
                <Text style={[styles.box, styles.box2]}>{item.orderref}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Total</Text>
                <Text style={[styles.box, styles.box3]}>₹ {item.ordertotal}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Quantity</Text>
                <Text style={[styles.box, styles.box3]}>{item.orderquantity}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Pickup</Text>
                <Text style={[styles.box, styles.box3]}>{moment.utc(item.orderpickuptime).format("HH:mm:ss")}</Text>
            </View>

        </View>
        </TouchableOpacity>
    )
  }
  const onSwitchChange = (value) => {
    if(switchIndex == value)
      return;
    setSwitchIndex(value);
  }

  const onPressSearch = async() => {

    if( orderId.toString().length < 2 )
      return;

    setErrMessage('');
    let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken')
        } catch (e) {
          console.log(e);
        }

        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            //console.log(data);
            if( data.orderdetails.length > 0 ) {
              setAlertSearch(false);
              let item = {
                orderref : data.orderref,
              }
              if( data.statusid < 16 ) {
                navigation.navigate('Update Order Detail', item);
              }
              else {
                navigation.navigate('Order Detail', item);
              }
            }
            else {
              setErrMessage("Order is missing");
            }
          }
          const onFailure = error => {
            setLoading(false);
            if(error.toString().includes('409')) {
              setErrMessage("Order is missing");
            }
            else if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
              reSignIn();
              //Toast.show("Order is missing");
            }
            else {
              setErrMessage("Please try again");
            }
          }
          setLoading(true);
          ORDERAPIKit.get('/shoporder/customer/order/' + orderId)
            .then(onSuccess)
            .catch(onFailure);
        }
  }
  return (
    <>
      <View style={styles.container}>
        { loading ? 
          <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
          : 
          <View style={styles.listContainer}> 
            {switchIndex==0 && (
              <View> 
              { ordersAll.length == 0 ? 
                <View  style={styles.noliverorders}> 
                  <Text style={styles.textNoLive}>
                    No Live Order
                  </Text>
                </View>
                : 
                <View style={{marginTop: 5}}></View>
              }
              <FlatList style ={{marginBottom: 10}}
                data={ordersAll}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem} />
              </View>
            )}
            {switchIndex==1 && (
              <View> 
              { ordersNew.length == 0 ? 
                <View  style={styles.noliverorders}> 
                  <Text style={styles.textNoLive}>
                    No Live Order
                  </Text>
                </View>
                : 
                <View style={{marginTop: 5}}></View>
              }
              <FlatList style ={{marginBottom: 10}}
                data={ordersNew}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem} 
                />
              </View>
            )}
            {switchIndex==2 && (
              <View> 
              { ordersProcessing.length == 0 ? 
                <View  style={styles.noliverorders}> 
                  <Text style={styles.textNoLive}>
                    No Live Order
                  </Text>
                </View>
                : 
                  <View style={{marginTop: 5}}></View>
              }
              <FlatList style ={{marginBottom: 10}}
                data={ordersProcessing}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem} />
              </View>
            )}
            {switchIndex==3 && (
              <View> 
              { ordersReady.length == 0 ? 
                <View  style={styles.noliverorders}> 
                  <Text style={styles.textNoLive}>
                    No Live Order
                  </Text>
                </View>
                : 
                  <View style={{marginTop: 5}}></View>
              }
              <FlatList style ={{marginBottom: 10}}
                data={ordersReady}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem} />
              </View>
            )}
            {switchIndex==4 && (
              <View> 
              { ordersPickup.length == 0 ? 
                <View  style={styles.noliverorders}> 
                  <Text style={styles.textNoLive}>
                    No Live Order
                  </Text>
                </View>
                : 
                  <View style={{marginTop: 5}}></View>
              }
              <FlatList style ={{marginBottom: 10}}
                data={ordersPickup}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem} />
              </View>
            )}
          </View>
      }
      </View>
      <SwitchSelector
          textColor={'rgba(34,150,243,1)'} //'#7a44cf'
          selectedColor={'white'}
          // buttonColor={'#2396f3'}
          buttonColor={'rgba(34,150,243,1)'}
          borderColor={'#146fb9'}
          backgroundColor={'rgba(217,232,252,1)'}
          style={{backgroundColor: 'rgba(217,232,252,1)', opacity: 1, borderWidth: 1, borderColor: "lightgray"}}
          // hasPadding
          options={options}
          initial={0}
          onPress={value => onSwitchChange(value)}
        />
        <ConfirmDialog
            dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 300, alignSelf: "center" }}
            titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
            title={"Please enter order ID to search order"}
            visible={isAlertSearch}
            onTouchOutside={() => setAlertSearch(false)}
        >
          <View style = {{marginTop: -10, marginBottom: -40, marginHorizontal: 10 }}>
                <Text style={{fontSize: 12, textAlign: "center"}}>
                  "Ex. For order ref VE0000-1111, use 1111 for search."
                </Text>
                <View style={{marginTop: 20, marginHorizontal: 30}}>
                  <TextInput
                      style={styles.inputOrderId}
                      keyboardType={'phone-pad'}
                      label={'ORDER ID'}
                      placeholder="ORDER ID"
                      value={orderId}
                      maxLength={6}
                      onChangeText={setOrderId}
                  />
                <Text style={{color: 'red', marginBottom: 20, textAlign: "center"}}>
                  {errMessage}
                </Text>
                  <Button
                    buttonStyle={{backgroundColor: "rgba(130, 130, 128,1)" }}
                    title="Search Order"
                    titleStyle={{ fontSize: 14 }}
                    onPress={() => onPressSearch()}
                  />
            </View>
          </View>
        </ConfirmDialog>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(217,232,252,1)',
  },
  listContainer: {
    flex: 1,
  },
  title: {
    margin: 10,
    alignSelf: "center",
    fontSize: 16,
  },
  item: {
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  selecteditem: {
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  card: {
    flexDirection: 'column',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  textNoLive: {
    fontSize: 18,
    marginTop: 300,
    color: "rgba(128, 128, 128, 1)"
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(20,123,136,1)',
    height: 30,
    backgroundColor: '#333',
    textAlignVertical: "center",
    textAlign: "center",
  },
  box2: {
    backgroundColor: 'rgba(176, 227, 230, 1)',
  },
  box3: {
    // backgroundColor: 'orange'
    backgroundColor:  'rgba(178, 221, 238, 1)',

  },
  two: {
    flex: 2
  },

  noliverorders: {
    marginTop: -50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputOrderId: {
    width: "140%",
    textAlign: "center",
    textAlignVertical: "center",
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
    height: 36,
    marginBottom: 20,
  }
});

export default HomeScreen;