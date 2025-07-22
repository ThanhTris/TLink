import React, { useState } from "react";
import Button from "../../components/Button";

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = () => {
    setError("");
    setSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }
    // TODO: Gọi API đổi mật khẩu ở đây
    setSuccess("Đổi mật khẩu thành công!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="px-4 py-8 md:px-16 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">
        Đổi mật khẩu
      </h2>
      <div className="max-w-xl mx-auto bg-white shadow rounded-2xl px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Mật khẩu cũ</span>
            <input
              type="password"
              className="font-medium bg-transparent border-none outline-none border-b border-gray-300 focus:border-blue-400 transition py-2"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu cũ"
            />
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Mật khẩu mới</span>
            <input
              type="password"
              className="font-medium bg-transparent border-none outline-none border-b border-gray-300 focus:border-blue-400 transition py-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Xác nhận mật khẩu mới</span>
            <input
              type="password"
              className="font-medium bg-transparent border-none outline-none border-b border-gray-300 focus:border-blue-400 transition py-2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </div>
        {error && <div className="text-red-500 mt-4">{error}</div>}
        {success && <div className="text-green-600 mt-4">{success}</div>}
        <div className="flex justify-end gap-4 mt-10">
          <Button
            className="px-6 py-2 font-medium text-white transition bg-blue-500 rounded-full hover:bg-blue-600"
            onClick={handleSave}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;