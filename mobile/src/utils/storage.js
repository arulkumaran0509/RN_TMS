import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory fallback in case native AsyncStorage module is unavailable or throws
const memoryStorage = new Map();

export const safeStorage = {
    async getItem(key) {
        try {
            if (typeof AsyncStorage?.getItem === 'function') {
                const val = await AsyncStorage.getItem(key);
                if (val !== null && val !== undefined) return val;
            }
        } catch (e) {
            console.log(`[Storage] Fallback to memory for key ${key}:`, e?.message);
        }
        return memoryStorage.get(key) || null;
    },

    async setItem(key, value) {
        const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
        memoryStorage.set(key, stringVal);
        try {
            if (typeof AsyncStorage?.setItem === 'function') {
                await AsyncStorage.setItem(key, stringVal);
            }
        } catch (e) {
            console.log(`[Storage] Native setItem failed, stored in memory for ${key}:`, e?.message);
        }
    },

    async removeItem(key) {
        memoryStorage.delete(key);
        try {
            if (typeof AsyncStorage?.removeItem === 'function') {
                await AsyncStorage.removeItem(key);
            }
        } catch (e) {
            console.log(`[Storage] Native removeItem failed for ${key}:`, e?.message);
        }
    },

    async clear() {
        memoryStorage.clear();
        try {
            if (typeof AsyncStorage?.clear === 'function') {
                await AsyncStorage.clear();
            }
        } catch (e) {
            console.log('[Storage] Native clear failed:', e?.message);
        }
    }
};

export default safeStorage;
