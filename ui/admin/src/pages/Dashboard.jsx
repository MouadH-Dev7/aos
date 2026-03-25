import { useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";

export default function AdminDashboard({
  user,
  onLogout,
  listings,
  stats,
  loading,
  error,
  selectedListing,
  onSelectListing,
  onApprove,
  onReject,
  actionLoading,
  actionError,
  actionSuccess,
  onGoListings,
  onGoDashboard,
  onGoTypes,
  onGoCategories,
  onGoUsers,
  onGoDocumentTypes,
  onGoAmenities,
  onGoAgencies,
  onGoContractors,
}) {
  const moderationQueue = useMemo(
    () => listings.filter((item) => String(item.status_name || "").toLowerCase() === "pending").slice(0, 6),
    [listings]
  );
  const recentListings = useMemo(() => listings.slice(0, 6), [listings]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active="dashboard"
          pendingCount={stats.pending}
          onGoDashboard={onGoDashboard}
          onGoListings={onGoListings}
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
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90" type="button">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Quick Actions
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" type="button">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
                  <p className="text-[11px] text-slate-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 dark:border-slate-700"></div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-background-dark/50">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Listings", value: stats.total, icon: "list", tone: "primary", badge: "Live" },
                { label: "Active Ads", value: stats.active, icon: "check_circle", tone: "emerald", badge: "Live" },
                { label: "Pending Moderation", value: stats.pending, icon: "pending", tone: "amber", badge: "Needs Review" },
                { label: "Rejected", value: stats.rejected, icon: "gpp_bad", tone: "primary", badge: "Live" },
              ].map((card) => (
                <div key={card.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 ${card.tone === "emerald" ? "bg-emerald-500/10" : card.tone === "amber" ? "bg-amber-500/10" : "bg-primary/10"} rounded-lg`}>
                      <span className={`material-symbols-outlined ${card.tone === "emerald" ? "text-emerald-500" : card.tone === "amber" ? "text-amber-500" : "text-primary"}`}>{card.icon}</span>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${card.tone === "amber" ? "text-amber-500 bg-amber-50" : "text-emerald-500 bg-emerald-50"}`}>{card.badge}</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{card.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{loading ? "..." : card.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Moderation Queue</h2>
                  <span className="text-slate-400 text-sm">{stats.pending} pending</span>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {moderationQueue.length ? (
                    moderationQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4 cursor-pointer"
                        onClick={() => onSelectListing(item)}
                      >
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{item.title}</p>
                          <p className="text-xs text-primary font-medium">{item.price} DZD</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Listing #{item.id}</p>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors" type="button">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" type="button">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-slate-500">No pending listings.</div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                    <h2 className="text-lg font-bold">Recent Listings</h2>
                    <div className="text-xs text-slate-500">Latest {recentListings.length} items</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentListings.length ? (
                          recentListings.map((item) => {
                            const status = String(item.status_name || "Pending");
                            const statusLower = status.toLowerCase();
                            const badgeClass =
                              statusLower === "active"
                                ? "bg-emerald-100 text-emerald-600"
                                : statusLower === "pending"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-slate-200 text-slate-600";
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                onClick={() => onSelectListing(item)}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                                    <span className="text-sm font-bold">{item.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{item.type_name || "-"}</td>
                                <td className="px-6 py-4 text-sm font-bold">{item.price} DZD</td>
                                <td className="px-6 py-4 text-sm text-slate-500">Commune #{item.commune_id}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${badgeClass}`}>{status}</span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="px-6 py-6 text-sm text-slate-500" colSpan={5}>
                              {loading ? "Loading listings..." : "No listings found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {selectedListing && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">Quick Review</h3>
                          <p className="text-sm text-slate-500">Listing #{selectedListing.id}</p>
                        </div>
                        <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                          {selectedListing.status_name || "Pending"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Title</p>
                          <p className="font-semibold text-slate-700">{selectedListing.title}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Price</p>
                          <p className="font-semibold text-slate-700">{selectedListing.price} DZD</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                          <p className="font-semibold text-slate-700">Commune #{selectedListing.commune_id}</p>
                        </div>
                      </div>
                      {actionError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
                      )}
                      {actionSuccess && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionSuccess}</div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                          type="button"
                          onClick={() => onApprove(selectedListing)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? "Updating..." : "Approve"}
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                          type="button"
                          onClick={() => onReject(selectedListing)}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
