import React, { useState, useEffect, useRef, useContext } from 'react'; // Bổ sung useContext
import { AuthContext } from '../context/AuthContext'; // Bổ sung import Context
import { askAI, getChatHistory } from '../services/chatService';
import ChatBubble from '../components/ChatBubble';
import FilePicker from '../components/FilePicker';
import { Send, Loader2, X, LogOut } from 'lucide-react'; // Thêm icon LogOut

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);
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
        <div className="app-container" style={{ flexDirection: 'column' }}>
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