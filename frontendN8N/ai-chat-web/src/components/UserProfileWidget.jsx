import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, CheckCircle, XCircle } from 'lucide-react';
import { getCurrentUser } from '../services/authService';

const UserProfileWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (isOpen && !userInfo) {
      getCurrentUser()
        .then(data => setUserInfo(data))
        .catch(err => console.error("Lỗi lấy thông tin user", err));
    }
  }, [isOpen]);

  // Click ra ngoài để đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div ref={widgetRef} style={{ position: 'fixed', top: '20px', right: '30px', zIndex: 9999 }}>
      {/* Nút nhấn */}
      <button 
        onClick={toggleOpen}
        style={{
          width: '45px', height: '45px', borderRadius: '50%',
          backgroundColor: '#2d2d3a', border: '2px solid #4dd0e1',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease-in-out',
          transform: isOpen ? 'scale(1.05)' : 'scale(1)'
        }}
        title="Thông tin người dùng"
      >
        <User size={22} color="#4dd0e1" />
      </button>

      {/* Popup thông tin */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '60px', right: '0',
          width: '260px', backgroundColor: '#252530',
          borderRadius: '12px', border: '1px solid #444',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          padding: '20px', color: '#fff',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #444', paddingBottom: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#4dd0e1" /> Hồ sơ cá nhân
          </h3>
          
          {!userInfo ? (
            <div style={{ textAlign: 'center', color: '#888', fontSize: '13px', padding: '10px 0' }}>Đang tải...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Tên đăng nhập:</span>
                <strong style={{ color: '#fff', fontSize: '15px' }}>{userInfo.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Vai trò:</span>
                <span style={{ 
                  backgroundColor: userInfo.role?.includes('ADMIN') ? '#ffb86c30' : '#4a90e230',
                  color: userInfo.role?.includes('ADMIN') ? '#ffb86c' : '#4dd0e1',
                  padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  {userInfo.role?.includes('ADMIN') ? <Shield size={14} /> : null}
                  {userInfo.role || 'USER'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#aaa' }}>Trạng thái:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: userInfo.enabled !== false ? '#50fa7b' : '#ff6b6b' }}>
                  {userInfo.enabled !== false ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {userInfo.enabled !== false ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileWidget;
