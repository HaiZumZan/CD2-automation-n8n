import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatScreen from './screens/ChatScreen';
import SearchScreen from './screens/SearchScreen';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './components/AdminDashboard';

// IMPORT ĐÚNG TỪ THƯ MỤC COMPONENTS
import DigitalLibrary from './components/DigitalLibrary'; 

function App() {
  const { token, logout, user } = useContext(AuthContext);
  
  // Tab mặc định khi mở app lên là thư viện
  const [activeTab, setActiveTab] = useState('library');

  if (!token) return <LoginScreen />;

  return (
    <div className="main-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={logout} 
      />
      
      <div className="content-area">
        {activeTab === 'library' && <DigitalLibrary />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'search' && <SearchScreen isAdmin={false} />}
{activeTab === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
}

export default App;