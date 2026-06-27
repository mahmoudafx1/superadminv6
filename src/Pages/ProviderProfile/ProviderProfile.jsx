import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationById, toggleBlockBranch } from "../../API/applicationApi";
import { MapPin, Calendar, ShieldAlert, ChevronRight, LayoutGrid, History, Clock } from 'lucide-react';
import { getServicesByStatus } from "../../API/servicesApi";
import { toast } from "react-toastify";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DOC_LABELS = {
    TAX_CERTIFICATE: "Tax Certificate",
    COMMERCIAL_REGISTER: "Commercial Register",
    NATIONAL_ID: "National ID",
    FACILITY_LICENSE: "Facility License",
};

const fmt12 = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const ProviderProfile = () => {
    const [services, setServices] = useState([]);
    const { categoryType, providerId } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [blockLoading, setBlockLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const blocked = provider?.user?.status === "SUSPENDED";

    const handleToggleBlock = async () => {
        try {
            setBlockLoading(true);

            await toggleBlockBranch(providerId);

            // Refetch provider data
            const res = await getApplicationById(providerId);
            setProvider(res.data.data);

            toast.success("Updated successfully");
        } catch (err) {
            toast.error("Failed to update provider status");
        } finally {
            setBlockLoading(false);
            setShowConfirmModal(false);
        }
    };

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                setLoading(true);
                const res = await getApplicationById(providerId);
                const providerData = res?.data?.data;
                setProvider(providerData);
                const servicesRes = await getServicesByStatus("APPROVED", providerData?.id);
                const allServices = servicesRes?.data?.data || [];
                setServices(allServices.filter(s => s.branch?.id === providerData?.id));
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProvider();
    }, [providerId]);

    if (loading) {
        return (
            <div className="p-10 text-center text-[#94a3b8] text-[14px]">
                Loading provider details...
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="p-10 text-center text-red-500 text-[14px]">
                Provider not found
            </div>
        );
    }

    const formatTitle = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

    const availabilities = provider.branch_availabilities || [];

    const scheduleByDay = availabilities.reduce((acc, slot) => {
        const day = slot.day_of_week;
        if (!acc[day]) acc[day] = [];
        acc[day].push(slot);
        return acc;
    }, {});

    const weeklySchedule = DAY_NAMES.map((dayName, i) => {
        const slots = scheduleByDay[i];
        if (!slots || slots.length === 0) {
            return { day: dayName, available: false };
        }
        const first = slots[0];
        return {
            day: dayName,
            available: first.status === "AVAILABLE",
            start: fmt12(first.start_time),
            end: fmt12(first.end_time),
            status: first.status,
        };
    });

    return (
        <div className="p-[25px] md:p-[40px] bg-[#f8fafc] min-h-screen animate-in fade-in duration-500">

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-[30px] max-w-[400px] w-full shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${blocked ? 'bg-green-100' : 'bg-red-100'}`}>
                            <ShieldAlert size={22} className={blocked ? 'text-green-600' : 'text-red-600'} />
                        </div>
                        <h3 className="text-[18px] font-bold text-[#0f172a] mb-2">
                            {blocked ? "Unblock this provider?" : "Block this provider?"}
                        </h3>
                        <p className="text-[14px] text-[#64748b] leading-relaxed mb-6">
                            {blocked
                                ? `Unblocking ${provider?.business_name} will restore its visibility to customers and resume bookings.`
                                : `Blocking ${provider?.business_name} will hide it from customers and suspend all active bookings. You can unblock it anytime.`
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-[10px] rounded-[12px] border border-[#e2e8f0] text-[#64748b] font-semibold hover:bg-[#f8fafc] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleToggleBlock}
                                disabled={blockLoading}
                                className={`flex-1 py-[10px] rounded-[12px] flex items-center justify-center gap-2 font-semibold transition-colors text-white ${blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                            >
                                <ShieldAlert size={18} />
                                {blockLoading ? "Processing..." : blocked ? "Unblock Provider" : "Block Provider"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-[25px] text-[14px]">
                <Link to="/providers" className="text-[#6366f1] font-medium hover:underline">
                    Providers
                </Link>
                <ChevronRight size={14} className="text-[#cbd5e1]" />
                <Link
                    to={`/category/${categoryType}`}
                    className="text-[#6366f1] font-medium hover:underline capitalize"
                >
                    {provider?.category}
                </Link>
                <ChevronRight size={14} className="text-[#cbd5e1]" />
                <span className="text-[#64748b]">{provider?.business_name}</span>
            </nav>

            {/* Header Card */}
            <div className="bg-[#111827] rounded-[24px] p-[30px] text-white mb-[25px] flex flex-col lg:flex-row gap-[30px]">
                <div className="flex flex-col gap-[12px] w-full lg:w-[280px]">
                    <img
                        className="w-full h-[180px] rounded-[16px] object-cover border border-white/10"
                        src={provider?.logo_url}
                        alt={provider?.business_name}
                    />
                </div>

                <div className="flex-1">
                    <span className="text-[11px] tracking-[1.5px] text-[#94a3b8] mb-2 block uppercase">
                        {provider?.category}
                    </span>
                    <h2 className="text-[32px] font-bold mb-3">{provider?.business_name}</h2>
                    <div className="flex flex-wrap gap-5 text-[14px] text-[#cbd5e1] mb-6">
                        <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {provider?.city} - {provider?.district}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { icon: <Calendar size={18} />, label: "Bookings", val: provider?.bookings_count ?? 0 },
                            { icon: <LayoutGrid size={18} />, label: "Services", val: services.length },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white/5 p-3 rounded-[14px] border border-white/10 flex items-center gap-3"
                            >
                                <div className="bg-white/10 p-2 rounded-[10px]">{stat.icon}</div>
                                <div>
                                    <small className="text-[#94a3b8] text-[11px] block">{stat.label}</small>
                                    <p className="font-bold text-[15px]">{stat.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:self-start">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={blockLoading}
                        className={`px-5 py-[10px] rounded-[12px] flex items-center gap-2 font-semibold transition-colors text-white ${blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                    >
                        <ShieldAlert size={18} />
                        {blockLoading ? "Processing..." : blocked ? "Unblock Provider" : "Block Provider"}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-[30px] overflow-x-auto pb-2">
                {['overview', 'services', 'schedule'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-7 py-3 rounded-[10px] border font-semibold text-[14px] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#1e40af] text-white border-[#1e40af]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#1e40af]'}`}
                    >
                        {formatTitle(tab)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white p-6 rounded-[16px] border border-[#f1f5f9]">
                                <h3 className="text-[12px] font-bold text-[#94a3b8] uppercase mb-5 tracking-widest">
                                    Owner Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { l: "Full Name", v: provider?.owner_name },
                                        { l: "Email", v: provider?.email },
                                        { l: "Phone", v: provider?.phone },
                                        { l: "City", v: provider?.city },
                                        { l: "District", v: provider?.district },
                                        { l: "Category", v: provider?.category },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <label className="text-[12px] text-[#94a3b8] block mb-1">{item.l}</label>
                                            <p className="font-semibold text-[#1e293b]">{item.v || "—"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[16px] border border-[#f1f5f9]">
                                <h3 className="text-[12px] font-bold text-[#94a3b8] uppercase mb-5 tracking-widest">
                                    Business Information
                                </h3>
                                <div className="space-y-0">
                                    {[
                                        { l: "Business Name", v: provider?.business_name },
                                        { l: "Status", v: provider?.status },
                                        { l: "Commercial Register", v: provider?.commercial_register_number },
                                        { l: "Tax ID", v: provider?.tax_id },
                                        { l: "Address", v: provider?.address },
                                    ].map((row, i, arr) => (
                                        <div
                                            key={i}
                                            className={`flex justify-between py-4 ${i < arr.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
                                        >
                                            <label className="text-[#94a3b8] text-[14px]">{row.l}</label>
                                            <span className="font-medium text-[#1e293b]">{row.v || "—"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[16px] border border-[#f1f5f9]">
                                <h3 className="text-[12px] font-bold text-[#94a3b8] uppercase mb-5 tracking-widest">
                                    Description
                                </h3>
                                <p className="text-[#475569] leading-relaxed">
                                    {provider?.description || "No description"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Plan Card */}
                            <div className="bg-[#1e40af] text-white p-6 rounded-[16px] relative overflow-hidden">
                                <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                    <History size={24} />
                                </div>
                                <small className="opacity-80 block mb-1">Current Plan</small>
                                <h4 className="text-[20px] font-bold mb-2">{provider?.plan?.name}</h4>
                                <div className="text-[24px] font-bold mb-4">
                                    {provider?.plan?.price} EGP{" "}
                                    <span className="text-[14px] opacity-70">/ Month</span>
                                </div>
                                {provider?.is_subscription_active ? (
                                    <p className="text-[12px] pt-4 border-t border-white/10 opacity-70">
                                        Started:{" "}
                                        {new Date(provider.subscription_started_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                ) : (
                                    <div className="pt-4 border-t border-white/10">
                                        <span className="text-[11px] font-bold bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg">
                                            ⚠ Subscription Not Active
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Documents */}
                            <div className="bg-white p-6 rounded-[16px] border border-[#f1f5f9]">
                                <h3 className="text-[12px] font-bold text-[#94a3b8] uppercase mb-5 tracking-widest">
                                    Documents
                                </h3>

                                {(() => {
                                    const docs = [
                                        {
                                            id: 1,
                                            type: "LOGO",
                                            file_url: provider?.logo_url,
                                        },
                                        {
                                            id: 2,
                                            type: "TAX_CERTIFICATE",
                                            file_url: provider?.tax_certificate_url,
                                        },
                                        {
                                            id: 3,
                                            type: "COMMERCIAL_REGISTER",
                                            file_url: provider?.commercial_register_url,
                                        },
                                        {
                                            id: 4,
                                            type: "NATIONAL_ID",
                                            file_url: provider?.national_id_url,
                                        },
                                        {
                                            id: 5,
                                            type: "FACILITY_LICENSE",
                                            file_url: provider?.facility_license_url,
                                        },
                                    ].filter((doc) => doc.file_url);

                                    return docs.length > 0 ? (
                                        <div className="space-y-3">
                                            {docs.map((doc) => (
                                                <a
                                                    key={doc.id}
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-between p-3 border border-[#f1f5f9] rounded-[12px] hover:bg-[#f8fafc] transition-colors group"
                                                >
                                                    <span className="text-[13px] font-semibold text-[#1e293b]">
                                                        {DOC_LABELS[doc.type] || doc.type}
                                                    </span>

                                                    <span className="text-[11px] text-indigo-500 font-medium group-hover:underline">
                                                        View
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[13px] text-[#94a3b8] text-center py-2">
                                            No documents uploaded
                                        </p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Services */}
                {activeTab === 'services' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                        {services.length === 0 ? (
                            <div className="col-span-full text-center py-16 text-[#94a3b8] text-[14px]">
                                No services found
                            </div>
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service.id}
                                    className="h-[420px] rounded-[24px] overflow-hidden relative group"
                                >
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-85"
                                    />
                                    <div className="absolute top-[25px] left-[25px] right-[25px] flex justify-between z-10">
                                        <span className="bg-[#10b981] text-white px-4 py-2 rounded-full text-[11px] font-medium">
                                            {service.status}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-[40px_25px_30px_25px] flex flex-col justify-end text-white">
                                        <div className="mb-3">
                                            <span className="border border-white/40 px-4 py-1.5 rounded-full text-[12px] text-[#cbd5e1]">
                                                {service.category?.name}
                                            </span>
                                        </div>
                                        <h4 className="text-[20px] font-medium mb-2">{service.name}</h4>
                                        <div className="flex items-center gap-2 text-[14px] text-[#94a3b8] mb-4">
                                            <MapPin size={14} />
                                            {service.branch?.business_name}
                                        </div>
                                        <p className="text-[14px] leading-relaxed text-[#cbd5e1] mb-8 line-clamp-2">
                                            {service.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-[#94a3b8]">
                                                {service.duration_minutes} min
                                            </span>
                                            <span className="text-xl font-bold">EGP {service.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Schedule */}
                {activeTab === 'schedule' && (
                    <div className="bg-white p-[30px] rounded-[24px] border border-[#f1f5f9]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-[#3b82f6] p-3 rounded-[14px] text-white">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-[#0f172a]">Weekly Schedule</h4>
                                <p className="text-[13px] text-[#94a3b8]">Regular business hours</p>
                            </div>
                        </div>

                        {availabilities.length === 0 ? (
                            <div className="text-center py-12 text-[#94a3b8] text-[14px]">
                                No schedule set for this provider
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {weeklySchedule.map((item, i) => (
                                    <div
                                        key={i}
                                        className={`flex justify-between items-center p-4 rounded-[16px] border transition-colors ${item.available ? 'border-[#e2e8f0] hover:bg-[#f8fafc]' : 'border-[#f1f5f9] bg-[#f8fafc] opacity-60'}`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center font-bold text-[#1e293b]">
                                                <span
                                                    className={`w-2 h-2 rounded-full mr-3 ${item.available ? 'bg-[#10b981]' : 'bg-[#cbd5e1]'}`}
                                                />
                                                {item.day}
                                            </div>
                                            {item.available && (
                                                <div className="flex items-center gap-2 text-[13px] text-[#64748b] ml-5">
                                                    <Clock size={13} />
                                                    {item.start} – {item.end}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {item.available ? (
                                                <span className="bg-[#dcfce7] text-[#10b981] px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase">
                                                    Open
                                                </span>
                                            ) : (
                                                <span className="bg-[#f1f5f9] text-[#94a3b8] px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderProfile;