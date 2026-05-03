import axios from 'axios';
export const API_BASE_URL = 'https://80db7ca704b85fe8-112-135-73-207.serveousercontent.com';

// Global interceptor to bypass localtunnel warning page
axios.interceptors.request.use((config) => {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    return config;
});
