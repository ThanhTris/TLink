import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';


interface LayoutProps {
  children: React.ReactNode;
  hideLayout?: boolean; // Thêm prop để xác định có ẩn layout hay không
}

const MainLayout: React.FC<LayoutProps> = ({ children, hideLayout = false }) => {
  if (hideLayout) {
    return <>{children}</>;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={false} username="Nguyen Thanh Trí" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 mt-16 ml-64">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;