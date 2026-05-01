import React, { useState, useEffect } from "react";
import {
  getComments,
  postComment,
  getFilePreviewUrl,
} from "../services/fileService";

const DocumentModal = ({ file, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);

  // ĐÃ DỌN DẸP: Chỉ giữ lại 1 useEffect gọi cả 2 hàm
  useEffect(() => {
    fetchComments();
    loadPdf();
  }, [file.id]);

  const loadPdf = async () => {
    try {
      const url = await getFilePreviewUrl(file.id);
      setPdfUrl(url);
    } catch (error) {
      console.error("Lỗi tải file xem trước:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getComments(file.id);
      setComments(data);
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await postComment(file.id, newComment);
      setNewComment("");
      fetchComments();
    } catch (error) {
      alert("Lỗi khi gửi bình luận!");
    }
  };

  // --- STYLE ---
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };
  const modalStyle = {
    backgroundColor: "#1e1e26",
    width: "90%",
    height: "90%",
    borderRadius: "10px",
    display: "flex",
    overflow: "hidden",
    border: "1px solid #444",
  };
  const pdfSectionStyle = {
    flex: 7,
    backgroundColor: "#2d2d3a",
    borderRight: "1px solid #444",
    display: "flex",
    flexDirection: "column",
  };
  const chatSectionStyle = {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1e1e26",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* --- NỬA TRÁI: KHUNG XEM PDF --- */}
        <div style={pdfSectionStyle}>
          <div
            style={{
              padding: "15px",
              backgroundColor: "#2d2d3a",
              borderBottom: "1px solid #444",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>
              📄 {file.fileName}
            </h2>
            <button
              onClick={onClose}
              style={{
                color: "#ff6b6b",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              ✖ Đóng
            </button>
          </div>
          <div style={{ flex: 1, width: "100%", height: "100%" }}>
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#view=FitH`}
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                title="Trình xem PDF"
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#888",
                }}
              >
                <p>⏳ Đang tải nội dung tài liệu...</p>
              </div>
            )}
          </div>
        </div>

        {/* --- NỬA PHẢI: KHUNG AI & BÌNH LUẬN --- */}
        <div style={chatSectionStyle}>
          {/* 1. KHU VỰC HIỂN THỊ AI TÓM TẮT */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #444",
              backgroundColor: "#252530",
            }}
          >
            <h3
              style={{
                color: "#ffb86c",
                margin: "0 0 10px 0",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ✨ AI Tóm tắt tài liệu
            </h3>
            {file.summary ? (
              <>
                <p
                  style={{
                    color: "#e0e0e0",
                    fontSize: "14px",
                    margin: "0 0 15px 0",
                    lineHeight: "1.6",
                    textAlign: "justify",
                  }}
                >
                  {file.summary}
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {file.keywords &&
                    file.keywords.split(",").map((kw, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: "#4a90e220",
                          color: "#4dd0e1",
                          padding: "5px 10px",
                          borderRadius: "15px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e150",
                          fontWeight: "bold",
                        }}
                      >
                        🏷️ {kw.trim()}
                      </span>
                    ))}
                </div>
              </>
            ) : (
              <p
                style={{
                  color: "#888",
                  fontSize: "14px",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                ⏳ AI đang đọc và phân tích tài liệu này... (Hãy tải lại trang
                sau ít phút)
              </p>
            )}
          </div>

          {/* 2. KHU VỰC BÌNH LUẬN (Đã dọn dẹp) */}
          <div style={{ padding: "15px", borderBottom: "1px solid #444" }}>
            <h3 style={{ color: "#4a90e2", margin: 0, fontSize: "16px" }}>
              💬 Thảo luận
            </h3>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {loading ? (
              <p style={{ color: "#aaa" }}>Đang tải...</p>
            ) : comments.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center" }}>
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            ) : (
              comments.map((cmt) => (
                <div
                  key={cmt.id}
                  style={{
                    backgroundColor: "#2d2d3a",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <strong style={{ color: "#4dd0e1", fontSize: "14px" }}>
                      👤 {cmt.username}
                    </strong>
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      {new Date(cmt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#ddd",
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    {cmt.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #444",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
              placeholder="Nhập ý kiến của bạn..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #444",
                backgroundColor: "#2d2d3a",
                color: "#fff",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendComment}
              style={{
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                padding: "0 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
