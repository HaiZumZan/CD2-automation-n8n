import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../constants/ApiEndpoints';

// Gọi API tạo Flashcard
export const generateFlashcards = async (fileName) => {
    const res = await axiosClient.post(ENDPOINTS.STUDY_FLASHCARD, {
        file_name: fileName
    });
    // Spring Boot trả về string JSON từ n8n, cần parse
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
// n8n trả về { flashcards: [...] }
    if (data && Array.isArray(data.flashcards)) return data.flashcards;
    if (Array.isArray(data)) return data;

    return [];
};

// Gọi API Feynman
export const sendFeynmanMessage = async (fileName, studentMessage) => {
    const res = await axiosClient.post(ENDPOINTS.STUDY_FEYNMAN, {
        file_name: fileName,
        student_message: studentMessage
    });
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    return data;
};