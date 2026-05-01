import React, { useState, useEffect, useContext, useRef } from "react";
import {
  uploadFile,
  getPersonalFiles,
  deleteFile,
  downloadFile,
  getFilePreviewUrl,
  sendChatRequest,
} from "../services/fileService";
import { AuthContext } from "../context/AuthContext";
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  HardDrive,
  Send,
  Bot,
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);

  // --- STATE CHO QUẢN LÝ FILE ---
  const [personalFiles, setPersonalFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE CHO CHAT AI TUTOR ---
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Chào bạn! AI Tutor đây. Hãy hỏi mình bất kỳ câu hỏi nào về các tài liệu bạn đã tải lên nhé (Ví dụ: Tạo cho mình 5 câu hỏi trắc nghiệm).",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef(null);

  const MAX_FILES = 5;
  const MAX_FILE_SIZE_MB = 5;

  useEffect(() => {
    fetchFiles();
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const data = await getPersonalFiles();
      setPersonalFiles(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Giữ nguyên các hàm handleFileChange, handleUpload, handleDelete, handlePreview như cũ)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(
        `⚠️ File nặng ${fileSizeMB.toFixed(1)}MB. Vui lòng chọn file dưới ${MAX_FILE_SIZE_MB}MB!`,
      );
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("⚠️ Vui lòng chọn tài liệu trước!");
      return;
    }
    if (personalFiles.length >= MAX_FILES) {
      alert(`⚠️ Đã đầy (${MAX_FILES}/${MAX_FILES}). Xóa bớt để tải file mới!`);
      return;
    }

    setIsUploading(true);
    try {
      await uploadFile(file, false, "", "", "");
      alert("✅ Tải lên thành công!");
      setFile(null);
      document.getElementById("student-file-upload").value = "";
      fetchFiles();
    } catch (error) {
      alert("❌ Lỗi tải lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Xóa tài liệu này khỏi không gian cá nhân?")) {
      try {
        await deleteFile(id);
        setPersonalFiles(personalFiles.filter((f) => f.id !== id));
      } catch (error) {
        alert("❌ Lỗi khi xóa.");
      }
    }
  };

  const handlePreview = async (id) => {
    try {
      const url = await getFilePreviewUrl(id);
      window.open(url, "_blank");
    } catch (error) {
      alert("❌ Lỗi hiển thị file.");
    }
  };

  // --- HÀM GỬI TIN NHẮN PERSONAL ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { sender: "user", text: chatInput };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      // Gắn nhãn 'personal' để n8n biết đang ở Không gian cá nhân
      const res = await sendChatRequest(
        newMsg.text,
        "personal",
        user?.username || "unknown",
      );
      const aiResponse =
        typeof res === "string"
          ? res
          : res.output || res.message || JSON.stringify(res);
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ AI Tutor đang bận. Vui lòng thử lại." },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  // STYLE
  const containerStyle = {
    padding: "30px",
    color: "#fff",
    height: "100%",
    overflowY: "auto",
    paddingBottom: "300px",
  };
  const cardStyle = {
    backgroundColor: "#2d2d3a",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #444",
    marginBottom: "20px",
  };
  const tableHeaderStyle = {
    padding: "15px 20px",
    borderBottom: "1px solid #444",
    color: "#888",
    fontSize: "14px",
    textAlign: "left",
  };
  const tableCellStyle = {
    padding: "15px 20px",
    borderBottom: "1px solid #444",
  };

  return (
    <div style={containerStyle}>
      {/* Header và Thanh trạng thái (Giữ nguyên) */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{ fontSize: "28px", color: "#4dd0e1", margin: "0 0 10px 0" }}
          >
            🧑‍🎓 Không gian Học tập Cá nhân
          </h1>
          <p style={{ color: "#888", margin: 0 }}>
            Tải lên tài liệu để AI Tutor hỗ trợ bạn ôn thi.
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#1e1e26",
            padding: "15px 20px",
            borderRadius: "10px",
            border: "1px solid #444",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <HardDrive
            size={24}
            color={personalFiles.length >= MAX_FILES ? "#ff6b6b" : "#50fa7b"}
          />
          <div>
            <div
              style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}
            >
              Dung lượng lưu trữ
            </div>
            <div
              style={{
                fontWeight: "bold",
                color: personalFiles.length >= MAX_FILES ? "#ff6b6b" : "#fff",
              }}
            >
              {personalFiles.length} / {MAX_FILES} Tài liệu
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}
      >
        {/* CỘT TRÁI: FORM UPLOAD (Giữ nguyên) */}
        <div>
          <form onSubmit={handleUpload} style={cardStyle}>
            <h2
              style={{
                fontSize: "18px",
                color: "#fff",
                margin: "0 0 15px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <UploadCloud size={20} color="#4a90e2" /> Tải tài liệu mới
            </h2>
            <div
              style={{
                backgroundColor: "#1e1e26",
                padding: "20px",
                borderRadius: "8px",
                border: "1px dashed #4a90e2",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <input
                type="file"
                id="student-file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ width: "100%", color: "#fff", marginBottom: "10px" }}
              />
              <div
                style={{
                  fontSize: "13px",
                  color: "#888",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                <AlertCircle size={14} /> Chấp nhận file PDF (Max 5MB)
              </div>
            </div>
            <button
              type="submit"
              disabled={isUploading || personalFiles.length >= MAX_FILES}
              style={{
                width: "100%",
                backgroundColor:
                  isUploading || personalFiles.length >= MAX_FILES
                    ? "#555"
                    : "#4a90e2",
                color: "white",
                padding: "12px",
                borderRadius: "5px",
                border: "none",
                cursor:
                  isUploading || personalFiles.length >= MAX_FILES
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "bold",
              }}
            >
              {isUploading
                ? "⏳ Đang phân tích..."
                : personalFiles.length >= MAX_FILES
                  ? "🔒 Đã đạt giới hạn"
                  : "🚀 Tải lên Hệ thống"}
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: BẢNG FILE (Giữ nguyên) */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #444",
              backgroundColor: "#252530",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                color: "#fff",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileText size={20} color="#50fa7b" /> Kho tài liệu của tôi
            </h2>
          </div>
          {isLoading ? (
            <div
              style={{ padding: "30px", textAlign: "center", color: "#888" }}
            >
              ⏳ Đang tải dữ liệu...
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#1e1e26" }}>
                  <th style={tableHeaderStyle}>TÊN TÀI LIỆU</th>
                  <th style={tableHeaderStyle}>TRẠNG THÁI</th>
                  <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {personalFiles.map((f) => (
                  <tr key={f.id}>
                    <td
                      style={{
                        ...tableCellStyle,
                        color: "#ddd",
                        fontWeight: "500",
                      }}
                    >
                      {f.fileName || f.name}
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          backgroundColor: "#50fa7b20",
                          color: "#50fa7b",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Sẵn sàng
                      </span>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "right" }}>
                      <button
                        onClick={() => handlePreview(f.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#4a90e2",
                          cursor: "pointer",
                          marginRight: "10px",
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => downloadFile(f.id, f.fileName || f.name)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ffb86c",
                          cursor: "pointer",
                          marginRight: "10px",
                        }}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff6b6b",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* KHUNG CHAT CỐ ĐỊNH Ở DƯỚI (DÀNH CHO AI TUTOR) */}
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
              {msg.sender === "ai" && <Bot size={24} color="#50fa7b" />}
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
              <Bot size={24} color="#50fa7b" />
              <div style={{ color: "#888", fontSize: "13px" }}>
                AI Tutor đang suy nghĩ...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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
            placeholder="Yêu cầu AI Tutor tạo câu hỏi trắc nghiệm, tóm tắt..."
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
              backgroundColor: "#50fa7b",
              color: "#000",
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
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentDashboard;
