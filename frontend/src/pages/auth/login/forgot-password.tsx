import React, { useState } from "react";
import Button from "../../../components/Button";
import forum from "../../../assets/forum.png";
import { maskEmailOrPhone } from "../../../utils/maskEmailOrPhone";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import { forgotPassword, verifyForgotPasswordOtp } from "../../../api/auth";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<"input" | "otp">("input");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errorInput, setErrorInput] = useState("");
  const [errorOtp, setErrorOtp] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);
  const navigate = useNavigate();

  const getInputType = (input: string): "email" | "phone" => {
    const phoneRegex = /^\d{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) return "email";
    if (phoneRegex.test(input)) return "phone";
    throw new Error("Invalid input");
  };

  const handleSendOtp = async () => {
    if (!emailOrPhone.trim()) {
      setErrorInput("Email hoặc số điện thoại không được để trống.");
      return;
    }
    try {
      getInputType(emailOrPhone);
      setErrorInput("");
      // Gọi API gửi OTP
      const res = await forgotPassword({ emailOrPhone });
      const result = res as { message: string; success: boolean };
      setToast({
        message: result.message,
        type: result.success ? "success" : "error",
      });
      if (result.success) {
        setStep("otp");
      }
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Gửi OTP thất bại.",
        type: "error",
      });
    }
  };

  const handleVerifyOtp = async () => {
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(verificationCode)) {
      setErrorOtp("Vui lòng nhập đúng 6 chữ số.");
      return;
    }
    try {
      setErrorOtp("");
      // Gọi API xác thực OTP
      const res = await verifyForgotPasswordOtp({
        emailOrPhone,
        otp: verificationCode,
      });
      const result = res as { message: string; success: boolean };
      setToast({
        message: result.message,
        type: result.success ? "success" : "error",
      });
      if (result.success) {
        setTimeout(
          () =>
            navigate("/auth/login/reset-password", {
              state: { emailOrPhone, otp: verificationCode },
            }),
          1200
        );
      }
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Xác thực OTP thất bại.",
        type: "error",
      });
    }
  };

  const handleLoginClick = () => {
    navigate("/auth/login");
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex items-center justify-center w-4/6 bg-gray-100">
        <img src={forum} alt="forum" className="h-full max-w-full" />
      </div>
      <div className="w-2/6 p-8">
        <h2 className="text-2xl font-semibold">
          {step === "input" ? "Quên mật khẩu" : "Xác thực mã OTP"}
        </h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        {step === "input" ? (
          <>
            <div className="mb-4">
              <label className="block mb-1 text-sm">
                Email hoặc số điện thoại
              </label>
              <input
                type="text"
                className="w-full p-3 font-semibold border rounded"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại"
              />
              <div className="h-4">
                {errorInput && (
                  <span className="text-xs text-red-500">{errorInput}</span>
                )}
              </div>
            </div>
            <Button
              className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleSendOtp}
            >
              Gửi mã OTP
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="mb-2 text-lg">
                Đã gửi mã OTP về{" "}
                <span className="font-semibold">
                  {maskEmailOrPhone(emailOrPhone)}
                </span>
                . Vui lòng nhập mã.
              </p>
              <input
                type="text"
                className="w-full p-3 font-semibold border rounded"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit code"
              />
              <div className="h-4">
                {errorOtp && (
                  <span className="text-xs text-red-500">{errorOtp}</span>
                )}
              </div>
            </div>
            <Button
              className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleVerifyOtp}
            >
              Xác thực
            </Button>
          </>
        )}

        <p className="mt-6 text-sm text-center">
          Quay lại{"  "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleLoginClick}
          >
            Đăng nhập
          </span>
        </p>
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

export default ForgotPassword;
