import React, { useEffect, useRef } from "react";

export default function LocationSection({
  wilayas, dairas, communes,
  selectedWilaya, setSelectedWilaya,
  selectedDaira, setSelectedDaira,
  selectedCommune, setSelectedCommune,
  latitude, setLatitude,
  longitude, setLongitude,
  loading
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const filteredDairas = selectedWilaya
    ? dairas.filter((d) => String(d.wilaya_id) === String(selectedWilaya))
    : [];
  const filteredCommunes = selectedDaira
    ? communes.filter((c) => String(c.daira_id) === String(selectedDaira))
    : [];

  useEffect(() => {
    if (selectedCommune) {
      const commune = communes.find((c) => String(c.id) === String(selectedCommune));
      if (commune?.latitude && commune?.longitude) {
        setLatitude(String(commune.latitude));
        setLongitude(String(commune.longitude));
      }
      return;
    }
    if (selectedDaira) {
      const daira = dairas.find((d) => String(d.id) === String(selectedDaira));
      if (daira?.latitude && daira?.longitude) {
        setLatitude(String(daira.latitude));
        setLongitude(String(daira.longitude));
      }
      return;
    }
    if (selectedWilaya) {
      const wilaya = wilayas.find((w) => String(w.id) === String(selectedWilaya));
      if (wilaya?.latitude && wilaya?.longitude) {
        setLatitude(String(wilaya.latitude));
        setLongitude(String(wilaya.longitude));
      }
    }
  }, [communes, dairas, selectedCommune, selectedDaira, selectedWilaya, wilayas, setLatitude, setLongitude]);

  const mapSrc = (() => {
    const latNum = Number(latitude);
    const lonNum = Number(longitude);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return "";
    const delta = 0.03;
    const left = lonNum - delta;
    const right = lonNum + delta;
    const bottom = latNum - delta;
    const top = latNum + delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latNum}%2C${lonNum}`;
  })();

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
    const map = window.L.map(mapRef.current).setView([36.7538, 3.0588], 8);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
    });
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);
  }, [setLatitude, setLongitude]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const latNum = Number(latitude);
    const lonNum = Number(longitude);
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
  }, [latitude, longitude]);

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary">location_on</span>
        <h4 className="text-lg font-bold">Location</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Wilaya</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary p-3"
            value={selectedWilaya}
            onChange={(event) => {
              setSelectedWilaya(event.target.value);
              setSelectedDaira("");
              setSelectedCommune("");
            }}
            disabled={loading || !wilayas?.length}
          >
            <option value="">Select Wilaya</option>
            {wilayas?.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Daira</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary p-3"
            value={selectedDaira}
            onChange={(event) => {
              setSelectedDaira(event.target.value);
              setSelectedCommune("");
            }}
            disabled={loading || !selectedWilaya}
          >
            <option value="">Select Daira</option>
            {filteredDairas.map((daira) => (
              <option key={daira.id} value={daira.id}>
                {daira.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Commune</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary p-3"
            value={selectedCommune}
            onChange={(event) => setSelectedCommune(event.target.value)}
            disabled={loading || !selectedDaira}
          >
            <option value="">Select Commune</option>
            {filteredCommunes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {commune.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Map Embed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 relative aspect-[21/9] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden group">
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-10"></div>
          {!mapSrc && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="text-center z-10 p-4">
                <span className="material-symbols-outlined text-4xl text-primary/40 mb-2">map</span>
                <p className="text-slate-500 font-medium">Select wilaya, daira, and commune to preview location</p>
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3 rounded-lg flex items-center gap-2 border border-slate-200 dark:border-slate-700 pointer-events-none z-20 shadow-md">
            <span className="material-symbols-outlined text-primary text-sm">info</span>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
              Click on the map to fine-tune the property location
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
