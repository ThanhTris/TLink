import React, { useState } from "react";
import Button from "../../../components/Button";
import forum from "../../../assets/forum.png";
import { useNavigate, useLocation } from "react-router-dom";
import Toast from "../../../components/Toast";
import { verifyOtp } from "../../../api/auth";
import { maskEmailOrPhone } from "../../../utils/maskEmailOrPhone";

const Verification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy thông tin xác minh từ state
  const { emailOrPhone, type } = (location.state || {}) as { emailOrPhone?: string; type?: "email" | "phone" };

  if (!emailOrPhone || !type) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-8 bg-white rounded shadow">
          <p className="mb-4 text-red-500">Không tìm thấy thông tin xác minh. Vui lòng đăng ký lại.</p>
          <Button onClick={() => navigate("/auth/register")}>Quay lại đăng ký</Button>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(verificationCode)) {
      setError("Vui lòng nhập đúng 6 chữ số.");
      return;
    }
    try {
      const res = await verifyOtp({ emailOrPhone, otp: verificationCode });
      const result = res as { message: string; success: boolean };
      setToast({ message: result.message, type: result.success ? "success" : "error" });
      if (result.success) {
        setTimeout(() => navigate("/auth/login"), 1200);
      }
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Có lỗi xảy ra.", type: "error" });
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
        <h2 className="text-2xl font-semibold">Verify {type === "email" ? "Email" : "Phone"}</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-4">
          <p className="mb-2 text-sm">
            Đã gửi mã OTP về {type === "email" ? "email" : "số điện thoại"}{" "}
            <span className="font-semibold">
              {emailOrPhone ? maskEmailOrPhone(emailOrPhone) : ""}
            </span>. Vui lòng xác thực {type === "email" ? "email" : "số điện thoại"}.
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

export default Verification;