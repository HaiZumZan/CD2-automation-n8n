import React, { useState, useEffect } from 'react';
import { generateFlashcards } from '../services/studyService';
import { getFiles } from '../services/fileService';
import { ArrowLeft, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';

const FlashcardMode = ({ onBack }) => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [error, setError] = useState(null);

    // Tải danh sách file cá nhân của user
    useEffect(() => {
        getFiles() // <-- Đổi tên hàm ở đây
            .then(data => {
                console.log("Danh sách file khả dụng cho AI:", data);
                setFiles(Array.isArray(data) ? data : []);
            })
            .catch(() => setFiles([]))
            .finally(() => setLoadingFiles(false));
    }, []);

    const handleGenerate = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
        const result = await generateFlashcards(selectedFile);
        console.log("Dữ liệu trả về:", result);

        // studyService đã xử lý hết, result phải là array rồi
        if (Array.isArray(result) && result.length > 0 && result[0].question) {
            setCards(result);
        } else {
            console.error("Cấu trúc không hợp lệ:", result);
            setError('AI không trả về dữ liệu hợp lệ. Thử lại!');
        }
    } catch (err) {
        console.error(err);
        setError('Lỗi kết nối. Kiểm tra n8n và backend đang chạy chưa.');
    } finally {
        setLoading(false);
    }
};

    const goNext = () => {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
    };

    const goPrev = () => {
        setCurrentIndex(i => i - 1);
        setIsFlipped(false);
    };

    // --- STYLES ---
    const containerStyle = { padding: '30px', color: '#fff', maxWidth: '700px', margin: '0 auto' };
    const headerStyle = { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' };
    const backBtnStyle = { background: 'none', border: '1px solid #555', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
    const selectStyle = { flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#1e1e26', color: '#fff', border: '1px solid #555', outline: 'none', fontSize: '14px' };
    const generateBtnStyle = { backgroundColor: loading ? '#555' : '#4a90e2', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px' };
    const cardStyle = {
        backgroundColor: '#2d2d3a',
        border: '1px solid #444',
        borderRadius: '16px',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'background-color 0.3s',
        marginTop: '24px',
        userSelect: 'none'
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <button style={backBtnStyle} onClick={onBack}>
                    <ArrowLeft size={16} /> Quay lại
                </button>
                <h2 style={{ margin: 0, color: '#4dd0e1' }}>🃏 Tạo Flashcard</h2>
            </div>

            {/* Chọn file + nút tạo */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {loadingFiles ? (
                    <p style={{ color: '#888' }}>Đang tải danh sách tài liệu...</p>
                ) : (
                    <select
                        style={selectStyle}
                        value={selectedFile}
                        onChange={e => setSelectedFile(e.target.value)}
                    >
                        <option value="">-- Chọn tài liệu để tạo flashcard --</option>
                        {files.map(f => (
                            <option key={f.id} value={f.fileName}>{f.fileName}</option>
                        ))}
                    </select>
                )}
                <button
                    style={generateBtnStyle}
                    onClick={handleGenerate}
                    disabled={loading || !selectedFile}
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : '✨ Tạo thẻ'}
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', marginTop: '60px', color: '#888' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px' }}>AI đang đọc tài liệu và tạo flashcard...</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Có thể mất 20-60 giây</p>
                </div>
            )}

            {/* Lỗi */}
            {error && (
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#3d1a1a', borderRadius: '8px', border: '1px solid #ff6b6b' }}>
                    <p style={{ color: '#ff6b6b', margin: 0 }}>⚠️ {error}</p>
                </div>
            )}

            {/* Flashcard */}
            {cards.length > 0 && !loading && (
                <>
                    {/* Tiến trình */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                        <span style={{ color: '#888', fontSize: '14px' }}>
                            Thẻ {currentIndex + 1} / {cards.length}
                        </span>
                        <span style={{ color: '#888', fontSize: '12px' }}>
                            👆 Bấm vào thẻ để lật
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px', marginTop: '8px' }}>
                        <div style={{
                            height: '100%',
                            width: `${((currentIndex + 1) / cards.length) * 100}%`,
                            backgroundColor: '#4a90e2',
                            borderRadius: '2px',
                            transition: 'width 0.3s'
                        }} />
                    </div>

                    {/* Thẻ */}
                    <div
                        style={{
                            ...cardStyle,
                            backgroundColor: isFlipped ? '#1a3a4a' : '#2d2d3a',
                            border: isFlipped ? '1px solid #4dd0e1' : '1px solid #444'
                        }}
                        onClick={() => setIsFlipped(f => !f)}
                    >
                        {isFlipped ? (
    <>
        <p style={{ fontSize: '12px', color: '#4dd0e1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Định nghĩa</p>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#e0e0e0' }}>
            {cards[currentIndex].answer} {/* ĐÃ SỬA THÀNH answer */}
        </p>
    </>
) : (
    <>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Khái niệm</p>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
            {cards[currentIndex].question} {/* ĐÃ SỬA THÀNH question */}
        </h3>
    </>
)}
                    </div>

                    {/* Nút điều hướng */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                        <button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            style={{ ...backBtnStyle, opacity: currentIndex === 0 ? 0.4 : 1 }}
                        >
                            <ArrowLeft size={16} /> Trước
                        </button>
                        <button
                            onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
                            style={backBtnStyle}
                        >
                            <RotateCcw size={16} /> Làm lại từ đầu
                        </button>
                        <button
                            onClick={goNext}
                            disabled={currentIndex === cards.length - 1}
                            style={{ ...backBtnStyle, opacity: currentIndex === cards.length - 1 ? 0.4 : 1 }}
                        >
                            Tiếp <ArrowRight size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FlashcardMode;