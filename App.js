/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserTokenStorage} from './src/DeviceTokenStorage';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import RNBootSplash from 'react-native-bootsplash';

const App = () => {
  const webViewRef = useRef();

  const [dataLoad, setDataLoad] = useState(false);
  const [companyId, setCompanyId] = useState();
  const [employeeId, setEmployeeId] = useState();
  const [longitude, setLongitudeId] = useState('');
  const [latitude, setLatitudeId] = useState('');

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  if (Platform.OS === 'android') {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Permission',
        message: 'We would like to use your current location',
        buttonPositive: 'Okay',
      },
    );
  }

  useEffect(() => {
    RNBootSplash.hide({fade: true});
    requestUserPermission();
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        setLatitudeId(position.coords.latitude);
        setLongitudeId(position.coords.longitude);
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  useEffect(() => {
    run2();
  }, [employeeId]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const saveUserId = async userId => {
    const deviceId = await AsyncStorage.getItem('deviceId');

    try {
      if (userId) {
        UserTokenStorage(userId).then(response => {
          console.log(response);
          if (response === 'success') {
            setEmployeeId(userId);
            const data = {
              eid: userId,
              deviceid: deviceId,
            };

            let axiosConfig = {
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              mode: 'no-cors',
              withCredentials: true,
              credentials: 'same-origin',
            };

            axios
              .post(
                `https://salesnayak.in/API/UpdateDeviceId`,
                data,
                axiosConfig,
              )
              .then(response => {
                console.log('response from Update Device Id api', response);
              })
              .catch(error => console.log(error.response));
          }
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const run1 = () => {
    const data = {
      Lats: latitude,
      longs: longitude,
      cmpid: companyId,
      eid: employeeId,
    };
    axios
      .post(`https://salesnayak.in/API/UpdateLocation`, data)

      .then(response => {
        console.log('response from update location api', response);
      })
      .catch(error => console.log(error));
  };

  const run2 = () => {
    console.log('dynamic emp id', employeeId);
    if (employeeId) {
      axios
        .post(`https://salesnayak.in/API/GetLocationDuration`, {
          eid: employeeId,
        })

        .then(response => {
          console.log('response from Get Location Duration api', response);
          if (response.data.EnableTracking === true) {
            //
            setInterval(run1, response.data.Duration * 1000);
          }
        })
        .catch(error => console.log(error));
    }
  };

  const onMessageReceived = event => {
    let data = event.nativeEvent.data;
    console.log(event.nativeEvent.data);
    let dataArr = data.split(',');
    let cmpId = dataArr[0];
    let userId = dataArr[1];

    console.log('received from web',data)

    if (cmpId) {
      console.log('cmp id', cmpId);

      setCompanyId(cmpId);
    }
    if (userId) {
      console.log('usr id', userId);

      saveUserId(userId);
    }
  };

  return (
    <>
      <SafeAreaView flex={1}>
        <WebView
          ref={webViewRef}
          originWhitelist={['http://*', 'https://*', 'intent://*']}
          startInLoadingState={true}
          javaScriptEnabled={true}
          source={{uri: 'https://salesnayak.com/Home/Index?way=1'}}
          onMessage={onMessageReceived}
          onLoadProgress={({nativeEvent}) => {
            return <ActivityIndicator size="large" />;
          }}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
        />
      </SafeAreaView>
    </>
  );
};

export default App;
