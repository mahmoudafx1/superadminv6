import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getApplicationById,
    approveApplication,
    rejectApplication
} from "../../API/applicationApi";
import {
    ArrowLeft, CheckCircle, XCircle, User,
    MapPin, Eye, Building2, CircleCheckBig, FileText,
    Download, X, CheckCircle2, CreditCard, AlertTriangle
} from 'lucide-react';
import RejectModal from '../../Components/RejectModal';

const DOC_LABELS = {
    LOGO: "Logo",
    TAX_CERTIFICATE: "Tax Certificate",
    COMMERCIAL_REGISTER: "Commercial Register",
    NATIONAL_ID: "National ID",
    FACILITY_LICENSE: "Facility License",
};

const ReviewApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionType, setActionType] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    useEffect(() => {
        getApplicationById(id)
            .then((res) => {
                const data = res?.data?.data;
                setApplication(Array.isArray(data) ? data[0] : data);
            })
            .catch(console.log)
            .finally(() => setLoading(false));
    }, [id]);

    const handleApprove = async () => {
        try {
            setActionType("approve");
            await approveApplication(id);
            toast.success("Application approved");
            navigate("/pending");
        } catch (err) {
            toast.error("Failed to approve application");
        } finally {
            setActionType(null);
        }
    };

    const handleReject = async (reason) => {
        try {
            setActionType("reject");
            await rejectApplication(id, reason);
            toast.success("Application rejected");
            setRejectModalOpen(false);
            navigate("/pending");
        } catch (err) {
            toast.error("Failed to reject application");
        } finally {
            setActionType(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#94a3b8] text-[14px]">
                Loading application...
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 text-[14px]">
                Application not found
            </div>
        );
    }

    const docs = [
        application.logo_url,
        application.tax_certificate_url,
        application.commercial_register_url,
        application.national_id_url,
        application.facility_license_url,
    ].filter(Boolean);
    const provider = application;
    return (
        <div className="animate-[fadeIn_.4s_ease-in] p-4 sm:p-6 lg:p-[30px] bg-[#f8fafc] min-h-screen">

            {/* Reject Modal */}
            <RejectModal
                isOpen={rejectModalOpen}
                onClose={() => !actionType && setRejectModalOpen(false)}
                onConfirm={handleReject}
                loading={actionType === "reject"}
                title="Reject Application"
                targetName={application.business_name}
            />

            {/* Back */}
            <div
                className="flex items-center gap-2 text-[#64748b] text-[14px] mb-5 sm:mb-6 cursor-pointer hover:text-[#1e293b] transition-colors w-fit"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={16} />
                <span>Back to Pending Approvals</span>
            </div>

            {/* ── Hero Card ── */}
            <div className="bg-[#0f172a] rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 lg:p-[35px] text-white shadow-lg mb-6">

                {/* Top row — name + buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="min-w-0">
                        <span className="text-[11px] text-[#94a3b8] font-bold tracking-wider uppercase">
                            {application.category}
                        </span>
                        <h2 className="text-xl sm:text-[26px] font-bold my-2 truncate">{application.business_name}</h2>
                        <p className="text-[#94a3b8] text-[14px]">{application.owner_name}</p>
                        <div className="bg-[#1e293b] px-3 py-1.5 rounded-[10px] text-[13px] text-[#94a3b8] flex items-center gap-1.5 mt-3 w-fit">
                            <MapPin size={13} />
                            Applied: {new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
                        <button
                            onClick={handleApprove}
                            disabled={!!actionType}
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle size={16} />
                            {actionType === "approve" ? "Approving..." : "Approve"}
                        </button>
                        <button
                            onClick={() => setRejectModalOpen(true)}
                            disabled={!!actionType}
                            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <XCircle size={16} />
                            Reject
                        </button>
                    </div>
                </div>

                {/* Stats Row — 2 cols on mobile, 4 on md+ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 sm:mt-8">
                    {[
                        { icon: FileText, label: "DOCUMENTS", value: docs.length },
                        { icon: CreditCard, label: "PLAN", value: application.plan?.name || "N/A" },
                        { icon: MapPin, label: "CITY", value: application.city },
                        { icon: CircleCheckBig, label: "STATUS", value: application.status },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#1e293b] border border-white/5 rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 flex flex-col">
                            <stat.icon size={17} className="mb-2 text-[#94a3b8]" />
                            <label className="text-[10px] text-[#94a3b8] font-bold mb-1 tracking-wider">{stat.label}</label>
                            <span className="text-lg sm:text-[20px] font-bold text-white leading-tight truncate">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Body — stack on mobile, 12-col grid on lg ── */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

                {/* Left Side */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Owner Info */}
                    <div className="bg-white border border-[#f1f5f9] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-5 sm:mb-6">
                            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-[10px] flex items-center justify-center flex-shrink-0">
                                <User size={18} />
                            </div>
                            <h5 className="text-[15px] font-bold text-[#0f172a]">Owner Information</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: "FULL NAME", val: application.owner_name },
                                { label: "EMAIL", val: application.email },
                                { label: "PHONE", val: application.phone },
                                { label: "CITY", val: application.city },
                                { label: "DISTRICT", val: application.district },
                                { label: "ADDRESS", val: application.address },
                            ].map((item, i) => (
                                <div key={i}>
                                    <label className="block text-[10px] text-[#94a3b8] font-bold mb-2 uppercase tracking-wider">
                                        {item.label}
                                    </label>
                                    <div className="p-3 border border-[#f1f5f9] rounded-[10px] text-[14px] text-[#1e293b] font-medium bg-[#f8fafc] break-all">
                                        {item.val || "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="bg-white border border-[#f1f5f9] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-5 sm:mb-6">
                            <div className="w-9 h-9 bg-purple-50 text-purple-500 rounded-[10px] flex items-center justify-center flex-shrink-0">
                                <Building2 size={18} />
                            </div>
                            <h5 className="text-[15px] font-bold text-[#0f172a]">Business Information</h5>
                        </div>
                        <div className="text-[14px]">
                            {[
                                { label: "Business Name", val: application.business_name },
                                { label: "Category", val: application.category },
                                { label: "Description", val: application.description },
                                { label: "Commercial Register No.", val: application.commercial_register_number },
                                { label: "Tax ID", val: application.tax_id },
                                { label: "Address", val: application.address },
                                { label: "Status", val: application.status },
                            ].map((item, i, arr) => (
                                <div key={i} className={`flex flex-col sm:flex-row sm:justify-between py-3.5 gap-1 ${i < arr.length - 1 ? 'border-b border-[#f8fafc]' : ''}`}>
                                    <span className="text-[#64748b] flex-shrink-0">{item.label}</span>
                                    <span className="font-semibold text-[#0f172a] sm:text-right sm:max-w-[60%] break-words">{item.val || "—"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plan Info */}
                    {application.plan && (
                        <div className="bg-white border border-[#f1f5f9] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-[10px] flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={18} />
                                </div>
                                <h5 className="text-[15px] font-bold text-[#0f172a]">Subscription Plan</h5>
                            </div>

                            {!application.is_subscription_active && (
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[12px] px-4 py-3 mb-5">
                                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[13px] font-semibold text-amber-700">Subscription Not Active</p>
                                        <p className="text-[12px] text-amber-600 mt-0.5">
                                            This branch has selected the <span className="font-bold">{application.plan.name}</span> plan but hasn't activated a subscription yet.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="text-[14px]">
                                {[
                                    { label: "Plan Name", val: application.plan.name },
                                    { label: "Price", val: `EGP ${application.plan.price} / month` },
                                    { label: "Max Staff", val: application.plan.max_staff ?? "Unlimited" },
                                    { label: "Max Services", val: application.plan.max_services ?? "Unlimited" },
                                    { label: "Loyalty Program", val: application.plan.loyalty_enabled ? "✅ Enabled" : "❌ Disabled" },
                                    { label: "Offers & Promotions", val: application.plan.offers_enabled ? "✅ Enabled" : "❌ Disabled" },
                                ].map((item, i, arr) => (
                                    <div key={i} className={`flex flex-col sm:flex-row sm:justify-between py-3.5 gap-1 ${i < arr.length - 1 ? 'border-b border-[#f8fafc]' : ''}`}>
                                        <span className="text-[#64748b]">{item.label}</span>
                                        <span className="font-semibold text-[#0f172a]">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Logo */}
                    {application.logo_url && (
                        <div className="bg-white border border-[#f1f5f9] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6">
                            <h5 className="text-[15px] font-bold text-[#0f172a] mb-4">Business Logo</h5>
                            <img
                                src={application.logo_url}
                                alt="logo"
                                className="w-full h-40 object-cover rounded-[14px]"
                            />
                        </div>
                    )}

                    {/* Documents */}
                    <div className="bg-white border border-[#f1f5f9] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6">
                        <h5 className="text-[15px] font-bold text-[#0f172a] mb-4">
                            Documents
                            <span className="ml-2 text-[12px] font-normal text-[#94a3b8]">
                                ({docs.length} uploaded)
                            </span>
                        </h5>

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

                            return docs.length === 0 ? (
                                <p className="text-[13px] text-[#94a3b8] text-center py-4">
                                    No documents uploaded
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {docs.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex justify-between items-center p-3 border border-[#f1f5f9] rounded-[12px] hover:bg-[#f8fafc] transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <CircleCheckBig
                                                    size={18}
                                                    className="text-green-500 flex-shrink-0"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-[#1e293b] leading-tight truncate">
                                                        {DOC_LABELS[doc.type] || doc.type}
                                                    </p>

                                                    <p className="text-[11px] text-[#94a3b8]">
                                                        {new Date(provider.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedDoc(doc)}
                                                className="p-1.5 rounded-[8px] hover:bg-[#e2e8f0] transition-colors flex-shrink-0"
                                            >
                                                <Eye size={16} className="text-[#94a3b8]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* ── Doc Preview Modal ── */}
            {selectedDoc && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setSelectedDoc(null)}
                >
                    <div
                        className="bg-white w-full max-w-[680px] rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#f1f5f9] flex justify-between items-center">
                            <div className="min-w-0 mr-4">
                                <h5 className="font-bold text-[#0f172a] text-[15px] sm:text-[17px] truncate">
                                    {DOC_LABELS[selectedDoc.type] || selectedDoc.type}
                                </h5>
                                <p className="text-[12px] sm:text-[13px] text-[#94a3b8] mt-0.5">
                                    Uploaded {new Date(selectedDoc.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="p-2 rounded-[10px] hover:bg-[#f1f5f9] text-[#94a3b8] transition-colors flex-shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 bg-[#f8fafc]">
                            <div className="bg-[#e2e8f0] rounded-[14px] overflow-hidden flex items-center justify-center mb-4 sm:mb-5" style={{ minHeight: 200 }}>
                                {selectedDoc.file_url ? (
                                    <img
                                        src={selectedDoc.file_url}
                                        className="max-w-full max-h-[280px] sm:max-h-[320px] object-contain rounded-[8px]"
                                        alt="Document preview"
                                    />
                                ) : (
                                    <div className="text-center py-10 text-[#94a3b8]">
                                        <FileText size={36} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-[13px]">No preview available</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 sm:p-4 border border-[#f1f5f9] rounded-[12px]">
                                    <label className="block text-[11px] text-[#94a3b8] mb-1 uppercase tracking-wider">Status</label>
                                    <span className="text-green-500 font-semibold text-[13px] flex items-center gap-1.5">
                                        <CheckCircle2 size={14} /> Uploaded
                                    </span>
                                </div>
                                <div className="bg-white p-3 sm:p-4 border border-[#f1f5f9] rounded-[12px]">
                                    <label className="block text-[11px] text-[#94a3b8] mb-1 uppercase tracking-wider">Document Type</label>
                                    <span className="font-semibold text-[#0f172a] text-[12px] sm:text-[13px] break-words">
                                        {DOC_LABELS[selectedDoc.type] || selectedDoc.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 sm:px-6 py-4 sm:py-5 border-t border-[#f1f5f9] flex gap-3">
                            {selectedDoc.file_url && (
                                <a
                                    href={selectedDoc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-2.5 sm:py-3 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download size={15} /> Open Document
                                </a>
                            )}
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-[12px] border border-[#e2e8f0] text-[#1e293b] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewApplication;