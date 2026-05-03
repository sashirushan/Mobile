import axios from 'axios';
export const API_BASE_URL = 'https://ravishing-illumination-production.up.railway.app';

// Global interceptor to bypass localtunnel warning page
axios.interceptors.request.use((config) => {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    return config;
});
