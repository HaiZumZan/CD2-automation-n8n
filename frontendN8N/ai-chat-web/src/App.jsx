import React, { useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ChatScreen from "./screens/ChatScreen";
// import SearchScreen from "./screens/SearchScreen"; // ❌ Bỏ dòng này đi
import LoginScreen from "./screens/LoginScreen";
import AdminDashboard from "./components/AdminDashboard";
import AIChatPage from "./components/AIChatPage";
import DigitalLibrary from "./components/DigitalLibrary";
import StudentDashboard from "./components/StudentDashboard"; // ✅ 1. THÊM DÒNG NÀY VÀO
import StudyAIScreen from './screens/StudyAIScreen'; // THÊM MỚI


function App() {
  const { token, logout, user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("library");

  if (!token) return <LoginScreen />;

  const isAdmin = user && (user.username === "admin" || user.role === "ADMIN");

  return (
    <div className="main-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={logout}
        isAdmin={isAdmin}
      />

      <div className="content-area">
        {activeTab === "library" && <DigitalLibrary />}

        {/* ✅ 2. SỬA DÒNG NÀY: Thay SearchScreen bằng StudentDashboard */}
        {activeTab === "search" && <StudentDashboard />}

        {activeTab === "ai-chat" && <AIChatPage />}
        {activeTab === "admin" && isAdmin && <AdminDashboard />}
        {activeTab === 'study' && <StudyAIScreen user={user} setActiveTab={setActiveTab} />} {/* THÊM MỚI */}
      </div>
    </div>
  );
}

export default App;
