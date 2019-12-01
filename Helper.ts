import { AsyncStorage, StyleSheet } from "react-native";

const storeData = async (key: string, value: string, callback? : (success) => void) => {
    try {
        await AsyncStorage.setItem(key, value);
        callback(true);
    } catch (err) {
        callback(false);
    }
};


const retrieveData = async (key : string, callback: (value) => void) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            callback(value);
        }
    } catch (err) {
        callback(null);
    }
};
