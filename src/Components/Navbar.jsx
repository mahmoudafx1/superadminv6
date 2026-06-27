import React from "react";
import { Bell, Menu } from "lucide-react";

function Navbar({ toggleSidebar }) {
  return (
    <nav className="sticky top-0 z-50 flex h-[72px] w-full items-center border-b border-[#f1f5f9] bg-white px-8 shadow-sm">
      <div className="flex w-full items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-5">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white text-[#1e293b] shadow-sm transition-all hover:bg-[#f8fafc] hover:border-[#cbd5e1] active:scale-95"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:block">
            <h5 className="text-[16px] font-bold leading-none tracking-tight text-[#0f172a]">
              Admin Dashboard
            </h5>
            <p className="mt-1 text-[13px] font-medium text-[#94a3b8]">
              Manage your platform
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white text-[#64748b] transition-all hover:bg-[#f8fafc] hover:text-[#1e293b] shadow-sm"
          >
            <Bell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          <div className="h-7 w-px bg-[#e2e8f0]" />

          {/* User Info + Avatar */}
          <button className="group flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-[14px] font-semibold leading-tight text-[#0f172a]">
                Admin User
              </p>
              <p className="text-[12px] font-medium text-[#94a3b8]">
                admin@booklyx.com
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-tr from-blue-700 to-blue-500 text-[15px] font-bold text-white shadow-sm ring-1 ring-[#e2e8f0] transition-transform group-hover:scale-105">
              A
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;