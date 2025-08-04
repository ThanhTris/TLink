import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import forum from "../../../assets/forum.png";
import facebook from "../../../assets/facebook-logo.png";
import google from "../../../assets/google-logo.png";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Toast from "../../../components/Toast";
import { login as loginApi } from "../../../api/auth";

const login: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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

  const handleLogin = async () => {
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

        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("emailOrPhone");

        localStorage.setItem("rememberMe", "false");
      }

      // Gọi API đăng nhập
      const res = await loginApi({ emailOrPhone, password });
      const result = res as { message: string; success: boolean; data?: any };
      setToast({
        message: result.message,
        type: result.success ? "success" : "error",
      });
      if (result.success && result.data) {
        localStorage.setItem("user", JSON.stringify(result.data));
        setTimeout(() => navigate("/"), 1200);
      }
      // Nếu không có result.data thì vẫn navigate như cũ
      else if (result.success) {
        setTimeout(() => navigate("/"), 1200);
      }
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Đăng nhập thất bại.",
        type: "error",
      });
    }
  };

  const handleRegisterClick = () => {
    navigate("/auth/register"); // Điều hướng đến trang Register
  };
  const handleForgotPasswordClick = () => {
    navigate("/auth/login/forgot-password"); // Điều hướng đến trang Forgot Password
  };

  // const handleGoogleLoginSuccess = (credentialResponse: any) => {
  //   if (credentialResponse.credential) {
  //     const decoded: any = jwtDecode(credentialResponse.credential);
  //     const email = decoded.email;
  //     fetch("http://localhost:8080/api/auth/login/google", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email }),
  //     })
  //       .then(res => res.json())
  //       .then(data => {
  //         if (data.success) {
  //           navigate("/");
  //         } else {
  //           setError(data.message);
  //         }
  //       });
  //   }
  // };

  // const handleGoogleLoginFailure = () => {
  //   setError("Đăng nhập Google thất bại.");
  // };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex items-center justify-center w-4/6 bg-gray-100">
        <img src={forum} alt="forum" className="h-full max-w-full" />
      </div>
      <div className="w-2/6 p-8">
        <h2 className="text-2xl font-semibold">Đăng nhập vào</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-3">
          <label className="block mb-1 text-sm">Email hoặc số điện thoại</label>
          <input
            type="text"
            placeholder="Email hoặc số điện thoại"
            className="w-full p-3 border rounded"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />
          <div className="h-4">
            {error && error.includes("Email hoặc số điện thoại") && (
              <span className="text-xs text-red-500">{error}</span>
            )}
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1 text-sm">Mật khẩu</label>
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="h-4">
            {error && error.includes("Mật khẩu") && (
              <span className="text-xs text-red-500">{error}</span>
            )}
          </div>
        </div>
        {/* Không render lỗi tổng phía dưới để không đẩy nút đăng nhập xuống */}

        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Ghi nhớ đăng nhập
          </label>
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleForgotPasswordClick}
          >
            Quên mật khẩu?
          </span>
        </div>

        <Button
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleLogin}
        >
          Đăng nhập
        </Button>

        <p className="mt-6 text-sm text-center">
          Chưa có tài khoản?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleRegisterClick}
          >
            Đăng ký
          </span>
        </p>

        <div className="relative flex items-center my-6">
          <hr className="flex-1 border-t border-gray-400" />
          <span className="mx-4 text-gray-400">HOẶC</span>
          <hr className="flex-1 border-t border-gray-400" />
        </div>

        {/* <Button className="flex items-center justify-center w-full gap-2 p-3 mb-6 border rounded">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
          />
        </Button>
        <Button className="flex items-center justify-center w-full gap-2 p-3 border rounded">
          <img src={facebook} alt="Facebook" className="w-5 h-5" />
          <span className="inline-block w-40 text-center">
            Login with Facebook
          </span>
        </Button> */}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default login;
