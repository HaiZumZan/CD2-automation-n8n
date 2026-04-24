import React, { useState, useEffect } from 'react';
import { getComments, postComment } from '../services/fileService';
// Cập nhật lại dòng import ở trên cùng

const DocumentModal = ({ file, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState(null);

    // Cập nhật lại useEffect để tải cả comment lẫn PDF
    useEffect(() => {
        fetchComments();
        loadPdf();
    }, [file.id]);

    const loadPdf = async () => {
        try {
            const url = await getFilePreviewUrl(file.id);
            setPdfUrl(url);
        } catch (error) {
            console.error("Lỗi tải file xem trước:", error);
        }
    };

    // Lấy danh sách bình luận khi mở Modal
    useEffect(() => {
        fetchComments();
    }, [file.id]);

    const fetchComments = async () => {
        try {
            const data = await getComments(file.id);
            setComments(data);
        } catch (error) {
            console.error("Lỗi khi tải bình luận:", error);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý gửi bình luận
    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        try {
            await postComment(file.id, newComment);
            setNewComment(''); // Xóa trắng ô nhập
            fetchComments(); // Tải lại danh sách bình luận mới nhất
        } catch (error) {
            alert("Lỗi khi gửi bình luận!");
        }
    };

    // --- STYLE CHO DARK MODE ---
    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
    const modalStyle = { backgroundColor: '#1e1e26', width: '90%', height: '90%', borderRadius: '10px', display: 'flex', overflow: 'hidden', border: '1px solid #444' };
    const pdfSectionStyle = { flex: 2, backgroundColor: '#2d2d3a', borderRight: '1px solid #444', display: 'flex', flexDirection: 'column' };
    const chatSectionStyle = { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e26' };
    
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                
                {/* --- NỬA TRÁI: KHUNG XEM PDF --- */}
                <div style={pdfSectionStyle}>
                    <div style={{ padding: '15px', backgroundColor: '#2d2d3a', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>📄 {file.fileName}</h2>
                        <button onClick={onClose} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>✖ Đóng</button>
                    </div>
                    {/* KHUNG IFRAME ĐỂ HIỂN THỊ PDF */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
                        {/* Lưu ý: Thay đổi URL này thành API lấy file stream từ Java của Hoa nếu có */}
{/* KHUNG IFRAME ĐỂ HIỂN THỊ PDF */}
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
        {pdfUrl ? (
            <iframe 
                src={pdfUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                title="Trình xem PDF"
            />
        ) : (
            <p>⏳ Đang tải nội dung tài liệu...</p>
        )}
    </div>                    </div>
                </div>

                {/* --- NỬA PHẢI: KHUNG BÌNH LUẬN --- */}
                <div style={chatSectionStyle}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #444' }}>
                        <h3 style={{ color: '#4a90e2', margin: 0 }}>💬 Thảo luận</h3>
                    </div>
                    
                    {/* Danh sách bình luận */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {loading ? <p style={{ color: '#aaa' }}>Đang tải...</p> : 
                         comments.length === 0 ? <p style={{ color: '#888', textAlign: 'center' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p> :
                         comments.map(cmt => (
                            <div key={cmt.id} style={{ backgroundColor: '#2d2d3a', padding: '10px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong style={{ color: '#4dd0e1', fontSize: '14px' }}>👤 {cmt.username}</strong>
                                    <span style={{ color: '#888', fontSize: '12px' }}>{new Date(cmt.createdAt).toLocaleString()}</span>
                                </div>
                                <p style={{ color: '#ddd', margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{cmt.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Khung nhập bình luận mới */}
                    <div style={{ padding: '15px', borderTop: '1px solid #444', display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                            placeholder="Nhập ý kiến của bạn..."
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#2d2d3a', color: '#fff', outline: 'none' }}
                        />
                        <button 
                            onClick={handleSendComment}
                            style={{ backgroundColor: '#4a90e2', color: 'white', border: 'none', padding: '0 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Gửi
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DocumentModal;