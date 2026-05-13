import React, { useState, useEffect, useRef, useContext } from 'react'; // Bổ sung useContext
import { AuthContext } from '../context/AuthContext'; // Bổ sung import Context
import { askAI, getChatHistory } from '../services/chatService';
import ChatBubble from '../components/ChatBubble';
import FilePicker from '../components/FilePicker';
import { Send, Loader2, X, LogOut, Camera, FileText } from 'lucide-react'; // Thêm icon LogOut, Camera và FileText

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
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

    // Xử lý đính kèm file dùng chung
    const processAttachedFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachedFile({
                data: reader.result,
                name: file.name,
                type: file.type,
                isImage: file.type.startsWith('image/')
            });
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        processAttachedFile(e.target.files[0]);
        e.target.value = ''; // reset file input
    };

    // --- KÉO THẢ FILE (DRAG & DROP) ---
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
        processAttachedFile(file);
    };

    // --- DÁN FILE (PASTE) ---
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) {
                    processAttachedFile(file);
                    e.preventDefault(); // Ngăn hành vi dán text mặc định
                    break;
                }
            }
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !attachedFile) || loading) return;
        
        const currentInput = input.trim();
        const fileToSend = attachedFile;
        
        setMessages(prev => [...prev, { text: currentInput, sender: 'student', file: fileToSend }]);
        setInput('');
        setAttachedFile(null);
        setLoading(true);

        try {
            const res = await askAI(currentInput, false, "", "", "", fileToSend ? fileToSend.data : null);
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
                    <h2 style={{ color: '#4a90e2', pointerEvents: 'none' }}>📸 Thả file/ảnh vào đây để đính kèm</h2>
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

            <footer className="input-container" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                {attachedFile && (
                    <div style={{ 
                        position: "relative", width: "fit-content", marginBottom: "10px", marginLeft: "10px",
                        padding: attachedFile.isImage ? "0" : "10px",
                        backgroundColor: attachedFile.isImage ? "transparent" : "#2d2d3a",
                        borderRadius: "8px", border: "2px solid #555",
                        display: "flex", alignItems: "center", gap: "10px"
                    }}>
                        {attachedFile.isImage ? (
                            <img src={attachedFile.data} alt="Preview" style={{ height: "60px", borderRadius: "6px", objectFit: "contain" }} />
                        ) : (
                            <>
                                <FileText size={24} color="#4a90e2" />
                                <span style={{ color: "#e0e0e0", fontSize: "14px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {attachedFile.name}
                                </span>
                            </>
                        )}
                        <button
                            onClick={() => setAttachedFile(null)}
                            style={{
                                position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white",
                                border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer",
                                fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >✕</button>
                    </div>
                )}
                <div className="input-wrapper" style={{ width: '100%' }}>
                    <FilePicker />
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#4a90e2', padding: '0 10px' }} title="Đính kèm ảnh/file">
                        <Camera size={20} />
                        <input type="file" hidden onChange={handleFileSelect} disabled={loading} />
                    </label>
                    <input 
                        value={input} 
                        placeholder="Hỏi AI Study Assistant hoặc Paste (Ctrl+V) ảnh/file..."
                        onChange={(e)=>setInput(e.target.value)} 
                        onKeyDown={(e)=>e.key==='Enter' && handleSend()} 
                        onPaste={handlePaste}
                        disabled={loading}
                    />
                    <button onClick={handleSend} disabled={(!input.trim() && !attachedFile) || loading}><Send size={20}/></button>
                </div>
            </footer>
        </div>
    );
};

export default ChatScreen;