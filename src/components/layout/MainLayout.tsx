import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout: React.FC = () => {
  const location = useLocation();

  // Determine page title based on current route
  const getPageTitle = (): string => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";

    // Remove leading slash and capitalize
    const title = path.substring(1).split("/")[0];
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <div className="flex h-screen w-full bg-stone-50 text-stone-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={getPageTitle()} />

        {/* Content Area with Scrolling */}
        <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
