/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { DeviceTokenStorage } from './src/DeviceTokenStorage';

 // Register background handler
 messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});


const saveToken = async (token) => {
  try {

    if (token) {
      DeviceTokenStorage(token).then(response => {
      });
    }

  } catch (error) {
  }
};

function HeadlessCheck({ isHeadless }) {
  useEffect(() => {
    // Get the device token
    messaging()
      .getToken()
      .then(token => {
        return saveToken(token);
      });

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

    // Listen to whether the token changes
    return messaging().onTokenRefresh(token => {
      saveToken(token);
    });
  }, []);

 
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}
AppRegistry.registerComponent(appName, () => HeadlessCheck);
