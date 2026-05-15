import axiosClient from "../api/axiosClient";
import { ENDPOINTS } from "../constants/ApiEndpoints";

export const getAllUsers = async () => {
  try {
    const res = await axiosClient.get(ENDPOINTS.ADMIN_USERS);
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    return [];
  }
};

export const toggleUserLock = async (username) => {
  const res = await axiosClient.put(`${ENDPOINTS.ADMIN_TOGGLE_LOCK}/${username}`);
  return res.data;
};