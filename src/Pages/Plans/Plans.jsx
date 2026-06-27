import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Star, Building2, CheckCircle, XCircle } from 'lucide-react';
import { getPlans } from "../../API/plansApi";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Sk = ({ className }) => (
    <div className={`animate-pulse bg-[#e2e8f0] rounded-[8px] ${className}`} />
);

/* ─── Plan visual config by index ────────────────────────────────────────── */
const PLAN_STYLES = [
    { icon: <Zap size={22} />,      iconBg: "bg-blue-50",   iconColor: "text-blue-500",   accent: "#3b82f6", accentLight: "#eff6ff" },
    { icon: <Star size={22} />,     iconBg: "bg-indigo-50", iconColor: "text-indigo-500", accent: "#6366f1", accentLight: "#eef2ff" },
    { icon: <Building2 size={22} />, iconBg: "bg-purple-50", iconColor: "text-purple-500", accent: "#a855f7", accentLight: "#faf5ff" },
];

/* ─── Feature row ─────────────────────────────────────────────────────────── */
const FeatureRow = ({ label, value, accent }) => {
    const isBoolean = typeof value === 'boolean';
    return (
        <li className="flex items-center justify-between text-[13px] py-2 border-b border-[#f8fafc] last:border-0">
            <span className="text-[#64748b]">{label}</span>
            {isBoolean ? (
                value
                    ? <CheckCircle size={15} style={{ color: accent }} />
                    : <XCircle size={15} className="text-[#cbd5e1]" />
            ) : (
                <span className="font-semibold text-[#0f172a]">{value ?? 'Unlimited'}</span>
            )}
        </li>
    );
};

/* ─── Plan Card Skeleton ──────────────────────────────────────────────────── */
function PlanCardSkeleton() {
    return (
        <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-sm overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-[#e2e8f0]" />
            <div className="p-6 space-y-5 flex-grow">
                <div className="flex items-center gap-3">
                    <Sk className="w-10 h-10 rounded-[10px]" />
                    <Sk className="h-5 w-28" />
                </div>
                <Sk className="h-20 w-full rounded-[16px]" />
                <div className="space-y-3 pt-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between py-2 border-b border-[#f8fafc]">
                            <Sk className="h-3 w-28" />
                            <Sk className="h-3 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const PlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        getPlans()
            .then(res => setPlans(res.data.data || []))
            .catch(console.log)
            .finally(() => setPlansLoading(false));
    }, []);

    return (
        <div className="p-[30px] bg-[#f8fafc] min-h-screen font-sans">

            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-sm">
                    <CreditCard size={22} />
                </div>
                <div>
                    <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight">Plans</h2>
                    <p className="text-[14px] text-[#64748b] mt-0.5">Subscription plans available on the platform</p>
                </div>
            </div>

            {/* Plans Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plansLoading
                    ? [1, 2, 3].map(i => <PlanCardSkeleton key={i} />)
                    : plans.map((plan, i) => {
                        const style = PLAN_STYLES[i] || PLAN_STYLES[0];
                        return (
                            <div key={plan.id} className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-sm overflow-hidden flex flex-col relative">
                                {style.badge && (
                                    <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: style.accent }}>
                                        {style.badge}
                                    </div>
                                )}
                                <div className="h-1.5 w-full" style={{ backgroundColor: style.accent }} />
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={`${style.iconBg} p-2.5 rounded-[10px] ${style.iconColor}`}>
                                            {style.icon}
                                        </div>
                                        <h3 className="text-[17px] font-bold text-[#0f172a]">{plan.name}</h3>
                                    </div>
                                    <div className="rounded-[16px] p-4 mb-5 flex items-end gap-1" style={{ backgroundColor: style.accentLight }}>
                                        <span className="text-[13px] font-bold text-[#64748b] mb-1">EGP</span>
                                        <span className="text-[36px] font-extrabold leading-none" style={{ color: style.accent }}>{plan.price}</span>
                                        <span className="text-[13px] text-[#94a3b8] mb-1">/ month</span>
                                    </div>
                                    <ul className="flex-grow">
                                        <FeatureRow label="Max Staff"           value={plan.max_staff}       accent={style.accent} />
                                        <FeatureRow label="Max Services"        value={plan.max_services}    accent={style.accent} />
                                        <FeatureRow label="Loyalty Program"     value={plan.loyalty_enabled} accent={style.accent} />
                                        <FeatureRow label="Offers & Promotions" value={plan.offers_enabled}  accent={style.accent} />
                                    </ul>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
};

export default PlansPage;