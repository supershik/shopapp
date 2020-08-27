/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  View,
  Button,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import AwesomeAlert from 'react-native-awesome-alerts';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import Spinner from 'react-native-loading-spinner-overlay';
import { colors } from '../../res/style/colors'
import SHOPAPIKit, { ORDERAPIKit, setShopClientToken, setOrderClientToken } from '../../utils/apikit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import cleancart from '../../res/assets/images/clean_cart.png'
import imgEmpty from '../../res/assets/images/empty.png';
import imgHome from '../../res/assets/images/home.png';
import BarcodeApp from "../../component/BarcodeApp"
const ShopBillingScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [products, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [deleteItem, setDeleteItem] = useState([]);
  const [alertOneItem, setAlertOneItem] = useState(false);
  const [alertAllItem, setAlertAllItem] = useState(false);
  const [mobile, setMobile] = useState('');
  const [alertMobile, setAlertMobile] = useState(false);
  const [isCamera, setCamera] = useState(false);
  const [qrvalue, setQRValue] = useState(route.params?.qrvalue);
  const [old_qrvalue, setOldQRValue] = useState("");
  const [fromScreen] = useState(route.params?.from);
  const [alertBarcode, setAlertBarcode] = useState(false);

  
  const navigationiOptions = () => {
    navigation.setOptions({ 
        title: 'Shop Billing',
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          // <View style={{flex: 1, flexDirection: "row"}}>
          //   <View style={{flexDirection: 'row', alignSelf: "center", marginRight: 5}}>
          //     <TouchableOpacity
          //         onPress={() => onPressHome()}
          //       >
          //       <Image
          //         source={imgHome}
          //         style={styles.cleanIcon}
          //       />
          //     </TouchableOpacity>
          //   </View>

          //   <View style={{flexDirection: 'row', alignSelf: "center", marginRight: 5}}>
          //     <TouchableOpacity
          //       onPress={() => onPressHome()}
          //     >
          //     <Image
          //       source={imgHome}
          //       style={styles.cleanIcon}
          //     />
          //     </TouchableOpacity>
          //   </View>
          // </View>

          <View style={{ flexDirection: 'row', alignSelf: "center", marginRight: 5 }}>
          
          <MaterialCommunityIcons.Button name="card-bulleted-settings-outline" size={25}
                backgroundColor={colors.primary}
                onPress={() => RefreshProducts()}
              ></MaterialCommunityIcons.Button>
          <MaterialCommunityIcons.Button name="home" size={25}
                backgroundColor={colors.primary}
                onPress={() => onPressHome()}
              ></MaterialCommunityIcons.Button>
        </View>
        )
    })
  }

  const RefreshProducts = () => {
    setMobile('');
    setAlertMobile(true);
  }

  useEffect(() => {
    navigationiOptions();
    const unsubscribe = navigation.addListener('focus', () => {
      // console.log(route?.params);
      // if (route?.params?.from == 'barcode_back' && route?.params?.qrvalue == "none") {
      //   RefreshProducts();
      // }
      if (route?.params?.from == 'barcode' && route?.params?.qrvalue != old_qrvalue) {
        // setQRValue(route?.params?.qrvalue);
        // setOldQRValue(route?.params?.qrvalue);
        // setAlertBarcode(true);
        sendBarcode(route?.params?.qrvalue);
      }
      else
      {
        RefreshProducts();
      }
    });
    return unsubscribe;
  }, [navigation, route, old_qrvalue]);

  const onPressedMobileNumberOK = ()=> {
    setAlertMobile(false);
    if (mobile.length < 10 ) {
      let mobile1 = '1111111111';
      setMobile(mobile1);
      setData([]);
      cleanProdcutFromShopBilling(mobile1);
    }
    else
      getProdcutFromShopBilling(mobile);
  }

  const onPressedMobileNumberCancel = ()=> {
    setAlertMobile(false);
    let mobile1 = '1111111111';
    setMobile(mobile1);
    setData([]);
    cleanProdcutFromShopBilling(mobile1);
  }

  // no response
  const cleanProdcutFromShopBilling = (mobile)=> {

    const bootstrapAsync = async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log(e);
      }
      if (userToken != null) {
        const onSuccess = ({ data }) => {
          console.log('---------- clean successful ---------- ');
          console.log(data);
          setLoading(false);
        }
        const onFailure = error => {
          console.log('---------- clean successful ---------- ');
          console.log(error);
          setLoading(false);
        }
        setLoading(true);
        console.log('---------- clean product by 11111111111 ---------- ')
        ORDERAPIKit.delete('/shopwalkin/cart/product/clean/' + mobile)
          .then(onSuccess)
          .catch(onFailure);
      }
      else {
        setData([]);
      }
    };
    bootstrapAsync();
  }

  const getProdcutFromShopBilling = (mobile)=> {

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
          console.log(data);
          setData(data.products);
          //getTotalPrice(data.products);
        }
        const onFailure = error => {
          setLoading(false);
          setData([]);
          console.log(error);
        }
        setLoading(true);
        ORDERAPIKit.get('/shopwalkin/cart/product/get/' + mobile)
          .then(onSuccess)
          .catch(onFailure);
      }
      else {
        setData([]);
      }
    };
    bootstrapAsync();
    console.log('Focused effect')
  }

  const onPressHome = () => {
    navigation.navigate('Home');
  }

  const cleanAllProducts = () => {
    setAlertAllItem(false);

    if( products.length > 0 ) {
      const onSuccess = ({ data }) => {
        setLoading(false);         
        // console.log(data);
        //Toast.show(data.message);
        Toast.show("All carts cleaned successfully");
        setData([]);
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          if(error.toString().includes('409')) {
            console.log( "message: Fail to delete.");
            Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
            //reSignIn();
            //Toast.show("error: Authentication failed");
          }
          else
            console.log(error);
      }

      console.log('clean all carts: ');
      setLoading(true);
      USERAPIKit.delete('/user/cart/remove')
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  const getTotalPrice = (products) => {
    var tempTotal = 0;
    products.forEach(element => {
      if (element.quantity != 'undefined' && element.quantity > 0) {
        var itemTotal = element.unitprice * element.quantity;
        element.total = itemTotal;
        tempTotal += itemTotal;
      }
    });
    setData(products);
    setTotal(tempTotal);
  }

  const onPressedScanProduct = () => {
    setCamera(true);
    setOldQRValue("");
    navigation.navigate('Barcode');
  }

  const sendBarcode = (qrvalue1) => {
    setAlertBarcode(false);
    let barcode = qrvalue1;
    
    if( barcode.length > 4 ) {
      const onSuccess = ({ data }) => {
        setLoading(false);         
        // console.log(data);
        var tempdata = [];
        products.forEach(element => {
            tempdata.push(element);
        })

        let newProduct = {
          "brand": data.brand,
          "category": data.category,
          "description": data.description,
          "imageurl": data.imageurl,
          "product": data.product,
          "productid": data.productid, 
          "quantity": data.quantity, 
          "symbol": data.symbol, 
          "unitprice": data.unitprice, 
          "walkinproductid": data.walkinproductid, 
          "weight": data.weight, 
          "weightunit": data.weightunit
        }
        tempdata.push(newProduct);
        setData(tempdata);
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          Toast.show('Fail to add');
          if(error.toString().includes('409')) {
            console.log( "message: Failed");
            //Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
          }
          else
            console.log(error);
      }

      let mobile1 = mobile;
      if(mobile1.length < 10)
        mobile1 = '1111111111';
      let payload = {
        'barcode': barcode,
        'mobile': mobile1,
      }

      console.log('will send barcode====', payload);
      setLoading(true);
      ORDERAPIKit.post('/shopwalkin/cart/product/add', payload)
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  const onPressedPayShop = () => {
    if( mobile.length == 10  ) {
      const onSuccess = ({ data }) => {
        setLoading(false);    
        Toast.show('Shop order created successfully');
        onPressHome();
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          Toast.show('Fail to pay app');
          if(error.toString().includes('409')) {
            console.log( "message: Failed");
            //Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
          }
          else
            console.log(error);
      }

      let mobile1 = mobile;
      if(mobile1.length < 10)
        mobile1 = '1111111111';

      setLoading(true);
      ORDERAPIKit.post('/shopwalkin/order/new/shoppay/'+ mobile1)
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  const onPressedPayApp = () => {
    if( mobile.length == 10  ) {
      const onSuccess = ({ data }) => {
        setLoading(false);    
        Toast.show('Shop order created successfully');
        onPressHome();
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          Toast.show('Fail to pay shop');
          if(error.toString().includes('409')) {
            console.log( "message: Failed");
            //Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
          }
          else
            console.log(error);
      }

      let mobile1 = mobile;
      if(mobile1.length < 10)
        mobile1 = '1111111111';

      setLoading(true);
      ORDERAPIKit.post('/shopwalkin/order/new/apppay/'+ mobile1)
          .then(onSuccess)
          .catch(onFailure);
      }
  }
  
  const renderCircleView = (item) => {
    if (item.symbol == 'G') {
      return (
        <View style={styles.circleview_green} />
      )
    }
    else if (item.symbol == 'R') {
      return (
        <View style={styles.circleview_red} />
      )
    }
    else if (item.symbol == 'Y') {
      return (
        <View style={styles.circleview_yellow} />
      )
    }
    else if (item.symbol == 'B') {
      return (
        <View style={styles.circleview_brown} />
      )
    }
    else {
      return (
        <View style={styles.circleview_white} />
      )
    }
  }

  const confirmOneDelete = () => {
    setAlertOneItem(false);
    if(deleteItem.length < 1)
      return;

    const item = deleteItem.item;
    const index = deleteItem.index;

    console.log(index);
    console.log(item);

    if( item.walkinproductid != null ) {
      const onSuccess = ({ data }) => {
        setLoading(false);         
        // console.log(data);

        Toast.show(data.message);
        var tempdata = [];
        products.forEach(element => {
          if(element.walkinproductid != item.walkinproductid)
            tempdata.push(element);
        })

        setData(tempdata);
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          Toast.show('Fail to delete.');
          if(error.toString().includes('409')) {
            console.log( "message: Failed");
            //Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
            //reSignIn();
            //Toast.show("error: Authentication failed");
          }
          else
            console.log(error);
      }

      console.log(item.walkinproductid);

      setLoading(true);
      ORDERAPIKit.patch('/shopwalkin/cart/product/remove/' + item.walkinproductid)
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  const onDeletePressed = (item, index) => {
    let data = {
      item: item,
      index: index
    }

    setDeleteItem(data);
    setAlertOneItem(true);
  }


  const onMinusQuantityPressed = (item, index) => {
    var tempdata = [];
    var new_quantity = item.quantity;
    new_quantity--;
    if(new_quantity < 1 )  new_quantity = 1;

    const newitem = {
      ...item,
      quantity: new_quantity
    }

    products.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = newitem;
    getTotalPrice(tempdata);
  }

  const onPlusQuantityPressed = (item, index) => {
    var tempdata = [];
    var maxQuantity = 0;
    var maxQuantity = 10000000;
    var new_quantity = item.quantity;
    new_quantity++;
    if(new_quantity > maxQuantity )  new_quantity = maxQuantity;

    const newitem = {
      ...item,
      quantity: new_quantity
    }

    products.forEach(element => {
      tempdata.push(element);
    })

    tempdata[index] = newitem;
    getTotalPrice(tempdata);
  }

  const onOneUpdatePressed = (item, index) => {
    if( item.walkinproductid != null ) {
      const onSuccess = ({ data }) => {                
        // console.log(data);
        Toast.show(data.message);
      }
      const onFailure = error => {
        Toast.show('Fail to update.');
        if(error.toString().includes('409')) {
          console.log( "message: Failed");
          //Toast.show('Fail to update.');
        }
        else if(error.toString().includes('401')) {
          console.log( "error: Authentication failed");
          // reSignIn();
          //Toast.show("error: Authentication failed");
        }
        else
          console.log(error);
      }
  
      const payload = {
          "walkinproductid": item.walkinproductid,
          "quantity": item.quantity,
      }

      ORDERAPIKit.patch('/shopwalkin/cart/product/update', payload )
      .then(onSuccess)
      .catch(onFailure);
    }
  }
  
  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.item}>
        <Image
          style={styles.image}
          source={item.imageurl ? { uri: item.imageurl } : imgEmpty}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ marginTop: 1, fontSize: 16 }}>{item.product}</Text>
          <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15 }}>{item.brand}</Text>
            <Text style={{ flex: 1, fontSize: 15, marginLeft: 10 }}>{item.weight} {item.weightunit}</Text>
            {
              renderCircleView(item)
            }
          </View>
          <View style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15 }}>PRICE: ₹ {item.unitprice}</Text>
            <View style={{ flexDirection: 'row', marginTop: 0}}>
                <TouchableOpacity onPress={() => onMinusQuantityPressed(item, index)} >
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="minus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                </TouchableOpacity>
                <View style={{ height: 20, marginRight: 10, marginBottom: 5, }}>
                  <Text style={{ fontSize: 15 }}>{item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => onPlusQuantityPressed(item, index)}>
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="plus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: "row"}}>
                <TouchableOpacity onPress={() => onDeletePressed(item, index)}>
                    <MaterialCommunityIcons
                          style = {{paddingRight: 6}}
                          name="delete-circle-outline"
                          color="red"
                          size={22}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onOneUpdatePressed(item, index)}>
                      <MaterialCommunityIcons
                            style = {{paddingRight: 5}}
                            name="backup-restore"
                            color="green"
                            size={22}/>
                </TouchableOpacity>
              </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
      { loading ? 
          <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
          : 
          <View style={styles.container}>
            { products.length == 0 ? 
                <View  style={styles.emptyData}> 
                  <Text style={{fontSize: 20, marginTop: 0, color: "rgba(128, 128, 128, 1)"}}>
                    Scan barcode to add product for billing
                  </Text>
                </View>
                : <>
                    <View style={{marginTop: 10}}/>
                    <View style={{flex: 10}}>
                      <FlatList
                        data={products}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={products ? renderItem : null} />
                    </View>
                    <View style={{flex: 1}}>
                        <View style={styles.btnGroup}>
                          <View style={styles.payBtnGroup} >
                            <View style={{flex: 1, paddingHorizontal: 5, }}>
                              <Button title='App Pay' onPress={onPressedPayApp} />
                            </View> 
                            <View style={{flex: 1, paddingHorizontal: 5, }}>
                              <Button title='Shop Pay' onPress={onPressedPayShop} />
                            </View> 
                          </View>
                        </View>
                    </View>
                  </>
              }
              <View style={styles.btnGroup} >
                <View style={{marginTop: -10, marginBottom: 5, paddingHorizontal: 5}}>
                  <Button title='Scan Product' onPress={onPressedScanProduct} />
                </View> 
              </View>

            </View>
         }
          {/* {isCamera && 
            <BarcodeApp/>
          } */}
         <AwesomeAlert
            show={alertOneItem}
            showProgress={false}
            title="Remove product?"
            titleStyle={{fontSize: 16}}
            message=""
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlertOneItem(false);
            }}
            onConfirmPressed={() => {
              confirmOneDelete();
            }}
        />
        <AwesomeAlert
            show={alertAllItem}
            showProgress={false}
            title="Remove all products ?"
            titleStyle={{fontSize: 16, marginBottom: 0, marginHorizontal: -10}}
            message=""
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlertAllItem(false);
            }}
            onConfirmPressed={() => {
              cleanAllProducts();
            }}
        />
        <ConfirmDialog
            dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 300, alignSelf: "center" }}
            titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
            title={"Please enter a mobile"}
            visible={alertMobile}
            onTouchOutside={() => onPressedMobileNumberCancel()}
        >
          <View style = {{marginTop: -10, marginBottom: -40, marginHorizontal: 10 }}>
                <View style={{marginTop: 20, marginHorizontal: 30}}>
                  <TextInput
                      style={styles.inputMobile}
                      keyboardType={'phone-pad'}
                      label={'Mobile'}
                      placeholder="Mobile"
                      value={mobile}
                      maxLength={10}
                      onChangeText={setMobile}
                  />

                  <Button
                    buttonStyle={{backgroundColor: "rgba(130, 130, 128,1)" }}
                    title="Start Billing"
                    titleStyle={{ fontSize: 14 }}
                    onPress={() => onPressedMobileNumberOK()}
                  />
            </View>
          </View>
        </ConfirmDialog>
        {/* <AwesomeAlert
            show={alertBarcode}
            showProgress={false}
            title="Are you really send to barcode?"
            titleStyle={{fontSize: 16, marginBottom: 0, marginHorizontal: -10}}
            message={qrvalue}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlertBarcode(false);
            }}
            onConfirmPressed={() => {
              sendBarcode();
            }}
        /> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  listContainer: {
    flex: 1,
  },
  item: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 1,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderColor: "rgba(0, 0, 0,1)",
    borderWidth: 1,
    borderRadius: 4
  },
  image: {
    width: 90,
    marginVertical: 0,
    marginRight: 5,
    resizeMode: 'stretch',
    height: "100%",
  },
  circleview_green: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#32CD32'
  },
  circleview_red: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#8B0000'
  },
  circleview_brown: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#D2691E'
  },
  circleview_white: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#FFFFFF'
  },
  circleview_yellow: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#808000'
  },
  btnGroup: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  payBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  buttonContainer: {
    
  },
  
  emptyData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cleanIcon: {
    padding: 10,
    marginVertical: 12,
    marginHorizontal: 15,
    height: 24,
    width: 28,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
  inputMobile: {
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

export default ShopBillingScreen;