import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobile && isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isMobile]);


  return (
    <div className="relative min-h-screen">
      <Sidebar
        isOpen={isOpen}
        isMobile={isMobile}
        closeSidebar={() => setIsOpen(false)}
      />

      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${isMobile ? "ml-0" : isOpen ? "ml-[270px]" : "ml-[85px]"
          }`}
      >
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="flex-1 overflow-visible p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;