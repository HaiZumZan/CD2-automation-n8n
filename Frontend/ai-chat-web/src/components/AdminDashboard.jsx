import React, { useState, useEffect } from "react";
import { uploadFile, getFiles, deleteFile } from "../services/fileService";
import { getChatHistory } from "../services/chatService";
import { getAllUsers, toggleUserLock } from "../services/adminService";
import {
  Users,
  FileText,
  Activity,
  Trash2,
  Shield,
  Lock,
  Unlock,
  UploadCloud,
  MessageSquare,
  Database,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");

  // --- CÁC STATE LƯU TRỮ DỮ LIỆU THẬT ---
  const [files, setFiles] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // State cho phần Upload
  const [file, setFile] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  // --- EFFECT LẤY DỮ LIỆU KHI CHUYỂN TAB ---
  useEffect(() => {
    fetchData();
  }, [activeAdminTab]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      if (activeAdminTab === "dashboard") {
        const data = await getFiles();
        setFiles(data || []);
      } else if (activeAdminTab === "ai-monitor") {
        const data = await getChatHistory();
        setChatLogs(data || []);
      } else if (activeAdminTab === "users") {
        const data = await getAllUsers();
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Lỗi khi fetch data admin:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- HÀM XỬ LÝ (ACTIONS) ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedFaculty || !selectedMajor || !selectedSubject) {
      alert("⚠️ Vui lòng chọn file và điền đầy đủ thông tin!");
      return;
    }
    setIsUploading(true);
    try {
      await uploadFile(
        file,
        true,
        selectedFaculty,
        selectedMajor,
        selectedSubject,
      );
      alert("✅ Tải lên thành công! AI đang xử lý tự động.");
      setFile(null);
      setSelectedSubject("");
      setActiveAdminTab("dashboard");
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi tải tài liệu lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (
      window.confirm(
        "⚠️ Bạn có chắc chắn muốn xóa file này? Dữ liệu AI tương ứng trên n8n cũng sẽ bị xóa vĩnh viễn!",
      )
    ) {
      try {
        await deleteFile(id);
        // Cập nhật lại danh sách ngay lập tức mà không cần load lại trang
        setFiles(files.filter((f) => f.id !== id));
        alert("✅ Xóa thành công!");
      } catch (error) {
        alert("❌ Lỗi khi xóa file. Vui lòng kiểm tra lại kết nối n8n.");
      }
    }
  };
  // Thêm hàm này ngay dưới hàm handleDeleteFile
  const handleToggleLock = async (username) => {
    if (
      window.confirm(
        `Bạn có chắc muốn thay đổi trạng thái hoạt động của tài khoản: ${username}?`,
      )
    ) {
      try {
        await toggleUserLock(username); // Gọi API từ adminService.jsx
        alert("✅ Cập nhật trạng thái thành công!");
        // Tải lại danh sách user mới nhất
        const data = await getAllUsers();
        setUsers(data || []);
      } catch (error) {
        alert(
          "❌ " + (error.response?.data?.error || "Lỗi khi khóa tài khoản."),
        );
      }
    }
  };
  // --- STYLE CHUNG ---
  const containerStyle = {
    padding: "30px",
    color: "#fff",
    height: "100%",
    overflowY: "auto",
  };
  const cardStyle = {
    backgroundColor: "#2d2d3a",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #444",
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

  const renderTabs = () => (
    <div
      style={{
        display: "flex",
        gap: "15px",
        marginBottom: "30px",
        borderBottom: "1px solid #444",
        paddingBottom: "15px",
      }}
    >
      <button
        onClick={() => setActiveAdminTab("dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          backgroundColor:
            activeAdminTab === "dashboard" ? "#4a90e2" : "transparent",
          color: activeAdminTab === "dashboard" ? "#fff" : "#888",
        }}
      >
        <Database size={18} /> Quản lý Kho Dữ liệu
      </button>
      <button
        onClick={() => setActiveAdminTab("upload")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          backgroundColor:
            activeAdminTab === "upload" ? "#4a90e2" : "transparent",
          color: activeAdminTab === "upload" ? "#fff" : "#888",
        }}
      >
        <UploadCloud size={18} /> Tải lên Tài liệu
      </button>
      <button
        onClick={() => setActiveAdminTab("ai-monitor")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          backgroundColor:
            activeAdminTab === "ai-monitor" ? "#4a90e2" : "transparent",
          color: activeAdminTab === "ai-monitor" ? "#fff" : "#888",
        }}
      >
        <MessageSquare size={18} /> Giám sát AI Chat
      </button>
      <button
        onClick={() => setActiveAdminTab("users")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          backgroundColor:
            activeAdminTab === "users" ? "#4a90e2" : "transparent",
          color: activeAdminTab === "users" ? "#fff" : "#888",
        }}
      >
        <Users size={18} /> Quản lý Người dùng
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ fontSize: "28px", color: "#ff6b6b", margin: "0 0 10px 0" }}
        >
          ⚙️ Trung tâm Quản trị VKU KMS
        </h1>
      </div>

      {renderTabs()}

      {isLoadingData && activeAdminTab !== "upload" ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>
          ⏳ Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* TAB 1: KHO DỮ LIỆU */}
          {activeAdminTab === "dashboard" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                <div
                  style={{
                    ...cardStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#ffb86c20",
                      padding: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <FileText size={28} color="#ffb86c" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                      Tổng Tài Liệu
                    </h3>
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {files.length}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    ...cardStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#50fa7b20",
                      padding: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <Activity size={28} color="#50fa7b" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                      Trạng thái AI (n8n)
                    </h3>
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#50fa7b",
                      }}
                    >
                      Hoạt động
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#252530" }}>
                      <th style={tableHeaderStyle}>TÊN FILE</th>
                      <th style={tableHeaderStyle}>KHOA/NGÀNH</th>
                      <th style={tableHeaderStyle}>NGƯỜI ĐĂNG</th>
                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                        HÀNH ĐỘNG
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.id}>
                        <td style={{ ...tableCellStyle, color: "#ddd" }}>
                          {f.fileName || f.name}
                        </td>
                        <td
                          style={{
                            ...tableCellStyle,
                            fontSize: "14px",
                            color: "#aaa",
                          }}
                        >
                          {f.faculty} / {f.major}
                        </td>
                        <td style={{ ...tableCellStyle, color: "#4dd0e1" }}>
                          {f.ownerUsername || "admin"}
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ff6b6b",
                              cursor: "pointer",
                            }}
                            title="Xóa tài liệu"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD (Giữ nguyên) */}
          {activeAdminTab === "upload" && (
            <div style={{ maxWidth: "800px" }}>
              <form onSubmit={handleUpload} style={cardStyle}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      fontWeight: "bold",
                      marginBottom: "5px",
                      display: "block",
                      color: "#4dd0e1",
                    }}
                  >
                    1. Chọn tài liệu PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#1e1e26",
                      border: "1px dashed #4a90e2",
                      borderRadius: "5px",
                      color: "#fff",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: "bold",
                        marginBottom: "5px",
                        display: "block",
                        color: "#4dd0e1",
                      }}
                    >
                      Khoa
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "5px",
                        backgroundColor: "#1e1e26",
                        color: "#fff",
                        border: "1px solid #555",
                        outline: "none",
                      }}
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
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: "bold",
                        marginBottom: "5px",
                        display: "block",
                        color: "#4dd0e1",
                      }}
                    >
                      Ngành
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "5px",
                        backgroundColor: "#1e1e26",
                        color: "#fff",
                        border: "1px solid #555",
                        outline: "none",
                      }}
                      value={selectedMajor}
                      onChange={(e) => {
                        setSelectedMajor(e.target.value);
                        setSelectedSubject("");
                      }}
                      disabled={!selectedFaculty}
                    >
                      <option value="">-- Chọn Ngành --</option>
                      {selectedFaculty &&
                        Object.keys(dataStructure[selectedFaculty]).map(
                          (maj) => (
                            <option key={maj} value={maj}>
                              {maj}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: "bold",
                        marginBottom: "5px",
                        display: "block",
                        color: "#4dd0e1",
                      }}
                    >
                      Môn học
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "5px",
                        backgroundColor: "#1e1e26",
                        color: "#fff",
                        border: "1px solid #555",
                        outline: "none",
                      }}
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={!selectedMajor}
                    >
                      <option value="">-- Chọn Môn --</option>
                      {selectedMajor &&
                        dataStructure[selectedFaculty][selectedMajor].map(
                          (sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    width: "100%",
                    backgroundColor: isUploading ? "#555" : "#4a90e2",
                    color: "white",
                    padding: "15px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {" "}
                  {isUploading
                    ? "⏳ Đang tải lên và cấu hình AI..."
                    : "🚀 Tải tài liệu lên Thư viện"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: GIÁM SÁT AI */}
          {activeAdminTab === "ai-monitor" && (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#252530" }}>
                    <th style={{ ...tableHeaderStyle, width: "15%" }}>
                      NGƯỜI HỎI
                    </th>
                    <th style={{ ...tableHeaderStyle, width: "35%" }}>
                      CÂU HỎI
                    </th>
                    <th style={{ ...tableHeaderStyle, width: "50%" }}>
                      AI TRẢ LỜI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chatLogs.map((log, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          ...tableCellStyle,
                          color: "#4dd0e1",
                          fontWeight: "bold",
                        }}
                      >
                        {log.username}
                      </td>
                      <td style={{ ...tableCellStyle, color: "#ddd" }}>
                        {log.studentMessage}{" "}
                        {/* Đã sửa lại cho khớp với Java */}
                      </td>
                      <td
                        style={{
                          ...tableCellStyle,
                          color: "#aaa",
                          fontStyle: "italic",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "300px",
                        }}
                      >
                        {log.aiResponse}
                      </td>
                    </tr>
                  ))}
                  {chatLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#888",
                        }}
                      >
                        Chưa có dữ liệu chat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* TAB 4: QUẢN LÝ NGƯỜI DÙNG */}
              {activeAdminTab === "users" && (
                <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      padding: "20px",
                      borderBottom: "1px solid #444",
                      backgroundColor: "#1e1e26",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: "16px" }}>
                      👥 Danh sách Tài khoản
                    </h2>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#252530" }}>
                        <th style={tableHeaderStyle}>USERNAME</th>
                        <th style={tableHeaderStyle}>QUYỀN (ROLE)</th>
                        <th style={tableHeaderStyle}>TRẠNG THÁI</th>
                        <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                          HÀNH ĐỘNG
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id || u.username}>
                          <td
                            style={{
                              ...tableCellStyle,
                              color: "#fff",
                              fontWeight: "bold",
                            }}
                          >
                            {u.username}
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                backgroundColor: u.role?.includes("ADMIN")
                                  ? "#ffb86c20"
                                  : "#4a90e220",
                                color: u.role?.includes("ADMIN")
                                  ? "#ffb86c"
                                  : "#4a90e2",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {u.role || "USER"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                color:
                                  u.enabled !== false ? "#50fa7b" : "#ff6b6b",
                              }}
                            >
                              {u.enabled !== false ? "Hoạt động" : "Đã bị khóa"}
                            </span>
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: "right" }}>
                            {u.role?.includes("ADMIN") ? (
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#888",
                                  cursor: "not-allowed",
                                }}
                                title="Không thể khóa Admin"
                              >
                                <Shield size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleLock(u.username)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color:
                                    u.enabled !== false ? "#ffb86c" : "#50fa7b",
                                  cursor: "pointer",
                                }}
                                title={
                                  u.enabled !== false
                                    ? "Khóa tài khoản"
                                    : "Mở khóa tài khoản"
                                }
                              >
                                {u.enabled !== false ? (
                                  <Lock size={18} />
                                ) : (
                                  <Unlock size={18} />
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            style={{
                              textAlign: "center",
                              padding: "20px",
                              color: "#888",
                            }}
                          >
                            Chưa có dữ liệu người dùng.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
