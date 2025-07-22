import React, { useState } from "react";
import type { ChangeEvent } from "react";
import Button from "../../components/Button";
import { Upload } from "lucide-react";

const userFromDb = {
  id: 1,
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone_number: "0912345678",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  created_at: "2023-01-01T00:00:00Z",
  birthday: "1990-01-15",
  gender: "Nam",
};

const Settings: React.FC = () => {
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState(userFromDb);
  const [form, setForm] = useState(userFromDb);

  const handleEdit = () => {
    setForm(user);
    setEdit(true);
  };

  const handleSave = () => {
    setUser(form);
    setEdit(false);
  };

  return (
    <div className="px-4 py-8 md:px-16 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">
        Cài đặt tài khoản
      </h2>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl px-8 py-8">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <img
            src={edit ? form.avatar : user.avatar}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow"
          />
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-semibold text-gray-800">
              {edit ? form.name : user.name}
            </span>
            <span className="text-gray-500 text-lg">
              {edit ? form.email : user.email}
            </span>
            <Button
              className="bg-blue-100 text-blue-700 font-medium px-6 py-2 mt-3 rounded-full shadow-none hover:bg-blue-200 cursor-pointer transition flex items-center gap-2"
            >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">ID</span>
            <span className="font-medium border-b border-gray-200 py-1 bg-gray-200 cursor-not-allowed text-gray-400">
              {user.id}
            </span>
          </div>
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">Họ và tên</span>
            {edit ? (
              <input
                className="font-medium bg-transparent border-none outline-none border-b border-gray-300 focus:border-blue-400 transition py-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            ) : (
              <span className="font-medium border-b border-gray-200 py-1">
                {user.name}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">Email</span>
            {edit ? (
              <input
                className="font-medium bg-transparent border-none outline-none border-b border-gray-300 focus:border-blue-400 transition py-1"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            ) : (
              <span className="font-medium border-b border-gray-200 py-1">
                {user.email}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">Số điện thoại</span>
            {edit ? (
              <input
                className="font-medium bg-transparent border-none outline-none border-b border-gray-300 focus:border-blue-400 transition py-1"
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
              />
            ) : (
              <span className="font-medium border-b border-gray-200 py-1">
                {user.phone_number}
              </span>
            )}
          </div>
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">Giới tính</span>
            <div className="border-b border-gray-200 py-1 min-h-[40px] flex items-center">
              {edit ? (
                <select
                  className="font-medium bg-transparent border-none outline-none w-full"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              ) : (
                <span className="font-medium">{user.gender}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">Ngày sinh</span>
            <div className="border-b border-gray-200 py-1 min-h-[40px] flex items-center">
              {edit ? (
                <input
                  type="date"
                  className="font-medium bg-transparent border-none outline-none w-full"
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                />
              ) : (
                <span className="font-medium">
                  {new Date(user.birthday).toLocaleDateString("en-US")}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <span className="mb-1 text-gray-500">Ngày tham gia</span>
            <span className="font-medium border-b border-gray-200 py-1 bg-gray-200 cursor-not-allowed text-gray-400">
              {new Date(user.created_at).toLocaleDateString("en-US")}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          {!edit ? (
            <button
              className="px-6 py-2 font-medium text-blue-700 transition bg-blue-100 rounded-full hover:bg-blue-200"
              onClick={handleEdit}
            >
              Chỉnh sửa
            </button>
          ) : (
            <button
              className="px-6 py-2 font-medium text-white transition bg-blue-500 rounded-full hover:bg-blue-600"
              onClick={handleSave}
            >
              Lưu thay đổi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;