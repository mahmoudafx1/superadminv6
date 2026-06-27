import React from 'react';
import { ArrowRight, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPendingApprovalApplications, getApprovedApplications } from "../../API/applicationApi";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Sk = ({ className }) => (
    <div className={`animate-pulse bg-[#e2e8f0] rounded-[8px] ${className}`} />
);

const Providers = () => {
    const [stats, setStats] = React.useState({ total: 0, active: 0, spa: 0, barber: 0, clinic: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [approvedRes, pendingRes] = await Promise.all([
                    getApprovedApplications(),
                    getPendingApprovalApplications(),
                ]);
                const approved = approvedRes.data.data.branches;
                const pending = pendingRes.data.data.branches;
                const active = approved.length;
                const total = active + pending.length;
                const spa = approved.filter(b => b.category === "SPA").length;
                const barber = approved.filter(b => b.category === "BARBER").length;
                const clinic = approved.filter(b => b.category === "CLINIC").length;
                setStats({ total, active, spa, barber, clinic });
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const categories = [
        { id: 1, img: "https://images.unsplash.com/photo-1638986396304-8e08d4f6bd01?q=80&w=1000", btnText: "View All Spa Centers", path: "/category/spa" },
        { id: 2, img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000", btnText: "View All Clinics Centers", path: "/category/clinic" },
        { id: 3, img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000", btnText: "View All Barbers Centers", path: "/category/barber" },
    ];

    const statCards = [
        { label: "Total Spa Centers",    value: stats.spa,    bg: "bg-[#00875A]" },
        { label: "Total Clinic Centers", value: stats.clinic, bg: "bg-[#E53935]" },
        { label: "Total Barber Centers", value: stats.barber, bg: "bg-[#1A202E]" },
    ];

    return (
        <div className="p-[30px] bg-[#f8fafc] min-h-screen animate-[fadeIn_0.4s_ease-in]">

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-purple-600 p-3 text-white shadow-sm">
                        <Store size={22} />
                    </div>
                    <div>
                        <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight">
                            Provider <span className="text-[#a855f7]">Categories</span>
                        </h2>
                        {loading ? (
                            <Sk className="h-3 w-48 mt-1.5" />
                        ) : (
                            <p className="text-[14px] text-[#64748b] mt-0.5">
                                {stats.total} total providers • {stats.active} active
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className={`${card.bg} p-6 rounded-[20px] text-white shadow-sm`}>
                        <p className="text-[11px] font-bold opacity-80 tracking-[0.5px] uppercase mb-1">{card.label}</p>
                        {loading ? (
                            <div className="h-9 w-16 bg-white/20 rounded-[8px] animate-pulse mt-1" />
                        ) : (
                            <h3 className="text-[32px] font-extrabold leading-none">{card.value}</h3>
                        )}
                    </div>
                ))}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, index) => (
                    <div
                        key={cat.id}
                        className="group relative h-[520px] rounded-[28px] p-6 text-white flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-[10px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
                        style={{
                            animationDelay: `${(index + 1) * 100}ms`,
                            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.95)), url(${cat.img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div />
                        <div className="relative z-10">
                            <Link
                                to={cat.path}
                                className="w-full bg-white text-[#1A202E] py-[14px] rounded-full font-bold text-[13px] flex items-center justify-center transition-all duration-300 hover:bg-[#f8fafc]"
                            >
                                {cat.btnText} <ArrowRight size={16} className="ml-2" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Providers;