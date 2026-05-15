import React from "react";
import {
  MessageSquare,
  Database,
  LogOut,
  Library,
  Folder,
  Bot,
  BookOpen,
  GraduationCap
} from "lucide-react";

// ĐÃ THÊM: Nhận biến isAdmin từ App.jsx truyền xuống
const Sidebar = ({ activeTab, setActiveTab, user, onLogout, isAdmin }) => {
  return (
    <div className="sidebar" style={{
      display: 'flex', flexDirection: 'column', height: '100%', 
      background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-dark) 100%)',
      borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px'
    }}>
      {/* BRANDING AREA */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', 
        marginBottom: '40px', padding: '10px 5px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4a90e2, #8ab4f8)',
          borderRadius: '12px', padding: '8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(74, 144, 226, 0.3)'
        }}>
          <GraduationCap size={24} color="#000" strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ 
            color: "#fff", margin: 0, fontSize: "20px", fontWeight: "700",
            letterSpacing: "0.5px"
          }}>
            VKU <span style={{ color: "var(--accent-color)" }}>KMS</span>
          </h2>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>Knowledge Management</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* 1. Nút Thư viện số */}
        <div
          className={`nav-item ${activeTab === "library" ? "active" : ""}`}
          onClick={() => setActiveTab("library")}
          style={{ transition: 'all 0.3s ease' }}
        >
          <Library size={20} /> <span style={{ fontWeight: "500" }}>Thư viện số</span>
        </div>

        {/* 2. Nút Tài liệu cá nhân */}
        {!isAdmin && (
          <div
            className={`nav-item ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
            style={{ transition: 'all 0.3s ease' }}
          >
            <Folder size={20} /> <span style={{ fontWeight: "500" }}>Tài liệu cá nhân</span>
          </div>
        )}

        {user?.role !== 'ADMIN' && (
            <div className={`nav-item ${activeTab === 'study' ? 'active' : ''}`}
                 onClick={() => setActiveTab('study')}
                 style={{ transition: 'all 0.3s ease' }}>
                <BookOpen size={20} /> <span style={{ fontWeight: "500" }}>Học bài với AI</span>
            </div>
        )}

        {/* 4. Nút dành riêng cho Admin (ĐÃ SỬA: Dùng biến isAdmin để quyết định) */}
        {isAdmin && (
          <div
            className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
            style={{ transition: 'all 0.3s ease', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}
          >
            <Database size={20} /> <span style={{ fontWeight: "500" }}>Quản trị hệ thống</span>
          </div>
        )}
      </div>

      {/* Nút Đăng xuất */}
      <div style={{ marginTop: "auto", borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
        <div
          className="nav-item logout-btn"
          onClick={onLogout}
          style={{ 
            color: "#ff6b6b", cursor: "pointer", transition: "all 0.3s ease",
            display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "12px"
          }}
        >
          <LogOut size={20} />{" "}
          <span style={{ fontWeight: "500" }}>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
