import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { categories, getCategoryMainPath } from "../constants/sidebarCategories";
import { ChevronDown, ChevronRight, Tag } from "lucide-react";
import Button from "./Button";

const Sidebar: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const isCategoryActive = (category: { name: string; sections: { path: string }[] }) => {
    const mainPath = getCategoryMainPath(category.name);
    return (
      location.pathname === mainPath || // Khớp chính xác với đường dẫn chính
      category.sections.some((section) => location.pathname === section.path) // Khớp chính xác với các đường dẫn con
    );
  };

  return (
    <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-[var(--bg-sidebar)] border-r border-[var(--glass-border)] backdrop-filter backdrop-blur-[18px] shadow-md px-2 py-4 overflow-y-auto sidebar-hide-scrollbar">
      <nav className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.name}
            className="relative"
            onMouseEnter={() => setHoveredCategory(category.name)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {category.sections.length === 1 ? (
              <Link
                to={category.sections[0].path}
                className={`flex items-center w-full text-[color:var(--text-main)] hover:text-[color:var(--color-primary-blue)] hover:bg-[rgba(255,255,255,0.15)] hover:shadow-inner cursor-pointer p-2 rounded transition-all ${
                  isCategoryActive(category)
                    ? "bg-[rgba(255,255,255,0.2)] border-l-5 border-[var(--color-primary-blue)] text-[var(--color-primary-blue)]"
                    : ""
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                <span className="truncate">{category.sections[0].name}</span>
              </Link>
            ) : (
              <>
                <Button
                  className={`flex items-center w-full p-2 rounded cursor-pointer transition-all text-[color:var(--text-main)] hover:text-[color:var(--color-primary-blue)] hover:bg-[rgba(255,255,255,0.15)] hover:shadow-inner ${
                    isCategoryActive(category)
                      ? "bg-[rgba(255,255,255,0.2)] border-l-5 border-[var(--color-primary-blue)] text-[var(--color-primary-blue)]"
                      : ""
                  }`}
                  onClick={() => navigate(getCategoryMainPath(category.name))}
                >
                  <span className="mr-2 shrink-0">{category.icon}</span>
                  <span className="truncate flex-1 text-left">{category.name}</span>
                  <span className="ml-auto flex items-center">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.name);
                      }}
                      className="flex items-center justify-center w-8 h-8 hover:bg-[rgba(255,255,255,0.3)]"
                    >
                      {openCategories[category.name] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  </span>
                </Button>
                {openCategories[category.name] && (
                  <div className="pl-6 space-y-1">
                    {category.sections.map((section) => (
                      <div
                        key={section.name}
                        className="relative"
                        onMouseEnter={() => setHoveredCategory(section.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <Button
                          className={`flex items-center w-full p-2 rounded cursor-pointer transition-all text-[color:var(--text-main)] hover:text-[color:var(--color-primary-blue)] hover:bg-[rgba(255,255,255,0.15)] hover:shadow-inner ${
                            location.pathname === section.path
                              ? "bg-[rgba(255,255,255,0.2)] border-l-4 border-[var(--color-primary-blue)] text-[var(--color-primary-blue)]"
                              : ""
                          }`}
                          onClick={() => navigate(section.path)}
                        >
                          <Tag size={16} className="mr-2 shrink-0" />
                          <span className="truncate text-left flex-1">{section.name}</span>
                        </Button>
                        {hoveredCategory === section.name && (
                          <div
                            className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-full px-3 py-2 bg-black text-white text-xs rounded shadow z-10 whitespace-nowrap"
                            style={{
                              minWidth: "max-content",
                              maxWidth: "220px",
                              pointerEvents: "none"
                            }}
                          >
                            {section.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {hoveredCategory === category.name && (
              <div
                className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-full px-3 py-2 bg-black text-white text-xs rounded shadow z-10 whitespace-nowrap"
                style={{
                  minWidth: "max-content",
                  maxWidth: "220px",
                  pointerEvents: "none"
                }}
              >
                {category.name}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};



export default Sidebar;
