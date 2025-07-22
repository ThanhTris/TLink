import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import forum from "../../assets/forum.png";
import { useNavigate } from "react-router-dom";

const register: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getInputType = (input: string): "email" | "phone" => {
    const phoneRegex = /^\d{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) return "email";
    if (phoneRegex.test(input)) return "phone";
    throw new Error("Invalid input");
  };

  const handleRegister = () => {
    try {
      const inputType = getInputType(emailOrPhone);

      if (!fullname.trim()) {
        setError("Họ tên không được để trống.");
        return;
      }

      if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      setError("");

      if (inputType === "email") {
        // Tạo mã OTP ngẫu nhiên (6 chữ số)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = Date.now() + 5 * 60 * 1000; // 5 phút

        // Lưu thông tin tạm thời (giả lập)
        const tempData = {
          emailOrPhone,
          fullname,
          password,
          otp,
          expiryTime,
        };
        localStorage.setItem("tempRegisterData", JSON.stringify(tempData));

        // Điều hướng đến VerifyEmail
        navigate("/register/verify-email");
      } else if (inputType === "phone") {
        // Gọi API đăng ký (giả lập)
        console.log("Đăng ký với:", {
          type: inputType,
          emailOrPhone,
          fullname,
          password,
        });
        // Điều hướng đến Login sau khi đăng ký thành công
        navigate("/login");
      }
    } catch {
      setError("Vui lòng nhập đúng định dạng email hoặc số điện thoại.");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex items-center justify-center w-4/6 bg-gray-100">
        <img src={forum} alt="forum" className="h-full max-w-full" />
      </div>
      <div className="w-2/6 p-8">
        <h2 className="text-2xl font-semibold">Register to</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Email or phone</label>
          <input
            type="text"
            className="w-full p-3 font-semibold border rounded"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Fullname</label>
          <input
            type="text"
            className="w-full p-3 font-semibold border rounded"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Password</label>
          <input
            type="password"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <Button
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleRegister}
        >
          Register
        </Button>

        <p className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleLoginClick}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default register;