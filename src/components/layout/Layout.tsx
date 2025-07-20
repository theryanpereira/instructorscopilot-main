import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { UserGuide } from "@/components/UserGuide";
import { Outlet, useLocation } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();
  const hideNav = location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="min-h-screen bg-background">
      {!hideNav && (
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}
      <div className="flex relative">
        {/* Mobile overlay */}
        {!sidebarCollapsed && !hideNav && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        {!hideNav && (
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
        )}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>
      <UserGuide />
    </div>
  );
}