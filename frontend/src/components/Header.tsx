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
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between h-16 px-24 bg-header backdrop-filter backdrop-blur-[20px] shadow-md">
      <div className="flex items-center gap-6">
        <img
          src={logo}
          alt="ForumTech Logo"
          className="h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <SearchBar />
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <Button
              className="glassmorphism flex items-center gap-4 p-2 rounded-lg cursor-pointer focus:outline-none hover:border-white/60 hover-glass transition"
              onClick={() => setOpenMenu((v) => !v)}
            >
              <img
                src={avatar}
                alt="User Avatar"
                className="object-cover w-10 h-10 avatar-glass transition"
              />
              <span className="text-[color:var(--text-main)] font-medium text-xl">{username}</span>
              <ChevronDown className="w-5 h-5 text-[color:var(--text-main)]" />
            </Button>
            {openMenu && (
              <div className="absolute left-0 z-50 py-3 mt-2 glassmorphism shadow-lg shadow-black/10 hover:cursor-pointer w-60 rounded-xl backdrop-filter backdrop-blur-md border border-white/20">
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
                  className="block w-full px-4 py-2 text-left text-[color:var(--color-accent-pink)] font-semibold hover:bg-white/20 rounded-lg transition cursor-pointer"
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
              className="glassmorphism font-medium px-6 py-2.5 w-34 rounded-full shadow-none hover-glass transition text-[color:var(--text-primary)] hover-text-primary"
              onClick={handleRegister}
            >
              Đăng ký
            </Button>
            <Button
              className="glassmorphism text-[color:rgba(255,255,255,0.7)] font-medium px-6 py-2.5 w-34 rounded-full shadow-none hover-glass transition hover:text-[color:var(--text-inverse)]"
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