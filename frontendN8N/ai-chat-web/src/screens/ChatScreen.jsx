import React, { useState, useEffect, useRef, useContext } from 'react'; // Bổ sung useContext
import { AuthContext } from '../context/AuthContext'; // Bổ sung import Context
import { askAI, getChatHistory } from '../services/chatService';
import ChatBubble from '../components/ChatBubble';
import FilePicker from '../components/FilePicker';
import { Send, Loader2, X, LogOut, Camera } from 'lucide-react'; // Thêm icon LogOut và Camera
import Tesseract from 'tesseract.js';

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false); // Thêm state cho drag and drop
    const scrollRef = useRef();
    
    // Sử dụng logout từ Context
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getChatHistory();
                setMessages(data);
            } catch (err) {
                console.error("Lỗi history:", err);
            }
        };
        const token = localStorage.getItem('accessToken');
        if (token) fetchHistory();
    }, []);

    // Xử lý Inbound (OCR)
    const handleImageOCR = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await Tesseract.recognize(file, 'vie+eng');
            setInput(prev => prev + (prev ? '\n' : '') + result.data.text.trim());
        } catch (err) {
            alert("Lỗi trích xuất chữ: " + err.message);
        } finally {
            setLoading(false);
            e.target.value = ''; // reset file input
        }
    };

    // --- KÉO THẢ ẢNH (DRAG & DROP) ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        
        setLoading(true);
        try {
            const result = await Tesseract.recognize(file, 'vie+eng');
            setInput(prev => prev + (prev ? '\n' : '') + result.data.text.trim());
        } catch (err) {
            alert("Lỗi trích xuất chữ: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        setMessages(prev => [...prev, { text: input, sender: 'student' }]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const res = await askAI(currentInput);
            setMessages(prev => [...prev, { text: res.answer, sender: 'ai' }]);
        } catch (err) {
            setMessages(prev => [...prev, { text: "Lỗi kết nối bộ não AI!", sender: 'ai' }]);
        } finally { setLoading(false); }
    };

    return (
        <div 
            className="app-container" 
            style={{ flexDirection: 'column', position: 'relative' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Lớp Overlay khi kéo thả ảnh */}
            {isDragging && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(74, 144, 226, 0.15)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    border: '3px dashed #4a90e2', borderRadius: '10px',
                    backdropFilter: 'blur(2px)'
                }}>
                    <h2 style={{ color: '#4a90e2', pointerEvents: 'none' }}>📸 Thả ảnh vào đây để trích xuất chữ</h2>
                </div>
            )}

            {/* THÊM HEADER CHO NÚT LOGOUT */}
            <header className="chat-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '1rem 2rem',
                background: 'var(--bg-card)',
                borderBottom: '1px solid #333'
            }}>
                <h3 style={{ color: 'var(--accent-color)' }}>AI Knowledge Base</h3>
                <button 
                    onClick={logout} 
                    style={{ 
                        background: 'transparent', 
                        border: '1px solid #ff6b6b', 
                        color: '#ff6b6b',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={18} /> Đăng xuất
                </button>
            </header>

            <main className="chat-window">
                {messages.map((m, i) => (
                    <ChatBubble key={i} message={m} onImageClick={(src) => setEnlargedImage(src)} />
                ))}
                {loading && (
                    <div className="chat-bubble ai">
                         <div className="avatar">AI</div>
                         <div className="text-content loading-dots">
                            <Loader2 className="animate-spin" size={18} />
                         </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </main>

            {enlargedImage && (
                <div className="image-modal" onClick={() => setEnlargedImage(null)}>
                    <button className="close-modal"><X size={32} /></button>
                    <img src={enlargedImage} alt="Full size" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            <footer className="input-container">
                <div className="input-wrapper">
                    <FilePicker />
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#4a90e2', padding: '0 10px' }} title="Quét chữ từ hình ảnh (OCR)">
                        <Camera size={20} />
                        <input type="file" accept="image/*" hidden onChange={handleImageOCR} disabled={loading} />
                    </label>
                    <input 
                        value={input} 
                        placeholder="Hỏi AI Study Assistant..."
                        onChange={(e)=>setInput(e.target.value)} 
                        onKeyDown={(e)=>e.key==='Enter' && handleSend()} 
                    />
                    <button onClick={handleSend} disabled={!input.trim()}><Send size={20}/></button>
                </div>
            </footer>
        </div>
    );
};

export default ChatScreen;