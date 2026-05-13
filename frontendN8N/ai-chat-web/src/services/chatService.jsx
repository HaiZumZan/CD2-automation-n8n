import axiosClient from "../api/axiosClient";
import { ENDPOINTS } from "../constants/ApiEndpoints";

// Đã nâng cấp: Nhận thêm các biến để lọc tài liệu
export const askAI = async (
  message,
  isGlobal = true,
  faculty = "",
  major = "",
  subject = "",
  imageBase64 = null
) => {
  const res = await axiosClient.post(ENDPOINTS.CHAT_ASK, {
    message,
    isGlobal: String(isGlobal), // Ép thành chuỗi để Java dễ đọc từ Map<String, String>
    faculty,
    major,
    subject,
    imageBase64: imageBase64 || "", // Gửi ảnh base64 nếu có
  });

  // Trả về trực tiếp chuỗi câu trả lời để giao diện dễ dùng
  return res.data.answer;
};

export const getChatHistory = async () => {
  const res = await axiosClient.get(ENDPOINTS.CHAT_HISTORY);
  return res.data;
};
