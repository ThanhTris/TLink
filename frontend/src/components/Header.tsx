import React, { useState, useRef } from "react";
import SearchBar from "./SearchBar";
import Button from "./Button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  avatar?: string;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, avatar }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleLogin = () => {
    localStorage.removeItem("user"); // Xoá user khỏi localStorage khi đăng xuất
    setOpenMenu(false); // Đóng menu khi đăng xuất
    navigate('/auth/login');
  };
  const handleRegister = () => {
    navigate('/auth/register');
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
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center h-16 p-4 bg-white border-b shadow-md border-black/10">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        ForumTech
      </h1>
      <SearchBar />
      <div className="flex items-center justify-around ml-auto min-w-70 ">
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <Button
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-100"
              onClick={() => setOpenMenu((v) => !v)}
            >
              <img
                src={avatar}
                alt="User Avatar"
                className="object-cover w-8 h-8 rounded-full"
              />
              <span className="text-lg">{username}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {openMenu && (
              <div className="absolute left-0 z-50 py-2 mt-2 bg-white shadow-lg hover:cursor-pointer w-55 rounded-xl">
                <a
                  href="/user/my-posts"
                  className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                >
                  Bài viết của tôi
                </a>
                <a
                  href="/user/settings"
                  className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                >
                  Cài đặt
                </a>
                <a
                  href="/user/change-password"
                  className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                >
                  Đổi mật khẩu
                </a>
                <Button
                  className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogin}
                >
                  Đăng xuất
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button className="bg-blue-100 text-blue-600 font-medium px-6 py-2.5 rounded-full shadow-none hover:bg-blue-200  cursor-pointer transition"
              onClick={handleRegister}>
              Đăng ký
            </Button>
            <Button className="bg-blue-500 text-white font-medium px-6 py-2.5 rounded-full shadow-none hover:bg-blue-600 cursor-pointer transition"
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