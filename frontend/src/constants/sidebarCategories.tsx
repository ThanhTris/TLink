import type { SidebarCategory } from "../types/sidebar";
import {
  House,
  TrendingUp,
  Bookmark,
  MessageCircleMore,
  MonitorSpeaker,
  Lock,
  Settings,
  BookOpenText,
  BriefcaseBusiness,
  Code2,
} from "lucide-react";

export const categories: SidebarCategory[] = [
  {
    name: "Trang chủ",
    icon: <House size={18} />,
    sections: [{ name: "Trang chủ", path: "/" }],
  },
  {
    name: "Phổ biến",
    icon: <TrendingUp size={18} />,
    sections: [{ name: "Phổ biến", path: "/popular" }],
  },
  {
    name: "Đã lưu",
    icon: <Bookmark size={18} />,
    sections: [{ name: "Đã lưu", path: "/saved" }],
  },
  {
    name: "Thảo luận chung",
    icon: <MessageCircleMore size={18} />,
    sections: [
      { name: "Giới thiệu – Làm quen", path: "/general/intro" },
      { name: "Chuyện ngoài IT", path: "/general/off-topic" },
      { name: "Hỏi đáp linh tinh", path: "/general/ask-anything" },
      { name: "Thảo luận công nghệ", path: "/general/tech-talk" },
    ],
  },
  {
    name: "Lập trình",
    icon: <Code2 size={18} />,
    sections: [
      { name: "Web", path: "/dev/web" },
      { name: "Mobile", path: "/dev/mobile" },
      { name: "Backend", path: "/dev/backend" },
      { name: "Frontend", path: "/dev/frontend" },
      { name: "Machine Learning", path: "/dev/ml" },
      { name: "Data", path: "/dev/data" },
    ],
  },
  {
    name: "Hệ điều hành",
    icon: <Settings size={18} />,
    sections: [
      { name: "Windows", path: "/os/windows" },
      { name: "Linux / Ubuntu", path: "/os/linux" },
      { name: "macOS", path: "/os/macos" },
      { name: "Command Line", path: "/os/cli" },
      { name: "Cài đặt hệ điều hành", path: "/os/installation" },
      { name: "Dual Boot", path: "/os/dualboot" },
    ],
  },
  {
    name: "Bảo mật & mạng",
    icon: <Lock size={18} />,
    sections: [
      { name: "An ninh mạng", path: "/security/cyber" },
      { name: "Hệ thống mạng", path: "/security/network" },
      { name: "Kiểm thử bảo mật", path: "/security/penetration-testing" },
      { name: "Firewall / IDS", path: "/security/firewall" },
      { name: "Mã hóa & bảo vệ dữ liệu", path: "/security/encryption" },
    ],
  },
  {
    name: "Tài nguyên học tập",
    icon: <BookOpenText size={18} />,
    sections: [
      { name: "Tài liệu – Khóa học", path: "/resources/courses" },
      { name: "Chia sẻ kinh nghiệm", path: "/resources/experience" },
      { name: "Lộ trình học tập", path: "/resources/roadmap" },
    ],
  },
  {
    name: "Tuyển dụng & nghề nghiệp",
    icon: <BriefcaseBusiness size={18} />,
    sections: [
      { name: "Việc làm IT", path: "/career/jobs" },
      { name: "CV & phỏng vấn", path: "/career/cv-interview" },
      { name: "Freelance", path: "/career/freelance" },
    ],
  },
];

export const getCategoryMainPath = (category: string) => {
  switch (category) {
    case "Lập trình":
      return "/dev";
    case "Hệ điều hành":
      return "/os";
    case "Bảo mật & mạng":
      return "/security";
    case "Tài nguyên học tập":
      return "/resources";
    case "Tuyển dụng & nghề nghiệp":
      return "/career";
    case "Thảo luận chung":
      return "/general";
    case "Trang chủ":
      return "/";
    case "Phổ biến":
      return "/popular";
    case "Đã lưu":
      return "/saved";
    default:
      return (
        categories.find((c) => c.name === category)?.sections[0]?.path || "/"
      );
  }
};
