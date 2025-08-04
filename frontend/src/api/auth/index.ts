import axios from "axios";

export interface RegisterPayload {
  emailOrPhone: string;
  fullname: string;
  password: string;
  gender: string;
  birthday: string;
}

export interface VerifyOtpPayload {
  emailOrPhone: string;
  otp: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
}

export interface ForgotPasswordPayload {
  emailOrPhone: string;
}

export interface ResetPasswordPayload {
  emailOrPhone: string;
  newPassword: string;
  otp: string;
}

export async function register(payload: RegisterPayload) {
  const res = await axios.post("/api/auth/register", payload);
  return res.data;
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const res = await axios.post("/api/auth/register/verify-otp", payload);
  return res.data;
}

export async function login(payload: LoginPayload) {
  const res = await axios.post("/api/auth/login", payload);
  return res.data;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const res = await axios.post("/api/auth/login/forgot-password", payload);
  return res.data;
}

export async function verifyForgotPasswordOtp(payload: VerifyOtpPayload) {
  const res = await axios.post("/api/auth/login/verify-otp", payload);
  return res.data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const res = await axios.post("/api/auth/login/reset-password", payload);
  return res.data;
}

// ...có thể bổ sung các hàm loginGoogle, loginFacebook nếu cần...
