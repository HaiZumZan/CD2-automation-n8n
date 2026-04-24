import axios from 'axios';

const API_URL = '/api/files'; 
export const BASE_URL = ''; 
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// 1. Tải tài liệu lên (Đã cập nhật thêm faculty, major, subject)
export const uploadFile = async (file, isGlobal = false, faculty, major, subject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isGlobal', isGlobal);
    formData.append('task', 'upload'); 
    
    // THÊM 3 DÒNG NÀY ĐỂ GỬI DỮ LIỆU SANG JAVA:
    if (faculty) formData.append('faculty', faculty);
    if (major) formData.append('major', major);
    if (subject) formData.append('subject', subject);

    const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};
// 2. Lấy danh sách file
export const getFiles = async () => {
    const res = await axios.get(`${API_URL}/list`, getAuthHeader());
    return res.data;
};
export const downloadFile = async (id, fileName) => {
    const res = await axios.get(`${API_URL}/download/${id}`, {
        ...getAuthHeader(),
        responseType: 'blob', // Quan trọng: Phải là blob
    });

    // Tạo một đường link ảo để kích hoạt việc tải xuống của trình duyệt
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
// src/services/fileService.jsx

// 3. Xóa tài liệu (Sửa lại cho khớp với @DeleteMapping("/{id}") bên Java)
export const deleteFile = async (id) => {
    const token = localStorage.getItem('accessToken');
    
    // PHẢI dùng axios.delete và đúng URL /api/files/{id}
    const res = await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};
// ... (giữ nguyên các đoạn code import và hàm upload cũ)

// 1. Lấy tài liệu Thư viện chung (Lọc theo Khoa, Ngành, Môn)
export const getLibraryFiles = async (faculty, major, subject) => {
    // Lưu ý sử dụng encodeURIComponent để tránh lỗi font tiếng Việt trên URL
    const url = `${API_URL}/library?faculty=${encodeURIComponent(faculty)}&major=${encodeURIComponent(major)}&subject=${encodeURIComponent(subject)}`;
    const res = await axios.get(url, getAuthHeader());
    return res.data;
};

// 2. Lấy tài liệu Không gian cá nhân
export const getPersonalFiles = async () => {
    const res = await axios.get(`${API_URL}/personal`, getAuthHeader());
    return res.data;
};
// ... (Giữ nguyên các hàm cũ ở trên)

// --- API CHO BÌNH LUẬN ---

// Lấy bình luận của 1 file
export const getComments = async (fileId) => {
    const res = await axios.get(`${API_URL.replace('/files', '/comments')}/${fileId}`, getAuthHeader());
    return res.data;
};

// Đăng bình luận mới
export const postComment = async (fileId, content) => {
    const res = await axios.post(`${API_URL.replace('/files', '/comments')}/`, 
        { fileId, content }, 
        getAuthHeader()
    );
    return res.data;
};
// Lấy link xem trước file PDF
export const getFilePreviewUrl = async (id) => {
    const res = await axios.get(`${API_URL}/preview/${id}`, {
        ...getAuthHeader(),
        responseType: 'blob', // Bắt buộc để đọc file nhị phân
    });
    
    // Ép kiểu thành PDF để trình duyệt nhận diện được
    const blob = new Blob([res.data], { type: 'application/pdf' });
    return window.URL.createObjectURL(blob);
};