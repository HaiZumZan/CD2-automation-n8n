import React, { useState } from 'react';
import { Send } from 'lucide-react';
import FilePicker from './FilePicker';
import '../App.css'; // Phải có dòng này thì CSS mới "ngấm" vào code được

const MessageInput = ({ onSend, loading }) => {
    const [text, setText] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (text.trim() && !loading) {
            onSend(text);
            setText('');
        }
    };

   // src/components/MessageInput.jsx
return (
    <footer className="input-container">
        <div className="input-wrapper">
            <div className="icon-btn">
                <FilePicker />
            </div>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi AI Study Assistant..."
            />
            <button className="icon-btn" onClick={handleSend} disabled={!text.trim()}>
                <Send size={20} />
            </button>
        </div>
        <p className="disclaimer">Sản phẩm hỗ trợ học tập cho sinh viên VKU</p>
    </footer>
);
};

export default MessageInput;