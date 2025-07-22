import React, { useState } from "react";
import Button from "../../components/Button";
import forum from "../../assets/forum.png";
import { useNavigate } from "react-router-dom";

const resetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = () => {
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");

    // Giả lập gọi API để cập nhật mật khẩu
    console.log("Cập nhật mật khẩu cho:", JSON.parse(localStorage.getItem("forgotPasswordData") || '{}').emailOrPhone, "với mật khẩu mới:", newPassword);
    localStorage.removeItem("forgotPasswordData");
    navigate("/login");
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex items-center justify-center w-4/6 bg-gray-100">
        <img src={forum} alt="forum" className="h-full max-w-full" />
      </div>
      <div className="w-2/6 p-8">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <h1 className="mb-10 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-4">
          <label className="block mb-1 text-sm">New Password</label>
          <input
            type="password"
            className="w-full p-3 font-semibold border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Confirm Password</label>
          <input
            type="password"
            className="w-full p-3 font-semibold border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <Button
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleReset}
        >
          Reset Password
        </Button>
      </div>
    </div>
  );
};

export default resetPassword;