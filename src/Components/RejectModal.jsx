import React, { useState, useEffect, useRef } from "react";
import { X, AlertTriangle, ChevronDown } from "lucide-react";

// Application rejection reasons (used in ReviewApplication)
export const APPLICATION_REJECT_REASONS = [
    "Documents are incomplete or invalid",
    "Business information does not match documents",
    "Category is not supported on this platform",
    "Duplicate application already exists",
    "License or registration has expired",
    "Other",
];

// Service rejection reasons (used in ManageUsers)
export const SERVICE_REJECT_REASONS = [
    "Price is inappropriate or misleading",
    "Service duration is unrealistic",
    "Service does not match the branch category",
    "Service image is missing or low quality",
    "Duplicate service already exists for this branch",
    "Service name is inappropriate",
    "Other",
];

// Default fallback
const QUICK_REASONS = APPLICATION_REJECT_REASONS;

/**
 * RejectModal
 * Props:
 *  - isOpen: bool
 *  - onClose: () => void
 *  - onConfirm: (reason: string) => Promise<void>
 *  - loading: bool
 *  - title?: string          e.g. "Reject Application" | "Reject Service"
 *  - targetName?: string     e.g. business name / service name
 *  - reasons?: string[]      custom quick-select reasons list
 */
const RejectModal = ({ isOpen, onClose, onConfirm, loading, title = "Reject", targetName, reasons }) => {
    const quickReasonsList = reasons || QUICK_REASONS;
    const [reason, setReason] = useState("");
    const [quickPick, setQuickPick] = useState("");
    const [dropOpen, setDropOpen] = useState(false);
    const [error, setError] = useState("");
    const textareaRef = useRef(null);
    const dropRef = useRef(null);

    // reset every time modal opens
    useEffect(() => {
        if (isOpen) {
            setReason("");
            setQuickPick("");
            setError("");
        }
    }, [isOpen]);

    // close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // lock body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleQuickPick = (item) => {
        setQuickPick(item);
        setDropOpen(false);
        if (item === "Other") {
            setReason("");
            setTimeout(() => textareaRef.current?.focus(), 50);
        } else {
            setReason(item);
        }
        setError("");
    };

    const handleSubmit = async () => {
        const trimmed = reason.trim();
        if (!trimmed) {
            setError("Please provide a rejection reason.");
            return;
        }
        if (trimmed.length < 10) {
            setError("Reason must be at least 10 characters.");
            return;
        }
        await onConfirm(trimmed);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-[480px] rounded-[24px] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-[12px] flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-bold text-[#0f172a]">{title}</h3>
                            {targetName && (
                                <p className="text-[13px] text-[#64748b] mt-0.5 truncate max-w-[260px]">{targetName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-[8px] hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#1e293b] transition-colors mt-0.5"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                    {/* Quick Reasons Dropdown */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                            Quick Select Reason
                        </label>
                        <div className="relative" ref={dropRef}>
                            <button
                                type="button"
                                onClick={() => setDropOpen((o) => !o)}
                                className="w-full flex items-center justify-between px-4 py-3 border border-[#e2e8f0] rounded-[12px] text-[14px] text-left hover:border-[#94a3b8] transition-colors bg-white"
                            >
                                <span className={quickPick ? "text-[#1e293b] font-medium" : "text-[#94a3b8]"}>
                                    {quickPick || "Select a common reason..."}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`text-[#94a3b8] transition-transform flex-shrink-0 ml-2 ${dropOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {dropOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] rounded-[14px] shadow-xl z-10 overflow-hidden py-1.5">
                                    {quickReasonsList.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleQuickPick(item)}
                                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#f8fafc] transition-colors
                                                ${quickPick === item ? "text-red-500 font-semibold bg-red-50" : "text-[#1e293b]"}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#f1f5f9]" />
                        <span className="text-[11px] text-[#94a3b8] font-medium">OR WRITE MANUALLY</span>
                        <div className="flex-1 h-px bg-[#f1f5f9]" />
                    </div>

                    {/* Textarea */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                            Rejection Reason <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                                if (quickPick && e.target.value !== quickPick) setQuickPick("Other");
                            }}
                            placeholder="Explain why this is being rejected..."
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-[12px] text-[14px] text-[#1e293b] placeholder-[#cbd5e1] resize-none outline-none transition-colors
                                ${error ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-[#e2e8f0] focus:border-[#94a3b8] focus:ring-2 focus:ring-slate-100"}`}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                            {error
                                ? <p className="text-red-500 text-[12px]">{error}</p>
                                : <span />
                            }
                            <span className={`text-[11px] ml-auto ${reason.length < 10 ? "text-[#94a3b8]" : "text-green-500"}`}>
                                {reason.length} chars
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 rounded-[14px] border border-[#e2e8f0] text-[#1e293b] font-semibold text-[14px] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 rounded-[14px] bg-red-500 hover:bg-red-600 text-white font-semibold text-[14px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Rejecting...</>
                                : "Confirm Rejection"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;