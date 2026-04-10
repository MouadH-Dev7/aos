import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cachedFetchJson, peekCachedJson } from "./utils/apiCache";

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";
  const LOCATION_BASE_URL =
    import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
  
  const cachedListings = peekCachedJson(`${LISTING_BASE_URL}/properties/list/`, { ttlMs: 60000 });
  const cachedActiveListings = Array.isArray(cachedListings)
    ? cachedListings.filter((item) => (item.status_name || "").toLowerCase() === "active")
    : [];
  const [activeListings, setActiveListings] = useState(cachedActiveListings);
  const [loadingListings, setLoadingListings] = useState(cachedActiveListings.length === 0);
  const [listingsError, setListingsError] = useState("");
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let ignore = false;
    const loadListings = async () => {
      if (activeListings.length === 0) {
        setLoadingListings(true);
      }
      setListingsError("");
      try {
        const data = await cachedFetchJson(`${LISTING_BASE_URL}/properties/list/`, { ttlMs: 60000 });
        const all = Array.isArray(data) ? data : [];
        const active = all.filter((item) => (item.status_name || "").toLowerCase() === "active");
        if (!ignore) {
          setActiveListings(active);
        }
      } catch (err) {
        if (!ignore) {
          setListingsError(err?.message || "Failed to load listings");
          if (activeListings.length === 0) {
            setActiveListings([]);
          }
        }
      } finally {
        if (!ignore) setLoadingListings(false);
      }
    };
    loadListings();
    return () => { ignore = true; };
  }, [LISTING_BASE_URL]);

  useEffect(() => {
    let ignore = false;
    const loadLocations = async () => {
      try {
        const [wilayasData, communesData] = await Promise.all([
          cachedFetchJson(`${LOCATION_BASE_URL}/wilayas/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LOCATION_BASE_URL}/communes/`, { ttlMs: 900000 }),
        ]);
        if (!ignore) {
          setWilayas(Array.isArray(wilayasData) ? wilayasData : []);
          setCommunes(Array.isArray(communesData) ? communesData : []);
        }
      } catch {
        if (!ignore) {
          setWilayas([]);
          setCommunes([]);
        }
      }
    };
    loadLocations();
    return () => { ignore = true; };
  }, [LOCATION_BASE_URL]);

  const coverImage = (listing) => listing.main_image_url || listing.images?.[0]?.image_url || "";
  const formatPrice = (value) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return "0 DA";
    return `${numeric.toLocaleString("fr-FR")} DA`;
  };

  const communeById = useMemo(() => {
    const map = new Map();
    communes.forEach((c) => map.set(String(c.id), c));
    return map;
  }, [communes]);

  const wilayaById = useMemo(() => {
    const map = new Map();
    wilayas.forEach((w) => map.set(String(w.id), w));
    return map;
  }, [wilayas]);

  const totalPages = Math.max(1, Math.ceil(activeListings.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedListings = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return activeListings.slice(start, start + pageSize);
  }, [activeListings, pageSize, safePage]);
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

  useEffect(() => {
    setPage(1);
  }, [activeListings.length]);

  return (
    <div className="bg-background-light font-display text-slate-900 selection:bg-primary/20">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Simple Header for Landing */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background-light/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
<<<<<<< HEAD
              <img src="/logo_x.png" alt="Immo DZ" className="h-10 w-auto object-contain" />
=======
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">domain</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-primary">ImmoAlgeria</h1>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
            </Link>
            <nav className="hidden items-center gap-8 lg:flex">
              <Link to="/" className="text-sm font-semibold text-primary">Home</Link>
              <Link to="/properties" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Properties</Link>
              <Link to="/agencies" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Agencies</Link>
              <Link to="/promoters" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Promoters</Link>
              <Link to="/about" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">About</Link>
            </nav>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </button>
                  <button
                    className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-300"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* HERO SECTION */}
          <section className="relative px-6 py-12 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary">
                      Premium Real Estate Market
                    </span>
                    <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
                      Find Your Perfect <br /> <span className="text-primary">Algerian Home</span>
                    </h1>
                    <p className="max-w-md text-lg leading-relaxed text-slate-600">
                      Discover premium listings across the country, from Algiers' modern penthouses to Oran's coastal villas.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]"
                      onClick={() => navigate("/properties")}
                    >
                      Browse Listings
                    </button>
                    <button 
                      className="rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-900 transition-colors hover:bg-slate-50"
                      onClick={() => navigate("/add-property")}
                    >
                      List Your Property
                    </button>
                  </div>
                </div>
                {/* Hero Illustration */}
                <div className="relative hidden lg:block">
                  <div className="aspect-square overflow-hidden rounded-3xl bg-slate-200 shadow-2xl">
                    <img
                      alt="Luxury Home"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa4kXDB6CO7X15GKJujicISNBngFncbORCfqlrFQNEYDFNhRA_NhvPfJ_wDzVZsU3gyTeJpjCU-3h_ENvSlcLUFhHBEBlG_hr4xFEQek35UYuHpSxnzKRpaFlt5_BIvrYsdMpTkejqcooNrg6O5QtgBoCZWf761erOqGJH7s2hy-VzN_ZyF5egKzEj0WUd4rZML1UCnq0z23C5tdUpA2_s9fREAA967gnhCycbYxiJNm_E9ngfNsV_QVKt2o0j17v7YxER9GWZpliS"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURED LISTINGS */}
          <section className="px-6 py-20 bg-white">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Featured Listings</h2>
                  <p className="mt-2 text-slate-600">Active properties available right now.</p>
                </div>
                <Link to="/properties" className="hidden items-center gap-2 font-bold text-primary hover:underline lg:flex">
                  View All <span className="material-symbols-outlined">arrow_right_alt</span>
                </Link>
              </div>
              {loadingListings && activeListings.length === 0 ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : listingsError && activeListings.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {listingsError}
                </div>
              ) : (
                <>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {pagedListings.map((listing) => {
                      const commune =
                        listing.commune_name
                          ? { name_en: listing.commune_name, name_ar: listing.commune_name, wilaya_id: listing.wilaya_id }
                        : communeById.get(String(listing.commune_id));
                    const wilaya =
                      listing.wilaya_name
                        ? { name_en: listing.wilaya_name, name_ar: listing.wilaya_name }
                        : commune
                        ? wilayaById.get(String(commune.wilaya_id))
                        : null;
                    const wilayaLabel = wilaya?.name_en || wilaya?.name_ar || listing.wilaya_name || "Wilaya";
                    const communeLabel = commune?.name_en || commune?.name_ar || listing.commune_name || "Commune";
                    const categoryName = listing.category_name || listing.category?.name || "Category";
                    const typeName =
                      listing.type_name ||
                      listing.type?.name ||
                      (typeof listing.type === "string" ? listing.type : "") ||
                      "Type";
                    return (
                      <button
                        key={listing.id}
                        type="button"
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <div className="relative h-56 w-full">
                          <img
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            src={coverImage(listing) || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                          />
                          <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 tracking-wide">
                            {`${wilayaLabel} - ${communeLabel}`}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{listing.title}</h3>
                            <span className="text-primary font-black text-lg">{formatPrice(listing.price)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            <span>{categoryName} | {typeName}</span>
                          </div>
                          <div className="flex items-center gap-4 py-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400">bed</span>
                              <span className="text-sm font-semibold">{listing.bedrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400">bathtub</span>
                              <span className="text-sm font-semibold">{listing.bathrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400">square_foot</span>
                              <span className="text-sm font-semibold">{listing.area || 0}m2</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                    })}
                  </div>
                  {activeListings.length > pageSize && (
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
                </>
              )}
            </div>
          </section>
        </main>

        <footer className="bg-slate-900 px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-3">
<<<<<<< HEAD
                  <img src="/logo_x.png" alt="Immo DZ" className="h-10 w-auto object-contain" />
=======
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                    <span className="material-symbols-outlined text-2xl">domain</span>
                  </div>
                  <h2 className="text-xl font-bold">ImmoAlgeria</h2>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
                </div>
                <p className="mt-6 text-sm leading-relaxed text-slate-400">
                  The most trusted real estate platform in Algeria.
                </p>
              </div>
              {/* Footer Links could go here */}
            </div>
            <div className="mt-20 border-t border-slate-800 pt-10 text-center text-sm text-slate-500">
<<<<<<< HEAD
              <p>© 2026 Immo DZ. All rights reserved.</p>
=======
              <p>© 2026 ImmoAlgeria. All rights reserved.</p>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
