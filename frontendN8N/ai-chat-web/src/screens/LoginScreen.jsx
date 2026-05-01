import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { LogIn, Loader2 } from 'lucide-react';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const data = await loginUser(username, password);
            console.log("Dữ liệu nhận được từ Java:", data); 

            if (data.token) {
                // SỬA Ở ĐÂY: Truyền CẢ token VÀ toàn bộ cục data (chứa role) vào
                login(data.token, data); 
            } else {
                setError("Phản hồi từ Server không có token!");
            }
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <LogIn size={48} color="var(--accent-color)" />
                <h2>Đăng nhập</h2>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <input 
                            type="text" 
                            placeholder="Tên đăng nhập" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="login-input-group">
                        <input 
                            type="password" 
                            placeholder="Mật khẩu" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {error && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem' }}>{error}</p>}
                    
                    <button type="submit" className="btn-login" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Đăng nhập ngay'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;