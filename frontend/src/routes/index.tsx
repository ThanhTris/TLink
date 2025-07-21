import type { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Forum from "../pages/Forum";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const routes: RouteObject[] = [
  { path: "/", element: <MainLayout><Home /></MainLayout> },
  { path: "/forum", element: <MainLayout><Forum /></MainLayout> },
  { path: "/login", element: <MainLayout hideLayout={true}><Login /></MainLayout> },
  { path: "/register", element: <MainLayout hideLayout={true}><Register /></MainLayout> },
  { path: "/register/verify-email", element: <MainLayout hideLayout={true}><VerifyEmail /></MainLayout> },
  { path: "/login/forgot-password", element: <MainLayout hideLayout={true}><ForgotPassword /></MainLayout> },
  { path: "/login/reset-password", element: <MainLayout hideLayout={true}><ResetPassword /></MainLayout> },
];

export default routes;