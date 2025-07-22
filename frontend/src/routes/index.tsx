import type { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// Import động tất cả page trong src/pages (kể cả trong subfolder)
const modules = import.meta.glob("../pages/**/*.tsx", { eager: true });

const routes: RouteObject[] = Object.entries(modules)
  .map(([filePath, mod]) => {
    // Ép kiểu cho mod
    const module = mod as { default: React.ComponentType };

    // Lấy path từ filePath, ví dụ ../pages/dev/web.tsx => /dev/web
    let path = filePath
      .replace("../pages", "")
      .replace(/\/index\.tsx$/, "") // /dev/index.tsx => /dev
      .replace(/\.tsx$/, "")
      .toLowerCase();

    // Nếu path rỗng thì là trang chủ
    if (path === "" || path === "/home") path = "/";

    // Nếu là trang auth thì hideLayout
    const isAuth = path.startsWith("/auth");

    // Nếu không export default thì bỏ qua
    if (!module.default) return null;

    return {
      path,
      element: (
        <MainLayout hideLayout={isAuth}>
          <module.default />
        </MainLayout>
      ),
    };
  })
  .filter(Boolean) as RouteObject[];

export default routes;