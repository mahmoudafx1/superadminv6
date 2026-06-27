import React, { useEffect, useState, useMemo } from 'react';
import {
    Check, X, Clock, Tag, Building2,
    Eye, DollarSign, AlignLeft, Store, Search, Loader2
} from 'lucide-react';
import { getServicesByStatus, getServiceById, approveService, rejectService } from "../../API/servicesApi";
import { getApplicationById } from "../../API/applicationApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RejectModal, { SERVICE_REJECT_REASONS } from '../../Components/RejectModal';

/* ── colours ── */
const CAT_COLORS = {
    SPA:    { badge: "bg-[#ee46bc]", active: "bg-[#ee46bc] border-[#ee46bc]" },
    BARBER: { badge: "bg-[#f79009]", active: "bg-[#f79009] border-[#f79009]" },
    CLINIC: { badge: "bg-[#2e90fa]", active: "bg-[#2e90fa] border-[#2e90fa]" },
};

/* ── Service Detail Modal ── */
const ServiceDetailModal = ({ service, onClose, onApprove, onReject, approving }) => {
    if (!service) return null;
    const branchCat = service.branch?.branchCategory;
    return (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-[560px] rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Image */}
                <div className="relative h-[200px] sm:h-[220px] flex-shrink-0">
                    <img src={service.image_url || "https://via.placeholder.com/560x220"} alt={service.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button onClick={onClose} className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-white/40 transition-colors">
                        <X size={18} />
                    </button>
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 text-[#1e293b]">
                            <Tag size={11} />{service.category?.name || "No Category"}
                        </span>
                        {branchCat && (
                            <span className={`${CAT_COLORS[branchCat]?.badge || "bg-[#64748b]"} text-white px-2.5 py-1 rounded-lg text-[11px] font-bold`}>
                                {branchCat}
                            </span>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                        <h3 className="text-white text-xl font-bold leading-tight drop-shadow">{service.name}</h3>
                        <p className="text-white/70 text-[13px] mt-0.5">{service.branch?.business_name || "Unknown Branch"}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: <DollarSign size={14} />, color: "text-purple-500", bg: "bg-purple-50", label: "Price",    val: `EGP ${service.price}` },
                            { icon: <Clock size={14} />,      color: "text-blue-500",   bg: "bg-blue-50",   label: "Duration", val: `${service.duration_minutes} min` },
                            { icon: <Store size={14} />,      color: "text-green-500",  bg: "bg-green-50",  label: "Branch",   val: service.branch?.business_name || "—" },
                        ].map(({ icon, color, bg, label, val }) => (
                            <div key={label} className={`${bg} rounded-[14px] p-3 flex flex-col gap-1`}>
                                <div className={`flex items-center gap-1.5 ${color}`}>
                                    {icon}
                                    <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                                </div>
                                <span className="font-bold text-[#0f172a] text-[13px] leading-tight truncate">{val}</span>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlignLeft size={15} className="text-[#64748b]" />
                            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Description</span>
                        </div>
                        <p className="text-[14px] text-[#475569] leading-relaxed bg-[#f8fafc] rounded-[12px] p-4 border border-[#f1f5f9]">
                            {service.description || "No description provided."}
                        </p>
                    </div>

                    {(service.staff_name || service.gender || service.min_age || service.max_age) && (
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Staff",   val: service.staff_name },
                                { label: "Gender",  val: service.gender },
                                { label: "Min Age", val: service.min_age },
                                { label: "Max Age", val: service.max_age },
                            ].filter(i => i.val).map(({ label, val }) => (
                                <div key={label} className="bg-[#f8fafc] rounded-[12px] p-3 border border-[#f1f5f9]">
                                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">{label}</p>
                                    <p className="text-[13px] font-semibold text-[#1e293b] capitalize">{val}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-[#f1f5f9] flex-shrink-0">
                    <button onClick={onApprove} disabled={approving}
                        className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        <Check size={16} />{approving ? "Approving..." : "Approve"}
                    </button>
                    <button onClick={onReject}
                        className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-red-200 py-3 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors">
                        <X size={16} />Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Main ── */
const TABS = ["All", "SPA", "BARBER", "CLINIC"];

const Services = () => {
    const [services,       setServices]       = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [enriching,      setEnriching]      = useState(false);
    const [searchTerm,     setSearchTerm]     = useState("");
    const [activeFilter,   setActiveFilter]   = useState("All");
    const [previewService, setPreviewService] = useState(null);
    const [rejectTarget,   setRejectTarget]   = useState(null);
    const [rejectLoading,  setRejectLoading]  = useState(false);
    const [approvingId,    setApprovingId]    = useState(null);

    useEffect(() => {
        const fetchAndEnrich = async () => {
            try {
                setLoading(true);
                const res = await getServicesByStatus("PENDING_APPROVAL");
                const raw = res?.data?.data || [];

                const uniqueBranchIds = [...new Set(raw.map(s => s.branch?.id).filter(Boolean))];
                setEnriching(true);

                // ✅ جيب service details + branch details بالتوازي
                const [serviceDetails, branchDetails] = await Promise.all([
                    // ✅ description بييجي من data.data مش data.data.data
                    Promise.all(raw.map(async (s) => {
                        try {
                            const r = await getServiceById(s.id);
                            return { id: s.id, description: r?.data?.data?.description || null };
                        } catch { return { id: s.id, description: null }; }
                    })),
                    // unique branches عشان ناخد category + email + phone
                    Promise.all(uniqueBranchIds.map(async (bid) => {
                        try {
                            const r = await getApplicationById(bid);
                            const d = r?.data?.data;
                            return {
                                id: bid,
                                category: d?.category || null,
                                email: d?.email || null,
                                phone: d?.phone || null,
                            };
                        } catch { return { id: bid, category: null, email: null, phone: null }; }
                    }))
                ]);

                // حوّل اللستات لـ maps عشان lookup سريع
                const svcDescMap    = Object.fromEntries(serviceDetails.map(s => [s.id, s.description]));
                const branchDataMap = Object.fromEntries(branchDetails.map(b => [b.id, b]));

                // ادمج كل حاجة على كل service
                setServices(raw.map(s => {
                    const bd = branchDataMap[s.branch?.id] || {};
                    return {
                        ...s,
                        description: svcDescMap[s.id] || s.description || null,
                        branch: {
                            ...s.branch,
                            branchCategory: bd.category || null,
                            email: bd.email || null,
                            phone: bd.phone || null,
                        },
                    };
                }));
            } catch (err) {
                console.log(err);
                toast.error("Failed to load services");
            } finally {
                setLoading(false);
                setEnriching(false);
            }
        };
        fetchAndEnrich();
    }, []);

    /* counts من الداتا المحليّة بعد الـ enrichment */
    const counts = useMemo(() => ({
        All:    services.length,
        SPA:    services.filter(s => s.branch?.branchCategory === "SPA").length,
        BARBER: services.filter(s => s.branch?.branchCategory === "BARBER").length,
        CLINIC: services.filter(s => s.branch?.branchCategory === "CLINIC").length,
    }), [services]);

    const filtered = useMemo(() => services.filter(s => {
        const matchSearch =
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.branch?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = activeFilter === "All" || s.branch?.branchCategory === activeFilter;
        return matchSearch && matchFilter;
    }), [services, searchTerm, activeFilter]);

    const handleApprove = async (id) => {
        try {
            setApprovingId(id);
            
            await approveService(id);
            toast.success("Service approved");
            setServices(prev => prev.filter(s => String(s.id) !== String(id)));
            setPreviewService(null);
        } catch { toast.error("Failed to approve service"); }
        finally { setApprovingId(null); }
    };

    const handleReject = async (reason) => {
        if (!rejectTarget) return;
        try {
            setRejectLoading(true);
            await rejectService(rejectTarget.id, reason);
            toast.success("Service rejected");
            setServices(prev => prev.filter(s => s.id !== rejectTarget.id));
            setRejectTarget(null);
            setPreviewService(null);
        } catch { toast.error("Failed to reject service"); }
        finally { setRejectLoading(false); }
    };

    if (loading || enriching) {
        return (
            <div className="p-[30px] flex items-center justify-center gap-3 text-[#94a3b8] text-[14px]">
                <Loader2 size={18} className="animate-spin" />
                {loading ? "Loading services..." : "Fetching branch details..."}
            </div>
        );
    }

    return (
        <div className="p-[30px] bg-[#f8fafc] min-h-screen animate-[fadeIn_0.4s_ease-in]">

            <ServiceDetailModal
                service={previewService}
                onClose={() => setPreviewService(null)}
                onApprove={() => handleApprove(previewService.id)}
                onReject={() => {
                    const svc = previewService;
                    setPreviewService(null);
                    setTimeout(() => setRejectTarget(svc), 150);
                }}
                approving={approvingId === previewService?.id}
            />

            <RejectModal
                isOpen={!!rejectTarget}
                onClose={() => !rejectLoading && setRejectTarget(null)}
                onConfirm={handleReject}
                loading={rejectLoading}
                title="Reject Service"
                targetName={rejectTarget?.name}
                reasons={SERVICE_REJECT_REASONS}
            />

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-[#10b981] p-3 text-white shadow-sm">
                        <Building2 size={22} />
                    </div>
                    <div>
                        <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight">
                            Pending <span className="text-[#10b981]">Services</span>
                        </h2>
                        <p className="text-[14px] text-[#64748b] mt-0.5">Review and approve submitted services</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`flex items-center px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200 border ${
                            activeFilter === tab
                                ? `${CAT_COLORS[tab]?.active || "bg-[#10b981] border-[#10b981]"} text-white`
                                : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                        }`}
                    >
                        {tab}
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            activeFilter === tab ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                        }`}>
                            {counts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                <input
                    type="text"
                    placeholder="Search services or branch..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#e2e8f0] text-[14px] focus:ring-2 focus:ring-emerald-100 focus:border-[#10b981] outline-none transition-all placeholder:text-[#94a3b8] text-[#1e293b]"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.length > 0 ? filtered.map(service => {
                    const branchCat = service.branch?.branchCategory;
                    return (
                        <div key={service.id} className="group bg-white rounded-[24px] border border-[#f1f5f9] overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col">

                            {/* Image */}
                            <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => setPreviewService(service)}>
                                <img
                                    src={service.image_url || "https://via.placeholder.com/400"}
                                    alt={service.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[12px] font-semibold text-[#1e293b]">
                                        <Eye size={13} /> View Details
                                    </div>
                                </div>
                                {/* service sub-category */}
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-[#1e293b] flex items-center gap-1">
                                    <Tag size={11} />{service.category?.name || "No Category"}
                                </span>
                                {/* branch type */}
                                {branchCat && (
                                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${CAT_COLORS[branchCat]?.badge || "bg-[#64748b]"}`}>
                                        {branchCat}
                                    </span>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-5 flex flex-col flex-grow">
                                <h5
                                    className="text-[17px] font-bold text-[#0f172a] mb-1 cursor-pointer hover:text-[#10b981] transition-colors"
                                    onClick={() => setPreviewService(service)}
                                >
                                    {service.name}
                                </h5>
                                <p className="text-[13px] text-[#64748b] mb-3">{service.branch?.business_name || "Unknown Branch"}</p>

                                

                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#94a3b8]">Price:</span>
                                        <span className="text-[#1e293b] font-semibold">EGP {service.price}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#94a3b8]">Duration:</span>
                                        <span className="text-[#1e293b] font-semibold flex items-center gap-1">
                                            <Clock size={12} className="text-[#a855f7]" />{service.duration_minutes} min
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#94a3b8]">Submitted:</span>
                                        <span className="text-[#1e293b] font-semibold">{new Date(service.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-2 pt-4 border-t border-[#f1f5f9]">
                                    <button
                                        onClick={() => handleApprove(service.id)}
                                        disabled={approvingId === service.id}
                                        className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-[12px] font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                                    >
                                        <Check size={16} />{approvingId === service.id ? "Approving..." : "Approve"}
                                    </button>
                                    <button
                                        onClick={() => setRejectTarget(service)}
                                        className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-red-200 py-2.5 rounded-[12px] font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <X size={16} />Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full text-center py-16">
                        <p className="text-[#94a3b8] text-[14px]">No services found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;