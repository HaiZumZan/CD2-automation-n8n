import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { LogIn, Loader2, GraduationCap } from 'lucide-react';

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
        <div className="login-container" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh',
            background: 'radial-gradient(circle at top right, #1a2333 0%, #0f1012 100%)',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Background decorations */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,144,226,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,180,248,0.08) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: 0 }}></div>

            <div className="login-card" style={{
                background: 'rgba(30, 31, 32, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '3rem 2.5rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(138, 180, 248, 0.05))',
                    borderRadius: '20px', padding: '15px', marginBottom: '1.5rem',
                    border: '1px solid rgba(138, 180, 248, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <GraduationCap size={48} color="var(--accent-color)" strokeWidth={1.5} />
                </div>
                
                <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', color: '#fff' }}>VKU KMS</h2>
                <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Knowledge Management System</p>
                
                <form onSubmit={handleSubmit} className="login-form" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div className="login-input-group" style={{ 
                        background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '0.8rem 1.2rem',
                        border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease'
                    }}>
                        <input 
                            type="text" 
                            placeholder="Tên đăng nhập" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }}
                        />
                    </div>
                    
                    <div className="login-input-group" style={{ 
                        background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '0.8rem 1.2rem',
                        border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease'
                    }}>
                        <input 
                            type="password" 
                            placeholder="Mật khẩu" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }}
                        />
                    </div>

                    {error && <div style={{ 
                        background: 'rgba(242, 139, 130, 0.1)', color: 'var(--error-color)', 
                        padding: '10px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid rgba(242, 139, 130, 0.2)' 
                    }}>{error}</div>}
                    
                    <button type="submit" className="btn-login" disabled={isSubmitting} style={{
                        background: 'linear-gradient(135deg, #4a90e2, #8ab4f8)',
                        color: '#000', padding: '1.1rem', borderRadius: '14px', border: 'none',
                        fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s ease',
                        marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(74, 144, 226, 0.3)'
                    }}>
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Đăng nhập ngay'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;