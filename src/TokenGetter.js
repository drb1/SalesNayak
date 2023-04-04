import AsyncStorage from '@react-native-async-storage/async-storage';

export const TokenGetter = async () => {

    try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId !== null) {
           
            return userId;
        } 
    } catch (e) {
       
        return e;
    }
};