import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout"; 
import Home from "./pages/Home"; // Tạo file Home.tsx sau
import Forum from "./pages/Forum"; // Tạo file Forum.tsx sau

const App: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        {/* Thêm các route khác nếu cần */}
      </Routes>
    </MainLayout>
  );
};

export default App;
