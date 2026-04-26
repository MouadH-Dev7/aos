import { useEffect, useMemo, useRef, useState } from "react";
import { cachedFetchJson } from "./utils/apiCache";
import { useLocation, useNavigate } from "react-router-dom";

export default function PropertyDetails({
 user,
 listing,
 listingId,
 onMyListings,
 onDashboard,
 onEditListing,
 onDeleted,
 successMessage,
 onClearSuccess,
}) {
 const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";
 const LOCATION_BASE_URL = import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
 const getAuthHeaders = () => {
  const access = localStorage.getItem("auth_access");
  return access ? { Authorization: `Bearer ${access}` } : {};
 };
 const [currentListing, setCurrentListing] = useState(listing || null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [locationInfo, setLocationInfo] = useState({ wilaya: null, commune: null, coords: null });
 const mapRef = useRef(null);
 const mapInstanceRef = useRef(null);
 const markerRef = useRef(null);
 const tileLayerRef = useRef(null);
 const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
 const [lightboxOpen, setLightboxOpen] = useState(false);
 const [activeImageIndex, setActiveImageIndex] = useState(0);
 const [zoom, setZoom] = useState(1);
 const [offset, setOffset] = useState({ x: 0, y: 0 });
 const dragRef = useRef({ dragging: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
 const pointersRef = useRef(new Map());
 const pinchRef = useRef({ startDistance: 0, startZoom: 1, startCenter: { x: 0, y: 0 }, startOffset: { x: 0, y: 0 } });
 const location = useLocation();
 const navigate = useNavigate();
 const routedListing = location?.state?.listing || null;

 const images = useMemo(() => {
 if (!currentListing) return [];
 const list = currentListing.images || [];
 const urls = list.map((img) => img.image_url).filter(Boolean);
 if (currentListing.main_image_url && !urls.includes(currentListing.main_image_url)) {
 urls.unshift(currentListing.main_image_url);
 }
 return urls;
 }, [currentListing]);

 const contacts = useMemo(() => {
  if (!currentListing) return [];
  const list = currentListing.contacts || [];
  return [...list].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
 }, [currentListing]);

 const mainImage = images[0] || "";
 const isOwner = Boolean(user?.id && currentListing?.user_id && String(user.id) === String(currentListing.user_id));
 const fallbackLat = locationInfo?.coords?.lat;
 const fallbackLon = locationInfo?.coords?.lon;
 const effectiveLat = Number.isFinite(Number(currentListing?.latitude)) ? Number(currentListing?.latitude) : Number(fallbackLat);
 const effectiveLon = Number.isFinite(Number(currentListing?.longitude)) ? Number(currentListing?.longitude) : Number(fallbackLon);

 const openLightbox = (index) => {
  setActiveImageIndex(index);
  setZoom(1);
  setOffset({ x: 0, y: 0 });
  setLightboxOpen(true);
 };

 const closeLightbox = () => {
  setLightboxOpen(false);
 };

 const handleWheel = (event) => {
  event.preventDefault();
  const nextZoom = Math.min(3, Math.max(1, zoom + (event.deltaY < 0 ? 0.2 : -0.2)));
  setZoom(nextZoom);
 };

 const handlePointerDown = (event) => {
  event.preventDefault();
  event.currentTarget.setPointerCapture?.(event.pointerId);
  pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointersRef.current.size === 1) {
   dragRef.current = {
    dragging: true,
    startX: event.clientX,
    startY: event.clientY,
    baseX: offset.x,
    baseY: offset.y,
   };
  }
  if (pointersRef.current.size === 2) {
   const pts = Array.from(pointersRef.current.values());
   const dx = pts[0].x - pts[1].x;
   const dy = pts[0].y - pts[1].y;
   pinchRef.current = {
    startDistance: Math.hypot(dx, dy),
    startZoom: zoom,
    startCenter: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
    startOffset: { x: offset.x, y: offset.y },
   };
  }
 };

 const handlePointerMove = (event) => {
  if (!pointersRef.current.has(event.pointerId)) return;
  pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointersRef.current.size === 2) {
   const pts = Array.from(pointersRef.current.values());
   const dx = pts[0].x - pts[1].x;
   const dy = pts[0].y - pts[1].y;
   const dist = Math.hypot(dx, dy);
   const scale = dist / (pinchRef.current.startDistance || dist);
   const nextZoom = Math.min(3, Math.max(1, pinchRef.current.startZoom * scale));
   setZoom(nextZoom);
   const center = {
    x: (pts[0].x + pts[1].x) / 2,
    y: (pts[0].y + pts[1].y) / 2,
   };
   setOffset({
    x: pinchRef.current.startOffset.x + (center.x - pinchRef.current.startCenter.x),
    y: pinchRef.current.startOffset.y + (center.y - pinchRef.current.startCenter.y),
   });
   return;
  }
  if (!dragRef.current.dragging) return;
  const dx = event.clientX - dragRef.current.startX;
  const dy = event.clientY - dragRef.current.startY;
  setOffset({ x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy });
 };

 const handlePointerUp = (event) => {
  if (event?.pointerId != null) {
   pointersRef.current.delete(event.pointerId);
  }
  dragRef.current.dragging = false;
 };

 useEffect(() => {
 if (currentListing || !listingId) return;
 if (routedListing && String(routedListing.id) === String(listingId)) {
  setCurrentListing(routedListing);
  return;
 }
 const load = async () => {
 setLoading(true);
 setError("");
 try {
 // Prefer direct fetch by id when available (works even for guests).
 const directRes = await fetch(`${LISTING_BASE_URL}/properties/${listingId}/`);
 if (directRes.ok) {
 const directData = await directRes.json();
 if (directData) {
  // If detail payload is partial, enrich from list endpoint.
  if (!directData.category_name || !directData.type_name || !directData.status_name) {
   const listData = await cachedFetchJson(`${LISTING_BASE_URL}/properties/list/`, { ttlMs: 30000 });
   const found = Array.isArray(listData)
    ? listData.find((item) => String(item.id) === String(listingId))
    : null;
   setCurrentListing(found || directData);
   return;
  }
  setCurrentListing(directData || null);
  return;
 }
 return;
 }

 // Fallback to user-specific list if we have an authenticated user.
 if (user?.id) {
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
 const found = Array.isArray(data)
  ? data.find((item) => String(item.id) === String(listingId))
  : null;
 setCurrentListing(found || null);
 return;
 }

 // Final fallback: public list endpoint.
 const listData = await cachedFetchJson(`${LISTING_BASE_URL}/properties/list/`, { ttlMs: 30000 });
 const found = Array.isArray(listData)
  ? listData.find((item) => String(item.id) === String(listingId))
  : null;
 setCurrentListing(found || null);
 if (found) return;

 const fallbackBody = await directRes.json().catch(() => ({}));
 throw new Error(fallbackBody?.detail || "Failed to load property");
 } catch (err) {
 setError(err?.message || "Failed to load property");
 } finally {
 setLoading(false);
 }
 };
 load();
 }, [LISTING_BASE_URL, currentListing, listingId, routedListing, user?.id]);

 useEffect(() => {
  if (!currentListing?.id) return;
  const loadContacts = async () => {
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/contacts/`);
      const data = await response.json();
      if (!response.ok) {
        return;
      }
      if (Array.isArray(data)) {
        setCurrentListing((prev) => {
          if (!prev) return prev;
          return { ...prev, contacts: data };
        });
      }
    } catch {
      // Ignore contact load errors in details view.
    }
  };
  loadContacts();
 }, [LISTING_BASE_URL, currentListing?.id]);

 useEffect(() => {
  if (!currentListing?.commune_id) {
    setLocationInfo({ wilaya: null, commune: null, coords: null });
    return;
  }
  const loadLocation = async () => {
    try {
      const [communesData, wilayasData] = await Promise.all([
        cachedFetchJson(`${LOCATION_BASE_URL}/communes/`, { ttlMs: 900000 }),
        cachedFetchJson(`${LOCATION_BASE_URL}/wilayas/`, { ttlMs: 900000 }),
      ]);
      const commune = (Array.isArray(communesData) ? communesData : []).find(
        (item) => String(item.id) === String(currentListing.commune_id)
      );
      const wilaya = commune
        ? (Array.isArray(wilayasData) ? wilayasData : []).find((item) => String(item.id) === String(commune.wilaya_id))
        : null;
      const lat = commune?.latitude ?? null;
      const lon = commune?.longitude ?? null;
      setLocationInfo({
        commune,
        wilaya,
        coords: Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) ? { lat: Number(lat), lon: Number(lon) } : null,
      });
    } catch {
      setLocationInfo({ wilaya: null, commune: null, coords: null });
    }
  };
  loadLocation();
 }, [LOCATION_BASE_URL, currentListing?.commune_id]);

 useEffect(() => {
  let cancelled = false;
  let retryTimer = null;

  const initMap = () => {
   if (cancelled) return;
   if (mapInstanceRef.current || !mapRef.current) return;
   if (!window.L) {
    retryTimer = setTimeout(initMap, 50);
    return;
   }
   if (window.L.Icon && window.L.Icon.Default) {
    window.L.Icon.Default.mergeOptions({
     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
     iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
   }
   const map = window.L.map(mapRef.current).setView([36.7538, 3.0588], 6);
   tileLayerRef.current = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
   }).addTo(map);
   mapInstanceRef.current = map;
   setTimeout(() => map.invalidateSize(), 0);
   setTimeout(() => map.invalidateSize(), 250);
  };

  initMap();
  return () => {
   cancelled = true;
   if (retryTimer) clearTimeout(retryTimer);
   if (mapInstanceRef.current) {
    mapInstanceRef.current.off();
    mapInstanceRef.current.remove();
    mapInstanceRef.current = null;
    markerRef.current = null;
    tileLayerRef.current = null;
   }
  };
 }, [currentListing?.id]);

useEffect(() => {
 if (!mapInstanceRef.current || !window.L || !currentListing) return;
 if (!Number.isFinite(effectiveLat) || !Number.isFinite(effectiveLon)) return;
 const map = mapInstanceRef.current;
 if (!tileLayerRef.current) {
  tileLayerRef.current = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
   attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
 }
 map.setView([effectiveLat, effectiveLon], Math.max(map.getZoom(), 13));
 if (!markerRef.current) {
 const markerIcon = window.L.divIcon({
 className: "",
 html: '<div style="width:14px;height:14px;background:#2563eb;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
 iconSize: [14, 14],
 iconAnchor: [7, 7],
 });
 markerRef.current = window.L.marker([effectiveLat, effectiveLon], { icon: markerIcon }).addTo(map);
 } else {
 markerRef.current.setLatLng([effectiveLat, effectiveLon]);
 }
 map.invalidateSize();
 setTimeout(() => map.invalidateSize(), 200);
 }, [currentListing, effectiveLat, effectiveLon]);

 useEffect(() => {
  if (!successMessage || !onClearSuccess) return;
  const timer = setTimeout(() => onClearSuccess(), 4000);
  return () => clearTimeout(timer);
 }, [successMessage, onClearSuccess]);

 useEffect(() => {
  if (!lightboxOpen) return;
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const onKey = (event) => {
   if (event.key === "Escape") closeLightbox();
   if (event.key === "ArrowRight") {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
   }
   if (event.key === "ArrowLeft") {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
   }
  };
  window.addEventListener("keydown", onKey);
  return () => {
   window.removeEventListener("keydown", onKey);
   document.body.style.overflow = prevOverflow;
  };
 }, [lightboxOpen, images.length]);

 const handleDelete = async () => {
 if (!currentListing?.id) return;

 setDeleteError("");
 setDeleteLoading(true);
 try {
 const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/`, {
 method: "DELETE",
 headers: { ...getAuthHeaders() },
 });
 if (!response.ok) {
 const data = await response.json().catch(() => ({}));
 throw new Error(data?.detail || "Failed to delete listing.");
 }
 if (onDeleted) {
 onDeleted();
 }
 } catch (err) {
 setDeleteError(err?.message || "Failed to delete listing.");
 } finally {
 setDeleteLoading(false);
 }
 };

 if (loading) {
 return <div className="min-h-screen bg-background-light px-6 py-10 text-sm text-slate-500">Loading property...</div>;
 }

 if (!currentListing) {
 return (
 <div className="min-h-screen bg-background-light px-6 py-10">
 <p className="text-sm text-slate-500">{error || "Property not found."}</p>
 <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" type="button" onClick={onMyListings}>
 Back to My Listings
 </button>
 </div>
 );
 }

 const statusName = currentListing.status_name || "Pending";
 const createdDate = currentListing.created_at ? new Date(currentListing.created_at).toLocaleDateString() : "—";
 const wilayaLabel =
  currentListing.wilaya_name ||
  locationInfo?.wilaya?.name_en ||
  locationInfo?.wilaya?.name_ar ||
  "Wilaya";
 const communeLabel =
  currentListing.commune_name ||
  locationInfo?.commune?.name_en ||
  locationInfo?.commune?.name_ar ||
  "Commune";

 return (
 <div className="bg-background-light font-display text-slate-900 min-h-screen">
 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
 <span>Listings</span>
 <span className="material-symbols-outlined text-xs">chevron_right</span>
 <span>{currentListing.category_name || "Category"}</span>
 <span className="material-symbols-outlined text-xs">chevron_right</span>
 <span className="text-primary font-medium">{currentListing.title}</span>
 </div>
 {successMessage && (
 <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center justify-between">
 <span>{successMessage}</span>
 <button className="text-emerald-700 font-bold" type="button" onClick={onClearSuccess}>
 Close
 </button>
 </div>
 )}
 {deleteError && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 <div className="lg:col-span-7 space-y-4">
 <div className="relative group aspect-video overflow-hidden rounded-xl bg-slate-200 shadow-sm">
 {mainImage ? (
 <button type="button" className="w-full h-full" onClick={() => openLightbox(0)}>
 <img alt={currentListing.title} className="w-full h-full object-cover" src={mainImage} />
 </button>
 ) : (
 <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No image</div>
 )}
 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
 <span className="material-symbols-outlined text-sm align-middle mr-1">photo_camera</span>
 {images.length ? `1/${images.length}` : "0/0"}
 </div>
 </div>

 {images.length > 0 && (
 <div className="grid grid-cols-4 gap-4">
 {images.slice(0, 4).map((src, index) => (
 <button
 key={`${src}-${index}`}
 type="button"
 className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${index === 0 ? "border-2 border-primary" : ""}`}
 onClick={() => openLightbox(index)}
 >
 <img className="w-full h-full object-cover" src={src} alt={`Property ${index + 1}`} />
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="lg:col-span-5 space-y-6">
 <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200">
 <div className="flex justify-between items-start mb-4">
 <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">
 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
 {statusName} {statusName === "Active" ? "" : ""}
 </span>
 <button className="text-slate-400 hover:text-primary transition-colors" type="button">
 <span className="material-symbols-outlined">favorite_border</span>
 </button>
 </div>
 <h1 className="text-2xl lg:text-3xl font-bold mb-2">{currentListing.title}</h1>
 <p className="text-slate-500 flex items-center gap-2 mb-6">
 <span className="material-symbols-outlined text-primary text-base">location_on</span>
 {currentListing.category_name} • {currentListing.type_name}
 </p>
 <div className="py-4 border-y border-slate-100 mb-6">
 <p className="text-sm text-slate-500 mb-1">Asking Price </p>
 <p className="text-3xl font-black text-primary tracking-tight">
 {currentListing.price} <span className="text-lg">DA</span>
 </p>
 </div>
 {isOwner && (
  <div className="grid grid-cols-2 gap-4">
   <button
    className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
    type="button"
    onClick={() => onEditListing?.(currentListing)}
   >
    <span className="material-symbols-outlined text-xl">edit</span>
    Edit Listing
   </button>
   <button
    className="w-full py-3 px-4 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
    type="button"
    onClick={handleDelete}
    disabled={deleteLoading}
   >
    <span className="material-symbols-outlined text-xl">delete</span>
    {deleteLoading ? "Deleting..." : "Delete "}
   </button>
  </div>
 )}
 </div>

 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
 <h3 className="font-bold mb-4 flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">analytics</span>
 Stats & Quick Info
 </h3>
 <div className="space-y-4">
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500">Listed on </span>
 <span className="font-medium">{createdDate}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500">Total Views </span>
 <span className="font-medium">—</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500">Interested Buyers </span>
 <span className="font-medium">—</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <section className="mt-8">
 <h2 className="text-xl font-bold mb-6">Property Overview </h2>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
 <span className="material-symbols-outlined text-primary/60">home</span>
 <span className="text-xs text-slate-500">Type</span>
 <span className="font-bold">{currentListing.type_name || "—"}</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
 <span className="material-symbols-outlined text-primary/60">category</span>
 <span className="text-xs text-slate-500">Category</span>
 <span className="font-bold">{currentListing.category_name || "—"}</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
 <span className="material-symbols-outlined text-primary/60">straighten</span>
 <span className="text-xs text-slate-500">Area</span>
 <span className="font-bold">{currentListing.area || 0}m²</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
 <span className="material-symbols-outlined text-primary/60">king_bed</span>
 <span className="text-xs text-slate-500">Bedrooms</span>
 <span className="font-bold">{currentListing.bedrooms || 0}</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center gap-2">
 <span className="material-symbols-outlined text-primary/60">shower</span>
 <span className="text-xs text-slate-500">Bathrooms</span>
 <span className="font-bold">{currentListing.bathrooms || 0}</span>
 </div>
 </div>
 </section>

 <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200">
 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">description</span>
 Description </h2>
 <div className="space-y-6 leading-relaxed">
 <p className="text-slate-700">{currentListing.description || "—"}</p>
 <div className="pt-6 border-t border-slate-100 text-right" dir="rtl">
 <p className="text-slate-700">—</p>
 </div>
 </div>
 </div>
 <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200">
 <h2 className="text-xl font-bold mb-6">Amenities</h2>
 {(currentListing.amenities || []).length ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {(currentListing.amenities || []).map((amenity) => (
 <div key={amenity.id} className="flex items-center gap-3">
 <span className="material-symbols-outlined text-green-500">check_circle</span>
 <span>{amenity.name}</span>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-slate-500">No amenities listed.</p>
 )}
 </div>

 <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200">
 <h2 className="text-xl font-bold mb-6">Documents</h2>
 {(currentListing.documents || []).length ? (
 <div className="space-y-3">
 {(currentListing.documents || []).map((doc) => (
 <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
 <div className="font-semibold text-slate-800">{doc.document_type_name || "Document"}</div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-slate-500">No documents listed.</p>
 )}
 </div>
 </div>
 <div className="space-y-8">

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="p-4 border-b border-slate-100">
 <h2 className="font-bold flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">contact_phone</span>
 Contact Info
 </h2>
 </div>
 {contacts.length ? (
 <div className="p-4 space-y-3 text-sm">
 {contacts.map((contact) => (
 <div key={contact.id} className="flex items-center gap-3">
 <span className="material-symbols-outlined text-primary text-base">contact_phone</span>
 <div>
 <div className="text-xs text-slate-500">{contact.contact_type_name || "Contact"}</div>
 <div className="font-medium">{contact.value}</div>
 </div>
 {contact.is_primary && <span className="ml-auto text-[10px] font-bold text-primary">PRIMARY</span>}
 </div>
 ))}
 </div>
 ) : (
 <div className="p-4 text-sm text-slate-500">No contacts listed.</div>
 )}
 </div>


 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="p-4 border-b border-slate-100">
 <h2 className="font-bold flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">map</span>
 Location </h2>
 </div>
 <div className="h-64 bg-slate-100 relative overflow-hidden">
 <div ref={mapRef} className="absolute inset-0 w-full h-full"></div>
 {(!Number.isFinite(effectiveLat) || !Number.isFinite(effectiveLon)) && (
 <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
 <span className="material-symbols-outlined text-4xl mb-2">place</span>
 <span className="text-xs">No location coordinates yet</span>
 </div>
 )}
 </div>
 <div className="p-4 text-sm">
 <p className="font-semibold">Location</p>
 <p className="text-slate-500">{wilayaLabel} - {communeLabel}</p>
 </div>
 </div>

 <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
 <h4 className="font-bold text-primary mb-2">Need Help? </h4>
 <p className="text-sm text-slate-600 mb-4">Our support team is available 24/7 for any questions regarding your listing.</p>
 <button
 className="block w-full py-2 bg-white border border-primary/30 text-center text-primary font-bold rounded-lg text-sm hover:bg-primary hover:text-white transition-all"
 type="button"
 onClick={() => navigate("/contact")}
 >
 Contact Support </button>
 </div>
 </div>
 </section>

 <footer className="mt-12 mb-20 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-8 gap-4">
 <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors" type="button" onClick={onMyListings}>
 <span className="material-symbols-outlined">arrow_back</span>
 Back to Listings </button>
 <div className="flex gap-4">
 <button className="px-6 py-2 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:brightness-110 transition-all" type="button">
 Promote Listing </button>
 </div>
 </footer>
 </main>
 {lightboxOpen && images[activeImageIndex] && (
 <div
 className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
 onClick={closeLightbox}
 onPointerMove={handlePointerMove}
 onPointerUp={handlePointerUp}
 onPointerLeave={handlePointerUp}
 onWheel={(event) => event.preventDefault()}
 onTouchMove={(event) => event.preventDefault()}
 >
 <div className="absolute top-6 right-6 flex items-center gap-2">
 <button
 type="button"
 className="rounded-full bg-white/10 text-white px-3 py-2 text-sm font-semibold hover:bg-white/20"
 onClick={(e) => {
 e.stopPropagation();
 setZoom(1);
 setOffset({ x: 0, y: 0 });
 }}
 >
 Reset
 </button>
 <button
  type="button"
  className="rounded-full bg-white/10 text-white px-3 py-2 text-sm font-semibold hover:bg-white/20"
  onClick={(e) => {
   e.stopPropagation();
   closeLightbox();
  }}
 >
 Close
 </button>
 </div>
 <button
  type="button"
  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white p-3 hover:bg-white/20"
  onClick={(e) => {
   e.stopPropagation();
   setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
   setZoom(1);
   setOffset({ x: 0, y: 0 });
  }}
 >
  <span className="material-symbols-outlined">chevron_left</span>
 </button>
 <button
  type="button"
  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white p-3 hover:bg-white/20"
  onClick={(e) => {
   e.stopPropagation();
   setActiveImageIndex((prev) => (prev + 1) % images.length);
   setZoom(1);
   setOffset({ x: 0, y: 0 });
  }}
 >
  <span className="material-symbols-outlined">chevron_right</span>
 </button>
 <div className="max-w-[95vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
 <img
  src={images[activeImageIndex]}
  alt="Property"
  className="select-none cursor-grab active:cursor-grabbing"
  style={{
   transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
   transformOrigin: "center",
   transition: dragRef.current.dragging ? "none" : "transform 120ms ease",
   maxWidth: "95vw",
   maxHeight: "85vh",
  }}
  onWheel={handleWheel}
  onPointerDown={handlePointerDown}
  draggable={false}
 />
 </div>
 </div>
 )}
 </div>
 );
}



