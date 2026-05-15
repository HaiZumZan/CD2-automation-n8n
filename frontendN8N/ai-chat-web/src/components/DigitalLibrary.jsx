import React, { useState, useContext, useRef, useEffect } from "react";
import {
  getLibraryFiles,
  downloadFile,

} from "../services/fileService";
import DocumentModal from "./DocumentModal";
import { AuthContext } from "../context/AuthContext";
import html2pdf from 'html2pdf.js';
import MindMap from "../components/MindMap";
// Cập nhật import lucide-react thêm Maximize2, Minimize2:
import { Send, Bot, User, FileText, Eye, Download, Search, Library, Maximize2, Minimize2, Camera } from "lucide-react"; import { askAI } from "../services/chatService";

const DigitalLibrary = () => {
  const { user } = useContext(AuthContext); // Lấy thông tin user hiện tại

  // --- STATE CHO QUẢN LÝ FILE ---
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
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
        "Tư tưởng Hồ Chí Minh",
        "Triết học Mac-Lenin",
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

  const handleChatDragOver = (e) => { e.preventDefault(); setIsDraggingChat(true); };
  const handleChatDragLeave = (e) => { e.preventDefault(); setIsDraggingChat(false); };
  const handleChatDrop = async (e) => {
    e.preventDefault();
    setIsDraggingChat(false);
    processAttachedFile(e.dataTransfer.files[0]);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        processAttachedFile(items[i].getAsFile());
        e.preventDefault();
        break;
      }
    }
  };
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
        true,
        selectedFaculty,
        selectedMajor,
        selectedSubject,
        fileToSend ? fileToSend.data : null
      );

      let aiResponse = res.answer || res;
      try {
        const parsed = JSON.parse(aiResponse);
        if (parsed.output) aiResponse = parsed.output;
      } catch (e) { }

      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Lỗi kết nối đến hệ thống AI. Vui lòng thử lại." },
      ]);
    } finally {
      setIsChatting(false);
    }
  };
  const handleDownloadPDF = (content, filename) => {
    const element = document.createElement('div');
    element.innerHTML = `
          <div style="font-family: 'Times New Roman', Times, serif; padding: 30px; background-color: #ffffff; color: #000000;">
              <h2 style="text-align: center; color: #28a745; text-transform: uppercase;">Tài liệu Thư viện - AI Navigator</h2>
              <hr style="border: 1px solid #ddd; margin-bottom: 20px;"/>
              <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; color: #222222;">
                  ${content.replace(/\n/g, '<br/>')}
              </div>
              <br/><hr style="border: 0.5px solid #eee; margin-top: 30px;"/>
          </div>
      `;
    const opt = { margin: 0.5, filename: filename + '.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
    html2pdf().from(element).set(opt).save();
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') text = JSON.stringify(text);

    const docRegex = /\[DOCUMENT_START\]([\s\S]*?)\[DOCUMENT_END\]/i;
    const docMatch = text.match(docRegex);
    if (docMatch) {
      const pureContent = docMatch[1].trim();
      const parts = text.split(docMatch[0]);
      return (
        <>
          {parts[0] && <span style={{ whiteSpace: 'pre-wrap' }}>{parts[0]}</span>}
          <div style={{ backgroundColor: '#1e1e26', border: '1px solid #4a90e2', borderRadius: '8px', padding: '10px', margin: '10px 0' }}>
            <div style={{ fontWeight: 'bold', color: '#4a90e2', marginBottom: '5px' }}>📄 Đã tạo Tóm tắt / Đề cương</div>
            <button onClick={() => handleDownloadPDF(pureContent, 'Tai-Lieu-Thu-Vien')} style={{ background: '#4a90e2', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Download size={14} /> Tải xuống PDF
            </button>
          </div>
          {parts[1] && <span style={{ whiteSpace: 'pre-wrap' }}>{parts[1]}</span>}
        </>
      );
    }

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
    return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
    backgroundColor: "rgba(45, 45, 58, 0.5)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "15px",
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.05)",
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
    backgroundColor: "var(--accent-color)",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease"
  };
  const cardStyle = {
    backgroundColor: "#252530",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "28px", marginBottom: "25px", color: "var(--text-primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
        <Library color="var(--accent-color)" size={32} /> Thư viện số VKU
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
        <button style={buttonStyle} onClick={handleSearch} className="search-btn-hover">
          <Search size={18} /> Tìm kiếm
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
              <div key={file.id} style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }} className="library-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: 'rgba(74, 144, 226, 0.1)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} color="#4a90e2" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "15px", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', flex: 1 }} title={file.fileName}>
                    {file.fileName}
                  </h3>
                </div>
                <p
                  style={{
                    color: "#888",
                    fontSize: "12px",
                    marginBottom: "20px",
                    paddingLeft: "44px"
                  }}
                >
                  Đăng ngày: {new Date(file.uploadDate).toLocaleDateString()}
                </p>

                {/* Wrapper chứa nút bấm, sử dụng margin-top: auto để đẩy xuống đáy */}
                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <button
                    className="btn-action-view"
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      backgroundColor: "rgba(80, 250, 123, 0.1)",
                      color: "#50fa7b",
                      border: "1px solid rgba(80, 250, 123, 0.2)",
                      fontSize: "13px",
                      justifyContent: "center",
                      padding: "8px 10px"
                    }}
                    onClick={() => setSelectedFile(file)}
                  >
                    <Eye size={16} /> Xem
                  </button>
                  <button
                    className="btn-action-download"
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      backgroundColor: "rgba(255, 107, 107, 0.1)",
                      color: "#ff6b6b",
                      border: "1px solid rgba(255, 107, 107, 0.2)",
                      fontSize: "13px",
                      justifyContent: "center",
                      padding: "8px 10px"
                    }}
                    onClick={() => downloadFile(file.id, file.fileName)}
                  >
                    <Download size={16} /> Tải
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
        onDragOver={handleChatDragOver}
        onDragLeave={handleChatDragLeave}
        onDrop={handleChatDrop}
        style={{ position: "fixed", bottom: 20, right: 30, left: 280, backgroundColor: "rgba(30, 30, 38, 0.95)", backdropFilter: "blur(20px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", boxShadow: "0 -10px 40px rgba(0,0,0,0.5)", height: isChatExpanded ? "85vh" : "280px", zIndex: 100, transition: "height 0.3s ease", overflow: "hidden" }}
      >
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 101, cursor: 'pointer', color: '#888' }} onClick={() => setIsChatExpanded(!isChatExpanded)}>
          {isChatExpanded ? <Minimize2 size={20} color="#ff6b6b" /> : <Maximize2 size={20} color="#4a90e2" />}
        </div>

        {isDraggingChat && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(74, 144, 226, 0.15)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            border: '3px dashed #4a90e2', borderRadius: '15px',
            backdropFilter: 'blur(2px)'
          }}>
            <h3 style={{ color: '#4a90e2', pointerEvents: 'none' }}>📸 Thả file/ảnh vào đây</h3>
          </div>
        )}

        <div style={{ flex: 1, padding: "20px 15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
              {msg.sender === "ai" && <Bot size={24} color="#4a90e2" />}
              <div style={{ backgroundColor: msg.sender === "user" ? "var(--accent-color)" : "#2d2d3a", color: msg.sender === "user" ? "#000" : "#fff", padding: "12px 18px", borderRadius: "18px", borderBottomRightRadius: msg.sender === "user" ? "4px" : "18px", borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "18px", maxWidth: "85%", fontSize: "14px", lineHeight: "1.5", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                {msg.file && (
                  <div style={{ marginBottom: msg.text ? '10px' : '0' }}>
                    {msg.file.isImage ? (
                      <img src={msg.file.data} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '250px', objectFit: 'contain' }} />
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
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <Bot size={24} color="#4a90e2" />
              <div style={{ color: "#888", fontSize: "13px" }}>AI Navigator đang suy nghĩ...</div>
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
          <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.3)", alignItems: "flex-end", gap: "5px" }}>
            <label style={{ cursor: 'pointer', padding: '10px', color: '#4a90e2', display: 'flex', alignItems: 'center' }} title="Đính kèm tài liệu/ảnh">
              <Camera size={18} />
              <input type="file" hidden onChange={handleFileSelect} disabled={isChatting} />
            </label>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Ctrl+V dán ảnh hoặc nhập yêu cầu... (Shift+Enter để xuống dòng)"
              style={{ flex: 1, backgroundColor: "transparent", border: "none", color: "#fff", outline: "none", padding: "10px", resize: "none", height: isChatExpanded ? "80px" : "40px", fontFamily: "inherit", transition: "height 0.3s ease" }}
              disabled={isChatting}
            />
            <button type="submit" disabled={isChatting || (!chatInput.trim() && !attachedFile)} style={{ backgroundColor: "#4a90e2", border: "none", borderRadius: "50%", minWidth: "40px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", opacity: isChatting || (!chatInput.trim() && !attachedFile) ? 0.5 : 1 }}>
              <Send size={18} color="#fff" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DigitalLibrary;
