import React, { useState } from 'react';
import { Paperclip, CheckCircle, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/fileService';

const FilePicker = () => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadFile(file);
            alert("Upload và học tài liệu thành công!");
        } catch (err) {
            alert("Lỗi upload: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-picker">
            <label style={{ cursor: 'pointer' }}>
                {uploading ? <Loader2 className="animate-spin" /> : <Paperclip size={24} />}
                <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
            </label>
        </div>
    );
};
export default FilePicker;