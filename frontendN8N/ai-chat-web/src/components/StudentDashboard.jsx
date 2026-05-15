import React, { useState, useEffect, useContext, useRef } from "react";
import MindMap from "../components/MindMap";
import {
  uploadFile,
  getPersonalFiles,
  deleteFile,
  downloadFile,
  getFilePreviewUrl,
} from "../services/fileService";
import { AuthContext } from "../context/AuthContext";
import {
  UploadCloud,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  HardDrive,
  Send,
  Bot,
  Camera,
  Loader2,
  Maximize2,
  Minimize2, // Nhớ kiểm tra xem đã có Icon thu nhỏ này chưa nhé
  FileText   // <--- CHỈ CẦN THÊM CHỮ NÀY VÀO ĐÂY
} from "lucide-react";
import html2pdf from 'html2pdf.js';
import { askAI } from "../services/chatService";

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
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false); // Thêm state cho kéo thả khung chat
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);

  // Hàm xử lý tải PDF (Đã fix lỗi chữ mờ)
  const handleDownloadPDF = (content, filename) => {
    const element = document.createElement('div');

    // Ép cứng CSS: Nền trắng, chữ đen, font size to hơn một chút cho dễ đọc
    element.innerHTML = `
          <div style="font-family: 'Times New Roman', Times, serif; padding: 30px; background-color: #ffffff; color: #000000;">
              <h2 style="text-align: center; color: #28a745; text-transform: uppercase;">Tài liệu tự học - AI Tutor</h2>
              <hr style="border: 1px solid #ddd; margin-bottom: 20px;"/>
              <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; color: #222222;">
                  ${content.replace(/\n/g, '<br/>')}
              </div>
              <br/><hr style="border: 0.5px solid #eee; margin-top: 30px;"/>
              <p style="text-align: right; font-size: 12px; color: #888; font-style: italic;">Được tạo tự động bởi VKU KMS AI</p>
          </div>
      `;

    const opt = {
      margin: 0.5,
      filename: filename + '.pdf',
      image: { type: 'jpeg', quality: 1 },
      // Thêm backgroundColor: '#ffffff' để html2canvas không bị dính nền trong suốt
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }

    // 1. Quét thẻ xuất PDF
    const docRegex = /\[DOCUMENT_START\]([\s\S]*?)\[DOCUMENT_END\]/i;
    const docMatch = text.match(docRegex);

    if (docMatch) {
      const pureContent = docMatch[1].trim();
      const parts = text.split(docMatch[0]);
      return (
        <>
          {parts[0] && <span style={{ whiteSpace: 'pre-wrap' }}>{parts[0]}</span>}
          <div style={{ backgroundColor: '#1e1e26', border: '1px solid #50fa7b', borderRadius: '8px', padding: '10px', margin: '10px 0' }}>
            <div style={{ fontWeight: 'bold', color: '#50fa7b', marginBottom: '5px' }}>📄 Đã tạo bộ câu hỏi / Tóm tắt</div>
            <button onClick={() => handleDownloadPDF(pureContent, 'Tai-Lieu-Hoc-Tap')} style={{ background: '#50fa7b', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Download size={14} /> Tải xuống PDF
            </button>
          </div>
          {parts[1] && <span style={{ whiteSpace: 'pre-wrap' }}>{parts[1]}</span>}
        </>
      );
    }

    // 2. Quét thẻ vẽ Sơ đồ Tư duy (Mermaid)
    const mermaidRegex = /```mermaid([\s\S]*?)```/i;
    const mermaidMatch = text.match(mermaidRegex);

    if (mermaidMatch) {
      const fullMatch = mermaidMatch[0];
      const pureCode = mermaidMatch[1].trim();
      const textParts = text.split(fullMatch);

      return (
        <>
          {textParts[0] && <span style={{ whiteSpace: 'pre-wrap' }}>{textParts[0].trim()}</span>}
          <MindMap chartCode={pureCode} onImageClick={(url) => setPreviewImage(url)} />
          {textParts[1] && <span style={{ whiteSpace: 'pre-wrap', display: 'block', marginTop: '10px' }}>{textParts[1].trim()}</span>}
        </>
      );
    }

    // 3. Trả về text thường (Giữ nguyên khoảng trắng và xuống dòng)
    return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
  };

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
      const errorMsg = error.response?.data || "Lỗi tải lên.";
      alert(`❌ ${errorMsg}`);
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
    if ((!chatInput.trim() && !attachedFile) || isChatting) return;

    const currentInput = chatInput.trim();
    const fileToSend = attachedFile;

    const newMsg = { sender: "user", text: currentInput, file: fileToSend };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    setAttachedFile(null);
    setIsChatting(true);

    try {
      const res = await askAI(
        currentInput,
        false,
        "",
        "",
        "",
        fileToSend ? fileToSend.data : null
      );

      // Bóc tách an toàn (Axios đã tự parse JSON vòng ngoài)
      let aiResponseText = res.answer || res;
      let isDoc = false;

      // Xử lý trường hợp n8n trả về thêm 1 lớp JSON dạng chuỗi bên trong
      if (typeof aiResponseText === 'string') {
        try {
          // DỌN DẸP AN TOÀN: Cắt bỏ thẻ ```json ở 2 đầu nếu có, tuyệt đối KHÔNG đụng đến thẻ ```mermaid ở giữa
          let cleanJsonString = aiResponseText.trim();
          if (cleanJsonString.startsWith('```json')) {
            cleanJsonString = cleanJsonString.substring(7);
          } else if (cleanJsonString.startsWith('```')) {
            cleanJsonString = cleanJsonString.substring(3);
          }
          if (cleanJsonString.endsWith('```')) {
            cleanJsonString = cleanJsonString.slice(0, -3);
          }
          cleanJsonString = cleanJsonString.trim();

          const parsed = JSON.parse(cleanJsonString);
          if (parsed.answer) aiResponseText = parsed.answer;
          if (parsed.is_document !== undefined) isDoc = parsed.is_document;
        } catch (e) {
          // Bỏ qua nếu không phải JSON
        }
      } else if (typeof aiResponseText === 'object') {
        isDoc = aiResponseText.is_document || false;
        if (aiResponseText.answer) aiResponseText = aiResponseText.answer;
      }

      // Đảm bảo giá trị cuối cùng push vào state phải là String
      const finalText = typeof aiResponseText === 'string' ? aiResponseText : JSON.stringify(aiResponseText);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: finalText,
          isDocument: isDoc
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ AI Tutor đang bận hoặc mất kết nối. Vui lòng thử lại." },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  // --- XỬ LÝ ĐÍNH KÈM FILE CHUNG ---
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
    e.target.value = '';
  };

  // --- KÉO THẢ VÀ DÁN FILE VÀO KHUNG CHAT ---
  const handleChatDragOver = (e) => {
    e.preventDefault();
    setIsDraggingChat(true);
  };

  const handleChatDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingChat(false);
  };

  const handleChatDrop = async (e) => {
    e.preventDefault();
    setIsDraggingChat(false);
    const file = e.dataTransfer.files[0];
    processAttachedFile(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          processAttachedFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
              className="upload-zone"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                padding: "30px 20px",
                borderRadius: "12px",
                border: "2px dashed #4a90e2",
                textAlign: "center",
                marginBottom: "20px",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => document.getElementById("student-file-upload").click()}
            >
              <input
                type="file"
                id="student-file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {file ? (
                <div style={{ color: "#50fa7b", fontWeight: "600", fontSize: "14px" }}>
                  <FileText size={24} style={{ marginBottom: "10px" }} />
                  <br />
                  {file.name}
                </div>
              ) : (
                <>
                  <UploadCloud size={32} color="#8ab4f8" style={{ marginBottom: "10px" }} />
                  <div style={{ color: "#fff", fontWeight: "500", marginBottom: "5px" }}>Nhấn hoặc kéo thả file vào đây</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <AlertCircle size={14} /> Chấp nhận file PDF (Max 5MB)
                  </div>
                </>
              )}
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
                  <tr key={f.id} className="table-row-hover" style={{ transition: "background-color 0.2s" }}>
                    <td
                      style={{
                        ...tableCellStyle,
                        color: "#ddd",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <FileText size={18} color="#4a90e2" />
                      {f.fileName || f.name}
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          backgroundColor: "rgba(80, 250, 123, 0.15)",
                          color: "#50fa7b",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          border: "1px solid rgba(80, 250, 123, 0.3)"
                        }}
                      >
                        Sẵn sàng
                      </span>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          className="icon-action-btn view"
                          onClick={() => handlePreview(f.id)}
                          title="Xem tài liệu"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-action-btn download"
                          onClick={() => downloadFile(f.id, f.fileName || f.name)}
                          title="Tải xuống"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="icon-action-btn delete"
                          onClick={() => handleDelete(f.id)}
                          title="Xóa tài liệu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        onDragOver={handleChatDragOver}
        onDragLeave={handleChatDragLeave}
        onDrop={handleChatDrop}
        style={{
          position: "fixed",
          bottom: 20,
          right: 30,
          left: 280,
          backgroundColor: "rgba(30, 30, 38, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.4)",
          height: isChatExpanded ? "85vh" : "280px", // <-- Đã đổi thành linh hoạt
          zIndex: 100,
          transition: "height 0.3s ease",
          overflow: "hidden"
        }}
      >
        {/* Nút phóng to / thu nhỏ */}
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 101, cursor: 'pointer', color: '#888' }} onClick={() => setIsChatExpanded(!isChatExpanded)}>
          {isChatExpanded ? <Minimize2 size={20} color="#ff6b6b" /> : <Maximize2 size={20} color="#50fa7b" />}
        </div>

        {isDraggingChat && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(80, 250, 123, 0.15)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            border: '3px dashed #50fa7b', borderRadius: '15px',
            backdropFilter: 'blur(2px)'
          }}>
            <h3 style={{ color: '#50fa7b', pointerEvents: 'none' }}>📸 Thả file/ảnh vào đây</h3>
          </div>
        )}

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
                    msg.sender === "user" ? "var(--accent-color)" : "#2d2d3a",
                  color: msg.sender === "user" ? "#000" : "#fff",
                  padding: "12px 18px",
                  borderRadius: "18px",
                  borderBottomRightRadius: msg.sender === "user" ? "4px" : "18px",
                  borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "18px",
                  maxWidth: "80%",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}
              >
                {msg.file && (
                  <div style={{ marginBottom: msg.text ? '10px' : '0' }}>
                    {msg.file.isImage ? (
                      <img
                        src={msg.file.data} alt="Uploaded"
                        style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '250px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid #555' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <span style={{ fontSize: '13px', color: '#e0e0e0', wordBreak: 'break-all' }}>{msg.file.name}</span>
                      </div>
                    )}
                  </div>
                )}
                {renderMessageContent(msg.text)}
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

        <div style={{ display: "flex", flexDirection: "column" }}>
          {attachedFile && (
            <div style={{
              position: "relative", width: "fit-content", marginBottom: "5px", marginLeft: "10px", marginTop: "10px",
              padding: attachedFile.isImage ? "0" : "10px",
              backgroundColor: attachedFile.isImage ? "transparent" : "#2d2d3a",
              borderRadius: "8px", border: "1px solid #555",
              display: "flex", alignItems: "center", gap: "10px", alignSelf: 'flex-start'
            }}>
              {attachedFile.isImage ? (
                <img src={attachedFile.data} alt="Preview" style={{ height: "50px", borderRadius: "6px", objectFit: "contain" }} />
              ) : (
                <>
                  <FileText size={20} color="#4a90e2" />
                  <span style={{ color: "#e0e0e0", fontSize: "12px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {attachedFile.name}
                  </span>
                </>
              )}
              <button
                onClick={() => setAttachedFile(null)}
                style={{
                  position: "absolute", top: "-5px", right: "-5px", background: "#ff4757", color: "white",
                  border: "none", borderRadius: "50%", width: "16px", height: "16px", cursor: "pointer",
                  fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >✕</button>
            </div>
          )}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #444",
              backgroundColor: "#252530",
              borderBottomLeftRadius: "15px",
              borderBottomRightRadius: "15px",
              alignItems: "flex-end", // <-- Căn đáy cho textarea và nút send
              gap: "5px"
            }}
          >
            <label style={{ cursor: 'pointer', padding: '10px', color: '#50fa7b', display: 'flex', alignItems: 'center' }} title="Đính kèm tài liệu/ảnh">
              <Camera size={18} />
              <input type="file" hidden onChange={handleFileSelect} disabled={isChatting} />
            </label>

            {/* ĐÃ CHUYỂN TỪ INPUT SANG TEXTAREA */}
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Ctrl+V dán ảnh hoặc nhập yêu cầu... (Shift+Enter để xuống dòng)"
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                outline: "none",
                padding: "10px",
                resize: "none",
                height: isChatExpanded ? "80px" : "40px",
                fontFamily: "inherit",
                transition: "height 0.3s ease"
              }}
              disabled={isChatting}
            />
            <button
              type="submit"
              disabled={isChatting || (!chatInput.trim() && !attachedFile)}
              style={{
                backgroundColor: "#50fa7b",
                color: "#000",
                border: "none",
                borderRadius: "50%",
                minWidth: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                opacity: isChatting || (!chatInput.trim() && !attachedFile) ? 0.5 : 1,
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
      {/* Modal phóng to ảnh sơ đồ */}
      {previewImage && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} alt="Phóng to" />
          <div style={{ position: 'absolute', top: 20, right: 30, color: '#fff', fontSize: '30px', cursor: 'pointer' }}>✕</div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
