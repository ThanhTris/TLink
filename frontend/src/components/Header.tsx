import React, { useState, useRef } from "react";
import SearchBar from "./SearchBar";
import Button from "./Button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login');
  };
  const handleRegister = () => {
    navigate('/register');
  };

  // Đóng menu khi click ra ngoài
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  return (
    <header className="flex flex-row fixed top-0 left-0 right-0 p-4 h-16 items-center bg-white border-b border-black/10 shadow-md z-50">
      <h1 className="text-xl font-bold">ForumTech</h1>
      <SearchBar />
      <div className="flex items-center justify-around min-w-70 ml-auto ">
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 focus:outline-none cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
              onClick={() => setOpenMenu((v) => !v)}
            >
              <img
                src="https://tse3.mm.bing.net/th/id/OIP.cVIjZO1CHBYfqIB04Kb9LgHaFj?w=1400&h=1050&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-lg">{username}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {openMenu && (
              <div className="absolute left-0 mt-2 w-55 bg-white rounded-xl shadow-lg py-2 z-50">
                <a
                  href="/my-posts"
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Bài viết của tôi
                </a>
                <a
                  href="/settings"
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Cài đặt
                </a>
                <a
                  href="/change-password"
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Đổi mật khẩu
                </a>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  onClick={handleLogin}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <> 
            <Button className="bg-blue-100 text-blue-600 font-medium px-6 py-2.5 rounded-full shadow-none hover:bg-blue-200 transition"
              onClick={handleRegister}>
              Đăng ký
            </Button>
            <Button className="bg-blue-500 text-white font-medium px-6 py-2.5 rounded-full shadow-none hover:bg-blue-600 transition"
              onClick={handleLogin}>
              Đăng nhập
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;