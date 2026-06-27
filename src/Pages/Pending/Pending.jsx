import React, { useState, useEffect } from 'react';
import { Search, Eye, MapPin, CheckSquare, X, Phone, Mail, Calendar, Building2, Tag, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApplications, getApplicationById } from "../../API/applicationApi";

/* ── Category config ── */
const CAT = {
    SPA:    { badge: "bg-[#ee46bc]", activeTab: "bg-[#ee46bc] border-[#ee46bc]", light: "bg-pink-50 text-pink-600" },
    BARBER: { badge: "bg-[#f79009]", activeTab: "bg-[#f79009] border-[#f79009]", light: "bg-orange-50 text-orange-500" },
    CLINIC: { badge: "bg-[#2e90fa]", activeTab: "bg-[#2e90fa] border-[#2e90fa]", light: "bg-blue-50 text-blue-500" },
};

/* ── Quick Preview Modal ── */
const AppPreviewModal = ({ app, loading, onClose, onReview }) => {
    if (!app) return null;
    const cat = CAT[app.category] || { badge: "bg-[#64748b]", light: "bg-slate-50 text-slate-500" };

    return (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-[480px] rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Image Header */}
                <div className="relative h-[180px] flex-shrink-0">
                    <img src={app.logo_url || "https://via.placeholder.com/480x180"} alt={app.business_name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <button onClick={onClose} className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-white/40 transition-colors">
                        <X size={18} />
                    </button>
                    <span className={`absolute top-3 left-3 ${cat.badge} text-white px-2.5 py-1 rounded-full text-[11px] font-bold`}>
                        {app.category}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                        <h3 className="text-white text-[18px] font-bold leading-tight drop-shadow">{app.business_name}</h3>
                        <p className="text-white/70 text-[13px] mt-0.5">{app.owner_name}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 overflow-y-auto flex-1">

                    {/* Quick info chips */}
                    <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-[#eff8ff] text-[#2e90fa]">
                            <MapPin size={12} />{app.city}
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium ${cat.light}`}>
                            <Tag size={12} />{app.category}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-amber-50 text-amber-600">
                            <Calendar size={12} />{new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Details rows */}
                    <div className="bg-[#f8fafc] rounded-[14px] p-4 space-y-3 border border-[#f1f5f9]">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-[#94a3b8]">
                                <Loader2 size={14} className="animate-spin" />
                                Loading contact details...
                            </div>
                        ) : (
                            <>
                                {[
                                    { icon: <Building2 size={14} className="text-[#64748b]" />, label: "Business",  val: app.business_name },
                                    { icon: <MapPin size={14} className="text-[#64748b]" />,    label: "Location",  val: `${app.city}${app.district ? `, ${app.district}` : ""}` },
                                    { icon: <Mail size={14} className="text-[#64748b]" />,      label: "Email",     val: app.email || "—" },
                                    { icon: <Phone size={14} className="text-[#64748b]" />,     label: "Phone",     val: app.phone || "—" },
                                ].map(({ icon, label, val }) => (
                                    <div key={label} className="flex items-center gap-3 text-[13px]">
                                        <div className="w-6 flex-shrink-0 flex justify-center">{icon}</div>
                                        <span className="text-[#94a3b8] w-[70px] flex-shrink-0">{label}</span>
                                        <span className="text-[#1e293b] font-medium truncate">{val}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Subscription status */}
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-[12px] text-[13px] font-medium ${app.is_subscription_active ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${app.is_subscription_active ? "bg-green-500" : "bg-amber-500"}`} />
                        {app.is_subscription_active ? "Subscription Active" : "Subscription Not Active Yet"}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-[#f1f5f9] flex-shrink-0">
                    <button
                        onClick={onReview}
                        className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-3 rounded-[14px] flex items-center justify-center gap-2 text-[14px] transition-colors"
                    >
                        <Eye size={16} /> Review Full Application <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Main ── */
function Pending() {
    const navigate = useNavigate();
    const [searchTerm,      setSearchTerm]      = useState("");
    const [activeFilter,    setActiveFilter]    = useState("All");
    const [applications,    setApplications]    = useState([]);
    const [categoryCounts,  setCategoryCounts]  = useState({});
    const [loading,         setLoading]         = useState(true);
    const [previewApp,      setPreviewApp]      = useState(null);
    const [previewLoading,  setPreviewLoading]  = useState(false);

    useEffect(() => {
        getApplications("PENDING_APPROVAL")
            .then((res) => {
                setApplications(res?.data?.data?.branches || []);
                setCategoryCounts(res?.data?.data?.category_counts || {});
            })
            .catch(console.log)
            .finally(() => setLoading(false));
    }, []);

    // ✅ fetch full branch data (with email + phone) on preview click
    const handlePreview = async (app) => {
        setPreviewApp(app);         // فتح الـ modal فورًا بالبيانات الأساسية
        setPreviewLoading(true);
        try {
            const res = await getApplicationById(app.id);
            const fullData = res?.data?.data;
            if (fullData) setPreviewApp(fullData);
        } catch (err) {
            console.log(err);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClose = () => {
        setPreviewApp(null);
        setPreviewLoading(false);
    };

    const filteredData = applications.filter((item) => {
        const matchesSearch =
            item.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            activeFilter === "All" || item.category === activeFilter.toUpperCase();
        return matchesSearch && matchesFilter;
    });

    const TABS = [
        { label: "All",    key: "all",    count: applications.length,        activeClass: "bg-[#2563eb] border-[#2563eb]" },
        { label: "Spa",    key: "spa",    count: categoryCounts.spa    || 0, activeClass: CAT.SPA.activeTab },
        { label: "Clinic", key: "clinic", count: categoryCounts.clinic || 0, activeClass: CAT.CLINIC.activeTab },
        { label: "Barber", key: "barber", count: categoryCounts.barber || 0, activeClass: CAT.BARBER.activeTab },
    ];

    if (loading) {
        return <div className="p-[30px] text-center text-[#94a3b8] text-[14px]">Loading applications...</div>;
    }

    return (
        <div className="p-[30px] bg-[#f8fafc] min-h-screen animate-[fadeIn_0.4s_ease-in]">

            <AppPreviewModal
                app={previewApp}
                loading={previewLoading}
                onClose={handleClose}
                onReview={() => { navigate(`/pending/${previewApp.id}`); handleClose(); }}
            />

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-[#1d4ed8] p-3 text-white shadow-sm">
                        <CheckSquare size={22} />
                    </div>
                    <div>
                        <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight">
                            Pending <span className="text-[#2563eb]">Applications</span>
                        </h2>
                        <p className="text-[14px] text-[#64748b] mt-0.5">Review and approve new provider applications</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
                {TABS.map(({ label, count, activeClass }) => (
                    <button
                        key={label}
                        onClick={() => setActiveFilter(label)}
                        className={`flex items-center px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200 border ${
                            activeFilter === label
                                ? `${activeClass} text-white`
                                : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                        }`}
                    >
                        {label}
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            activeFilter === label ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                        }`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                <input
                    type="text"
                    placeholder="Search applications..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#e2e8f0] text-[14px] focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb] outline-none transition-all placeholder:text-[#94a3b8] text-[#1e293b]"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.length > 0 ? filteredData.map((app) => {
                    const cat = CAT[app.category] || { badge: "bg-[#64748b]", light: "bg-slate-50 text-slate-500" };
                    return (
                        <div key={app.id} className="group bg-white rounded-[24px] border border-[#f1f5f9] overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col">

                            {/* Image — click = preview modal */}
                            <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => handlePreview(app)}>
                                <img
                                    src={app.logo_url || "https://via.placeholder.com/400"}
                                    alt={app.business_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[12px] font-semibold text-[#1e293b]">
                                        <Eye size={13} /> Quick Preview
                                    </div>
                                </div>
                                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold text-white ${cat.badge}`}>
                                    {app.category}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex flex-col flex-grow">
                                <h5
                                    className="text-[17px] font-bold text-[#0f172a] mb-1 cursor-pointer hover:text-[#2563eb] transition-colors"
                                    onClick={() => handlePreview(app)}
                                >
                                    {app.business_name}
                                </h5>
                                <p className="text-[13px] text-[#64748b] mb-4">{app.owner_name}</p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[12px] font-medium bg-[#eff8ff] text-[#2e90fa]">
                                        <MapPin size={12} />{app.city}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-[8px] text-[12px] font-medium ${cat.light}`}>
                                        {app.category}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#94a3b8]">Submitted:</span>
                                        <span className="text-[#1e293b] font-semibold">{new Date(app.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#94a3b8]">Subscription:</span>
                                        <span className={`font-semibold ${app.is_subscription_active ? "text-green-500" : "text-amber-500"}`}>
                                            {app.is_subscription_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/pending/${app.id}`)}
                                    className="mt-auto w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-2.5 rounded-[12px] flex items-center justify-center gap-2 text-[14px] transition-colors duration-200"
                                >
                                    <Eye size={16} /> Review Application
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full text-center py-16">
                        <p className="text-[#94a3b8] text-[14px]">No applications found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Pending;