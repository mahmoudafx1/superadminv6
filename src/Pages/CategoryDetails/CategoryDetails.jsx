import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Eye, ChevronRight, Mail, Phone, Tag } from "lucide-react";
import { getApprovedApplications, getApplicationById } from "../../API/applicationApi";


const formatTitle = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1);



function ProviderCard({ item, categoryType }) {

    return (
        <div className="bg-white rounded-[20px] overflow-hidden border border-[#edf2f7] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="relative h-[160px] bg-gray-100 overflow-hidden">
                <img
                    src={item.logo_url}
                    alt={item.business_name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-[20px]">

                <h5 className="text-[17px] font-bold text-[#1e293b] mb-1">
                    {item.business_name}
                </h5>

                <p className="text-[#64748b] text-[13px] mb-2">
                    {item.owner_name}
                </p>

                <p className="text-[#94a3b8] text-[13px] flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-[#64748b]" />
                    {item.city}
                </p>

                <div className="grid grid-cols-1 gap-2 mb-[20px] text-[12px] text-[#64748b]">
                    <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{item.email || "No email"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{item.phone || "No email"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tag size={14} />
                        <span>{item.category || "No email"}</span>
                    </div>
                </div>

                <Link
                    to={`/category/${categoryType}/${item.id}`}
                    className="w-full py-[12px] bg-[#0f172a] text-white rounded-[12px] font-semibold text-[13px] flex items-center justify-center gap-2 transition-all hover:bg-[#1e293b]"
                >
                    <Eye size={16} /> View Details
                </Link>
            </div>
        </div>
    );
}

function CategoryDetails() {
    const { categoryType } = useParams();

    const [search, setSearch] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 GET APPROVED FROM BACKEND
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await getApprovedApplications(categoryType);

                const branches = res?.data?.data?.branches || [];

                const fullBranches = await Promise.all(
                    branches.map(async (branch) => {
                        try {
                            const details = await getApplicationById(branch.id);

                            return {
                                ...branch,
                                ...details?.data?.data
                            };
                        } catch (err) {
                            console.log(`Error loading branch ${branch.id}`, err);
                            return branch;
                        }
                    })
                );
                const filteredBranches = fullBranches.filter(
                    (item) =>
                        item.category?.toLowerCase() === categoryType?.toLowerCase()
                );

                setData(filteredBranches);


            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryType]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            return item.business_name
                ?.toLowerCase()
                .includes(search.toLowerCase());
        });
    }, [data, search]);

    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Loading approved providers...
            </div>
        );
    }

    return (
        <div className="p-[25px] md:p-[40px] bg-[#f8fafc] min-h-screen">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-[20px] text-[14px]">
                <Link to="/providers" className="text-[#6366f1] font-medium hover:underline">
                    Providers
                </Link>

                <ChevronRight size={14} className="text-[#64748b]" />

                <span className="text-[#64748b] capitalize font-semibold">
                    {formatTitle(categoryType)}
                </span>
            </nav>

            {/* Header */}
            <div className="mb-[25px]">
                <h2 className="text-[28px] font-bold text-[#1e293b] mb-1">
                    {formatTitle(categoryType)} Providers
                </h2>

                <p className="text-[#64748b] text-[14px]">
                    Approved providers only
                </p>
            </div>

            {/* Search */}
            <div className="mb-[25px] max-w-[500px]">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${categoryType}...`}
                    className="w-full px-[20px] py-[12px] rounded-[12px] border border-[#e2e8f0] bg-white text-[14px]"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <ProviderCard
                            key={item.id}
                            item={item}
                            categoryType={categoryType}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        No approved providers in this category
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryDetails;