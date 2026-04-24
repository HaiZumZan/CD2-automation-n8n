import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../constants/ApiEndpoints';

export const askAI = async (message) => {
    // Trả về { answer: "..." } như Backend của bạn
    const res = await axiosClient.post(ENDPOINTS.CHAT_ASK, { message });
    return res.data; 
};

export const getChatHistory = async () => {
    const res = await axiosClient.get(ENDPOINTS.CHAT_HISTORY);
    return res.data;
};