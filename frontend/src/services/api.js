import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:4000', // Usamos 127.0.0.1 para evitar problemas de resolución IPv6 en Windows
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

export default api;
