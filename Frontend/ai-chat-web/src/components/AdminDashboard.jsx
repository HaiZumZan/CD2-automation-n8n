import React, { useState } from 'react';
import { uploadFile } from '../services/fileService'; 
// Nhớ kiểm tra lại đường dẫn fileService cho đúng nhé

const AdminDashboard = () => {
    const [file, setFile] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Dữ liệu cây thư mục (Dùng chung với Thư viện số)
    const dataStructure = {
        "Khoa Công nghệ thông tin": {
            "Công nghệ phần mềm": ["Lập trình Java", "Cấu trúc dữ liệu", "Cơ sở dữ liệu"],
            "Trí tuệ nhân tạo": ["Machine Learning", "Python cơ bản"]
        },
        "Khoa Kinh tế số": {
            "Quản trị kinh doanh": ["Marketing cơ bản", "Kinh tế vi mô"]
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault(); // Ngăn load lại trang
        
        if (!file || !selectedFaculty || !selectedMajor || !selectedSubject) {
            alert("⚠️ Vui lòng chọn file và điền đầy đủ Khoa/Ngành/Môn!");
            return;
        }

        setIsUploading(true);
        try {
            // Gọi hàm uploadFile, truyền true cho tham số isGlobal (vì đây là tài liệu chung)
            await uploadFile(file, true, selectedFaculty, selectedMajor, selectedSubject);
            alert("✅ Tải lên thành công! AI đang xử lý tự động.");
            
            // Reset form sau khi upload xong
            setFile(null);
            setSelectedSubject('');
            // Bạn có thể giữ nguyên Khoa/Ngành để Admin tiện up nhiều file cùng lúc
        } catch (error) {
            console.error("Lỗi upload:", error);
            alert("❌ Có lỗi xảy ra khi tải tài liệu lên.");
        } finally {
            setIsUploading(false);
        }
    };

    // --- STYLE CHO DARK MODE ---
    const containerStyle = { padding: '30px', color: '#fff', maxWidth: '800px', margin: '0 auto' };
    const formStyle = { backgroundColor: '#2d2d3a', padding: '30px', borderRadius: '10px', border: '1px solid #444', display: 'flex', flexDirection: 'column', gap: '20px' };
    const labelStyle = { fontWeight: 'bold', marginBottom: '5px', display: 'block', color: '#4dd0e1' };
    const selectStyle = { width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e26', color: '#fff', border: '1px solid #555', outline: 'none' };
    const fileInputStyle = { width: '100%', padding: '10px', backgroundColor: '#1e1e26', border: '1px dashed #4a90e2', borderRadius: '5px', color: '#fff' };
    const buttonStyle = { backgroundColor: isUploading ? '#555' : '#4a90e2', color: 'white', padding: '15px', borderRadius: '5px', border: 'none', cursor: isUploading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#ff6b6b' }}>⚙️ Quản trị hệ thống (Admin)</h1>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Khu vực đăng tải tài liệu chung cho toàn bộ sinh viên VKU.</p>

            <form onSubmit={handleUpload} style={formStyle}>
                
                {/* CHỌN FILE */}
                <div>
                    <label style={labelStyle}>1. Chọn tài liệu PDF</label>
                    <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={fileInputStyle}
                    />
                    {file && <p style={{ fontSize: '12px', color: '#4dd0e1', marginTop: '5px' }}>Đã chọn: {file.name}</p>}
                </div>

                {/* BỘ LỌC PHÂN LOẠI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Khoa</label>
                        <select style={selectStyle} value={selectedFaculty} onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedMajor(''); setSelectedSubject(''); }}>
                            <option value="">-- Chọn Khoa --</option>
                            {Object.keys(dataStructure).map(fac => <option key={fac} value={fac}>{fac}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Ngành</label>
                        <select style={selectStyle} value={selectedMajor} onChange={(e) => { setSelectedMajor(e.target.value); setSelectedSubject(''); }} disabled={!selectedFaculty}>
                            <option value="">-- Chọn Ngành --</option>
                            {selectedFaculty && Object.keys(dataStructure[selectedFaculty]).map(maj => <option key={maj} value={maj}>{maj}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Môn học</label>
                        <select style={selectStyle} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedMajor}>
                            <option value="">-- Chọn Môn --</option>
                            {selectedMajor && dataStructure[selectedFaculty][selectedMajor].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>
                </div>

                {/* NÚT SUBMIT */}
                <button type="submit" style={buttonStyle} disabled={isUploading}>
                    {isUploading ? '⏳ Đang tải lên và cấu hình AI...' : '🚀 Tải tài liệu lên Thư viện'}
                </button>

            </form>
        </div>
    );
};

export default AdminDashboard;