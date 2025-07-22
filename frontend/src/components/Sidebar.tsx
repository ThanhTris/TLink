import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "../constants/sidebarCategories";
import { ChevronDown, ChevronRight, Tag, Hash } from "lucide-react";

const Sidebar: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const location = useLocation();

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Kiểm tra section có active không
  const isSectionActive = (section: { path: string }) =>
    location.pathname === section.path;

  return (
    <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-black/10 shadow-md p-4 overflow-y-auto sidebar-hide-scrollbar">
      <nav className="space-y-2">
        {categories.map((category) => (
          <div key={category.name}>
            {category.sections.length === 1 ? (
              // Nếu chỉ có 1 section, render luôn link lớn
              <Link
                to={category.sections[0].path}
                className={`flex items-center w-full text-gray-700 hover:bg-gray-100 cursor-pointer p-2 rounded ${
                  location.pathname === category.sections[0].path
                    ? "bg-gray-200 font-bold text-blue-600"
                    : ""
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                <span className="truncate">{category.sections[0].name}</span>
              </Link>
            ) : (
              // Nếu có nhiều section, render button + tree
              <>
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={`flex items-center w-full text-gray-700 hover:bg-gray-100 hover:text-[#535bf2] cursor-pointer p-2 rounded ${
                    category.sections.some(isSectionActive) ? "bg-gray-200" : ""
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                  <span className="ml-auto">
                    {openCategories[category.name] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>
                </button>
                {openCategories[category.name] && (
                  <div className="pl-6 space-y-1">
                    {category.sections.map((section) => (
                      <Link
                        key={section.name}
                        to={section.path}
                        className={`flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded ${
                          location.pathname === section.path
                            ? "bg-gray-200 font-bold text-blue-600"
                            : ""
                        }`}
                      >
                        <Tag size={16} className="mr-2 shrink-0" />
                        <span className="truncate">{section.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
