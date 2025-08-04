import React, { useState } from "react";
import Button from "../../../components/Button";
import forum from "../../../assets/forum.png";
import { useNavigate, useLocation } from "react-router-dom";
import Toast from "../../../components/Toast";
import { resetPassword } from "../../../api/auth";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorNew, setErrorNew] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy emailOrPhone và otp từ location.state (truyền từ bước xác thực OTP)
  const { emailOrPhone, otp } = (location.state || {}) as { emailOrPhone?: string; otp?: string };

  const handleReset = async () => {
    let hasError = false;
    if (newPassword.length < 6) {
      setErrorNew("Mật khẩu mới phải có ít nhất 6 ký tự.");
      hasError = true;
    } else {
      setErrorNew("");
    }
    if (newPassword !== confirmPassword) {
      setErrorConfirm("Mật khẩu xác nhận không khớp.");
      hasError = true;
    } else {
      setErrorConfirm("");
    }
    if (!emailOrPhone || !otp) {
      setToast({ message: "Thiếu thông tin xác thực. Vui lòng thực hiện lại quy trình quên mật khẩu.", type: "error" });
      return;
    }
    if (hasError) return;

    try {
      const res = await resetPassword({
        emailOrPhone,
        newPassword,
        otp,
      });
      const result = res as { message: string; success: boolean };
      setToast({ message: result.message, type: result.success ? "success" : "error" });
      if (result.success) {
        setTimeout(() => navigate("/auth/login"), 1200);
      }
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Đặt lại mật khẩu thất bại.", type: "error" });
    }
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex items-center justify-center w-4/6 bg-gray-100">
        <img src={forum} alt="forum" className="h-full max-w-full" />
      </div>
      <div className="w-2/6 p-8">
        <h2 className="text-2xl font-semibold">Đặt lại mật khẩu</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full p-3 font-semibold border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
          />
          <div className="h-4">
            {errorNew && (
              <span className="text-xs text-red-500">{errorNew}</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Xác nhận mật khẩu</label>
          <input
            type="password"
            className="w-full p-3 font-semibold border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
          />
          <div className="h-4">
            {errorConfirm && (
              <span className="text-xs text-red-500">{errorConfirm}</span>
            )}
          </div>
        </div>

        <Button
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleReset}
        >
          Đặt lại mật khẩu
        </Button>
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

export default ResetPassword;