import React from 'react';
import MindMap from './MindMap';

const ChatBubble = ({ message, onImageClick }) => {
    
    // Hàm siêu quét: Tìm và bóc tách đoạn ```mermaid ... ```
    const renderContent = (text) => {
        if (!text) return null;

        const mermaidRegex = /```mermaid([\s\S]*?)```/i;
        const match = text.match(mermaidRegex);

        if (match) {
            const fullMatch = match[0]; // Cục ```mermaid...```
            const pureCode = match[1].trim(); // Chỉ lấy ruột code bên trong
            
            // Cắt chuỗi text thành 2 mảng: Trước sơ đồ và Sau sơ đồ
            const textParts = text.split(fullMatch);

            return (
                <>
                    {/* Phần chữ AI nói TRƯỚC sơ đồ */}
                    {textParts[0] && <p style={{ whiteSpace: 'pre-wrap' }}>{textParts[0].trim()}</p>}
                    
                    {/* Máy in sơ đồ */}
                    <MindMap chartCode={pureCode} onImageClick={onImageClick} />
                    
                    {/* Phần chữ AI nói SAU sơ đồ */}
                    {textParts[1] && <p style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{textParts[1].trim()}</p>}
                </>
            );
        }

        // Nếu không có sơ đồ thì in chữ bình thường
        return <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>;
    };

    return (
        <div className={`chat-bubble ${message.sender}`}>
            <div className="avatar">{message.sender === 'ai' ? 'AI' : 'Me'}</div>
            <div className="text-content">
                {renderContent(message.text)}
            </div>
        </div>
    );
};

export default ChatBubble;