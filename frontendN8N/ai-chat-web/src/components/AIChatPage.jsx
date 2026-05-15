import React, { useState, useRef, useEffect } from "react";
import { askAI } from "../services/chatService";

const AIChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Chào bạn! Mình là AI Navigator của VKU. Mình có thể giúp bạn tìm kiếm tài liệu chung của trường, hoặc giải đáp kiến thức từ tài liệu cá nhân của bạn. Bạn muốn hỏi gì nào?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg = input.trim();
    const imageToSend = selectedImage;
    setInput("");
    setSelectedImage(null);

    // 1. Thêm tin nhắn của user vào màn hình
    setMessages((prev) => [...prev, { role: "user", content: userMsg, image: imageToSend }]);
    setIsLoading(true);

    try {
      // 2. Gửi xuống Backend kèm theo ảnh (nếu có)
      // Nếu muốn tìm trong file cá nhân, đổi isGlobal = false
      const aiResponse = await askAI(userMsg, true, "", "", "", imageToSend);

      // 3. Thêm câu trả lời của AI vào màn hình
      setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);
    } catch (error) {
      console.error("Lỗi Chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "❌ Xin lỗi, hệ thống AI đang bận hoặc mất kết nối. Vui lòng thử lại sau!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "80vh",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#1e1e26",
        borderRadius: "10px",
        border: "1px solid #444",
        overflow: "hidden",
      }}
    >
      {/* TIÊU ĐỀ */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#2d2d3a",
          borderBottom: "1px solid #444",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "24px" }}>🤖</span>
        <h2 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>
          Trợ lý ảo VKU KMS
        </h2>
      </div>

      {/* KHU VỰC HIỂN THỊ TIN NHẮN */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "15px",
                borderRadius: "15px",
                backgroundColor: msg.role === "user" ? "#4a90e2" : "#2d2d3a",
                color: msg.role === "user" ? "#fff" : "#e0e0e0",
                borderBottomRightRadius: msg.role === "user" ? "0" : "15px",
                borderBottomLeftRadius: msg.role === "ai" ? "0" : "15px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap", // Giúp hiển thị đúng các dấu xuống dòng của AI
              }}
            >
              {msg.image && (
                <div style={{ marginBottom: msg.content ? "10px" : "0" }}>
                  <img src={msg.image} alt="User upload" style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "250px", objectFit: "contain" }} />
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {/* Hiệu ứng AI đang gõ... */}
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "15px",
                borderRadius: "15px",
                backgroundColor: "#2d2d3a",
                color: "#888",
                fontStyle: "italic",
                borderBottomLeftRadius: "0",
              }}
            >
              ✨ AI đang phân tích dữ liệu...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* KHU VỰC NHẬP TEXT */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#2d2d3a",
          borderTop: "1px solid #444",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Preview ảnh thu nhỏ ngay trên khung nhập */}
        {selectedImage && (
          <div style={{ position: "relative", width: "fit-content", marginLeft: "55px" }}>
            <img src={selectedImage} alt="Preview" style={{ height: "70px", borderRadius: "8px", border: "2px solid #555" }} />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute", top: "-8px", right: "-8px", background: "#ff4757", color: "white",
                border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer",
                fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Nút Upload Ảnh */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: "transparent",
              color: "#aaa",
              border: "1px solid #444",
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.3s"
            }}
            title="Đính kèm ảnh (Chụp màn hình slide/bài tập)"
          >
            🖼️
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result);
                reader.readAsDataURL(file);
              }
              e.target.value = null; // reset input để có thể up lại ảnh cũ
            }}
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !isLoading && handleSendMessage()
            }
            disabled={isLoading}
            placeholder="Nhập câu hỏi hoặc dán ảnh vào đây..."
          style={{
            flex: 1,
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: "#1e1e26",
            color: "#fff",
            outline: "none",
            fontSize: "15px",
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#555" : "#4a90e2",
            color: "white",
            border: "none",
            padding: "0 25px",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            transition: "0.3s",
          }}
        >
          Gửi
        </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
