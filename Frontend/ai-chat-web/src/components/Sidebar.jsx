import React from "react";
import {
  MessageSquare,
  Database,
  LogOut,
  Library,
  Folder,
  Bot,
  BookOpen
} from "lucide-react";

// ĐÃ THÊM: Nhận biến isAdmin từ App.jsx truyền xuống
const Sidebar = ({ activeTab, setActiveTab, user, onLogout, isAdmin }) => {
  return (
    <div className="sidebar">
      <h2 style={{ color: "var(--accent-color)", marginBottom: "30px" }}>
        VKU KMS
      </h2>

      {/* 1. Nút Thư viện số */}
      <div
        className={`nav-item ${activeTab === "library" ? "active" : ""}`}
        onClick={() => setActiveTab("library")}
      >
        <Library size={20} /> <span>Thư viện số</span>
      </div>

      {/* 2. Nút Tài liệu cá nhân */}
      <div
        className={`nav-item ${activeTab === "search" ? "active" : ""}`}
        onClick={() => setActiveTab("search")}
      >
        <Folder size={20} /> <span>Tài liệu cá nhân</span>
      </div>

      

      {/* 4. Nút dành riêng cho Admin (ĐÃ SỬA: Dùng biến isAdmin để quyết định) */}
      {isAdmin && (
        <div
          className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => setActiveTab("admin")}
        >
          <Database size={20} /> <span>Quản trị hệ thống</span>
        </div>
      )}

      {user?.role !== 'ADMIN' && (
          <div className={`nav-item ${activeTab === 'study' ? 'active' : ''}`}
               onClick={() => setActiveTab('study')}>
              <BookOpen size={20} /> <span>Học bài với AI</span>
          </div>
      )}


      {/* Nút Đăng xuất */}
      <div
        style={{ marginTop: "auto" }}
        className="nav-item"
        onClick={onLogout}
      >
        <LogOut size={20} color="#ff6b6b" />{" "}
        <span style={{ color: "#ff6b6b" }}>Đăng xuất</span>
      </div>
    </div>
  );
};

export default Sidebar;
