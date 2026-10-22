import AsyncStorage from '@react-native-async-storage/async-storage';

// Bytte ut min tidigare mock-database till att använda async/storage. Enkelt att byta ut till backend senare.
const STORAGE_KEY = 'rateflix:library:v1';

export const libraryStorage = {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Kunde inte läsa biblioteket', e);
      return {};
    }
  },

  async save(library) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch (e) {
      console.warn('Kunde inte spara biblioteket', e);
    }
  },
};
