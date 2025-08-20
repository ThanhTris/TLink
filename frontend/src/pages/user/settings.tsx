import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Button from "../../components/Button";
import { Upload } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { updateUser, getInfoUserById } from "../../api/user";
import Toast from "../../components/Toast"; // Thêm import Toast

const Settings: React.FC = () => {
  const user = useUser();
  const [edit, setEdit] = useState(false);
  const [userData, setUserData] = useState<any>(user);
  const [form, setForm] = useState<any>(user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Lấy thông tin user hiện tại từ backend khi vào trang
  useEffect(() => {
    if (!user.id) return;
    (async () => {
      try {
        const res = (await getInfoUserById(user.id)) as {
          data?: { data?: any };       };
        if (res.data && res.data.data) {
          setUserData(res.data.data);
          setForm(res.data.data);
        }
      } catch {
        // fallback giữ nguyên user local
      }
    })();
    // eslint-disable-next-line
  }, [user.id]);

  const handleEdit = () => {
    setForm(userData);
    setEdit(true);
    setError(null);
    setSuccess(null);
  };

  // Validate email/phone format
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{3,15}$/;
    // Không cho phép cả email và phone cùng trống
    if ((!form.email || form.email.trim() === "") && (!form.phone || form.phone.trim() === "")) {
      setError("Email và số điện thoại không được đồng thời để trống.");
      setToast({ message: "Email và số điện thoại không được đồng thời để trống.", type: "error" });
      return false;
    }
    if (form.email && !emailRegex.test(form.email)) {
      setError("Email không đúng định dạng.");
      setToast({ message: "Email không đúng định dạng.", type: "error" });
      return false;
    }
    if (form.phone && !phoneRegex.test(form.phone)) {
      setError("Số điện thoại không đúng định dạng.");
      setToast({ message: "Số điện thoại không đúng định dạng.", type: "error" });
      return false;
    }
    return true;
  };

  // Khi bấm nút lưu thay đổi, kiểm tra định dạng trước, hợp lệ mới cho nhập mật khẩu
  const handleSave = () => {
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;
    setShowPasswordModal(true);
  };

  // Chỉ chạy API khi xác nhận trong modal
  const handleConfirmUpdate = async () => {
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;
    try {
      if (!password) {
        setError("Vui lòng nhập mật khẩu xác thực.");
        setToast({ message: "Vui lòng nhập mật khẩu xác thực.", type: "error" });
        return;
      }
      // So sánh và chỉ gửi các trường thay đổi
      const changedFields: any = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== userData[key]) {
          changedFields[key] = form[key];
        }
      });
      changedFields.passwordHash = password; // luôn gửi để xác thực

      const res = await updateUser(userData.id, changedFields);
      const data = res.data as { success: boolean; message?: string };
      if (data.success) {
        // Sau khi cập nhật thành công, lấy lại thông tin user mới nhất từ backend
        const userRes = (await getInfoUserById(userData.id)) as { data?: { data?: any } };
        if (userRes.data && userRes.data.data) {
          setUserData(userRes.data.data);
          setForm(userRes.data.data);
        }
        setEdit(false);
        setShowPasswordModal(false);
        setPassword("");
        setSuccess("Cập nhật thành công!");
        setToast({ message: "Cập nhật thành công!", type: "success" });
      } else {
        setError(data.message || "Cập nhật thất bại");
        setToast({ message: data.message || "Cập nhật thất bại", type: "error" });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Cập nhật thất bại";
      setError(msg);
      setToast({ message: msg, type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 bg-gray-100 py-7 md:px-30">
      <div className="w-full px-8 py-8 bg-white shadow rounded-2xl">
        <div className="flex flex-col items-center gap-8 mb-10 md:flex-row">
          <img
            src={(edit ? form.avatar : userData.avatar) ?? undefined}
            alt="avatar"
            className="object-cover border-4 border-blue-400 rounded-full shadow w-28 h-28"
          />
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-semibold text-gray-800">
              {edit ? form.name : userData.name}
            </span>
            <span className="text-lg text-gray-500">
              {edit ? form.email : userData.email}
            </span>
            <Button className="flex items-center gap-2 px-6 py-2 mt-3 font-medium text-blue-700 transition bg-blue-100 rounded-full shadow-none cursor-pointer hover:bg-blue-200">
              <Upload size={16} className="inline" />
              Thay đổi ảnh đại diện
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setForm({ ...form, avatar: ev.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          <div className="flex flex-col mb-2">
            <span className="text-gray-500 ">ID</span>
            <span className="flex items-center py-1 pl-2 font-medium text-gray-400 bg-gray-200 border-b border-gray-200 rounded-md cursor-not-allowed h-11">
              {userData.id ?? ""}
            </span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-gray-500 ">Họ và tên</span>
            {edit ? (
              <input
                className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11 focus:border-blue-400"

                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            ) : (
              <span className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11">
                {userData.name ?? ""}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Email</span>
            {edit ? (
              <input
                className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11 focus:border-blue-400"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            ) : (
              <span className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11">
                {userData.email ?? ""}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Số điện thoại</span>
            {edit ? (
              <input
                className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11 focus:border-blue-400"
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            ) : (
              <span className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11">
                {userData.phone ?? ""}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Giới tính</span>
            {edit ? (
              <select
                className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11 focus:border-blue-400"
                value={form.gender ?? ""}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <span className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11">
                {userData.gender ?? ""}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Ngày sinh</span>
            {edit ? (
              <input
                type="date"
                className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11 focus:border-blue-400"
                value={form.dateOfBirth ?? ""}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            ) : (
              <span className="flex items-center py-1 pl-2 font-medium border-b border-gray-200 outline-none h-11">
                {userData.dateOfBirth
                  ? new Date(userData.dateOfBirth).toLocaleDateString("en-US")
                  : ""}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <span className="mb-1 text-gray-500">Ngày tham gia</span>
            <span className="flex items-center py-1 pl-2 font-medium text-gray-400 bg-gray-200 border-b border-gray-200 rounded-md cursor-not-allowed h-11">
              {userData.created_at
                ? new Date(userData.created_at).toLocaleDateString("en-US")
                : ""}
            </span>
          </div>
        </div>



        <div className="flex justify-end gap-4 mt-8">
          {!edit ? (
            <Button
              className="px-6 py-2 font-medium text-blue-700 transition bg-blue-100 rounded-full hover:bg-blue-200"
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button
                className="px-6 py-2 font-medium text-gray-700 transition bg-gray-200 rounded-full hover:bg-gray-300"
                onClick={() => {
                  setEdit(false);
                  setForm(userData);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="px-6 py-2 font-medium text-white transition bg-blue-500 rounded-full hover:bg-blue-600"
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Modal nhập mật khẩu xác thực */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-8 shadow-lg min-w-[320px]">
            <h3 className="mb-4 text-lg font-semibold">Xác thực mật khẩu</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleConfirmUpdate();
              }}
            >
              <input
                type="password"
                className="w-full py-2 mb-4 border-b border-gray-300 outline-none"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded"
     
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="px-4 py-2 text-white bg-blue-500 rounded"
          
                  // Gọi API khi bấm xác nhận
                  onClick={handleConfirmUpdate}
                >
                  Xác nhận
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
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

export default Settings;
