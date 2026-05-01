import React, { useState, useEffect } from 'react';
import { generateFlashcards, getLearnedFiles } from '../services/studyService';
import { getStudyFiles } from '../services/fileService';
import { ArrowLeft, ArrowRight, RotateCcw, Loader2, BookOpen, BrainCircuit, CheckCircle2, Circle } from 'lucide-react';

const FlashcardMode = ({ onBack }) => {
    const [files, setFiles] = useState([]);
    const [learnedFileNames, setLearnedFileNames] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [error, setError] = useState(null);

    // Tải danh sách file và trạng thái đã học
    const fetchData = async () => {
        setLoadingFiles(true);
        try {
            const [allFiles, learnedNames] = await Promise.all([
                getStudyFiles(),
                getLearnedFiles()
            ]);
            setFiles(Array.isArray(allFiles) ? allFiles : []);
            setLearnedFileNames(learnedNames);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setFiles([]);
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStartStudy = async (fileName) => {
        setSelectedFile(fileName);
        setLoading(true);
        setError(null);
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);

        try {
            const result = await generateFlashcards(fileName);
            if (Array.isArray(result) && result.length > 0) {
                setCards(result);
                // Nếu file chưa có trong danh sách đã học thì cập nhật lại list
                if (!learnedFileNames.includes(fileName)) {
                    setLearnedFileNames(prev => [...prev, fileName]);
                }
            } else {
                setError('AI không trả về dữ liệu hợp lệ. Thử lại!');
            }
        } catch (err) {
            setError('Lỗi kết nối. Kiểm tra Backend và n8n.');
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
    const containerStyle = { padding: '30px', color: '#fff', maxWidth: '900px', margin: '0 auto' };
    const tableStyle = { 
        width: '100%', 
        borderCollapse: 'separate', 
        borderSpacing: '0 8px',
        marginTop: '20px'
    };
    const thStyle = { padding: '12px', textAlign: 'left', color: '#888', fontSize: '14px', fontWeight: '500', borderBottom: '1px solid #333' };
    const trStyle = { backgroundColor: '#1e1e26', transition: 'transform 0.2s, background-color 0.2s' };
    const tdStyle = { padding: '16px', borderTop: '1px solid #333', borderBottom: '1px solid #333' };
    const actionBtnStyle = (isLearned) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '600',
        fontSize: '13px',
        backgroundColor: isLearned ? '#2e7d32' : '#4a90e2',
        color: '#fff',
        transition: 'filter 0.2s'
    });

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} 
                        onClick={onBack}
                    >
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                    <h2 style={{ margin: 0, color: '#4dd0e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BrainCircuit size={28} /> Học tập thông minh
                    </h2>
                </div>
            </div>

            {!cards.length && !loading ? (
                <div className="fade-in">
                    <div style={{ backgroundColor: '#2d2d3a', padding: '24px', borderRadius: '16px', border: '1px solid #444' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#e0e0e0' }}>Danh sách tài liệu học tập</h3>
                        {loadingFiles ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Loader2 className="animate-spin" size={32} color="#4a90e2" />
                                <p style={{ color: '#888', marginTop: '10px' }}>Đang đồng bộ dữ liệu...</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr>
                                            <th style={{...thStyle, position: 'sticky', top: 0, backgroundColor: '#2d2d3a', zIndex: 1}}>Tên tài liệu</th>
                                            <th style={{...thStyle, position: 'sticky', top: 0, backgroundColor: '#2d2d3a', zIndex: 1}}>Trạng thái</th>
                                            <th style={{...thStyle, textAlign: 'right', position: 'sticky', top: 0, backgroundColor: '#2d2d3a', zIndex: 1}}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map(file => {
                                            const isLearned = learnedFileNames.includes(file.fileName);
                                            return (
                                                <tr key={file.id} style={trStyle} className="hover-row">
                                                    <td style={{...tdStyle, borderLeft: '1px solid #333', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>
                                                        <div style={{ fontWeight: '500' }}>{file.fileName}</div>
                                                        <div style={{ fontSize: '11px', color: '#666' }}>{file.faculty} - {file.subject}</div>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {isLearned ? (
                                                            <span style={{ color: '#81c784', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                                                                <CheckCircle2 size={14} /> Đã sẵn sàng
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                                                                <Circle size={14} /> Chưa học
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{...tdStyle, textAlign: 'right', borderRight: '1px solid #333', borderTopRightRadius: '12px', borderBottomRightRadius: '12px'}}>
                                                        <button 
                                                            style={actionBtnStyle(isLearned)}
                                                            onClick={() => handleStartStudy(file.fileName)}
                                                        >
                                                            {isLearned ? <BookOpen size={16} /> : <BrainCircuit size={16} />}
                                                            {isLearned ? 'Học ngay' : 'Tạo Flashcard'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Loading AI */}
            {loading && (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <div className="pulse-animation" style={{ marginBottom: '24px' }}>
                        <BrainCircuit size={64} color="#4a90e2" />
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px' }}>Đang trích xuất kiến thức...</h3>
                    <p style={{ color: '#888' }}>Hệ thống đang phân tích tài liệu và tạo bộ nhớ flashcard cho bạn.</p>
                </div>
            )}

            {/* Lỗi */}
            {error && (
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#3d1a1a', borderRadius: '12px', border: '1px solid #ff6b6b' }}>
                    <p style={{ color: '#ff6b6b', margin: 0 }}>⚠️ {error}</p>
                </div>
            )}

            {/* Flashcard 3D Mode */}
            {cards.length > 0 && !loading && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#888', fontSize: '14px' }}>
                            Đang học: <b style={{color: '#4dd0e1'}}>{selectedFile}</b>
                        </span>
                        <span style={{ color: '#888', fontSize: '14px' }}>
                            Thẻ {currentIndex + 1} / {cards.length}
                        </span>
                    </div>

                    <div style={{ height: '6px', backgroundColor: '#333', borderRadius: '3px', marginBottom: '30px' }}>
                        <div style={{
                            height: '100%',
                            width: `${((currentIndex + 1) / cards.length) * 100}%`,
                            backgroundColor: '#4a90e2',
                            borderRadius: '3px',
                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                    </div>

                    <div 
                        style={{ width: '100%', height: '400px', perspective: '1200px', cursor: 'pointer' }}
                        onClick={() => setIsFlipped(f => !f)}
                    >
                        <div style={{
                            width: '100%', height: '100%', position: 'relative', transition: 'transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)',
                            transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}>
                            {/* Front */}
                            <div style={{
                                width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden',
                                backgroundColor: '#2d2d3a', border: '1px solid #444', borderRadius: '24px',
                                padding: '60px 40px', boxSizing: 'border-box',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                                display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ position: 'absolute', top: '24px', left: '24px', color: '#666', fontSize: '12px', fontWeight: 'bold' }}>CÂU HỎI</div>
                                <div className="flashcard-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '5px' }}>
                                    <div style={{ margin: 'auto 0', textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '24px', lineHeight: '1.5', color: '#fff', margin: 0, whiteSpace: 'pre-wrap' }}>{cards[currentIndex].question}</h3>
                                    </div>
                                </div>
                                <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', color: '#4a90e2', fontSize: '12px' }}>Chạm để xem đáp án</div>
                            </div>

                            {/* Back */}
                            <div style={{
                                width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                                backgroundColor: '#1a3a4a', border: '2px solid #4dd0e1', borderRadius: '24px',
                                padding: '60px 40px', boxSizing: 'border-box',
                                boxShadow: '0 15px 35px rgba(77, 208, 225, 0.15)',
                                display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ position: 'absolute', top: '24px', left: '24px', color: '#4dd0e1', fontSize: '12px', fontWeight: 'bold' }}>ĐÁP ÁN</div>
                                <div className="flashcard-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '5px' }}>
                                    <div style={{ margin: 'auto 0', textAlign: 'center' }}>
                                        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#e0e0e0', margin: 0, whiteSpace: 'pre-wrap' }}>{cards[currentIndex].answer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                         {cards[currentIndex].id ? (
                            <span style={{ backgroundColor: 'rgba(46, 125, 50, 0.2)', color: '#81c784', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid #2e7d32' }}>
                                💾 Đã lưu trong Database
                            </span>
                        ) : (
                            <span style={{ backgroundColor: 'rgba(245, 124, 0, 0.2)', color: '#ffb74d', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid #f57c00' }}>
                                🤖 Vừa tạo mới bởi AI
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                        <button onClick={goPrev} disabled={currentIndex === 0} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: currentIndex === 0 ? 0.3 : 1 }}>
                            <ArrowLeft size={18} /> Trước
                        </button>
                        <button onClick={() => { setCurrentIndex(0); setIsFlipped(false); }} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RotateCcw size={18} /> Học lại
                        </button>
                        <button onClick={goNext} disabled={currentIndex === cards.length - 1} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: currentIndex === cards.length - 1 ? 0.3 : 1 }}>
                            Sau <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashcardMode;