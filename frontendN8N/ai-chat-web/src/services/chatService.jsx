import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../constants/ApiEndpoints';

export const askAI = async (message, isGlobal, faculty, major, subject, fileBase64) => {
    try {
        // Đóng gói dữ liệu thành JSON để gửi tới ChatController
        const payload = {
            message: message,
            isGlobal: isGlobal.toString(), // Chuyển boolean thành chuỗi để Java dễ đọc
            faculty: faculty || "",
            major: major || "",
            subject: subject || "",
            fileBase64: fileBase64 || ""
        };

        // GỌI ĐÚNG VÀO ENDPOINT: /api/chat/ask
        const response = await axiosClient.post(ENDPOINTS.CHAT_ASK, payload);
        
        // Trả về thẳng object { answer: "..." }
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi gọi AI Tutor:", error);
        throw error;
    }
};

// Hàm lấy lịch sử chat
export const getChatHistory = async () => {
    try {
        const response = await axiosClient.get(ENDPOINTS.CHAT_HISTORY);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử chat:", error);
        throw error;
    }
};
