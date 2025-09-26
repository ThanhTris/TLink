import React, { useState, useRef } from "react";
import SearchBar from "./SearchBar";
import Button from "./Button";
import { ChevronDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';


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
    localStorage.removeItem("user");
    setOpenMenu(false);
    navigate('/auth/login');
  };

  const handleRegister = () => navigate('/auth/register');

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

  const menuItems = [
    { href: "/user/my-posts", label: "Bài viết của tôi" },
    { href: "/user/settings", label: "Cài đặt" },
    { href: "/user/change-password", label: "Đổi mật khẩu" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between h-16 px-24 bg-header backdrop-filter backdrop-blur-[20px] shadow-md border-b border-white/25">
      <div className="flex items-center gap-6">
        <img
          src={logo}
          alt="ForumTech Logo"
          className="h-12 cursor-pointer"
          onClick={() => navigate("/")}
          // style={{ filter: "brightness(0) invert(1)" }} /* Logo màu trắng */
        />
        <SearchBar />
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <Button
              className="flex items-center gap-3 p-2 transition rounded-lg focus:outline-none hover-glass"
              onClick={() => setOpenMenu((v) => !v)}
            >
              <img
                src={avatar}
                alt="User Avatar"
                className="object-cover transition w-9 h-9 avatar-glass"
              />
              <span className="text-[color:var(--text-main)] font-medium text-base">{username}</span>
              <ChevronDown className="w-5 h-5 text-[color:var(--text-main)]" />
            </Button>
            {openMenu && (
              <div className="absolute left-0 z-50 py-3 mt-2 user-menu hover:cursor-pointer w-60">
                {menuItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block w-full px-4 py-2 text-left text-[color:var(--text-main)] font-medium hover:bg-white/20 hover:font-semibold rounded-lg transition"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  className="block w-full px-4 py-2 font-semibold text-left text-red-500 transition rounded-lg hover:bg-white/20"
                  onClick={handleLogin}
                >
                  Đăng xuất
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button
              className="bg-[rgba(255,255,255,0.15)] backdrop-blur-md border border-[rgba(255,255,255,0.3)] text-[color:var(--text-primary)] font-medium px-6 py-2.5 w-36 rounded-full shadow-2xl transition hover:bg-[var(--color-primary-blue)] hover:text-white"
              onClick={handleRegister}
            >
              Đăng ký
            </Button>
            <Button
              className="bg-[rgba(255,255,255,0.15)] backdrop-blur-md border border-[rgba(255,255,255,0.3)] text-[color:var(--color-primary-purple)] font-medium px-6 py-2.5 w-36 rounded-full shadow-2xl transition hover:bg-[var(--color-primary-purple)] hover:text-white"
              onClick={handleLogin}
            >
              Đăng nhập
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;