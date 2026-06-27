import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getServicesByStatus } from "../../API/servicesApi";
import { getPlatformAnalytics } from "../../API/financeApi";
import { getRecentActivities, getAnalyticsOverview, getRevenueChart } from "../../API/analyticsApi";
import { getApplications } from "../../API/applicationApi";

import {
  CheckCircle, RefreshCw, UserPlus, CreditCard,
  XCircle, Clock, Building2, User, LayoutDashboard
} from "lucide-react";

const branchAppIcons = {
  APPROVED: { icon: CheckCircle, bg: "bg-green-100", color: "text-green-600" },
  PENDING_APPROVAL: { icon: Clock, bg: "bg-orange-100", color: "text-orange-600" },
  REJECTED: { icon: XCircle, bg: "bg-red-100", color: "text-red-600" },
  DEFAULT: { icon: Building2, bg: "bg-gray-100", color: "text-gray-600" },
};

const activityIcons = {
  branch_approved: { icon: CheckCircle, bg: "bg-green-100", color: "text-green-600" },
  branch_rejected: { icon: XCircle, bg: "bg-red-100", color: "text-red-600" },
  subscription_renewed: { icon: RefreshCw, bg: "bg-blue-100", color: "text-blue-600" },
  new_subscription: { icon: CreditCard, bg: "bg-indigo-100", color: "text-indigo-600" },
  user_registered: { icon: UserPlus, bg: "bg-purple-100", color: "text-purple-600" },
};

const PERIOD_MONTHS = {
  "Last 6 months": 6,
  "Last 3 months": 3,
  "Last month": 1,
};

// ─── Skeleton pulse base ──────────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-[#e2e8f0] rounded-[8px] ${className}`} />
);

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-sm p-6 flex items-center gap-4">
      <Sk className="w-12 h-12 rounded-[10px] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Sk className="h-7 w-24" />
        <Sk className="h-3 w-32" />
      </div>
    </div>
  );
}

// ─── Pending Row Skeleton ─────────────────────────────────────────────────────
function PendingRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <Sk className="w-9 h-9 rounded-[10px] flex-shrink-0" />
      <Sk className="h-4 flex-1" />
      <Sk className="h-3 w-16" />
      <Sk className="h-3 w-20 ml-3" />
    </div>
  );
}

