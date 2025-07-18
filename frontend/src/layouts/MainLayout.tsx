import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';


interface LayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} username="Nguyen Thanh Trí" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;