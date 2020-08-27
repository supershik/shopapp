import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import Autocomplete from 'react-native-autocomplete-input';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';
import DropDownPicker from 'react-native-dropdown-picker';
import NumericInput from 'react-native-numeric-input'
import InputSpinner from "react-native-input-spinner";
// import {Switch} from "react-native-switch"


import {
    Input,
    Button
} from 'react-native-elements';
import { AuthContext } from '../../utils/authContext';
import { TextInput, HelperText } from 'react-native-paper';

const ShopServicesScreen = ({ navigation }) => {
    const { signIn } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [incorporationyear, setYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [bulkorder, setBulkOrder] = useState(1);
    const [managedinventory, setManagedInventory] = useState(1);
    const [wholesaler, setWholesaler] = useState(1);
    const [discount, setDiscount] = useState(0);
    const [exchange, setExchange] = useState(1);
    const [isonline, setIsOnline] = useState(1);
    const [delivery, setDelivery] = useState(1);
    const [minordervalue, setMinOrderValue] = useState('0');

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
                setYearsList();
                let userToken = null;
                try {
                    userToken = await AsyncStorage.getItem('userToken')
                } catch (e) {
                    console.log(e);
                }
                if (userToken != null) {
                    const onSuccess = ({ data }) => {
                        setLoading(false);
                        console.log(data)
                        setYear(data.incorporationyear);
                        setBulkOrder(data.bulkorder);
                        setWholesaler(data.wholesaler);
                        setManagedInventory(data.managedinventory);
                        setDiscount(data.discount);
                        setExchange(data.exchange);
                        setDelivery(data.delivery);
                        setIsOnline(data.isonline);
                        setMinOrderValue(data.minordervalue.toString());
                    }
                    const onFailure = error => {
                        setLoading(false);
                        if(error.toString().includes('409')) {
                            console.log(error);
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
                    setShopClientToken(userToken)
                    SHOPAPIKit.get('/shop/details/services')
                        .then(onSuccess)
                        .catch(onFailure);
                }
                else {

                }
            };
            bootstrapAsync();
        });
        return unsubscribe;
    }, []);
    const handleUpdate = () => {

        let userToken = null;
        try {
            userToken = AsyncStorage.getItem('userToken')
        } catch (e) {
            console.log(e);
        }
        
        if (userToken != null) {
            const payload = { incorporationyear, bulkorder, exchange, delivery, wholesaler, managedinventory, isonline, discount, minordervalue };
            const onSuccess = ({ data }) => {
                setLoading(false);
                Toast.show('Successfully updated.');
            }
            const onFailure = error => {
                setLoading(false);
                if(error.toString().includes('409')) {
                    Toast.show('Failed to update');
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
            setShopClientToken(userToken)
            SHOPAPIKit.patch('/shop/details/services/update', payload)
                .then(onSuccess)
                .catch(onFailure)
        }
        
    };
    // const onGSTChanged = () => {
    //     if (gst.length == 15) {
    //         setErrorData({
    //             ...errorData,
    //             isValidGST: true
    //         });
    //         const onSuccessGST = ({ data }) => {
    //             setErrorData({
    //                 ...errorData,
    //                 isValidGST: false,
    //                 gst: data.message,
    //             });
                
    //             setLoading(false);
    //             return true;
    //         }
    //         const onFailureGST = error => {
    //             console.log(error)
    //             setErrorData({
    //                 ...errorData,
    //                 isValidGST: true,
    //             });
    //             setLoading(false);
    //             return false;
    //         }
    //         setLoading(true);
    //         SHOPAPIKit.get('/validation/gst/' + gst)
    //             .then(onSuccessGST)   // 200: gst already exist.
    //             .catch(onFailureGST); // 409: OK, gst is not exist.
    //     }
    //     else {
    //         setErrorData({
    //             ...errorData,
    //             isValidGST: false,
    //             gst: 'Enter the GST that character length is 15.',
    //         });
    //         return false;
    //     }
    // }

    const setYearsList = () => {
        var data = [];
        var currentYear = new Date().getFullYear(); //To get the Current Year
        for (let year = currentYear; year > 1700; year-- )
        {
            data.push({label: year, value: year});

        }
        setYears(data);
   }
    const onChangedDiscount = (text) => {
        var value = parseFloat(text);
        if(value.toString() == 'NaN' || value < 0)
            value = 0
        else if( value > 99.99 )
            value = 99.99;
       
        setDiscount(value);
        console.log(value);
        console.log(discount);
    }
   
    const setIsOnline1 = (val) => {
        setIsOnline(val == true ? 1: 0);
    }   
    const setManagedInventory1 = (val) => {
        setManagedInventory(val == true ? 1: 0);
    }
    const setBulkOrder1 = (val) => {
        setBulkOrder(val == true ? 1: 0);
    }   
    const setWholesaler1 = (val) => {
        setWholesaler(val == true ? 1: 0);
    }
    const setExchange1 = (val) => {
        setExchange(val == true ? 1: 0);
    }   
    const setDelivery1 = (val) => {
        setDelivery(val == true ? 1: 0);
    }
   
    const confirmLayout = () => {
      return(
        <>
        <ScrollView style={styles.scrollView}>
                <View style={styles.viewInputGroup}>
                    <View>
                    <Text style={styles.textView}>
                            Incorporation year
                        </Text>
                        {years.length < 1 ? (
                            <DropDownPicker
                                items={[
                                    {label: new Date().getFullYear(), value: new Date().getFullYear()},
                                    {label: new Date().getFullYear()-1, value: new Date().getFullYear()-1},
                                ]}
                                containerStyle={{height: 40}}
                                style={{backgroundColor: '#fafafa'}}
                                dropDownStyle={{backgroundColor: '#fafafa'}}
                                onChangeItem={item => setYear(item.value)}
                            />
                        ) : (
                            <DropDownPicker
                                items={years}
                                defaultValue={incorporationyear}
                                value={incorporationyear}
                                containerStyle={{height: 40}}
                                style={{backgroundColor: '#fafafa'}}
                                dropDownStyle={{backgroundColor: '#fafafa'}}
                                onChangeItem={item => setYear(item.value)}
                            />
                            )
                        }
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                            Bulk Order
                        </Text>
                        <Switch
                            value={bulkorder == 1 ? true: false}
                            onValueChange={(val) => setBulkOrder1(val)}
                        />
                        {/* <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={bulkorder}
                            value={bulkorder}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setBulkOrder(item.value)}
                        /> */}
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                            Wholesaler
                        </Text>
                        <Switch
                            value={wholesaler == 1 ? true: false}
                            onValueChange={(val) => setWholesaler1(val)}
                        />
                        {/* <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={wholesaler}
                            value={wholesaler}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setWholesaler(item.value)}
                        /> */}
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                            Product Exchange
                        </Text>
                        <Switch
                            value={exchange == 1 ? true: false}
                            onValueChange={(val) => setExchange1(val)}
                        />
                        {/* <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={exchange}
                            value={exchange}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setExchange(item.value)}
                        /> */}
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                           Home Delivery
                        </Text>
                        <Switch
                            value={delivery == 1 ? true: false}
                            onValueChange={(val) => setDelivery1(val)}
                        />
                        {/* <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={delivery}
                            value={delivery}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setDelivery(item.value)}
                        /> */}
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                            Manage Inventory
                        </Text>
                        <Switch
                            value={managedinventory == 1 ? true: false}
                            onValueChange={(val) => setManagedInventory1(val)}
                        />
                        {/* <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={managedinventory}
                            value={managedinventory}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setManagedInventory(item.value)}
                        /> */}
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                            Accept Order
                        </Text>
                        <Switch
                            value={isonline == 1 ? true: false}
                            onValueChange={(val) => setIsOnline1(val)}
                        />
                        {/* <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={isonline}
                            value={isonline}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setIsOnline(item.value)}
                        /> */}
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={styles.textView}>
                            Min Order Value
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="phone-pad"
                            maxLength={8}
                            value={minordervalue}
                            onChangeText={setMinOrderValue}
                        />
                    </View>
                    <View style={styles.rowGroup}>
                        <Text style={[styles.box, styles.textView]}>
                            Discount on shop
                        </Text>
                        <View style={[styles.box, styles.spin]}>
                            <InputSpinner
                                type={"float"}
                                max={'99.99'}
                                min={'0.0'}
                                step={'0.5'}
                                height={35}
                                rounded = {false}
                                showBorder={true}
                                inputStyle={{fontSize: 12, textAlignVertical: "center", alignSelf: "center"}}
                                // colorMax={"rgba(250,250,250,1)"}
                                // colorMin={"rgba(250,250,250,1)"}
                                buttonTextColor={"rgba(255,255,255,1)"}
                                buttonPressTextColor={"rgba(100,100,100,1)"}
                                color={"rgba(112,180,235,1)"}
                                value={discount}
                                onChange={(num)=>setDiscount(num)}
                            />
                        </View>
                    </View>
            </View>
        </ScrollView>
        <View style={styles.updateButton}>
            <Button
                backgroundColor="#03A9F4"
                title="Update shop details"
                onPress={() => handleUpdate()}
            />
        </View>
    </>
    )}
    
    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            {confirmLayout()}
        </View>
        
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    spinnerStyle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        marginTop: 30,
    },
    
    updateButton: {
        position: "relative",
        flex: 1,
        bottom: 0,
        justifyContent: 'center',
        marginLeft: 25,
        marginRight: 25,
        marginTop: 10,
        marginBottom: 10,
    },
    viewInputGroup: {
        borderRadius: 25,
        marginBottom: 30,
        justifyContent: "center",
        paddingLeft: 30,
        paddingRight: 30,
    },

    textView: {
        fontSize: 14,
        marginTop: 10,
        color: "rgba(64,64,64,1)",
    },
    textInput: {
        color: "black",
        backgroundColor: "white",
        height: 25,
        textAlignVertical: "center",
        textAlign: "center",
    },
    box: {
        flex: 1,
        borderColor: 'rgba(20,123,136,1)',
    },
    spin: {
        alignItems: "flex-end",
    },
    rowGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 6,
        // borderBottomColor: "lightgray",
        // borderBottomWidth: 1,
    }
})
export default ShopServicesScreen;