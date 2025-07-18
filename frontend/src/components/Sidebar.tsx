import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, TrendingUp, Bookmark, Tag, Hash, ChevronDown, ChevronUp, MessageCircleMore, MonitorSpeaker, Lock, Settings, BookOpenText, BriefcaseBusiness } from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
}

interface SidebarSection {
  name: string;
  path: string;
  items?: SidebarItem[];
}

interface SidebarCategory {
  name: string;
  icon?: React.ReactNode;
  sections: SidebarSection[];
}

const Sidebar: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const categories: SidebarCategory[] = [
    { name: 'Trang chủ', icon: <House size={18} />, sections: [{ name: 'Trang chủ', path: '/' }] },
    { name: 'Phổ biến', icon: <TrendingUp size={18} />, sections: [{ name: 'Phổ biến', path: '/popular' }] },
    { name: 'Đã lưu', icon: <Bookmark size={18} />, sections: [{ name: 'Đã lưu', path: '/saved' }] },
    {
      name: 'Thảo luận chung',
      icon: <MessageCircleMore size={18} />,
      sections: [
        { name: 'Giới thiệu – Làm quen', path: '/thao-luan-chung/gioi-thieu-lam-quen' },
        { name: 'Chuyện ngoài IT (off-topic)', path: '/thao-luan-chung/chuyen-ngoai-it' },
      ],
    },
    {
      name: 'Lập trình',
      icon: <MonitorSpeaker size={18} />,
      sections: [
        {
          name: 'Frontend',
          path: '/lap-trinh/frontend',
          items: [
            { name: 'HTML', path: '/lap-trinh/frontend/html' },
            { name: 'CSS', path: '/lap-trinh/frontend/css' },
            { name: 'JavaScript', path: '/lap-trinh/frontend/javascript' },
            { name: 'React', path: '/lap-trinh/frontend/react' },
          ],
        },
        {
          name: 'Backend',
          path: '/lap-trinh/backend',
          items: [
            { name: 'Node.js', path: '/lap-trinh/backend/nodejs' },
            { name: 'Java', path: '/lap-trinh/backend/java' },
            { name: 'PHP', path: '/lap-trinh/backend/php' },
          ],
        },
        {
          name: 'Mobile',
          path: '/lap-trinh/mobile',
          items: [
            { name: 'Android', path: '/lap-trinh/mobile/android' },
            { name: 'iOS', path: '/lap-trinh/mobile/ios' },
            { name: 'Flutter', path: '/lap-trinh/mobile/flutter' },
          ],
        },
      ],
    },
    {
      name: 'Hệ điều hành',
      icon: <Settings size={18} />,
      sections: [
        { name: 'Windows', path: '/he-dieu-hanh/windows' },
        { name: 'Linux / Ubuntu', path: '/he-dieu-hanh/linux-ubuntu' },
        { name: 'macOS', path: '/he-dieu-hanh/macos' },
      ],
    },
    {
      name: 'Bảo mật & mạng',
      icon: <Lock size={18} />,
      sections: [
        { name: 'An ninh mạng', path: '/bao-mat-mang/an-ninh-mang' },
        { name: 'Hệ thống mạng (cấu hình, lỗi…)', path: '/bao-mat-mang/he-thong-mang' },
      ],
    },
    {
      name: 'Tài nguyên học tập',
      icon: <BookOpenText size={18} />,
      sections: [
        { name: 'Tài liệu – Khóa học', path: '/tai-nguyen-hoc-tap/tai-lieu-khoa-hoc' },
        { name: 'Chia sẻ kinh nghiệm học IT', path: '/tai-nguyen-hoc-tap/chia-se-kinh-nghiem' },
      ],
    },
    {
      name: 'Tuyển dụng & nghề nghiệp',
      icon: <BriefcaseBusiness size={18} />,
      sections: [
        { name: 'Việc làm IT', path: '/tuyen-dung-nghe-nghiep/viec-lam-it' },
        { name: 'CV, phỏng vấn, lộ trình', path: '/tuyen-dung-nghe-nghiep/cv-phong-van-lo-trinh' },
      ],
    },
  ];

  return (
    <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-black/10 shadow-md  p-4 overflow-y-auto ">
      <nav className="space-y-2">
        {categories.map((category) => (
          <div key={category.name}>
            <button
              onClick={() => toggleCategory(category.name)}
              className={`flex items-center w-full text-gray-700 hover:bg-gray-100 p-2 rounded ${
                category.sections.some((section) => location.pathname === section.path || (section.items && section.items.some((item) => location.pathname === item.path)))
                  ? 'bg-gray-200'
                  : ''
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="truncate">{category.name}</span>
              <span className="ml-auto">{category.sections.length > 1 ? (openCategories[category.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : ''}</span>
            </button>
            {openCategories[category.name] && category.sections.length > 1 && (
              <div className="pl-6 space-y-1">
                {category.sections.map((section) => (
                  <div key={section.name}>
                    <button
                      onClick={() => toggleSection(section.name)}
                      className={`flex items-center w-full text-gray-600 hover:bg-gray-100 p-2 rounded ${
                        section.items && section.items.some((item) => location.pathname === item.path)
                          ? 'bg-gray-200'
                          : ''
                      }`}
                    >
                      <Tag size={16} className="mr-2 shrink-0" />
                      <span className="truncate">{section.name}</span>
                      <span className="ml-auto">
                        {section.items && (openSections[section.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                      </span>
                    </button>
                    {section.items && openSections[section.name] && (
                      <div className="pl-6 space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center text-gray-500 hover:bg-gray-100 p-2 rounded ${
                              location.pathname === item.path ? 'bg-gray-200' : ''
                            }`}
                          >
                            <Hash size={15} className="mr-2 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;