import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson, peekCachedJson } from "./utils/apiCache";

export default function Properties({
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
  activeRoute,
  onViewListing,
}) {
  const listingBaseUrl =
    import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8080/api/listing";
  const locationBaseUrl =
    import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";

  const cachedListings = peekCachedJson(`${listingBaseUrl}/properties/list/`, { ttlMs: 60000 });
  const cachedActiveListings = Array.isArray(cachedListings)
    ? cachedListings.filter((item) => (item.status_name || "").toLowerCase() === "active")
    : [];
  const initialListings = cachedActiveListings;
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [error, setError] = useState("");

  const [types, setTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);

  const [filters, setFilters] = useState({
    locationQuery: "",
    typeId: "",
    priceRange: "any",
    wilayaId: "",
    dairaId: "",
    communeId: "",
    bedrooms: "",
    amenityIds: [],
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const navClass = (key) =>
    key === activeRoute
      ? "text-sm font-semibold text-primary underline underline-offset-4"
      : "text-sm font-semibold text-slate-600 transition-colors hover:text-primary";

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        if (listings.length === 0) {
          setLoading(true);
        }
        setError("");
        const [propertiesData, typesData, amenitiesData] = await Promise.all([
          cachedFetchJson(`${listingBaseUrl}/properties/list/`, { ttlMs: 60000 }),
          cachedFetchJson(`${listingBaseUrl}/types/`, { ttlMs: 600000 }),
          cachedFetchJson(`${listingBaseUrl}/amenities/`, { ttlMs: 600000 }),
        ]);
        if (!isMounted) return;
        const allListings = Array.isArray(propertiesData) ? propertiesData : [];
        const activeOnly = allListings.filter(
          (item) => (item.status_name || "").toLowerCase() === "active"
        );
        setListings(activeOnly);
        setTypes(typesData || []);
        setAmenities(amenitiesData || []);

        const [wilayasData, dairasData, communesData] = await Promise.all([
          cachedFetchJson(`${locationBaseUrl}/wilayas/`, { ttlMs: 600000 }),
          cachedFetchJson(`${locationBaseUrl}/dairas/`, { ttlMs: 600000 }),
          cachedFetchJson(`${locationBaseUrl}/communes/`, { ttlMs: 600000 }),
        ]);
        if (!isMounted) return;
        setWilayas(wilayasData || []);
        setDairas(dairasData || []);
        setCommunes(communesData || []);
      } catch (err) {
        if (!isMounted) return;
        setError("Failed to load listings. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [listingBaseUrl, locationBaseUrl]);

  const communeById = useMemo(() => {
    const map = new Map();
    communes.forEach((c) => map.set(String(c.id), c));
    return map;
  }, [communes]);

  const dairaById = useMemo(() => {
    const map = new Map();
    dairas.forEach((d) => map.set(d.id, d));
    return map;
  }, [dairas]);

  const wilayaById = useMemo(() => {
    const map = new Map();
    wilayas.forEach((w) => map.set(w.id, w));
    return map;
  }, [wilayas]);

  const typeById = useMemo(() => {
    const map = new Map();
    types.forEach((t) => map.set(String(t.id), t));
    return map;
  }, [types]);

  const filteredDairas = useMemo(() => {
    if (!filters.wilayaId) return dairas;
    return dairas.filter((d) => String(d.wilaya_id) === String(filters.wilayaId));
  }, [dairas, filters.wilayaId]);

  const filteredCommunes = useMemo(() => {
    if (!filters.wilayaId && !filters.dairaId) return communes;
    return communes.filter((c) => {
      const matchWilaya = filters.wilayaId
        ? String(c.wilaya_id) === String(filters.wilayaId)
        : true;
      const matchDaira = filters.dairaId
        ? String(c.daira_id) === String(filters.dairaId)
        : true;
      return matchWilaya && matchDaira;
    });
  }, [communes, filters.wilayaId, filters.dairaId]);

  const formatPrice = (value) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return "0 DA";
    return `${numeric.toLocaleString("fr-FR")} DA`;
  };

  const filteredListings = useMemo(() => {
    const {
      locationQuery,
      typeId,
      priceRange,
      wilayaId,
      dairaId,
      communeId,
      bedrooms,
      amenityIds,
      sort,
    } = filters;

    let result = [...listings];

    if (typeId) {
      result = result.filter((p) => String(p.type) === String(typeId));
    }

    if (communeId) {
      result = result.filter((p) => String(p.commune_id) === String(communeId));
    } else if (wilayaId || dairaId) {
      result = result.filter((p) => {
        const commune = communeById.get(p.commune_id);
        if (!commune) return false;
        const matchWilaya = wilayaId
          ? String(commune.wilaya_id) === String(wilayaId)
          : true;
        const matchDaira = dairaId
          ? String(commune.daira_id) === String(dairaId)
          : true;
        return matchWilaya && matchDaira;
      });
    }

    if (locationQuery.trim()) {
      const query = locationQuery.trim().toLowerCase();
      result = result.filter((p) => {
        const commune = communeById.get(p.commune_id);
        const daira = commune ? dairaById.get(commune.daira_id) : null;
        const wilaya = commune ? wilayaById.get(commune.wilaya_id) : null;
        const parts = [
          p.title,
          p.description,
          commune?.name_en,
          commune?.name_ar,
          daira?.name_en,
          daira?.name_ar,
          wilaya?.name_en,
          wilaya?.name_ar,
        ].filter(Boolean);
        return parts.some((part) => String(part).toLowerCase().includes(query));
      });
    }

    if (priceRange !== "any") {
      result = result.filter((p) => {
        const price = Number(p.price || 0);
        if (priceRange === "1-5") return price >= 1000000 && price <= 5000000;
        if (priceRange === "5-20") return price > 5000000 && price <= 20000000;
        if (priceRange === "20+") return price > 20000000;
        return true;
      });
    }

    if (bedrooms) {
      const bedValue = Number(bedrooms);
      if (bedrooms === "4+") {
        result = result.filter((p) => Number(p.bedrooms || 0) >= 4);
      } else if (Number.isFinite(bedValue)) {
        result = result.filter((p) => Number(p.bedrooms || 0) === bedValue);
      }
    }

    if (amenityIds.length) {
      result = result.filter((p) => {
        const propertyAmenityIds = (p.amenities || []).map((a) => String(a.id));
        return amenityIds.every((id) => propertyAmenityIds.includes(String(id)));
      });
    }

    if (sort === "price-asc") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === "price-desc") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return result;
  }, [listings, filters, communeById, wilayaById, dairaById]);

  useEffect(() => {
    setPage(1);
  }, [
    filters.locationQuery,
    filters.typeId,
    filters.priceRange,
    filters.wilayaId,
    filters.dairaId,
    filters.communeId,
    filters.bedrooms,
    filters.amenityIds,
    filters.sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedListings = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, pageSize, safePage]);
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (id) => {
    setFilters((prev) => {
      const exists = prev.amenityIds.includes(id);
      return {
        ...prev,
        amenityIds: exists
          ? prev.amenityIds.filter((item) => item !== id)
          : [...prev.amenityIds, id],
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      locationQuery: "",
      typeId: "",
      priceRange: "any",
      wilayaId: "",
      dairaId: "",
      communeId: "",
      bedrooms: "",
      amenityIds: [],
      sort: "newest",
    });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Filters</h3>
                <button className="text-xs text-primary font-medium" type="button" onClick={resetFilters}>
                  Reset
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Search</label>
                <input
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2 px-3"
                  value={filters.locationQuery}
                  onChange={(event) => handleFilterChange("locationQuery", event.target.value)}
                  placeholder="City or keyword"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Type</label>
                <select
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2"
                  value={filters.typeId}
                  onChange={(event) => handleFilterChange("typeId", event.target.value)}
                >
                  <option value="">Any Type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Price Range</label>
                <select
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2"
                  value={filters.priceRange}
                  onChange={(event) => handleFilterChange("priceRange", event.target.value)}
                >
                  <option value="any">Any Price</option>
                  <option value="1-5">1M - 5M DA</option>
                  <option value="5-20">5M - 20M DA</option>
                  <option value="20+">20M+ DA</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Wilaya</label>
                <select
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2"
                  value={filters.wilayaId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilters((prev) => ({ ...prev, wilayaId: value, dairaId: "", communeId: "" }));
                  }}
                >
                  <option value="">All Wilayas</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.id} value={wilaya.id}>
                      {wilaya.name_en || wilaya.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Daira</label>
                <select
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2"
                  value={filters.dairaId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilters((prev) => ({ ...prev, dairaId: value, communeId: "" }));
                  }}
                >
                  <option value="">All Dairas</option>
                  {filteredDairas.map((daira) => (
                    <option key={daira.id} value={daira.id}>
                      {daira.name_en || daira.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Commune</label>
                <select
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2"
                  value={filters.communeId}
                  onChange={(event) => handleFilterChange("communeId", event.target.value)}
                >
                  <option value="">All Communes</option>
                  {filteredCommunes.map((commune) => (
                    <option key={commune.id} value={commune.id}>
                      {commune.name_en || commune.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Bedrooms</label>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4+"].map((bed) => (
                    <button
                      key={bed}
                      className={
                        filters.bedrooms === bed
                          ? "p-2 border border-primary bg-primary/10 text-primary rounded-lg text-xs font-bold"
                          : "p-2 border rounded-lg text-xs font-bold hover:border-primary"
                      }
                      type="button"
                      onClick={() =>
                        handleFilterChange("bedrooms", filters.bedrooms === bed ? "" : bed)
                      }
                    >
                      {bed}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Amenities</label>
                <div className="space-y-2">
                  {amenities.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        className="rounded text-primary focus:ring-primary"
                        type="checkbox"
                        checked={filters.amenityIds.includes(amenity.id)}
                        onChange={() => toggleAmenity(amenity.id)}
                      />
                      {amenity.name}
                    </label>
                  ))}
                  {!amenities.length && <p className="text-xs text-slate-400">No amenities loaded.</p>}
                </div>
              </div>
            </aside>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{filteredListings.length} Properties Found</h2>
                  <p className="text-slate-500 text-sm">Available listings across Algeria</p>
                </div>
                <select
                  className="rounded-lg border-slate-200 text-sm py-2 bg-white w-48"
                  value={filters.sort}
                  onChange={(event) => handleFilterChange("sort", event.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {loading && listings.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">Loading...</div>
              )}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>}

              {!error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pagedListings.map((property) => {
    const commune = communeById.get(String(property.commune_id));
                    const wilaya = commune ? wilayaById.get(commune.wilaya_id) : null;
                    const wilayaLabel = wilaya?.name_en || wilaya?.name_ar || "Wilaya";
                    const communeLabel = commune?.name_en || commune?.name_ar || "Commune";
                    const coverImage =
                      property.main_image_url ||
                      property.images?.[0]?.image_url ||
                      "https://images.unsplash.com/featured/?real-estate";
                    const typeName = typeById.get(String(property.type))?.name || "Type";
                    const categoryName = property.category_name || property.category?.name || "Category";
                    return (
                      <button
                        key={property.id}
                        type="button"
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden text-left transition-shadow hover:shadow-lg"
                        onClick={() => onViewListing?.(property)}
                      >
                        <div className="relative h-56 w-full">
                          <img className="h-full w-full object-cover transition-transform group-hover:scale-105" src={coverImage} alt={property.title} />
                          <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 tracking-wide">
                            {`${wilayaLabel} - ${communeLabel}`}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{property.title}</h3>
                            <span className="text-primary font-black text-lg">{formatPrice(property.price)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            <span>{categoryName} | {typeName}</span>
                          </div>
                          <div className="flex items-center gap-4 py-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400">bed</span>
                              <span className="text-sm font-semibold">{property.bedrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400">bathtub</span>
                              <span className="text-sm font-semibold">{property.bathrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400">square_foot</span>
                              <span className="text-sm font-semibold">{property.area || 0}m2</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredListings.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 py-12">
                      No results found.
                    </div>
                  )}
                </div>
              )}
              {!loading && !error && filteredListings.length > 0 && (
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
                        {pageNumbers[0] > 2 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                      </>
                    )}
                    {pageNumbers.map((num) => (
                      <button
                        key={num}
                        className={`px-3 py-2 rounded-lg border text-sm ${
                          num === safePage
                            ? "border-primary bg-primary text-white"
                            : "border-slate-200"
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
          </div>
        </div>
      </main>
    </div>
  );
}
