import { useState, useEffect } from "react";
import { cachedFetchJson } from "../utils/apiCache";

const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";
const LOCATION_BASE_URL = import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8003";

export function useReferenceData() {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [contactTypes, setContactTypes] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoadError("");
      setLoading(true);
      try {
        const [categoryData, typeData, amenityData, documentTypeData, contactTypeData, wilayaData, dairaData, communeData] = await Promise.all([
          cachedFetchJson(`${LISTING_BASE_URL}/categories/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LISTING_BASE_URL}/types/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LISTING_BASE_URL}/amenities/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LISTING_BASE_URL}/document-types/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LISTING_BASE_URL}/contact-types/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LOCATION_BASE_URL}/wilayas/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LOCATION_BASE_URL}/dairas/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LOCATION_BASE_URL}/communes/`, { ttlMs: 900000 }),
        ]);

        if (!ignore) {
          setCategories(categoryData);
          setTypes(typeData);
          setAmenities(amenityData);
          setDocumentTypes(documentTypeData);
          setContactTypes(contactTypeData);
          setWilayas(wilayaData);
          setDairas(dairaData);
          setCommunes(communeData);
        }
      } catch (error) {
        if (!ignore) setLoadError(error?.message || "Failed to load reference data.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => { ignore = true; };
  }, []);

  return {
    categories,
    types,
    amenities,
    documentTypes,
    contactTypes,
    wilayas,
    dairas,
    communes,
    loading,
    loadError
  };
}
