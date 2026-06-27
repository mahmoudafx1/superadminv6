import React from "react";
import logoImg from '../img/booklyx.png';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Building2, DollarSign, LogOut, Store, CreditCard } from "lucide-react";

function Sidebar({ isOpen, isMobile }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div
            className={`fixed top-0 h-screen bg-[#111827] flex flex-col z-[1050] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden
            ${isMobile ? (isOpen ? "left-0 shadow-2xl" : "-left-[270px]") : "left-0"}
            ${isOpen ? "w-[270px] p-6" : "w-[85px] py-6 px-0"}`}
        >
            {/* Logo Section */}
            <div className={`flex items-center mb-8 h-[35px] transition-all duration-400 ${isOpen ? "px-2 gap-3" : "justify-center px-0"}`}>
                <div className="w-[45px] h-[45px] flex-shrink-0">
                    <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                </div>
                {isOpen && (
                    <span className="text-white text-2xl font-bold whitespace-nowrap animate-in fade-in duration-300">
                        BooklyX
                    </span>
                )}
            </div>

            <div className={`h-[1px] bg-white/10 mb-6 transition-all ${isOpen ? "mx-2" : "mx-4"}`}></div>

            {/* Navigation Menu */}
            <ul className="flex flex-col gap-3 flex-grow px-3">
                <SidebarItem icon={<LayoutDashboard size={22} />} text="Overview" isOpen={isOpen} to="/overview" />
                <SidebarItem icon={<CheckSquare size={22} />} text="Applications" isOpen={isOpen} to="/pending" />
                <SidebarItem icon={<Building2 size={22} />} text="Services" isOpen={isOpen} to="/services" />
                <SidebarItem
                    icon={<Store size={22} />}
                    text="Providers"
                    isOpen={isOpen}
                    to="/providers"
                    isActiveOverride={location.pathname === '/providers' || location.pathname.startsWith('/category/')}
                />
                <SidebarItem icon={<DollarSign size={22} />} text="Finance" isOpen={isOpen} to="/finance" />
                <SidebarItem icon={<CreditCard size={22} />} text="Plans" isOpen={isOpen} to="/plans" />
            </ul>

            {/* Footer Section */}
            <div className={`pt-5 border-t border-white/5 mt-auto flex flex-col gap-4 ${isOpen ? "px-2" : "items-center"}`}>
                {/* Avatar */}
                <div className={`flex items-center transition-all duration-400 ${isOpen ? "gap-3" : "justify-center"}`}>
                    <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/10">
                        A
                    </div>
                    {isOpen && (
                        <div className="overflow-hidden whitespace-nowrap animate-in slide-in-from-left-2">
                            <p className="text-white text-[13px] font-bold">Admin User</p>
                            <p className="text-white/40 text-[11px]">Administrator</p>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className={`flex items-center text-white border border-red-500/30 rounded-xl transition-all duration-300 hover:bg-red-500/10 group
                    ${isOpen ? "w-full h-[48px] px-4" : "w-[48px] h-[48px] justify-center"}`}
                >
                    <div className="flex-shrink-0 text-red-500">
                        <LogOut size={20} />
                    </div>
                    {isOpen && <span className="ml-3 font-semibold text-[14px]">Logout</span>}
                </button>
            </div>
        </div>
    );
}

function SidebarItem({ icon, text, isOpen, to, isActiveOverride }) {
    return (
        <li>
            <NavLink
                to={to}
                className={({ isActive }) => `
                    flex items-center rounded-xl transition-all duration-300 group
                    ${(isActiveOverride ?? isActive)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"}
                    ${isOpen ? "px-4 py-3 justify-start" : "h-[48px] w-[48px] justify-center"}
                `}
            >
                <div className="flex-shrink-0">{icon}</div>
                {isOpen && (
                    <span className="ml-3 font-medium text-[14px] whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                        {text}
                    </span>
                )}
            </NavLink>
        </li>
    );
}

export default Sidebar;