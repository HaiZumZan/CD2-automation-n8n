import axios from 'axios';
import { BASE_URL } from '../constants/ApiEndpoints';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Gắn Token vào Header cho mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// src/api/axiosClient.jsx
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu lỗi 403 (Token hết hạn/Forbidden), chúng ta chỉ xóa Token 
        // chứ tuyệt đối KHÔNG reload trang nữa.
        if (error.response?.status === 403 || error.response?.status === 401) {
            console.warn("Phát hiện lỗi xác thực (403/401). Token đã bị xóa.");
            localStorage.removeItem('accessToken');
        }
        
        // Trả lỗi về để catch() trong component nhận được
        return Promise.reject(error);
    }
);

export default axiosClient;