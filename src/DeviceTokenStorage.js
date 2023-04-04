import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserTokenStorage = async (userId) => {
    try {
        await AsyncStorage.setItem('userId', userId);
        console.log(userId)
        return 'success';
    } catch (e) {
        return 'failure';
    }
};
export const DeviceTokenStorage = async (deviceId) => {
    try {
        await AsyncStorage.setItem('deviceId', deviceId);
        console.log(deviceId)
        return 'success';
    } catch (e) {
        return 'failure';
    }
};
