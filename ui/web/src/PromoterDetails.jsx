import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "./utils/apiCache";

export default function PromoterDetails({
  user,
  promoter,
  promoterId,
  onLogin,
  onLogout,
  onDashboard,
  onAddProperty,
  onHome,
  onProperties,
  onAgencies,
  onPromoters,
  onAbout,
  onViewListing,
}) {
  const accountBaseUrl =
    import.meta.env.VITE_ACCOUNT_BASE_URL || "http://localhost:8080/api/account";
  const locationBaseUrl =
    import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
  const listingBaseUrl =
    import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8080/api/listing";

  const [currentPromoter, setCurrentPromoter] = useState(promoter || null);
  const [listings, setListings] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "" });

  const navClass = (key) =>
    key === "promoters"
      ? "text-sm font-semibold text-primary underline underline-offset-4"
      : "text-sm font-semibold text-slate-600 transition-colors hover:text-primary";

  useEffect(() => {
    let alive = true;
    const fetchJson = async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return response.json();
    };

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const targetId = promoter?.id || promoterId;
        if (!targetId) {
          setError("Promoter not found.");
          setLoading(false);
          return;
        }

        const [promoterData, wilayasData, communesData] = await Promise.all([
          fetchJson(`${accountBaseUrl}/promoteurs/${targetId}/`),
          cachedFetchJson(`${locationBaseUrl}/wilayas/`, { ttlMs: 600000 }),
          cachedFetchJson(`${locationBaseUrl}/communes/`, { ttlMs: 600000 }),
        ]);

        const listingsData = await fetchJson(
          `${listingBaseUrl}/properties/list/?user_id=${promoterData?.user_id || ""}`
        );

        if (!alive) return;
        setCurrentPromoter(promoterData);
        setListings(Array.isArray(listingsData) ? listingsData : []);
        setWilayas(Array.isArray(wilayasData) ? wilayasData : []);
        setCommunes(Array.isArray(communesData) ? communesData : []);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load promoter details.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, [accountBaseUrl, listingBaseUrl, locationBaseUrl, promoter?.id, promoterId]);

  const communeById = useMemo(() => {
    const map = new Map();
    communes.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [communes]);

  const wilayaById = useMemo(() => {
    const map = new Map();
    wilayas.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [wilayas]);

  const locationLabel = useMemo(() => {
    if (!currentPromoter) return "Unknown location";
    const commune = communeById.get(String(currentPromoter.commune_id));
    const wilaya = commune ? wilayaById.get(String(commune.wilaya_id)) : null;
    return (
      [commune?.name_en, wilaya?.name_en].filter(Boolean).join(", ") ||
      "Unknown location"
    );
  }, [currentPromoter, communeById, wilayaById]);

  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((item) => String(item.status_name || "").toLowerCase() === "active").length;
    const pending = listings.filter((item) => String(item.status_name || "").toLowerCase() === "pending").length;
    const rejected = listings.filter((item) => String(item.status_name || "").toLowerCase() === "rejected").length;
    return { total, active, pending, rejected };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesSearch = search
        ? [item.title, item.category_name, item.type_name, item.description]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))
        : true;
      return matchesSearch;
    });
  }, [listings, filters.search]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading promoter details...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && currentPromoter && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-28 w-28 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {currentPromoter.logo_url ? (
                        <img
                          className="h-full w-full object-cover"
                          src={currentPromoter.logo_url}
                          alt={currentPromoter.company_name}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-3xl">business</span>
                      )}
                    </div>
                    <h2 className="mt-4 text-2xl font-black">{currentPromoter.company_name}</h2>
                    <p className="text-sm text-slate-500 mt-1">{currentPromoter.owner_name}</p>
                    <p className="text-sm text-slate-500">{locationLabel}</p>
                  </div>
                  <div className="mt-6 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">location_on</span>
                      <span>{locationLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">person</span>
                      <span>{currentPromoter.owner_name || "Unknown owner"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">badge</span>
                      <span>Registration #{currentPromoter.registration_number || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">mail</span>
                      <span>contact@promoter.dz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">phone</span>
                      <span>+213 00 00 00 00</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-primary text-white p-4">
                    <p className="text-xs uppercase opacity-80">Total Listings</p>
                    <p className="text-2xl font-black">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500 text-white p-4">
                    <p className="text-xs uppercase opacity-80">Active</p>
                    <p className="text-2xl font-black">{stats.active}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-500 text-white p-4">
                    <p className="text-xs uppercase opacity-80">Pending</p>
                    <p className="text-2xl font-black">{stats.pending}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 text-white p-4">
                    <p className="text-xs uppercase opacity-80">Rejected</p>
                    <p className="text-2xl font-black">{stats.rejected}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-xl font-bold">About the Promoter</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {currentPromoter.description || "No description provided."}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Promoter Listings</h3>
                    <p className="text-sm text-slate-500">
                      Showing {filteredListings.length} of {stats.total} listings
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                      <input
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary w-full md:w-48"
                        placeholder="Search listing..."
                        type="text"
                        value={filters.search}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, search: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {filteredListings.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    No listings found for this promoter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredListings.map((item) => {
                      const image =
                        item.main_image_url ||
                        item.main_image ||
                        (Array.isArray(item.images) ? item.images[0]?.image_url : "") ||
                        "";
                      const commune = communeById.get(String(item.commune_id));
                      const wilaya = commune ? wilayaById.get(String(commune.wilaya_id)) : null;
                      const wilayaLabel = wilaya?.name_en || wilaya?.name_ar || "Wilaya";
                      const communeLabel = commune?.name_en || commune?.name_ar || "Commune";
                      const categoryName = item.category_name || item.category?.name || "Category";
                      const typeName = item.type_name || item.type?.name || "Type";
                      return (
                        <article
                          key={item.id}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group hover:shadow-xl transition-all duration-300 cursor-pointer"
                          onClick={() => onViewListing(item)}
                        >
                          <div className="relative h-56 overflow-hidden bg-slate-100">
                            {image ? (
                              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={image} alt={item.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                No image
                              </div>
                            )}
                            <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 tracking-wide">
                              {`${wilayaLabel} - ${communeLabel}`}
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-slate-900 truncate">{item.title}</h3>
                              <span className="text-primary font-black text-lg">{item.price} DA</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                              <span className="material-symbols-outlined text-base">location_on</span>
                              <span>{categoryName} | {typeName}</span>
                            </div>
                            <div className="flex items-center gap-4 py-3 border-t border-slate-100">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-slate-400">bed</span>
                                <span className="text-sm font-semibold">{item.bedrooms || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-slate-400">bathtub</span>
                                <span className="text-sm font-semibold">{item.bathrooms || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-slate-400">square_foot</span>
                                <span className="text-sm font-semibold">{item.area || 0}m2</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
