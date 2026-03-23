import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "./utils/apiCache";

export default function MyListings({
 user,
 onHome,
 onDashboard,
 onAddProperty,
 onViewListing,
 onEditListing,
 successMessage,
 onClearSuccess,
}) {
 const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";
 const LOCATION_BASE_URL =
 import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
 const [listings, setListings] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [wilayas, setWilayas] = useState([]);
 const [communes, setCommunes] = useState([]);
 const handleView = (listing) => {
 if (onViewListing) onViewListing(listing);
 };

 const loadListings = async () => {
 if (!user?.id) return;
 setLoading(true);
 setError("");
 try {
 const data = await cachedFetchJson(
 `${LISTING_BASE_URL}/properties/list/?user_id=${user.id}`,
 { ttlMs: 30000 }
 );
 setListings(Array.isArray(data) ? data : []);
 } catch (err) {
 setError(err?.message || "Failed to load listings");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadListings();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [user?.id]);

 useEffect(() => {
 const loadLocations = async () => {
 try {
 const [wilayasData, communesData] = await Promise.all([
 cachedFetchJson(`${LOCATION_BASE_URL}/wilayas/`, { ttlMs: 900000 }),
 cachedFetchJson(`${LOCATION_BASE_URL}/communes/`, { ttlMs: 900000 }),
 ]);
 setWilayas(Array.isArray(wilayasData) ? wilayasData : []);
 setCommunes(Array.isArray(communesData) ? communesData : []);
 } catch {
 setWilayas([]);
 setCommunes([]);
 }
 };
 loadLocations();
 }, [LOCATION_BASE_URL]);

 useEffect(() => {
 if (!successMessage || !onClearSuccess) return;
 const timer = setTimeout(() => onClearSuccess(), 4000);
 return () => clearTimeout(timer);
 }, [successMessage, onClearSuccess]);

 const stats = useMemo(() => {
 const total = listings.length;
 const active = listings.filter((l) => (l.status_name || "").toLowerCase() === "active").length;
 const sold = listings.filter((l) => (l.status_name || "").toLowerCase() === "sold").length;
 return { total, active, sold };
 }, [listings]);

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

 const coverImage = (listing) => listing.main_image_url || listing.images?.[0]?.image_url || "";

 return (
 <div className="bg-background-light text-slate-900 min-h-screen">
 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
 <div>
 <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Listings <span className="font-bold"></span></h1>
 <p className="text-slate-500 max-w-lg">
 Manage your real estate portfolio across Algeria. Track performance and update your ads.
 . .
 </p>
 </div>
 <button
 className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
 type="button"
 onClick={onAddProperty}
 >
 <span className="material-symbols-outlined">add_circle</span>
 <span>Add New Listing </span>
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
 <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
 <span className="material-symbols-outlined">list_alt</span>
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings </p>
 <p className="text-2xl font-black text-slate-900">{stats.total}</p>
 </div>
 </div>
 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
 <div className="size-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
 <span className="material-symbols-outlined">check_circle</span>
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active </p>
 <p className="text-2xl font-black text-slate-900">{stats.active}</p>
 </div>
 </div>
 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
 <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
 <span className="material-symbols-outlined">archive</span>
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sold </p>
 <p className="text-2xl font-black text-slate-900">{stats.sold}</p>
 </div>
 </div>
 </div>

 {successMessage && (
 <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center justify-between">
 <span>{successMessage}</span>
 <button className="text-emerald-700 font-bold" type="button" onClick={onClearSuccess}>
 Close
 </button>
 </div>
 )}
 {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

 {loading ? (
 <div className="text-sm text-slate-500">Loading listings...</div>
 ) : listings.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 text-center">
 <div className="size-32 bg-primary/5 rounded-full flex items-center justify-center mb-6">
 <span className="material-symbols-outlined text-6xl text-primary/30">house_siding</span>
 </div>
 <h2 className="text-2xl font-bold text-slate-900 mb-2">No listings found yet!</h2>
 <p className="text-slate-500 mb-8 max-w-sm">
 Ready to sell or rent? Add your first property and start reaching thousands of seekers in Algeria.
 <br /> .
 </p>
 <button
 className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
 type="button"
 onClick={onAddProperty}
 >
 <span className="material-symbols-outlined">add_circle</span>
 Add New Listing </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {listings.map((listing) => {
 const cover = coverImage(listing);
 return (
 <button
 key={listing.id}
 className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left"
 type="button"
 onClick={() => handleView(listing)}
 >
 <div className="relative h-56 w-full">
 {cover ? (
 <img alt={listing.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" src={cover} />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">No image</div>
 )}
 <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 tracking-wide">
 {(() => {
 const commune =
 listing.commune_name
 ? { name_ar: listing.commune_name, name_en: listing.commune_name, wilaya_id: listing.wilaya_id }
 : communeById.get(String(listing.commune_id));
 const wilaya =
 listing.wilaya_name
 ? { name_ar: listing.wilaya_name, name_en: listing.wilaya_name }
 : commune
 ? wilayaById.get(String(commune.wilaya_id))
 : null;
 const wilayaLabel = wilaya?.name_en || wilaya?.name_ar || listing.wilaya_name || "Wilaya";
 const communeLabel = commune?.name_en || commune?.name_ar || listing.commune_name || "Commune";
 return `${wilayaLabel} - ${communeLabel}`;
 })()}
 </div>
 </div>
 <div className="p-5">
 <div className="flex justify-between items-start mb-2">
 <h3 className="text-lg font-bold text-slate-900 truncate">{listing.title}</h3>
 <span className="text-primary font-black text-lg">{listing.price} DA</span>
 </div>
 <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
 <span className="material-symbols-outlined text-base">location_on</span>
 <span>{listing.category_name} | {listing.type_name}</span>
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
 )}
 </main>
 </div>
 );
}
