import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../constants/ApiEndpoints';

export const loginUser = async (username, password) => {

    const response = await axiosClient.post(ENDPOINTS.LOGIN, {
        username,
        password
    });
    return response.data; // Trả về { accessToken: "..." }
};

export const registerUser = async (username, password, role) => {
    const response = await axiosClient.post(ENDPOINTS.REGISTER, {
        username,
        password,
        role
    });
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
};

export const getCurrentUser = async () => {
    const response = await axiosClient.get(ENDPOINTS.AUTH_ME);
    return response.data;
};