import React, { useState } from "react";
import Button from "../../../components/Button";
import forum from "../../../assets/forum.png";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../../../api/auth";
import Toast from "../../../components/Toast";

const register: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Nam");
  const [birthday, setBirthday] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  const getInputType = (input: string): "email" | "phone" => {
    const phoneRegex = /^\d{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) return "email";
    if (phoneRegex.test(input)) return "phone";
    throw new Error("Invalid input");
  };

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    try {
      getInputType(emailOrPhone);
    } catch {
      newErrors.emailOrPhone = "Email hoặc số điện thoại không hợp lệ.";
    }

    if (!fullname.trim()) {
      newErrors.fullname = "Họ tên không được để trống.";
    }

    if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!birthday) {
      newErrors.birthday = "Vui lòng chọn ngày sinh.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await registerApi({
        emailOrPhone,
        fullname,
        password,
        gender,
        birthday,
      });
      
      const result = res as { message: string; success: boolean };
      setToast({ message: result.message, type: result.success ? "success" : "error" });
      if (result.success) {
        const type = getInputType(emailOrPhone);
        setTimeout(() => navigate("/auth/register/verification", {
          state: { emailOrPhone, type },
        }), 1200);
      }
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Đăng ký thất bại.", type: "error" });
      setErrors({
        ...newErrors,
        api: err?.response?.data?.message || "Đăng ký thất bại.",
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
        <h2 className="text-2xl font-semibold">Đăng ký vào</h2>
        <h1 className="mb-4 text-3xl font-bold text-blue-600">IT Forum</h1>

        <div className="mb-1.5">
          <label className="block mb-1 text-sm">Email hoặc số điện thoại</label>
          <input
            type="text"
            placeholder="Email hoặc số điện thoại"
            className={`w-full p-3 font-semibold border rounded ${
              errors.emailOrPhone ? "border-red-400" : ""
            }`}
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />
          <div className="h-4">
            {errors.emailOrPhone && (
              <span className="text-xs text-red-500">
                {errors.emailOrPhone}
              </span>
            )}
          </div>
        </div>

        <div className="mb-1.5">
          <label className="block mb-1 text-sm">Họ và tên</label>
          <input
            type="text"
            placeholder="Họ và tên"
            className={`w-full p-3 font-semibold border rounded ${
              errors.fullname ? "border-red-400" : ""
            }`}
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
          <div className="h-4">
            {errors.fullname && (
              <span className="text-xs text-red-500">{errors.fullname}</span>
            )}
          </div>
        </div>

        <div className="mb-1.5">
          <label className="block mb-1 text-sm">Mật khẩu</label>
          <input
            type="password"
            placeholder="Mật khẩu"
            className={`w-full p-3 border rounded ${
              errors.password ? "border-red-400" : ""
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="h-4">
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>
        </div>

        <div className="mb-1.5">
          <label className="block mb-1 text-sm">Giới tính</label>
          <select
            className="w-full p-3 font-semibold border rounded"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <div className="h-4"></div>
        </div>

        <div className="mb-1.5">
          <label className="block mb-1 text-sm">Ngày sinh</label>
          <input
            type="date"
            className={`w-full p-3 font-semibold border rounded ${
              errors.birthday ? "border-red-400" : ""
            }`}
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
          <div className="h-4">
            {errors.birthday && (
              <span className="text-xs text-red-500">{errors.birthday}</span>
            )}
          </div>
        </div>

        <Button
          className="w-full p-3 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleRegister}
        >
          Đăng ký
        </Button>
      

        <p className="mt-6 text-sm text-center">
          Đã có tài khoản?{" "}
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

export default register;