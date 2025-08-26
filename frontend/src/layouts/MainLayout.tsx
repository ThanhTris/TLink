import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  hideLayout?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideLayout = false }) => {
  if (hideLayout) return <>{children}</>;

  // Lấy user từ localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!user;
  const username =
    user?.fullname ||
    user?.name ||
    user?.emailOrPhone ||
    "Khách";
  const avatar =
    user?.avatar ||
    "https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3";

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} username={username} avatar={avatar} />
      <div className="flex flex-1 w-full">
        <Sidebar />
        {/* Thêm sidebar gợi ý bên phải, tách khỏi main content */}
        <main className="flex-1 ml-64 mr-70 mt-16 flex flex-row gap-8">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;