// ─── Activity Row Skeleton ────────────────────────────────────────────────────
function ActivityRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Sk className="w-9 h-9 rounded-[10px] flex-shrink-0" />
      <Sk className="h-4 flex-1" />
      <Sk className="h-3 w-28" />
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-end gap-2 px-4 pb-4 pt-6">
      <div className="flex items-end gap-3 h-full">
        {[55, 75, 45, 90, 60, 80].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Sk className="w-full rounded-[6px]" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Sk key={i} className="flex-1 h-3" />
        ))}
      </div>
    </div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-[13px]">
        No data available
      </div>
    );
  }

  const W = 560, H = 320;
  const PAD = { top: 30, right: 16, bottom: 36, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  let step;
  if (maxVal <= 1000) step = 100;
  else if (maxVal <= 10000) step = 1000;
  else if (maxVal <= 100000) step = 10000;
  else step = 50000;

  const niceMax = Math.ceil(maxVal / step) * step;
  const ySteps = 6;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round((niceMax / ySteps) * i)
  );

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * innerW,
    y: PAD.top + innerH - (d.revenue / niceMax) * innerH,
    revenue: d.revenue,
    label: d.label,
  }));

  const shortLabel = (lbl) => {
    const [month, year] = lbl.split(" ");
    return `${month.slice(0, 3)} '${year.slice(2)}`;
  };

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`;

  const pathLen = pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = pts[i - 1];
    return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0) || 600;

  const fmt = (v) => v >= 1000 ? (v / 1000).toFixed(0) + "K" : v;

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yLabels.map((val, i) => {
          const y = PAD.top + innerH - (i / ySteps) * innerH;
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{fmt(val)}</text>
            </g>
          );
        })}

        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {shortLabel(data[i].label)}
          </text>
        ))}

        <path d={areaD} fill="url(#revAreaGrad)" style={{ opacity: animated ? 1 : 0, transition: "opacity 0.7s ease 0.4s" }} />
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: pathLen, strokeDashoffset: animated ? 0 : pathLen, transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }}
        />

        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="18" fill="transparent" style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ ...p, i })} onMouseLeave={() => setTooltip(null)} />
            <circle cx={p.x} cy={p.y} r="5" fill="#6366f1" stroke="white" strokeWidth="2"
              style={{ opacity: animated ? 1 : 0, transition: `opacity 0.3s ease ${0.8 + i * 0.07}s` }} />
            {p.revenue > 0 && (
              <text x={p.x} y={p.y - 11} textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600"
                style={{ opacity: animated ? 1 : 0, transition: `opacity 0.3s ease ${0.9 + i * 0.07}s` }}>
                {p.revenue.toLocaleString()}
              </text>
            )}
          </g>
        ))}
      </svg>

      {tooltip && (
        <div className="absolute pointer-events-none z-10 bg-[#0f172a] text-white text-[12px] font-semibold px-3 py-2 rounded-[10px] shadow-xl whitespace-nowrap"
          style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / H) * 100}%`, transform: "translate(-50%, -150%)" }}>
          <p className="text-[#94a3b8] text-[11px] font-normal mb-0.5">{tooltip.label}</p>
          <p>EGP {tooltip.revenue.toLocaleString()}</p>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 bg-[#0f172a] rotate-45" />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminOverview() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("Last 6 months");

  // ── individual loading states ──
  const [analyticsLoading,       setAnalyticsLoading]       = useState(true);
  const [overviewLoading,        setOverviewLoading]        = useState(true);
  const [branchesLoading,        setBranchesLoading]        = useState(true);
  const [servicesLoading,        setServicesLoading]        = useState(true);
  const [activitiesLoading,      setActivitiesLoading]      = useState(true);
  const [revenueLoading,         setRevenueLoading]         = useState(true);

  // ── data ──
  const [analytics,              setAnalytics]              = useState(null);
  const [overview,               setOverview]               = useState(null);
  const [pendingBranches,        setPendingBranches]        = useState([]);
  const [pendingServices,        setPendingServices]        = useState([]);
  const [allPendingServices,     setAllPendingServices]     = useState([]);
  const [activities,             setActivities]             = useState([]);
  const [allRevenueData,         setAllRevenueData]         = useState([]);

  useEffect(() => {
    getPlatformAnalytics("this_month")
      .then(res => setAnalytics(res.data.data))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  useEffect(() => {
    getAnalyticsOverview()
      .then(res => setOverview(res.data.data))
      .finally(() => setOverviewLoading(false));
  }, []);

  useEffect(() => {
    getApplications("PENDING_APPROVAL")
      .then(res => setPendingBranches(res.data.data?.branches?.slice(0, 3) || []))
      .finally(() => setBranchesLoading(false));
  }, []);

  useEffect(() => {
    getServicesByStatus("PENDING_APPROVAL")
      .then(res => {
        const data = res.data.data || [];
        setAllPendingServices(data);
        setPendingServices(data.slice(0, 3));
      })
      .finally(() => setServicesLoading(false));
  }, []);

  useEffect(() => {
    getRecentActivities()
      .then(res => setActivities(res.data.data))
      .finally(() => setActivitiesLoading(false));
  }, []);

  useEffect(() => {
    getRevenueChart()
      .then(res => setAllRevenueData(res.data.data || []))
      .finally(() => setRevenueLoading(false));
  }, []);

  const months = PERIOD_MONTHS[period] || 6;
  const revenueData = allRevenueData.slice(-months);

  return (
    <div className="p-[30px] bg-[#f8fafc] min-h-full font-sans">

      {/* Page Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[#1e293b] p-3 text-white shadow-sm">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight">Overview</h2>
            <p className="text-[14px] text-[#64748b] mt-0.5">Monitor and manage your platform performance</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {analyticsLoading || overviewLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={<DollarIcon />}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              label="Revenue This Month"
              value={`EGP ${analytics?.total_subscription_revenue || 0}`}
            />
            <StatCard
              icon={<HomeIcon />}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label="Active Branches"
              value={analytics?.total_active_businesses || 0}
            />
            <StatCard
              icon={<User size={30} />}
              iconBg="bg-orange-50"
              iconColor="text-orange-500"
              label="Total Users"
              value={overview?.total_users || 0}
            />
          </>
        )}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-5 gap-5 mb-5">

        {/* Pending Approvals */}
        <div className="col-span-3 bg-white rounded-[24px] border border-[#f1f5f9] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f8fafc]">
            <h2 className="text-[17px] font-bold text-[#0f172a]">Pending Approvals</h2>
          </div>

          {/* Branch Applications */}
          <div className="px-6 pb-2 pt-3">
            <div className="flex items-center justify-between py-2.5 border-b border-[#f8fafc]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-[10px] flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#0f172a]">Branch Applications</p>
                  <p className="text-[12px] text-[#94a3b8]">Applications waiting for your review</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {branchesLoading
                  ? <Sk className="w-6 h-6 rounded-full" />
                  : <span className="bg-indigo-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">{pendingBranches.length}</span>
                }
                <button className="text-[13px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors" onClick={() => navigate("/pending")}>
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 divide-y divide-[#f8fafc]">
            {branchesLoading
              ? [1, 2, 3].map(i => <PendingRowSkeleton key={i} />)
              : pendingBranches.map(b => {
                  const config = branchAppIcons[b.status] || branchAppIcons.DEFAULT;
                  const Icon = config.icon;
                  return (
                    <div key={b.id} className="flex items-center gap-3 py-3.5 hover:bg-[#f8fafc] -mx-6 px-6 transition-colors cursor-pointer">
                      <div className={`w-9 h-9 ${config.bg} rounded-[10px] flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1e293b]">{b.business_name}</p>
                      </div>
                      <span className="text-[13px] text-[#94a3b8]">{b.city}</span>
                      <span className="text-[13px] text-[#94a3b8] ml-3">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  );
                })
            }
          </div>

          <div className="mx-6 my-3 border-t border-[#f1f5f9]" />

          {/* Service Approvals */}
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between py-2.5 border-b border-[#f8fafc]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-[10px] flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#0f172a]">Service Approvals</p>
                  <p className="text-[12px] text-[#94a3b8]">Services waiting for your review</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {servicesLoading
                  ? <Sk className="w-6 h-6 rounded-full" />
                  : <span className="bg-orange-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">{allPendingServices.length}</span>
                }
                <button className="text-[13px] font-semibold text-orange-500 hover:text-indigo-700 transition-colors" onClick={() => navigate("/services")}>
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 divide-y divide-[#f8fafc]">
            {servicesLoading
              ? [1, 2, 3].map(i => <PendingRowSkeleton key={i} />)
              : pendingServices.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-3.5 hover:bg-[#f8fafc] -mx-6 px-6 transition-colors cursor-pointer">
                    <div className="w-9 h-9 bg-gray-100 rounded-[10px] flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1e293b]">{s.name}</p>
                    </div>
                    <span className="text-[13px] text-[#94a3b8]">{s.branch.business_name}</span>
                    <span className="text-[13px] text-[#94a3b8] ml-3">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── Revenue Chart Card ── */}
        <div className="col-span-2 bg-white rounded-[24px] border border-[#f1f5f9] shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
            <h2 className="text-[17px] font-bold text-[#0f172a]">Revenue Overview</h2>
            <div className="relative">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="appearance-none text-[13px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] pl-3 pr-7 py-1.5 text-[#64748b] focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option>Last 6 months</option>
                <option>Last 3 months</option>
                <option>Last month</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none text-xs">▾</span>
            </div>
          </div>
          <div className="flex-1 w-full px-2 pb-3 pt-2">
            {revenueLoading ? <ChartSkeleton /> : <RevenueChart data={revenueData} />}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-[24px] border border-[#f1f5f9] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f8fafc]">
          <h2 className="text-[17px] font-bold text-[#0f172a]">Recent Activity</h2>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {activitiesLoading
            ? [1, 2, 3, 4, 5].map(i => <ActivityRowSkeleton key={i} />)
            : activities.map((activity, index) => {
                const config = activityIcons[activity.type] || { icon: CreditCard, bg: "bg-gray-100", color: "text-gray-500" };
                const Icon = config.icon;
                return (
                  <div key={`${activity.id}-${index}`} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors">
                    <div className={`w-9 h-9 ${config.bg} rounded-[10px] flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <p className="flex-1 text-[14px] text-[#64748b]">
                      {activity.type === "branch_approved"
                        ? `Branch approved - ${activity.entity_name}`
                        : `Subscription renewed - ${activity.entity_name}`}
                    </p>
                    <span className="text-[13px] text-[#94a3b8] flex-shrink-0">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#f1f5f9] shadow-sm p-6 flex items-center gap-4">
      <div className={`${iconBg} w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[28px] font-bold text-[#0f172a] tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[13px] text-[#94a3b8] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const DollarIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);