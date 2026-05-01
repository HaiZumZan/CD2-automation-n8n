import axiosClient from "../api/axiosClient"; // Dùng axiosClient xịn xò của bạn

export const getAllUsers = async () => {
  try {
    const res = await axiosClient.get("/api/admin/users");
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    return []; // Trả về mảng rỗng nếu chưa có API backend để UI không bị sập
  }
};

export const toggleUserLock = async (username) => {
  const res = await axiosClient.put(`/api/admin/users/toggle-lock/${username}`);
  return res.data;
};