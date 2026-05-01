import React, { useState, useContext, useRef, useEffect } from "react";
import {
  getLibraryFiles,
  downloadFile,
  sendChatRequest,
} from "../services/fileService";
import DocumentModal from "./DocumentModal";
import { AuthContext } from "../context/AuthContext";
import { Send, Bot, User } from "lucide-react";

const DigitalLibrary = () => {
  const { user } = useContext(AuthContext); // Lấy thông tin user hiện tại

  // --- STATE CHO QUẢN LÝ FILE ---
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // --- STATE CHO CHAT AI ---
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Chào bạn! Mình là AI Navigator. Bạn cần tìm tài liệu gì trong Thư viện số VKU hôm nay?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const dataStructure = {
    "Khoa Công nghệ thông tin": {
      "Công nghệ phần mềm": [
        "Lập trình Java",
        "Cấu trúc dữ liệu",
        "Cơ sở dữ liệu",
      ],
      "Trí tuệ nhân tạo": ["Machine Learning", "Python cơ bản"],
    },
    "Khoa Kinh tế số": {
      "Quản trị kinh doanh": ["Marketing cơ bản", "Kinh tế vi mô"],
    },
  };

  const handleSearch = async () => {
    if (!selectedFaculty || !selectedMajor || !selectedSubject) {
      alert("Vui lòng chọn đầy đủ Khoa, Ngành và Môn học!");
      return;
    }
    setLoading(true);
    try {
      const data = await getLibraryFiles(
        selectedFaculty,
        selectedMajor,
        selectedSubject,
      );
      setFiles(data);
    } catch (error) {
      alert("Không thể tải tài liệu lúc này.");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM GỬI TIN NHẮN GLOBAL ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { sender: "user", text: chatInput };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      // Gắn nhãn 'global' để n8n biết đang ở Thư viện chung
      const res = await sendChatRequest(
        newMsg.text,
        "global",
        user?.username || "unknown",
      );

      // Xử lý dữ liệu trả về từ Webhook n8n (phụ thuộc vào node Respond to Webhook)
      const aiResponse =
        typeof res === "string"
          ? res
          : res.output || res.message || JSON.stringify(res);
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Lỗi kết nối đến hệ thống AI. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  // --- STYLE CHO DARK MODE ---
  const containerStyle = {
    padding: "30px",
    color: "#fff",
    width: "100%",
    paddingBottom: "300px",
  };
  const filterBoxStyle = {
    backgroundColor: "#2d2d3a",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  };
  const selectStyle = {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#1e1e26",
    color: "#fff",
    border: "1px solid #444",
    outline: "none",
  };
  const buttonStyle = {
    backgroundColor: "#4a90e2",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };
  const cardStyle = {
    backgroundColor: "#2d2d3a",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #444",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px", color: "#4a90e2" }}>
        📚 Thư viện số VKU
      </h1>

      {/* BỘ LỌC VÀ HIỂN THỊ FILE */}
      <div style={filterBoxStyle}>
        <select
          style={selectStyle}
          value={selectedFaculty}
          onChange={(e) => {
            setSelectedFaculty(e.target.value);
            setSelectedMajor("");
            setSelectedSubject("");
          }}
        >
          <option value="">-- Chọn Khoa --</option>
          {Object.keys(dataStructure).map((fac) => (
            <option key={fac} value={fac}>
              {fac}
            </option>
          ))}
        </select>
        <select
          style={selectStyle}
          value={selectedMajor}
          onChange={(e) => {
            setSelectedMajor(e.target.value);
            setSelectedSubject("");
          }}
          disabled={!selectedFaculty}
        >
          <option value="">-- Chọn Ngành --</option>
          {selectedFaculty &&
            Object.keys(dataStructure[selectedFaculty]).map((maj) => (
              <option key={maj} value={maj}>
                {maj}
              </option>
            ))}
        </select>
        <select
          style={selectStyle}
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={!selectedMajor}
        >
          <option value="">-- Chọn Môn học --</option>
          {selectedMajor &&
            dataStructure[selectedFaculty][selectedMajor].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
        </select>
        <button style={buttonStyle} onClick={handleSearch}>
          🔍 Tìm kiếm
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#aaa" }}>Đang tải tài liệu...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {files.length > 0 ? (
            files.map((file) => (
              <div key={file.id} style={cardStyle}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                  📄 {file.fileName}
                </h3>
                <p
                  style={{
                    color: "#888",
                    fontSize: "12px",
                    marginBottom: "15px",
                  }}
                >
                  Đăng ngày: {new Date(file.uploadDate).toLocaleDateString()}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      backgroundColor: "#2e7d32",
                      fontSize: "12px",
                    }}
                    onClick={() => setSelectedFile(file)}
                  >
                    👁️ Xem
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      backgroundColor: "#d32f2f",
                      fontSize: "12px",
                    }}
                    onClick={() => downloadFile(file.id, file.fileName)}
                  >
                    ⬇️ Tải
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                color: "#aaa",
                gridColumn: "1 / -1",
                textAlign: "center",
                marginTop: "50px",
              }}
            >
              Dùng bộ lọc hoặc hỏi AI Navigator để tìm tài liệu.
            </p>
          )}
        </div>
      )}

      {/* KHUNG CHAT CỐ ĐỊNH Ở DƯỚI */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 30,
          left: 280,
          backgroundColor: "#1e1e26",
          borderRadius: "15px",
          border: "1px solid #444",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -5px 20px rgba(0,0,0,0.5)",
          height: "250px",
          zIndex: 10,
        }}
      >
        {/* Khu vực hiển thị tin nhắn */}
        <div
          style={{
            flex: 1,
            padding: "15px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              {msg.sender === "ai" && <Bot size={24} color="#4a90e2" />}
              <div
                style={{
                  backgroundColor:
                    msg.sender === "user" ? "#4a90e2" : "#2d2d3a",
                  color: "#fff",
                  padding: "10px 15px",
                  borderRadius: "15px",
                  maxWidth: "80%",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
            <div
              style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}
            >
              <Bot size={24} color="#4a90e2" />
              <div style={{ color: "#888", fontSize: "13px" }}>
                AI Navigator đang tìm kiếm...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Khu vực nhập liệu */}
        <form
          onSubmit={handleSendMessage}
          style={{
            display: "flex",
            padding: "10px",
            borderTop: "1px solid #444",
            backgroundColor: "#252530",
            borderBottomLeftRadius: "15px",
            borderBottomRightRadius: "15px",
          }}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Hỏi AI Navigator về giáo trình, slide bài giảng..."
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "#fff",
              outline: "none",
              padding: "10px",
            }}
            disabled={isChatting}
          />
          <button
            type="submit"
            disabled={isChatting || !chatInput.trim()}
            style={{
              backgroundColor: "#4a90e2",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              opacity: isChatting || !chatInput.trim() ? 0.5 : 1,
            }}
          >
            <Send size={18} color="#fff" />
          </button>
        </form>
      </div>

      {selectedFile && (
        <DocumentModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};

export default DigitalLibrary;
