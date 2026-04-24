import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../constants/ApiEndpoints';

export const loginUser = async (username, password) => {

    const response = await axiosClient.post(ENDPOINTS.LOGIN, {
        username,
        password
    });
    return response.data; // Trả về { accessToken: "..." }
};

export const logoutUser = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
};