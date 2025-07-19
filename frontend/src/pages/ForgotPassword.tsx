import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import forum from "../assets/forum.png";
import { maskEmailOrPhone } from "../utils/maskEmailOrPhone";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<"input" | "otp">("input"); // Trạng thái bước: nhập email/phone hoặc nhập OTP
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getInputType = (input: string): "email" | "phone" => {
    const phoneRegex = /^\d{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) return "email";
    if (phoneRegex.test(input)) return "phone";
    throw new Error("Invalid input");
  };

  const handleSendOtp = () => {
    if (!emailOrPhone.trim()) {
      setError("Email hoặc số điện thoại không được để trống.");
      return;
    }

    try {
      const inputType = getInputType(emailOrPhone);
      setError("");

      // Giả lập kiểm tra tồn tại trong cơ sở dữ liệu
      const isValidUser = ["example@gmail.com", "12345678"].includes(emailOrPhone);
      if (!isValidUser) {
        setError("Email hoặc số điện thoại không tồn tại.");
        return;
      }

      // Giả lập gửi OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = Date.now() + 5 * 60 * 1000; // 5 phút
      localStorage.setItem("forgotPasswordData", JSON.stringify({ emailOrPhone, otp, expiryTime }));
      setStep("otp"); // Chuyển sang bước nhập OTP
    } catch {
      setError("Vui lòng nhập đúng định dạng email hoặc số điện thoại.");
    }
  };

  const handleVerifyOtp = () => {
    const tempData = localStorage.getItem("forgotPasswordData");
    if (!tempData) {
      setError("Không tìm thấy thông tin. Vui lòng thử lại.");
      return;
    }

    const { otp, expiryTime } = JSON.parse(tempData);
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(verificationCode)) {
      setError("Vui lòng nhập đúng 6 chữ số.");
      return;
    }

    if (Date.now() > expiryTime) {
      localStorage.removeItem("forgotPasswordData");
      setError("Mã OTP đã hết hạn. Vui lòng thử lại.");
      return;
    }

    if (verificationCode === otp) {
      setError("");
      navigate("/login/reset-password");
    } else {
      setError("Mã OTP không đúng. Vui lòng thử lại.");
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
        <h2 className="text-2xl font-semibold">
          {step === "input" ? "Forgot Password" : "Enter OTP"}
        </h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        {step === "input" ? (
          <>
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-3 font-semibold border rounded"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Enter your email or phone"
              />
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            <Button
              className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="mb-2 text-lg">
                Đã gửi mã OTP về{" "}
                <span className="font-semibold">{maskEmailOrPhone(emailOrPhone)}</span>. Vui lòng nhập mã.
              </p>
            
              <input
                type="text"
                className="w-full p-3 font-semibold border rounded"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit code"
              />
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            <Button
              className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleVerifyOtp}
            >
              Verify
            </Button>
          </>
        )}

        <p className="mt-6 text-sm text-center">
          Back to{" "}
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

export default ForgotPassword;