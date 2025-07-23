import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import forum from "../../assets/forum.png";
import facebook from "../../assets/facebook-logo.png";
import google from "../../assets/google-logo.png";
import { useNavigate } from "react-router-dom";

const login: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load từ localStorage nếu có
  useEffect(() => {
    const savedEmailOrPhone = localStorage.getItem("emailOrPhone");
    const savedPassword = localStorage.getItem("password");
    const savedRemember = localStorage.getItem("rememberMe") === "true";

    if (savedRemember && savedEmailOrPhone && savedPassword) {
      setEmailOrPhone(savedEmailOrPhone);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Xác định người dùng nhập là email hay phone
  const getInputType = (input: string): "email" | "phone" => {
    const phoneRegex = /^\d{3,15}$/; // Giả sử số điện thoại có từ 3 đến 15 chữ số
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) return "email";
    if (phoneRegex.test(input)) return "phone";
    throw new Error("Invalid input");
  };

  const handleLogin = () => {
    if (!emailOrPhone.trim()) {
      setError("Email hoặc số điện thoại không được để trống.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      const inputType = getInputType(emailOrPhone);
      setError(""); // Xóa lỗi nếu không có ngoại lệ

      if (rememberMe) {
        localStorage.setItem("emailOrPhone", emailOrPhone);
        localStorage.setItem("password", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("emailOrPhone");
        localStorage.removeItem("password");
        localStorage.setItem("rememberMe", "false");
      }

      // TODO: Gọi API đăng nhập
      console.log("Đăng nhập với:", {
        type: inputType,
        emailOrPhone,
        password,
      });
      navigate("/"); // Điều hướng đến trang Home sau khi đăng nhập thành công
    } catch (err) {
      setError("Vui lòng nhập đúng định dạng email hoặc số điện thoại.");
    }
  };

  const handleRegisterClick = () => {
    navigate("/auth/register"); // Điều hướng đến trang Register
  };
  const handleForgotPasswordClick = () => {
    navigate("/login/forgot-password"); // Điều hướng đến trang Forgot Password
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex items-center justify-center w-4/6 bg-gray-100">
        <img src={forum} alt="forum" className="h-full max-w-full" />
      </div>
      <div className="w-2/6 p-8">
        <h2 className="text-2xl font-semibold">Welcome to</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-6">
          <label className="block mb-1 text-sm">Email or phone</label>
          <input
            type="text"
            placeholder="Email hoặc số điện thoại"
            className="w-full p-3 border rounded"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1 text-sm">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleForgotPasswordClick}
          >
            Forgot password?
          </span>
        </div>

        <Button
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleLogin}
        >
          Login
        </Button>

        <p className="mt-6 text-sm text-center">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleRegisterClick}
          >
            Register
          </span>
        </p>

        <div className="relative flex items-center my-6">
          <hr className="flex-1 border-t border-gray-400" />
          <span className="mx-4 text-gray-400">OR</span>
          <hr className="flex-1 border-t border-gray-400" />
        </div>

        <Button className="flex items-center justify-center w-full gap-2 p-3 mb-6 border rounded">
          <img src={google} alt="Google" className="w-5 h-5" />
          <span className="inline-block w-40 text-center">
            Login with Google
          </span>
        </Button>
        <Button className="flex items-center justify-center w-full gap-2 p-3 border rounded">
          <img src={facebook} alt="Facebook" className="w-5 h-5" />
          <span className="inline-block w-40 text-center">
            Login with Facebook
          </span>
        </Button>
      </div>
    </div>
  );
};

export default login;
