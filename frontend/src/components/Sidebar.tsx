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

  const isSectionActive = (section: { path: string }) =>
    location.pathname === section.path;

  return (
    <aside className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-black/10 shadow-md px-2 py-4 overflow-y-auto sidebar-hide-scrollbar">
      <nav className="space-y-2">
        {categories.map((category) => (
          <div key={category.name} className="relative">
            {category.sections.length === 1 ? (
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
              <>
                <div
                  className="relative w-full"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Button
                    className={`flex items-center w-full p-2 rounded cursor-pointer transition-all
                      ${
                        openCategories[category.name] ||
                        hoveredCategory === category.name
                          ? "bg-gray-100 text-[#535bf2]"
                          : "text-gray-700"
                      }
                      ${
                        category.sections.some(isSectionActive)
                          ? "bg-gray-200 font-bold text-blue-600"
                          : ""
                      }
                    `}
                    onClick={() => navigate(getCategoryMainPath(category.name))}
                  >
                    <span className="mr-2 shrink-0">{category.icon}</span>
                    <span className="truncate flex-1 text-left">{category.name}</span>
                    <span className="ml-auto flex items-center px-2.5 py-2">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.name);
                        }}
                        className="flex items-center"
                      >
                        {openCategories[category.name] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    </span>
                  </Button>
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
                {openCategories[category.name] && (
                  <div className="pl-6 space-y-1">
                    {category.sections.map((section) => (
                      <div
                        key={section.name}
                        className="relative w-full"
                        onMouseEnter={() => setHoveredCategory(section.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <Button
                          className={`flex items-center w-full p-2 rounded cursor-pointer transition-all
                            ${
                              location.pathname === section.path
                                ? "bg-gray-200 font-bold text-blue-600"
                                : "text-gray-600"
                            }
                            hover:bg-gray-100
                          `}
                          onClick={() => navigate(section.path)}
                        >
                          <Tag size={16} className="mr-2 shrink-0" />
                          <span className="truncate text-left flex-1 hover:text-blue-600">{section.name}</span>
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
          </div>
        ))}
      </nav>
    </aside>
  );
};



export default Sidebar;
