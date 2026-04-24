import React from 'react';
import { MessageSquare, Database, LogOut, Library, Folder } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  console.log("Thông tin User hiện tại là:", user);
  return (
    <div className="sidebar">
      <h2 style={{ color: 'var(--accent-color)', marginBottom: '30px' }}>VKU KMS</h2>
      
      {/* 1. Nút Thư viện số (Mới thêm) */}
      <div className={`nav-item ${activeTab === 'library' ? 'active' : ''}`} 
           onClick={() => setActiveTab('library')}>
        <Library size={20} /> <span>Thư viện số</span>
      </div>

      {/* 2. Nút Tài liệu cá nhân (Thay thế cho nút Search cũ) */}
      <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} 
           onClick={() => setActiveTab('search')}>
        <Folder size={20} /> <span>Tài liệu cá nhân</span>
      </div>

      {/* 3. Nút AI Assistant (Chat chung) */}
      <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} 
           onClick={() => setActiveTab('chat')}>
        <MessageSquare size={20} /> <span>AI Assistant</span>
      </div>

      {/* 4. Nút dành riêng cho Admin */}
      {user?.role === 'ADMIN' && (
        <div className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} 
             onClick={() => setActiveTab('admin')}>
          <Database size={20} /> <span>Quản trị hệ thống</span>
        </div>
      )}

      {/* Nút Đăng xuất */}
      <div style={{ marginTop: 'auto' }} className="nav-item" onClick={onLogout}>
        <LogOut size={20} color="#ff6b6b" /> <span style={{ color: '#ff6b6b' }}>Đăng xuất</span>
      </div>
    </div>
  );
};

export default Sidebar;