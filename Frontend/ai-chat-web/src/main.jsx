import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // Nhớ thêm dòng này
import './index.css';
import './App.css'     // Import sau để đè lên các style cũ (nếu có)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bọc AuthProvider ở đây để App và các con của nó dùng được useContext */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);