import AsyncStorage from '@react-native-async-storage/async-storage';

// Secure storage utility (using AsyncStorage for now)
export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },

  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};

export default secureStorage;
