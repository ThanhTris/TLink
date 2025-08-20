import React, { useState } from "react";
import Button from "../../components/Button";
import { useUser } from "../../hooks/useUser";
import { changePassword } from "../../api/user";
import Toast from "../../components/Toast";

const ChangePassword: React.FC = () => {
  const user = useUser();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setToast(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      setToast({
        message: "Vui lòng nhập đầy đủ thông tin.",
        type: "error",
      });
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setToast({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
        type: "error",
      });
      return;
    }
    if (newPassword === oldPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      setToast({
        message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      setToast({
        message: "Xác nhận mật khẩu không khớp.",
        type: "error",
      });
      return;
    }
    try {
      const res = await changePassword(
        user.id,
        oldPassword,
        newPassword,
        confirmPassword
      );
      const data = res.data as { success: boolean; message?: string };
      if (data.success) {
        setSuccess("Đổi mật khẩu thành công!");
        setToast({ message: "Đổi mật khẩu thành công!", type: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Đổi mật khẩu thất bại");
        setToast({
          message: data.message || "Đổi mật khẩu thất bại",
          type: "error",
        });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Đổi mật khẩu thất bại";
      setError(msg);
      setToast({ message: msg, type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 bg-gray-100 py-7 md:px-30 ">
      <div className="w-full px-8 py-8 bg-white shadow rounded-2xl ">
        <h2 className="mb-8 text-2xl font-semibold text-gray-800">
          Đổi mật khẩu
        </h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Mật khẩu cũ</span>
            <input
              type="password"
              className="flex items-center py-1 pl-2 font-medium transition border-b border-gray-200 outline-none h-11 focus:border-blue-400"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu cũ"
            />
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Mật khẩu mới</span>
            <input
              type="password"
              className="flex items-center py-1 pl-2 font-medium transition border-b border-gray-200 outline-none h-11 focus:border-blue-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Xác nhận mật khẩu mới</span>
            <input
              type="password"
              className="flex items-center py-1 pl-2 font-medium transition border-b border-gray-200 outline-none h-11 focus:border-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-10">
          <Button
            className="px-6 py-2 font-medium text-white transition bg-blue-500 rounded-full hover:bg-blue-600"
            onClick={handleSave}
          >
            Lưu thay đổi
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
    </div>
  );
};

export default ChangePassword;