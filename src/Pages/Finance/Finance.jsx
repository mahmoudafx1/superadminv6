import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Download, DollarSign, Calendar, RefreshCw,
    CreditCard, MoreVertical, RotateCcw,
    Download as DownloadIcon, X, AlertTriangle, CheckCircle,
    Clock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
    getBranchPayments,
    refundPayment,
    getFinancialSummary,
    getPaymentDetails,
} from "../../API/financeApi";
import { formatCurrency } from "../../utils/money";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Sk = ({ className }) => (
    <div className={`animate-pulse bg-[#e2e8f0] rounded-[8px] ${className}`} />
);

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] p-6 border border-[#f1f5f9] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
                <Sk className="w-10 h-10 rounded-[10px]" />
                <Sk className="h-3 w-32" />
            </div>
            <Sk className="h-8 w-28" />
            <div className="flex justify-between">
                <Sk className="h-3 w-24" />
                <Sk className="h-3 w-20" />
            </div>
        </div>
    );
}

function TableRowSkeleton() {
    return (
        <tr className="border-b border-[#f8fafc]">
            <td className="py-4 px-6"><div className="flex items-center gap-3"><Sk className="w-9 h-9 rounded-full flex-shrink-0" /><Sk className="h-4 w-32" /></div></td>
            <td className="py-4 px-6"><Sk className="h-4 w-20" /></td>
            <td className="py-4 px-6"><Sk className="h-4 w-16" /></td>
            <td className="py-4 px-6"><Sk className="h-6 w-16 rounded-full" /></td>
            <td className="py-4 px-6"><Sk className="h-4 w-28" /></td>
            <td className="py-4 px-6 flex justify-end"><Sk className="h-8 w-8 rounded-[8px]" /></td>
        </tr>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const filterMap = { Today: "today", "This Month": "this_month", "This Year": "this_year" };
const STATUS_TABS = ["All", "Paid", "Refunded"];

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase();
    if (s === "PAID")
        return <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full text-[11px] font-bold">Paid</span>;
    if (s === "REFUNDED")
        return <span className="bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-full text-[11px] font-bold">Refunded</span>;
    return <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1 rounded-full text-[11px] font-bold">Pending</span>;
};

// ─── Refund Modal ─────────────────────────────────────────────────────────────
const RefundModal = ({ payment, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[380px] mx-4 p-8 relative">
            <button onClick={onCancel} className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#1e293b] transition-colors"><X size={18} /></button>
            <div className="bg-orange-50 w-14 h-14 rounded-[16px] flex items-center justify-center mb-5">
                <AlertTriangle size={26} className="text-orange-500" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0f172a] mb-2">Refund Payment</h3>
            <p className="text-[#64748b] text-[14px] leading-relaxed mb-3">Are you sure you want to refund this payment? This action cannot be undone.</p>
            <p className="text-[#94a3b8] text-[13px] italic mb-8">Payment will be refunded to the original payment method.</p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 rounded-[14px] border border-[#e2e8f0] text-[#1e293b] font-semibold text-[14px] hover:bg-[#f8fafc] transition-colors">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-[14px] bg-red-500 text-white font-semibold text-[14px] hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Processing...' : 'Confirm Refund'}
                </button>
            </div>
        </div>
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => {
    if (!msg) return null;
    const isSuccess = msg.type === 'success';
    return (
        <div className="fixed top-6 right-6 z-[60] flex items-start gap-3 px-5 py-4 rounded-[16px] shadow-xl border max-w-[360px] bg-white border-[#e2e8f0]">
            {isSuccess
                ? <div className="bg-green-500 rounded-full p-1 mt-0.5 flex-shrink-0"><CheckCircle size={16} className="text-white" /></div>
                : <div className="bg-red-100 rounded-full p-1 mt-0.5 flex-shrink-0"><X size={16} className="text-red-500" /></div>
            }
            <div className="flex-1">
                <p className="font-bold text-[14px] text-[#0f172a]">{isSuccess ? 'Payment Refunded Successfully' : 'Refund Failed'}</p>
                <p className="text-[#64748b] text-[13px] mt-0.5">{msg.text}</p>
            </div>
            <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1e293b] ml-2 mt-0.5"><X size={15} /></button>
        </div>
    );
};

// ─── Actions Menu ─────────────────────────────────────────────────────────────
const ActionsMenu = ({ payment, onRefundClick, onDownloadReceipt }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const isRefunded = payment.payment_status?.toUpperCase() === 'REFUNDED';

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative flex justify-end" ref={ref}>
            <button onClick={() => setOpen(o => !o)} className="p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors text-[#94a3b8] hover:text-[#1e293b]">
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className="absolute right-0 mt-1 w-[180px] bg-white border border-[#e8ecf0] rounded-[16px] shadow-xl z-20 overflow-hidden py-1.5">
                    <button
                        onClick={() => { setOpen(false); if (!isRefunded) onRefundClick(payment); }}
                        disabled={isRefunded}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium hover:bg-[#f8fafc] transition-colors ${isRefunded ? 'text-[#cbd5e1] cursor-not-allowed' : 'text-red-500'}`}
                    >
                        <RotateCcw size={15} /> Refund Payment
                    </button>
                    <button
                        onClick={() => { setOpen(false); onDownloadReceipt(payment); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium hover:bg-[#f8fafc] transition-colors text-[#1e293b]"
                    >
                        <DownloadIcon size={15} /> Download Receipt
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ meta, page, setPage }) {
    if (!meta || meta.total_pages <= 1) return null;

    const { current_page, total_pages, total_records } = meta;
    const PER_PAGE = Math.ceil(total_records / total_pages);
    const from = (current_page - 1) * PER_PAGE + 1;
    const to = Math.min(current_page * PER_PAGE, total_records);

    // show at most 5 page buttons, centered on current
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(1, current_page - delta); i <= Math.min(total_pages, current_page + delta); i++) {
            range.push(i);
        }
        return range;
    };

    return (
        <div className="flex items-center justify-between px-8 py-5 border-t border-[#f8fafc]">
            <p className="text-[13px] text-[#94a3b8]">
                Showing <span className="font-semibold text-[#1e293b]">{from}–{to}</span> of{' '}
                <span className="font-semibold text-[#1e293b]">{total_records}</span> payments
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={current_page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers()[0] > 1 && (
                    <>
                        <button onClick={() => setPage(1)} className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-[#e2e8f0] text-[13px] font-semibold text-[#64748b] hover:bg-[#f8fafc] transition-colors">1</button>
                        {getPageNumbers()[0] > 2 && <span className="text-[#94a3b8] text-[13px] px-1">…</span>}
                    </>
                )}

                {getPageNumbers().map(n => (
                    <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-9 h-9 flex items-center justify-center rounded-[10px] text-[13px] font-semibold transition-colors ${current_page === n ? 'bg-indigo-500 text-white shadow-sm' : 'border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'}`}
                    >
                        {n}
                    </button>
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] < total_pages && (
                    <>
                        {getPageNumbers()[getPageNumbers().length - 1] < total_pages - 1 && <span className="text-[#94a3b8] text-[13px] px-1">…</span>}
                        <button onClick={() => setPage(total_pages)} className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-[#e2e8f0] text-[13px] font-semibold text-[#64748b] hover:bg-[#f8fafc] transition-colors">{total_pages}</button>
                    </>
                )}

                <button
                    onClick={() => setPage(p => Math.min(total_pages, p + 1))}
                    disabled={current_page === total_pages}
                    className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const FinancePage = () => {
    const [searchQuery,    setSearchQuery]    = useState("");
    const [financeSummary, setFinanceSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [payments,       setPayments]       = useState([]);
    const [meta,           setMeta]           = useState(null);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [timeFilter,     setTimeFilter]     = useState('This Year');
    const [statusTab,      setStatusTab]      = useState('All');
    const [page,           setPage]           = useState(1);
    const [refundTarget,   setRefundTarget]   = useState(null);
    const [refundLoading,  setRefundLoading]  = useState(false);
    const [toast,          setToast]          = useState(null);

    const showToast = (type, text) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 5000);
    };

    // ── Financial summary (static) ──
    useEffect(() => {
        getFinancialSummary()
            .then(res => setFinanceSummary(res.data.data))
            .catch(() => {})
            .finally(() => setSummaryLoading(false));
    }, []);

    // ── Payments (changes with filter + page) ──
    const fetchPayments = useCallback(async () => {
        try {
            setPaymentsLoading(true);
            const period = filterMap[timeFilter];
            const res = await getBranchPayments(period, page);
            const raw = res.data.data;
            setPayments(Array.isArray(raw) ? raw : raw?.payments || []);
            setMeta(raw?.meta || null);
        } catch {
            showToast('error', 'Failed to load payments');
        } finally {
            setPaymentsLoading(false);
        }
    }, [timeFilter, page]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    // reset to page 1 when filter changes
    useEffect(() => { setPage(1); }, [timeFilter, statusTab]);

    // ── PDF ──
    const downloadReceipt = async (payment) => {
        let details = payment;
        try {
            const res = await getPaymentDetails(payment.payment_id);
            details = { ...payment, ...res.data.data };
        } catch {}

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Payment Receipt", 14, 20);
        doc.setFontSize(11);
        doc.text(`Receipt ID: ${details.payment_id}`, 14, 30);
        const data = [
            ["Branch",          details.branch?.business_name || details.business_name],
            ["Plan",            details.plan?.name            || details.plan_name || "N/A"],
            ["Amount",          formatCurrency(details.amount)],
            ["Status",          details.payment_status],
            ["Payment Method",  details.payment_method || "N/A"],
            ["Date",            new Date(details.paid_at).toLocaleString()],
        ];
        autoTable(doc, { startY: 40, head: [["Field", "Value"]], body: data, theme: "grid" });
        doc.save(`receipt-${details.payment_id}.pdf`);
    };

    const exportReportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Financial Report", 14, 20);
        doc.setFontSize(11);
        doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 28);
        doc.setFontSize(13);
        doc.text("Summary", 14, 40);
        const summary = [
            ["Monthly Revenue",      financeSummary?.monthly_revenue?.value      || 0],
            ["Active Subscriptions", financeSummary?.active_subscriptions?.value || 0],
            ["Refunds",              financeSummary?.refunds?.value              || 0],
            ["Total Payments",       financeSummary?.total_payments?.value       || 0],
        ];
        autoTable(doc, { startY: 45, head: [["Metric", "Value"]], body: summary });
        const rows = filteredPayments.map(p => [
            p.business_name, p.plan_name || "N/A", p.amount, p.payment_status,
            new Date(p.paid_at).toLocaleString(),
        ]);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [["Branch", "Plan", "Amount", "Status", "Date"]],
            body: rows,
        });
        doc.save(`financial-report-${Date.now()}.pdf`);
    };

    const handleConfirmRefund = async () => {
        if (!refundTarget) return;
        try {
            setRefundLoading(true);
            await refundPayment(refundTarget.payment_id);
            setRefundTarget(null);
            showToast('success', 'The payment has been refunded.');
            fetchPayments();
        } catch (err) {
            setRefundTarget(null);
            showToast('error', err?.response?.data?.message || 'Refund failed. Please try again.');
        } finally {
            setRefundLoading(false);
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchStatus = statusTab === "All" || p.payment_status?.toUpperCase() === statusTab.toUpperCase();
        const q = searchQuery.toLowerCase();
        const matchSearch =
            p.business_name?.toLowerCase().includes(q) ||
            p.plan_name?.toLowerCase().includes(q) ||
            p.payment_status?.toLowerCase().includes(q) ||
            String(p.amount).includes(q);
        return matchStatus && matchSearch;
    });

    const statCards = [
        {
            icon: <DollarSign size={20} className="text-green-600" />, iconBg: 'bg-green-50',
            label: 'Monthly Revenue',      value: formatCurrency(financeSummary?.monthly_revenue?.value || 0),
            sub: 'From subscription plans', trend: financeSummary?.monthly_revenue?.trend || 0,
        },
        {
            icon: <Calendar size={20} className="text-blue-500" />, iconBg: 'bg-blue-50',
            label: 'Active Subscriptions', value: financeSummary?.active_subscriptions?.value || 0,
            sub: 'Currently active',        trend: financeSummary?.active_subscriptions?.trend || 0,
        },
        {
            icon: <RefreshCw size={20} className="text-orange-500" />, iconBg: 'bg-orange-50',
            label: 'Refunds',              value: formatCurrency(financeSummary?.refunds?.value || 0),
            sub: `${financeSummary?.refunds?.count || 0} refunded payments`, trend: financeSummary?.refunds?.trend || 0,
        },
        {
            icon: <CreditCard size={20} className="text-purple-500" />, iconBg: 'bg-purple-50',
            label: 'Total Payments',       value: financeSummary?.total_payments?.value || 0,
            sub: 'All transactions',        trend: financeSummary?.total_payments?.trend || 0,
        },
    ];

    return (
        <div className="p-[30px] bg-[#f8fafc] min-h-screen font-sans">

            <Toast msg={toast} onClose={() => setToast(null)} />

            {refundTarget && (
                <RefundModal
                    payment={refundTarget}
                    onConfirm={handleConfirmRefund}
                    onCancel={() => setRefundTarget(null)}
                    loading={refundLoading}
                />
            )}

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-[#16a34a] p-3 text-white shadow-sm">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight">Financial</h2>
                        <p className="text-[14px] text-[#64748b] mt-0.5">Track your platform revenue and payments</p>
                    </div>
                </div>
                <button
                    onClick={exportReportToPDF}
                    className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-[12px] font-semibold text-[14px] hover:bg-black transition-colors shadow-sm"
                >
                    <Download size={16} /> Export Report
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {summaryLoading
                    ? [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
                    : statCards.map((card, i) => (
                        <div key={i} className="bg-white rounded-[20px] p-6 border border-[#f1f5f9] shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`${card.iconBg} p-2.5 rounded-[10px]`}>{card.icon}</div>
                                <span className="text-[13px] font-medium text-[#64748b]">{card.label}</span>
                            </div>
                            <div className="text-[28px] font-bold text-[#0f172a] tracking-tight leading-none mb-1">{card.value}</div>
                            <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                                <span className="text-[12px] text-[#94a3b8]">{card.sub}</span>
                                <span className={`text-[12px] font-semibold ${card.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}% vs last month
                                </span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* ── Payment History Table ── */}
            <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-sm overflow-hidden">

                {/* Table Header */}
                <div className="flex flex-col gap-4 px-8 py-6 border-b border-[#f8fafc] md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Title with icon */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 p-2 rounded-[10px]">
                                <Clock size={16} className="text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-bold text-[#0f172a]">Payment History</h3>
                                {meta && !paymentsLoading && (
                                    <p className="text-[12px] text-[#94a3b8] mt-0.5">{meta.total_records} total payments</p>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by branch, plan, status..."
                                className="w-[260px] pl-9 pr-3 py-2.5 rounded-[12px] border border-[#e2e8f0] text-[13px] outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <svg className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Time Filter */}
                        <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-[12px]">
                            {Object.keys(filterMap).map(label => (
                                <button
                                    key={label}
                                    onClick={() => setTimeFilter(label)}
                                    className={`px-4 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all whitespace-nowrap ${timeFilter === label ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {/* Status Tabs */}
                        <div className="flex gap-1 bg-[#f8fafc] p-1 rounded-[12px]">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusTab(tab)}
                                    className={`px-4 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all ${statusTab === tab ? 'bg-blue-500 text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className="border-b border-[#f1f5f9]">
                                {['Branch', 'Plan', 'Amount', 'Status', 'Payment Date', 'Actions'].map(h => (
                                    <th key={h} className={`py-4 px-6 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paymentsLoading
                                ? [1, 2, 3, 4, 5, 6, 7].map(i => <TableRowSkeleton key={i} />)
                                : filteredPayments.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-[#94a3b8] text-[14px]">No payments found.</td>
                                        </tr>
                                    )
                                    : filteredPayments.map(payment => (
                                        <tr key={payment.payment_id} className="border-b border-[#f8fafc] hover:bg-[#fcfdfe] transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://i.pravatar.cc/150?u=${payment.branch_id}`} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                                                    <span className="font-semibold text-[#1e293b] text-[14px] truncate">{payment.business_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-[14px] text-[#64748b]">{payment.plan_name || 'N/A'}</td>
                                            <td className="py-4 px-6 font-semibold text-[14px] text-[#1e293b]">{formatCurrency(payment.amount)}</td>
                                            <td className="py-4 px-6"><StatusBadge status={payment.payment_status} /></td>
                                            <td className="py-4 px-6 text-[14px] text-[#64748b]">
                                                {new Date(payment.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <ActionsMenu payment={payment} onRefundClick={setRefundTarget} onDownloadReceipt={downloadReceipt} />
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!paymentsLoading && <Pagination meta={meta} page={page} setPage={setPage} />}
            </div>
        </div>
    );
};

export default FinancePage;