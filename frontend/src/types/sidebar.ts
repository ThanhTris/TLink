import type { ReactNode } from "react";

export interface SidebarItem {
  name: string;
  path: string;
}

export interface SidebarSection {
  name: string;
  path: string;
  items?: SidebarItem[];
}

export interface SidebarCategory {
  name: string;
  icon?: ReactNode;
  sections: SidebarSection[];
}