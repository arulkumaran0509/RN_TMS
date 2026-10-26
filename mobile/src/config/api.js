import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import safeStorage from '../utils/storage';

// Dynamically detect PC's IP address from React Native bundle URL or Expo Constants
const getDetectedHost = () => {
    // 1. Check NativeModules SourceCode.scriptURL (guaranteed accurate in dev mode)
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
        const match = scriptURL.match(/^https?:\/\/([^:/]+)/i);
        if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
            return match[1];
        }
    }

    // 2. Candidates from Expo Constants
    const candidates = [
        Constants?.expoConfig?.hostUri,
        Constants?.expoGoConfig?.debuggerHost,
        Constants?.manifest2?.extra?.expoGo?.debuggerHost,
        Constants?.manifest?.debuggerHost,
        Constants?.linkingUri,
        Constants?.experienceUrl,
    ];

    for (const item of candidates) {
        if (item && typeof item === 'string') {
            const match = item.match(/^(?:[a-zA-Z0-9]+:\/\/)?([^:/]+)/i);
            if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
                return match[1];
            }
        }
    }

    return '10.32.115.242'; // Current Wi-Fi IP fallback
};

const detectedHost = getDetectedHost();

export const DEFAULT_SERVER_IP = detectedHost;

export let currentBaseUrl = Platform.select({
    web: 'http://localhost:5000',
    default: `http://${detectedHost}:5000`,
});

const API = axios.create({
    baseURL: currentBaseUrl,
    timeout: 10000,
});

// Load user-customized IP from storage, safely discarding obsolete IPs
safeStorage.getItem('custom_server_ip').then((savedIp) => {
    if (savedIp) {
        if (savedIp === '192.168.209.27') {
            console.log('[Mobile API] Discarding outdated saved IP 192.168.209.27');
            safeStorage.removeItem('custom_server_ip');
            return;
        }
        currentBaseUrl = `http://${savedIp}:5000`;
        API.defaults.baseURL = currentBaseUrl;
        console.log('[Mobile API] Loaded custom saved IP:', currentBaseUrl);
    }
}).catch(() => {});

export const updateServerIp = async (newIp) => {
    const cleanIp = newIp.trim().replace(/^https?:\/\//, '').replace(/:5000\/?$/, '');
    currentBaseUrl = `http://${cleanIp}:5000`;
    API.defaults.baseURL = currentBaseUrl;
    await safeStorage.setItem('custom_server_ip', cleanIp);
    console.log('[Mobile API] Updated to new URL:', currentBaseUrl);
    return currentBaseUrl;
};

// Interceptor to attach JWT token and ensure baseURL is synced
API.interceptors.request.use(
    async (config) => {
        if (!config.baseURL) {
            config.baseURL = currentBaseUrl;
        }
        try {
            const token = await safeStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error reading token from storage:', error);
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || currentBaseUrl}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const fullUrl = `${error.config?.baseURL || currentBaseUrl}${error.config?.url || ''}`;
        console.warn(`[API Error] ${error.config?.method?.toUpperCase()} ${fullUrl}:`, error.message);
        return Promise.reject(error);
    }
);

export const getImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return currentBaseUrl + cleanPath;
};

export const BACKEND_URL = currentBaseUrl;
export { axios };
export default API;
