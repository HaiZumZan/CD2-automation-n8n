import React, { useState, useEffect } from 'react';
import FlashcardMode from '../components/FlashcardMode';
import FeynmanMode from '../components/FeynmanMode';

// 1. NHẬN THÊM PROPS user VÀ setActiveTab TỪ COMPONENT CHA
const StudyAIScreen = ({ user, setActiveTab }) => {
    const [mode, setMode] = useState(null); // null | 'flashcard' | 'feynman'

    // 2. BẢO MẬT COMPONENT (Route Guard)
    useEffect(() => {
        // Nếu phát hiện người lọt vào trang này là ADMIN, lập tức đá về trang quản trị
        if (user?.role === 'ADMIN') {
            if (setActiveTab) setActiveTab('admin');
        }
    }, [user, setActiveTab]);

    // 3. Ngăn không cho render UI (tránh bị nháy màn hình hiển thị tính năng 1 giây rồi mới biến mất)
    if (user?.role === 'ADMIN') {
        return null;
    }

    if (mode === 'flashcard') return <FlashcardMode onBack={() => setMode(null)} />;
    if (mode === 'feynman') return <FeynmanMode onBack={() => setMode(null)} />;

    // Màn hình chọn chế độ
    const cardStyle = {
        backgroundColor: '#2d2d3a',
        border: '1px solid #444',
        borderRadius: '16px',
        padding: '32px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        flex: 1,
        maxWidth: '320px'
    };

    return (
        <div style={{ padding: '40px', color: '#fff' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>📖 Học bài với AI</h1>
            <p style={{ color: '#888', marginBottom: '40px' }}>
                Chọn phương pháp học phù hợp với bạn
            </p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Flashcard */}
                <div
                    style={cardStyle}
                    onClick={() => setMode('flashcard')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4dd0e1'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🃏</div>
                    <h2 style={{ color: '#4dd0e1', marginBottom: '12px', fontSize: '20px' }}>Flashcard thông minh</h2>
                    <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '14px' }}>
                        AI tự động trích xuất các khái niệm cốt lõi từ tài liệu và tạo thành bộ thẻ ghi nhớ.
                        Bấm để lật thẻ và kiểm tra hiểu biết của bạn.
                    </p>
                    <div style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: '#1a3a4a', borderRadius: '8px', display: 'inline-block' }}>
                        <span style={{ color: '#4dd0e1', fontSize: '13px' }}>✨ Tự động tạo từ tài liệu</span>
                    </div>
                </div>

                {/* Feynman */}
                <div
                    style={cardStyle}
                    onClick={() => setMode('feynman')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffb74d'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑‍🏫</div>
                    <h2 style={{ color: '#ffb74d', marginBottom: '12px', fontSize: '20px' }}>Phương pháp Feynman</h2>
                    <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '14px' }}>
                        Giải thích lại khái niệm cho AI nghe bằng ngôn ngữ của bạn.
                        AI sẽ đóng vai giáo sư, chấm điểm và chỉ ra chỗ sai.
                    </p>
                    <div style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: '#3a2a1a', borderRadius: '8px', display: 'inline-block' }}>
                        <span style={{ color: '#ffb74d', fontSize: '13px' }}>🎯 AI chấm điểm tự động</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyAIScreen;