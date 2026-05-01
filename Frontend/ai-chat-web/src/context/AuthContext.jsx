import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('accessToken'));
    
    // THÊM MỚI: Khởi tạo state user từ localStorage (nếu có)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // CẬP NHẬT: Hàm login giờ nhận thêm tham số userData
    const login = (newToken, userData) => {
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Lưu thông tin user
        setToken(newToken);
        setUser(userData); // Cập nhật state
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user'); // Nhớ dọn rác khi đăng xuất
        setToken(null);
        setUser(null);
    };

    return (
        // QUAN TRỌNG: Phải "xuất khẩu" cái user ra thì App.jsx mới lấy được
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};