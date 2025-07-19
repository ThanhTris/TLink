import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout"; 
import Home from "./pages/Home"; 
import Forum from "./pages/Forum"; 
import Login from "./pages/Login"; 
import Register from "./pages/Register"; 
import VerifyEmail from "./pages/VerifyEmail";


const App: React.FC = () => {
  return (
    <Routes>
      {/* Các trang có header và sidebar (hideLayout mặc định là false) */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/forum" element={<MainLayout><Forum /></MainLayout>} />
      
      {/* Trang Login không có header và sidebar (hideLayout = true) */}
      <Route path="/login" element={<MainLayout hideLayout={true}><Login /></MainLayout>} />
      <Route path="/register" element={<MainLayout hideLayout={true}><Register /></MainLayout>} />
      <Route path="/register/verify-email" element={<MainLayout hideLayout={true}><VerifyEmail /></MainLayout>} />

      {/* <Route path="/register" element={<MainLayout hideLayout={true}><Register /></MainLayout>} /> */}
      {/* Thêm các route khác nếu cần */}
    </Routes>
  );
};

export default App;