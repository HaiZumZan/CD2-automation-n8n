import React, { useState } from 'react';
import { getLibraryFiles, downloadFile } from '../services/fileService'; 
import DocumentModal from './DocumentModal'; 
// (Chỉnh lại đường dẫn nếu Hoa để ở thư mục khác)

const DigitalLibrary = () => {
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    
    const [files, setFiles] = useState([
  
    ]);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // Lưu file đang được chọn để xem

    // Dữ liệu mẫu (Cây thư mục)
    const dataStructure = {
        "Khoa Công nghệ thông tin": {
            "Công nghệ phần mềm": ["Lập trình Java", "Cấu trúc dữ liệu", "Cơ sở dữ liệu"],
            "Trí tuệ nhân tạo": ["Machine Learning", "Python cơ bản"]
        },
        "Khoa Kinh tế số": {
            "Quản trị kinh doanh": ["Marketing cơ bản", "Kinh tế vi mô"]
        }
    };

    const handleSearch = async () => {
        if (!selectedFaculty || !selectedMajor || !selectedSubject) {
            alert("Vui lòng chọn đầy đủ Khoa, Ngành và Môn học!");
            return;
        }
        
        setLoading(true);
        try {
            const data = await getLibraryFiles(selectedFaculty, selectedMajor, selectedSubject);
            setFiles(data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            alert("Không thể tải tài liệu lúc này.");
        } finally {
            setLoading(false);
        }
    };

    // --- STYLE CHO DARK MODE ---
    const containerStyle = { padding: '30px', color: '#fff', width: '100%' };
    const filterBoxStyle = { backgroundColor: '#2d2d3a', padding: '20px', borderRadius: '10px', display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' };
    const selectStyle = { flex: 1, padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e26', color: '#fff', border: '1px solid #444', outline: 'none' };
    const buttonStyle = { backgroundColor: '#4a90e2', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
    const cardStyle = { backgroundColor: '#2d2d3a', padding: '20px', borderRadius: '10px', border: '1px solid #444' };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#4a90e2' }}>📚 Thư viện số VKU</h1>

            {/* BỘ LỌC */}
            <div style={filterBoxStyle}>
                <select style={selectStyle} value={selectedFaculty} onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedMajor(''); setSelectedSubject(''); }}>
                    <option value="">-- Chọn Khoa --</option>
                    {Object.keys(dataStructure).map(fac => <option key={fac} value={fac}>{fac}</option>)}
                </select>

                <select style={selectStyle} value={selectedMajor} onChange={(e) => { setSelectedMajor(e.target.value); setSelectedSubject(''); }} disabled={!selectedFaculty}>
                    <option value="">-- Chọn Ngành --</option>
                    {selectedFaculty && Object.keys(dataStructure[selectedFaculty]).map(maj => <option key={maj} value={maj}>{maj}</option>)}
                </select>

                <select style={selectStyle} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedMajor}>
                    <option value="">-- Chọn Môn học --</option>
                    {selectedMajor && dataStructure[selectedFaculty][selectedMajor].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>

                <button style={buttonStyle} onClick={handleSearch}>
                    🔍 Tìm kiếm
                </button>
            </div>

            {/* HIỂN THỊ KẾT QUẢ */}
            {loading ? (
                <p style={{ color: '#aaa' }}>Đang tải tài liệu...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {files.length > 0 ? files.map(file => (
                        <div key={file.id} style={cardStyle}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📄 {file.fileName}</h3>
                            <p style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }}>Đăng ngày: {new Date(file.uploadDate).toLocaleDateString()}</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
{/* Thay vì: onClick={() => alert(...)} */}
<button 
    style={{...buttonStyle, flex: 1, backgroundColor: '#2e7d32', fontSize: '12px'}} 
    onClick={() => setSelectedFile(file)}
>
    👁️ Xem
</button>                                <button style={{...buttonStyle, flex: 1, backgroundColor: '#d32f2f', fontSize: '12px'}} onClick={() => downloadFile(file.id, file.fileName)}>⬇️ Tải</button>
                            </div>
                        </div>
                    )) : (
                        <p style={{ color: '#aaa', gridColumn: '1 / -1', textAlign: 'center', marginTop: '50px' }}>Chưa có tài liệu nào cho môn học này.</p>
                    )}
                </div>
            )}
            {/* Nếu có file được chọn thì mới hiển thị Modal */}
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