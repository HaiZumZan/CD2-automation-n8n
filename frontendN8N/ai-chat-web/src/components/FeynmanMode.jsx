import React, { useState, useEffect, useRef } from 'react';
import { sendFeynmanMessage } from '../services/studyService';
import { getFiles } from '../services/fileService';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// Cài thêm: npm install react-markdown

const FeynmanMode = ({ onBack }) => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [started, setStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const scrollRef = useRef();

    useEffect(() => {
        getFiles()
            .then(data => setFiles(Array.isArray(data) ? data : []))
            .catch(() => setFiles([]))
            .finally(() => setLoadingFiles(false));
    }, []);

    // Tự cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleStart = () => {
        if (!selectedFile) return;
        setStarted(true);
        setMessages([{
            role: 'ai',
            content: `Xin chào! Tôi là Giáo sư AI.\n\nBạn đang học tài liệu **${selectedFile}**.\n\nHãy chọn một khái niệm trong tài liệu và **giải thích lại cho tôi nghe bằng ngôn ngữ của bạn** — như thể bạn đang giải thích cho một người chưa biết gì về chủ đề này.`
        }]);
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const studentMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'student', content: studentMsg }]);
        setLoading(true);

        try {
            const result = await sendFeynmanMessage(selectedFile, studentMsg);
            // n8n Feynman trả về output từ AI Agent
            const aiReply = result?.data || result?.output || 'Không nhận được phản hồi.';
            setMessages(prev => [...prev, { role: 'ai', content: aiReply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '⚠️ Lỗi kết nối. Kiểm tra n8n và backend đang chạy chưa.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES ---
    const containerStyle = { padding: '30px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' };
    const headerStyle = { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexShrink: 0 };
    const backBtnStyle = { background: 'none', border: '1px solid #555', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
    const selectStyle = { flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#1e1e26', color: '#fff', border: '1px solid #555', outline: 'none', fontSize: '14px' };
    const startBtnStyle = { backgroundColor: '#2e7d32', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };

    // Màn hình chọn file
    if (!started) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <button style={backBtnStyle} onClick={onBack}>
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                    <h2 style={{ margin: 0, color: '#ffb74d' }}>🧑‍🏫 Phương pháp Feynman</h2>
                </div>

                <div style={{ backgroundColor: '#2d2d3a', padding: '24px', borderRadius: '12px', border: '1px solid #444', maxWidth: '600px' }}>
                    <p style={{ color: '#aaa', marginBottom: '24px', lineHeight: '1.6' }}>
                        Kỹ thuật Feynman: Thay vì đọc tài liệu thụ động, bạn sẽ <strong style={{ color: '#ffb74d' }}>giải thích lại khái niệm cho AI</strong>.
                        AI sẽ đóng vai giáo sư, chấm điểm và chỉ ra những chỗ bạn hiểu sai hoặc thiếu.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {loadingFiles ? (
                            <p style={{ color: '#888' }}>Đang tải danh sách tài liệu...</p>
                        ) : (
                            <select
                                style={selectStyle}
                                value={selectedFile}
                                onChange={e => setSelectedFile(e.target.value)}
                            >
                                <option value="">-- Chọn tài liệu muốn ôn tập --</option>
                                {files.map(f => (
                                    <option key={f.id} value={f.fileName}>{f.fileName}</option>
                                ))}
                            </select>
                        )}
                        <button
                            style={{ ...startBtnStyle, opacity: selectedFile ? 1 : 0.5 }}
                            onClick={handleStart}
                            disabled={!selectedFile}
                        >
                            Bắt đầu →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Màn hình chat Feynman
    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <button style={backBtnStyle} onClick={() => { setStarted(false); setMessages([]); }}>
                    <ArrowLeft size={16} /> Đổi tài liệu
                </button>
                <div>
                    <h2 style={{ margin: 0, color: '#ffb74d', fontSize: '18px' }}>🧑‍🏫 Feynman Mode</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>📄 {selectedFile}</p>
                </div>
            </div>

            {/* Khung chat */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#1a1a24',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid #333'
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'student' ? 'flex-end' : 'flex-start',
                        gap: '10px',
                        alignItems: 'flex-start'
                    }}>
                        {msg.role === 'ai' && (
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: '#ffb74d', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', flexShrink: 0
                            }}>👨‍🏫</div>
                        )}
                        <div style={{
                            maxWidth: '75%',
                            padding: '14px 18px',
                            borderRadius: msg.role === 'student' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            backgroundColor: msg.role === 'student' ? '#1565c0' : '#2d2d3a',
                            border: msg.role === 'ai' ? '1px solid #444' : 'none',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#e0e0e0'
                        }}>
                            {msg.role === 'ai' ? (
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                                        h3: ({ children }) => <h3 style={{ color: '#ffb74d', margin: '12px 0 6px 0', fontSize: '15px' }}>{children}</h3>,
                                        strong: ({ children }) => <strong style={{ color: '#fff' }}>{children}</strong>,
                                        li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                <p style={{ margin: 0 }}>{msg.content}</p>
                            )}
                        </div>
                        {msg.role === 'student' && (
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: '#4a90e2', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', fontWeight: 'bold', flexShrink: 0
                            }}>Tôi</div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffb74d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍🏫</div>
                        <div style={{ padding: '14px 18px', backgroundColor: '#2d2d3a', borderRadius: '18px', border: '1px solid #444' }}>
                            <Loader2 size={18} style={{ color: '#ffb74d', animation: 'spin 1s linear infinite' }} />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                flexShrink: 0
            }}>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Giải thích khái niệm bằng ngôn ngữ của bạn... (Enter để gửi, Shift+Enter xuống dòng)"
                    rows={3}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #555',
                        backgroundColor: '#1e1e26',
                        color: '#fff',
                        fontSize: '14px',
                        resize: 'none',
                        outline: 'none',
                        lineHeight: '1.5'
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    style={{
                        backgroundColor: loading || !input.trim() ? '#555' : '#ffb74d',
                        color: '#1a1a24',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0 20px',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default FeynmanMode;