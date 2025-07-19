import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import forum from "../assets/forum.png";
import { useNavigate } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy dữ liệu tạm thời từ localStorage
    const tempData = localStorage.getItem("tempRegisterData");
    if (!tempData) {
      setError("Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
      return;
    }
    const { emailOrPhone, otp, expiryTime } = JSON.parse(tempData);
    if (Date.now() > expiryTime) {
      localStorage.removeItem("tempRegisterData");
      setError("Mã OTP đã hết hạn. Vui lòng đăng ký lại.");
    }
  }, []);

  const handleVerify = () => {
    const tempData = localStorage.getItem("tempRegisterData");
    if (!tempData) {
      setError("Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
      return;
    }

    const { emailOrPhone, otp, expiryTime } = JSON.parse(tempData);
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(verificationCode)) {
      setError("Vui lòng nhập đúng 6 chữ số.");
      return;
    }

    if (Date.now() > expiryTime) {
      localStorage.removeItem("tempRegisterData");
      setError("Mã OTP đã hết hạn. Vui lòng đăng ký lại.");
      return;
    }

    if (verificationCode === otp) {
      setError("");
      // Lưu thông tin đăng ký (giả lập)
      console.log("Đăng ký thành công với:", JSON.parse(tempData));
      localStorage.removeItem("tempRegisterData");
      navigate("/login");
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
        <h2 className="text-2xl font-semibold">Verify Email</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-4">
          <p className="mb-2 text-sm">
            Đã gửi mã OTP về email{" "}
            <span className="font-semibold">{JSON.parse(localStorage.getItem("tempRegisterData") || '{}').emailOrPhone || "..."}</span>
            . Vui lòng xác thực email.
          </p>
          <label className="block mb-1 text-sm">Verification Code</label>
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
          onClick={handleVerify}
        >
          Verify
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

export default VerifyEmail;