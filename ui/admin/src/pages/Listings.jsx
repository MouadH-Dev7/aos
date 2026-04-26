import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";

export default function AdminListings({
  user,
  listings,
  loading,
  error,
  onBack,
  onSelectListing,
  onGoTypes,
  onGoCategories,
  onGoUsers,
  onGoDocumentTypes,
  onGoAmenities,
  onGoAgencies,
  onGoContractors,
  onLogout,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [communeFilter, setCommuneFilter] = useState("");

  const total = listings.length;
  const pendingCount = listings.filter((item) => String(item.status_name || "").toLowerCase() === "pending").length;

  const statusBadge = (status) => {
    const s = String(status || "Pending").toLowerCase();
    if (s === "active") return "bg-emerald-100 text-emerald-600";
    if (s === "pending") return "bg-amber-100 text-amber-600";
    if (s === "rejected") return "bg-red-100 text-red-600";
    return "bg-slate-100 text-slate-500";
  };

  const categories = useMemo(() => {
    const set = new Set();
    listings.forEach((item) => {
      if (item?.category_name) set.add(item.category_name);
    });
    return Array.from(set).sort();
  }, [listings]);

  const types = useMemo(() => {
    const set = new Set();
    listings.forEach((item) => {
      if (item?.type_name) set.add(item.type_name);
    });
    return Array.from(set).sort();
  }, [listings]);

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);
    return listings.filter((item) => {
      if (statusFilter !== "all") {
        const statusName = String(item.status_name || "").toLowerCase();
        if (statusFilter === "inactive") {
          if (statusName === "active") return false;
        } else if (statusName !== statusFilter) {
          return false;
        }
      }
      if (categoryFilter !== "all") {
        if (String(item.category_name || "") !== categoryFilter) return false;
      }
      if (typeFilter !== "all") {
        if (String(item.type_name || "") !== typeFilter) return false;
      }
      if (communeFilter.trim()) {
        if (String(item.commune_id || "") !== communeFilter.trim()) return false;
      }
      if (ownerId.trim()) {
        if (String(item.user_id || "") !== ownerId.trim()) return false;
      }
      if (Number.isFinite(min) && Number(item.price || 0) < min) return false;
      if (Number.isFinite(max) && Number(item.price || 0) > max) return false;
      if (q) {
        const haystack = [
          item.id,
          item.title,
          item.user_id,
          item.commune_id,
          item.type_name,
          item.category_name,
          item.status_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [listings, maxPrice, minPrice, ownerId, query, statusFilter]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active="listings"
          pendingCount={pendingCount}
          onGoDashboard={onBack}
          onGoListings={() => {}}
          onGoTypes={onGoTypes}
          onGoCategories={onGoCategories}
          onGoUsers={onGoUsers}
          onGoDocumentTypes={onGoDocumentTypes}
          onGoAmenities={onGoAmenities}
          onGoAgencies={onGoAgencies}
          onGoContractors={onGoContractors}
          onLogout={onLogout}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="Search property, user, or transaction..."
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
                <p className="text-[11px] text-slate-500">Super Admin</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-background-dark/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Property Listings</h2>
                <p className="text-slate-500 text-sm mt-1">Total {total} properties.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors" type="button">
                  <span className="material-symbols-outlined text-lg">file_download</span>
                  Export CSV
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors" type="button">
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Add Listing
                </button>
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                      className="w-64 pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20"
                      placeholder="Search by ID, title, owner..."
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                  >
                    <option value="all">All Types</option>
                    {types.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    placeholder="Min price"
                    type="number"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                  />
                  <input
                    className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    placeholder="Max price"
                    type="number"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                  <input
                    className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    placeholder="Commune ID"
                    type="text"
                    value={communeFilter}
                    onChange={(event) => setCommuneFilter(event.target.value)}
                  />
                  <input
                    className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm"
                    placeholder="Owner ID"
                    type="text"
                    value={ownerId}
                    onChange={(event) => setOwnerId(event.target.value)}
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing {filteredListings.length} of {total}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input className="rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-slate-800" type="checkbox" />
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredListings.length ? (
                      filteredListings.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onSelectListing(item)}>
                          <td className="px-6 py-4">
                            <input className="rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-slate-800" type="checkbox" />
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">#{item.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0"></div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">{item.title}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{item.type_name || "Property"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium">User #{item.user_id}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold">{item.price} DZD</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">Commune #{item.commune_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${statusBadge(item.status_name)}`}>{item.status_name || "Pending"}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-primary transition-colors" type="button">
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={8}>
                          {loading ? "Loading listings..." : "No listings found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
