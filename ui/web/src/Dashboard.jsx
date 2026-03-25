import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "./utils/apiCache";

export default function Dashboard({ user, stats, onLogout, onHome, onAddProperty, onMyListings, onViewListing, onSettings }) {
 const favoritesCount = stats?.favorites ?? 0;
 const inquiriesCount = stats?.inquiries ?? 0;
 const messagesCount = stats?.messages ?? 0;
 const [recentListings, setRecentListings] = useState([]);
 const [recentLoading, setRecentLoading] = useState(false);
 const [recentError, setRecentError] = useState("");
 const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";
 const LOCATION_BASE_URL =
 import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
 const [wilayas, setWilayas] = useState([]);
 const [communes, setCommunes] = useState([]);

 useEffect(() => {
 const loadRecentListings = async () => {
 if (!user?.id) return;
 setRecentLoading(true);
 setRecentError("");
 try {
<<<<<<< HEAD
 const access = localStorage.getItem("auth_access");
 if (!access) {
  throw new Error("Please login before viewing your listings.");
 }
 const response = await fetch(`${LISTING_BASE_URL}/properties/list/?user_id=${user.id}`, {
  headers: { Authorization: `Bearer ${access}` },
 });
 const data = await response.json();
 if (!response.ok) {
  throw new Error(data?.detail || "Failed to load listings");
 }
=======
 const data = await cachedFetchJson(
 `${LISTING_BASE_URL}/properties/list/?user_id=${user.id}`,
 { ttlMs: 30000 }
 );
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
 const items = Array.isArray(data) ? data.slice(0, 3) : [];
 setRecentListings(items);
 } catch (error) {
 setRecentError(error?.message || "Failed to load listings");
 } finally {
 setRecentLoading(false);
 }
 };

 loadRecentListings();
 }, [LISTING_BASE_URL, user?.id]);

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


 return (
 <div className="font-sans antialiased bg-[#F9F7F5] text-gray-800 min-h-screen">
 <div className="flex min-h-screen">
 <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16" dir="rtl">
 <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
 <a className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors group bg-blue-50 text-primary border-r-4 border-primary" href="#">
 <div className="flex items-center gap-3">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 <span className="text-sm font-medium"> Home</span>
 </div>
 </a>
 <button
 className="flex w-full items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group"
 type="button"
 onClick={onMyListings}
 >
 <div className="flex items-center gap-3">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 <span className="text-sm font-medium"> My Listings</span>
 </div>
 </button>
 <a className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group" href="#">
 <div className="flex items-center gap-3">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 <span className="text-sm font-medium"> Saved Searches</span>
 </div>
 </a>
 <a className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group" href="#">
 <div className="flex items-center gap-3">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 <span className="text-sm font-medium"> Messages</span>
 </div>
 <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{messagesCount}</span>
 </a>
 <div className="pt-4 mt-4 border-t border-gray-100">
 <button
 className="flex w-full items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
 type="button"
 onClick={onSettings}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
 </svg>
 <span className="text-sm font-medium"> Settings</span>
 </button>
 </div>
 </nav>
 <div className="p-4 bg-gray-50 border-t border-gray-100">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-blue-100 rounded-lg text-primary">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 </div>
 <div className="flex-1">
 <p className="text-[10px] font-bold text-gray-400 uppercase">Support</p>
 <p className="text-xs text-gray-600">Contact Help Desk</p>
 </div>
 </div>
 </div>
 </aside>

 <main className="flex-1 p-4 md:p-8 lg:max-w-7xl mx-auto overflow-hidden">
 <section className="mb-8" dir="rtl">
 <div className="bg-primary rounded-2xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
 <div>
 <h1 className="text-2xl md:text-3xl font-bold mb-2"> {user?.name || "User"}!</h1>
 <p className="text-blue-100 max-w-md">
 {messagesCount} ({inquiriesCount}). .
 </p>
 <div className="mt-6 flex flex-wrap gap-3">
 <button className="bg-white text-primary px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors" type="button" onClick={onAddProperty}>
 Post an Ad </button>
 <button className="bg-primary/50 border border-white/30 backdrop-blur-sm px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-colors">
 My Favorites
 </button>
 </div>
 </div>
 <div className="hidden md:block">
 <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
 <svg className="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 </div>
 </div>
 </div>
 <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
 </div>
 </section>

 <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" dir="rtl">
 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
 <div className="w-12 h-12 bg-blue-50 text-primary rounded-lg flex items-center justify-center">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 </div>
 <div>
 <p className="text-2xl font-bold">{favoritesCount}</p>
 <p className="text-xs text-gray-500 font-medium"> Saved Listings</p>
 </div>
 </div>
 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
 <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 </div>
 <div>
 <p className="text-2xl font-bold">{inquiriesCount}</p>
 <p className="text-xs text-gray-500 font-medium"> Active Inquiries</p>
 </div>
 </div>
 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
 <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 ></path>
 </svg>
 </div>
 <div>
 <p className="text-2xl font-bold">{messagesCount}</p>
 <p className="text-xs text-gray-500 font-medium"> Messages</p>
 </div>
 </div>
 </section>

 <section className="mb-10">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-bold">Recently Viewed </h2>
 <button className="text-primary text-sm font-semibold hover:underline" type="button" onClick={onMyListings}>
 View all
 </button>
 </div>
 {recentError && (
 <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
 {recentError}
 </div>
 )}
 {recentLoading ? (
 <div className="text-sm text-slate-500">Loading listings...</div>
 ) : recentListings.length === 0 ? (
 <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">No listings yet.</div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
 {recentListings.map((listing) => {
 const cover = listing.main_image_url || listing.images?.[0]?.image_url;
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
 const typeName = listing.type_name || listing.type?.name || "Type";
 return (
 <button
 key={listing.id}
 className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left"
 type="button"
 onClick={() => onViewListing && onViewListing(listing)}
 >
 <div className="relative h-56 w-full overflow-hidden">
 {cover ? (
 <img alt={listing.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" src={cover} />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">No image</div>
 )}
 <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 tracking-wide">
 {`${wilayaLabel} - ${communeLabel}`}
 </div>
 </div>
 <div className="p-5">
 <div className="flex justify-between items-start mb-2">
 <h3 className="text-lg font-bold text-slate-900 truncate">{listing.title}</h3>
 <span className="text-primary font-black text-lg">{listing.price} DA</span>
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
 )}
 </section>
 </main>
 </div>
 </div>
 );
}

