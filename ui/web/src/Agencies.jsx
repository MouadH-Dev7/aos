import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "./utils/apiCache";

export default function Agencies({
  user,
  onLogin,
  onLogout,
  onDashboard,
  onAddProperty,
  onHome,
  onProperties,
  onAgencies,
  onPromoters,
  onAbout,
  onViewAgency,
  activeRoute,
}) {
  const accountBaseUrl =
    import.meta.env.VITE_ACCOUNT_BASE_URL || "http://localhost:8080/api/account";
  const locationBaseUrl =
    import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
  const listingBaseUrl =
    import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8080/api/listing";

  const [agencies, setAgencies] = useState([]);
  const [listings, setListings] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    wilayaId: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const navClass = (key) =>
    key === activeRoute
      ? "text-sm font-semibold text-primary underline underline-offset-4"
      : "text-sm font-semibold text-slate-600 transition-colors hover:text-primary";

  const locationBases = useMemo(() => {
    const bases = [
      locationBaseUrl,
      "http://localhost:8080/api/location",
      "http://localhost:8003",
    ].filter(Boolean);
    const unique = [];
    bases.forEach((base) => {
      const normalized = String(base).replace(/\/+$/, "");
      if (normalized && !unique.includes(normalized)) {
        unique.push(normalized);
      }
    });
    return unique;
  }, [locationBaseUrl]);

  useEffect(() => {
    let alive = true;
    const fetchLocation = async (path) => {
      let lastErr;
      for (const base of locationBases) {
        try {
          return await cachedFetchJson(`${base}${path}`, { ttlMs: 600000 });
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error("Failed to load locations.");
    };
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [agenciesData, listingsData] = await Promise.all([
          cachedFetchJson(`${accountBaseUrl}/agences/`, { ttlMs: 60000 }),
          cachedFetchJson(`${listingBaseUrl}/properties/list/`, { ttlMs: 60000 }),
        ]);
        if (!alive) return;
        setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
        setListings(Array.isArray(listingsData) ? listingsData : []);

        const [wilayasData, dairasData, communesData] = await Promise.all([
          fetchLocation("/wilayas/"),
          fetchLocation("/dairas/"),
          fetchLocation("/communes/"),
        ]);
        if (!alive) return;
        setWilayas(Array.isArray(wilayasData) ? wilayasData : []);
        setDairas(Array.isArray(dairasData) ? dairasData : []);
        setCommunes(Array.isArray(communesData) ? communesData : []);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load agencies.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, [accountBaseUrl, listingBaseUrl, locationBases]);

  const communeById = useMemo(() => {
    const map = new Map();
    communes.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [communes]);

  const dairaById = useMemo(() => {
    const map = new Map();
    dairas.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [dairas]);

  const wilayaById = useMemo(() => {
    const map = new Map();
    wilayas.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [wilayas]);

  const listingsCountByUser = useMemo(() => {
    const map = new Map();
    listings.forEach((item) => {
      const userId = String(item.user_id || "");
      if (!userId) return;
      map.set(userId, (map.get(userId) || 0) + 1);
    });
    return map;
  }, [listings]);

  const enrichedAgencies = useMemo(() => {
    return agencies
      .map((agency) => {
        const commune = communeById.get(String(agency.commune_id));
        const daira = commune ? dairaById.get(String(commune.daira_id)) : null;
        const wilaya = commune ? wilayaById.get(String(commune.wilaya_id)) : null;
        const listingsCount = listingsCountByUser.get(String(agency.user_id)) || 0;
        const locationLabel =
          [commune?.name_en, daira?.name_en, wilaya?.name_en].filter(Boolean).join(", ") ||
          "Unknown location";
        return {
          ...agency,
          commune,
          daira,
          wilaya,
          listingsCount,
          locationLabel,
        };
      })
      .sort((a, b) => b.listingsCount - a.listingsCount || b.id - a.id);
  }, [agencies, communeById, dairaById, wilayaById, listingsCountByUser]);

  const filteredAgencies = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return enrichedAgencies.filter((agency) => {
      const matchesSearch = search
        ? [agency.company_name, agency.owner_name, agency.description, agency.locationLabel]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))
        : true;
      const matchesWilaya = filters.wilayaId
        ? String(agency.wilaya?.id || "") === String(filters.wilayaId)
        : true;
      return matchesSearch && matchesWilaya;
    });
  }, [enrichedAgencies, filters.search, filters.wilayaId]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.wilayaId]);

  const totalPages = Math.max(1, Math.ceil(filteredAgencies.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedAgencies = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAgencies.slice(start, start + pageSize);
  }, [filteredAgencies, pageSize, safePage]);
  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);
    const pages = [];
    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const spotlightAgency = filteredAgencies[0] || null;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Agencies Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic list from account service with automatic filters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <input
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
              type="text"
              placeholder="Search by company or owner..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
            />
            <select
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
              value={filters.wilayaId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, wilayaId: event.target.value }))
              }
            >
              <option value="">All Wilayas</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.id} value={wilaya.id}>
                  {wilaya.name_en || wilaya.name_ar}
                </option>
              ))}
            </select>
            <button
              className="h-11 rounded-xl bg-slate-200 text-sm font-bold text-slate-900"
              type="button"
              onClick={() => setFilters({ search: "", wilayaId: "" })}
            >
              Reset Filters
            </button>
          </div>
        </section>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading agencies...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && spotlightAgency && (
          <section className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-primary">Top Agency</p>
            <div className="mt-3 flex flex-col md:flex-row gap-5 md:items-center">
              <div className="h-20 w-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {spotlightAgency.logo_url ? (
                  <img
                    src={spotlightAgency.logo_url}
                    alt={spotlightAgency.company_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-slate-400">business</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">{spotlightAgency.company_name}</h3>
                <p className="text-sm text-slate-500">Owner: {spotlightAgency.owner_name}</p>
                <p className="text-sm text-slate-500">{spotlightAgency.locationLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-slate-400 font-bold">Active Listings</p>
                <p className="text-2xl font-black text-primary">{spotlightAgency.listingsCount}</p>
                <button
                  className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white"
                  type="button"
                  onClick={() => onViewAgency?.(spotlightAgency)}
                >
                  View Agency
                </button>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">All Agencies</h3>
              <span className="text-sm text-slate-500">{filteredAgencies.length} result(s)</span>
            </div>

            {filteredAgencies.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No agencies match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {pagedAgencies.map((agency) => (
                  <article
                    key={agency.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {agency.logo_url ? (
                          <img
                            src={agency.logo_url}
                            alt={agency.company_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">
                            business
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">{agency.company_name}</h4>
                        <p className="text-xs text-slate-500">Owner: {agency.owner_name}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{agency.locationLabel}</p>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {agency.description || "No description."}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Listings</span>
                      <span className="font-bold text-primary">{agency.listingsCount}</span>
                    </div>
                    <button
                      className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      type="button"
                      onClick={() => onViewAgency?.(agency)}
                    >
                      View Agency
                    </button>
                  </article>
                ))}
              </div>
            )}
            {filteredAgencies.length > 0 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Page {safePage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    Previous
                  </button>
                  {pageNumbers[0] > 1 && (
                    <>
                      <button
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        type="button"
                        onClick={() => setPage(1)}
                      >
                        1
                      </button>
                      {pageNumbers[0] > 2 && <span className="px-2 text-slate-400">...</span>}
                    </>
                  )}
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        num === safePage ? "border-primary bg-primary text-white" : "border-slate-200"
                      }`}
                      type="button"
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <button
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        type="button"
                        onClick={() => setPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
