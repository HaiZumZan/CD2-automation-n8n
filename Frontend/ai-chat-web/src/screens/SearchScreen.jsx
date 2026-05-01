import React, { useState, useEffect } from 'react';
import { getFiles, deleteFile, downloadFile } from '../services/fileService'; // Thêm downloadFile
import { Trash2, FileText, Loader2, Info, Download, Search } from 'lucide-react'; // Thêm icon

const SearchScreen = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list');
    const [searchTerm, setSearchTerm] = useState(""); // 1. State lưu từ khóa tìm kiếm

    useEffect(() => { loadFiles(); }, []);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await getFiles();
            setFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách file:", err);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa file này AI sẽ mất kiến thức liên quan?")) return;
        try {
            await deleteFile(id);
            setFiles(f => f.filter(item => item.id !== id));
        } catch (err) {
            alert("Lỗi khi xóa file!");
        }
    };

    // 2. Logic tải file về máy
    const handleDownload = async (id, fileName) => {
        try {
            await downloadFile(id, fileName);
        } catch (err) {
            alert("Lỗi khi tải file!");
        }
    };

    // 3. Logic lọc file theo tên (Dùng cho cả 2 view)
    const filteredFiles = files.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hàm render bảng dữ liệu (tách ra để dùng chung cho 2 tab)
    const renderTable = (data) => (
        <table className="custom-table">
            <thead>
                <tr>
                    <th>Tên file</th>
                    <th>Chủ sở hữu</th>
                    <th>Ngày tải</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map(file => (
                        <tr key={file.id}>
                            <td>
                                <div className="file-name-cell">
                                    <FileText size={16} /> 
                                    <span>{file.fileName}</span>
                                </div>
                            </td>
                            <td>{file.ownerUsername}</td>
                            <td>{new Date(file.uploadDate).toLocaleDateString('vi-VN')}</td>
                            <td className="actions-cell">
                                {/* Nút Tải về */}
                                <button 
                                    onClick={() => handleDownload(file.id, file.fileName)} 
                                    className="download-btn" 
                                    title="Tải về máy"
                                >
                                    <Download size={18} />
                                </button>
                                {/* Nút Xóa */}
                                <button 
                                    onClick={() => handleDelete(file.id)} 
                                    className="delete-btn" 
                                    title="Xóa file"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="empty-row">
                            <Info size={16} /> Không tìm thấy tài liệu nào.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    return (
        <div className="search-screen-container">
            <div className="search-header">
                <h2>Knowledge Management</h2>
                <div className="tab-buttons">
                    <button 
                        onClick={() => { setView('list'); setSearchTerm(""); }} 
                        className={view === 'list' ? 'active' : ''}
                    >
                        Danh sách file
                    </button>
                    <button 
                        onClick={() => setView('search')} 
                        className={view === 'search' ? 'active' : ''}
                    >
                        Tìm kiếm sâu
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Đang tải dữ liệu từ bộ não AI...</p>
                </div>
            ) : (
                view === 'list' ? (
                    renderTable(files) // View danh sách: hiện tất cả
                ) : (
                    <div className="search-input-area">
                        <div className="search-bar-container">
                            <Search className="search-icon" size={20} />
                            <input 
                                type="text" 
                                placeholder="Nhập tên file cần tìm kiếm..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật từ khóa
                                autoFocus
                            />
                        </div>
                        <div className="search-results-area">
                            {/* Khi có từ khóa mới hiện bảng kết quả */}
                            {searchTerm && renderTable(filteredFiles)}
                            {!searchTerm && (
                                <div className="search-placeholder">
                                    <p>Nhập tên tài liệu để bắt đầu tìm kiếm nhanh.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default SearchScreen;