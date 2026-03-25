import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
<<<<<<< HEAD
import { ADMIN_BASE_URLS, fetchWithFallback } from "../api.js";
=======
import { ADMIN_BASE_URLS, fetchWithFallback, getAdminAuthHeaders } from "../api.js";
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

export default function AdminPropertyDetails({
  listing,
  onBack,
  onApprove,
  onReject,
  actionLoading,
  actionError,
  actionSuccess,
  onGoDashboard,
  onGoListings,
  onGoTypes,
  onGoCategories,
  onGoUsers,
  onGoDocumentTypes,
  onGoAmenities,
  onGoAgencies,
  onGoContractors,
  onLogout,
  pendingCount,
}) {
  const [currentListing, setCurrentListing] = useState(listing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewIndex, setPreviewIndex] = useState(-1);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

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

  useEffect(() => {
    if (currentListing || !listing?.id) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
<<<<<<< HEAD
        const access = localStorage.getItem("admin_access");
        const response = await fetchWithFallback(ADMIN_BASE_URLS, "/listings/", {
          headers: { Authorization: `Bearer ${access}` },
=======
        const response = await fetchWithFallback(ADMIN_BASE_URLS, "/listings/", {
          headers: getAdminAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load property");
        }
        const found = Array.isArray(data) ? data.find((item) => String(item.id) === String(listing.id)) : null;
        setCurrentListing(found || null);
      } catch (err) {
        setError(err?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentListing, listing?.id]);

  useEffect(() => {
    if (!currentListing?.id) return;
    const loadContacts = async () => {
      try {
<<<<<<< HEAD
        const access = localStorage.getItem("admin_access");
        const response = await fetchWithFallback(
          ADMIN_BASE_URLS,
          `/properties/${currentListing.id}/contacts/`,
          { headers: { Authorization: `Bearer ${access}` } }
=======
        const response = await fetchWithFallback(
          ADMIN_BASE_URLS,
          `/properties/${currentListing.id}/contacts/`,
          { headers: getAdminAuthHeaders() }
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        );
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
        // ignore
      }
    };
    loadContacts();
  }, [currentListing?.id]);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;
    if (!window.L) return;
    if (window.L.Icon && window.L.Icon.Default) {
      window.L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
    const map = window.L.map(mapRef.current).setView([36.7538, 3.0588], 6);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !currentListing) return;
    const latNum = Number(currentListing.latitude);
    const lonNum = Number(currentListing.longitude);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return;
    const map = mapInstanceRef.current;
    map.setView([latNum, lonNum], Math.max(map.getZoom(), 13));
    if (!markerRef.current) {
      const markerIcon = window.L.divIcon({
        className: "",
        html: '<div style="width:14px;height:14px;background:#2563eb;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      markerRef.current = window.L.marker([latNum, lonNum], { icon: markerIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng([latNum, lonNum]);
    }
    map.invalidateSize();
  }, [currentListing]);

  const previewImage =
    previewIndex >= 0 && previewIndex < images.length ? images[previewIndex] : "";

  const closePreview = () => setPreviewIndex(-1);
  const openPreview = (index) => setPreviewIndex(index);
  const showPrev = () => {
    if (!images.length) return;
    setPreviewIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  };
  const showNext = () => {
    if (!images.length) return;
    setPreviewIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImage]);

  if (loading) {
    return <div className="min-h-screen bg-background-light px-6 py-10 text-sm text-slate-500">Loading property...</div>;
  }

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-background-light px-6 py-10">
        <p className="text-sm text-slate-500">{error || "Property not found."}</p>
        <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" type="button" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statusName = currentListing.status_name || "Pending";
  const createdDate = currentListing.created_at ? new Date(currentListing.created_at).toLocaleDateString() : "â€”";

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active="listings"
          pendingCount={pendingCount}
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
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg">
                  <span className="material-symbols-outlined text-white">domain</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">ImmoAlgeria Admin</span>
              </div>
              <nav className="flex items-center gap-4 lg:gap-8">
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors" type="button" onClick={onBack}>
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span>Back</span>
                </button>
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
          <span>Admin</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span>Listings</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">{currentListing.title}</span>
        </div>

        {(actionError || actionSuccess) && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${actionError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {actionError || actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group aspect-video overflow-hidden rounded-xl bg-slate-200 shadow-sm">
              {mainImage ? (
                <button className="w-full h-full" type="button" onClick={() => openPreview(0)}>
                  <img alt={currentListing.title} className="w-full h-full object-cover" src={mainImage} />
                </button>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No image</div>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    className={`aspect-square rounded-lg overflow-hidden ${index === 0 ? "border-2 border-primary" : ""}`}
                    type="button"
                    onClick={() => openPreview(index)}
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
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold tracking-wide">
                  {statusName}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{currentListing.title}</h1>
              <p className="text-slate-500 flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-base">location_on</span>
                {currentListing.category_name} â€¢ {currentListing.type_name}
              </p>
              <div className="py-4 border-y border-slate-100 mb-6">
                <p className="text-sm text-slate-500 mb-1">Asking Price</p>
                <p className="text-3xl font-black text-primary tracking-tight">
                  {currentListing.price} <span className="text-lg">DA</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all"
                  type="button"
                  onClick={() => onApprove(currentListing)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Approve"}
                </button>
                <button
                  className="w-full py-3 px-4 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-all"
                  type="button"
                  onClick={() => onReject(currentListing)}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Stats & Quick Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Listed on</span>
                  <span className="font-medium">{createdDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Bedrooms</span>
                  <span className="font-medium">{currentListing.bedrooms || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Bathrooms</span>
                  <span className="font-medium">{currentListing.bathrooms || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Description
              </h2>
              <p className="text-slate-700">{currentListing.description || "â€”"}</p>
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
                  Contacts
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
                  Location
                </h2>
              </div>
              <div className="h-64 bg-slate-100 relative overflow-hidden">
                <div ref={mapRef} className="absolute inset-0 w-full h-full"></div>
                {(!currentListing.latitude || !currentListing.longitude) && (
                  <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl mb-2">place</span>
                    <span className="text-xs">No location coordinates yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
          </main>
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closePreview}
        >
          <div className="relative max-w-5xl w-full" onClick={(event) => event.stopPropagation()}>
            <button
              className="absolute -top-3 -right-3 bg-white text-slate-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg"
              type="button"
              onClick={closePreview}
              aria-label="Close preview"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
              type="button"
              onClick={showPrev}
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
              type="button"
              onClick={showNext}
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
            <img className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" src={previewImage} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
