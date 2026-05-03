import axios from 'axios';
export const API_BASE_URL = 'http://172.20.10.2:5000';

// Global interceptor to bypass localtunnel warning page
axios.interceptors.request.use((config) => {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    return config;
});
