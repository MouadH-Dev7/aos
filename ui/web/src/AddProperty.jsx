import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BasicInfoSection from "./components/property/BasicInfoSection";
import LocationSection from "./components/property/LocationSection";
import DetailsSection from "./components/property/DetailsSection";
import MediaSection from "./components/property/MediaSection";
import { useReferenceData } from "./hooks/useReferenceData";

export default function AddProperty({ user }) {
  const navigate = useNavigate();
  const roleId = Number(user?.role_id || 0);
  const isUnlimitedRole = roleId === 2 || roleId === 3;
  const standardListingLimit = 2;
  
  const { categories, types, amenities, documentTypes, contactTypes, wilayas, dairas, communes, loading, loadError } = useReferenceData();

  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedDaira, setSelectedDaira] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  const [contacts, setContacts] = useState([]);
  const [selectedContactType, setSelectedContactType] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [contactPrimary, setContactPrimary] = useState(false);
  const [contactError, setContactError] = useState("");
  
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [documentError, setDocumentError] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  const [imageFiles, setImageFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [listingCount, setListingCount] = useState(0);
  const [loadingListingCount, setLoadingListingCount] = useState(false);
  
  const contactSeededRef = useRef(false);

  const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";

  useEffect(() => {
    let ignore = false;
    const access = localStorage.getItem("auth_access");

    if (!user?.id || !access || isUnlimitedRole) {
      setListingCount(0);
      setLoadingListingCount(false);
      return undefined;
    }

    const loadListingCount = async () => {
      setLoadingListingCount(true);
      try {
        const response = await fetch(`${LISTING_BASE_URL}/properties/list/?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load your listings.");
        }
        if (!ignore) {
          setListingCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        if (!ignore) {
          setSubmitError((current) => current || error?.message || "Failed to load your listings.");
        }
      } finally {
        if (!ignore) setLoadingListingCount(false);
      }
    };

    loadListingCount();
    return () => {
      ignore = true;
    };
  }, [LISTING_BASE_URL, isUnlimitedRole, user?.id]);

  const listingLimitReached = !isUnlimitedRole && listingCount >= standardListingLimit;

  useEffect(() => {
    const previews = imageFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setFilePreviews(previews);
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imageFiles]);

  useEffect(() => {
    if (contactSeededRef.current) return;
    if (!contactTypes.length) return;
    if (contacts.length) {
      contactSeededRef.current = true;
      return;
    }

    const next = [];
    const findType = (name) =>
      contactTypes.find((type) => String(type.name || "").toLowerCase() === name);

    const addSeed = (name, value, isPrimary) => {
      if (!value) return;
      const type = findType(name);
      if (!type) return;
      next.push({
        contact_type: Number(type.id),
        contact_type_name: type.name,
        value: String(value),
        is_primary: isPrimary,
        temp_id: `seed-${type.id}-${Date.now()}-${Math.random()}`,
      });
    };

    addSeed("phone", user?.phone, true);
    addSeed("email", user?.email, next.length === 0);

    if (next.length) {
      setContacts(next);
    }
    contactSeededRef.current = true;
  }, [contactTypes, contacts.length, user?.email, user?.phone]);

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id != amenityId) : [...prev, amenityId]
    );
  };

  const removeImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  const moveImage = (fromIndex, toIndex) => {
    setImageFiles((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleAddContact = () => {
    setContactError("");
    if (!selectedContactType || !contactValue.trim()) {
      setContactError("Select a contact type and enter a value.");
      return;
    }
    if (contacts.some((c) => String(c.contact_type) === String(selectedContactType) && String(c.value).trim().toLowerCase() === contactValue.trim().toLowerCase())) {
      setContactError("This contact is already added.");
      return;
    }
    const contact = {
      contact_type: Number(selectedContactType),
      contact_type_name: (contactTypes.find((c) => String(c.id) === String(selectedContactType)) || {}).name || "Contact",
      value: contactValue.trim(),
      is_primary: contactPrimary || contacts.length === 0,
      temp_id: `${selectedContactType}-${Date.now()}`,
    };
    setContacts((prev) => [contact, ...prev].map((c) => (contact.is_primary ? { ...c, is_primary: c.temp_id === contact.temp_id } : c)));
    setSelectedContactType("");
    setContactValue("");
    setContactPrimary(false);
  };

  const handleRemoveContact = (tempId) => {
    setContacts((prev) => {
      const next = prev.filter((c) => c.temp_id !== tempId);
      if (!next.length) return next;
      if (!next.some((c) => c.is_primary)) return next.map((c, index) => ({ ...c, is_primary: index === 0 }));
      return next;
    });
  };

  const handlePrimaryChange = (tempId) => {
    setContacts((prev) => prev.map((c) => ({ ...c, is_primary: c.temp_id === tempId })));
  };

  const handleAddDocument = () => {
    setDocumentError("");
    if (!selectedDocumentType) {
      setDocumentError("Select a document type.");
      return;
    }
    if (documents.some((doc) => String(doc.document_type) === String(selectedDocumentType))) {
      setDocumentError("This document type is already added.");
      return;
    }
    const doc = {
      document_type: Number(selectedDocumentType),
      document_type_name: (documentTypes.find((d) => String(d.id) === String(selectedDocumentType)) || {}).name || "Document",
      temp_id: `${selectedDocumentType}-${Date.now()}`,
    };
    setDocuments((prev) => [doc, ...prev]);
    setSelectedDocumentType("");
  };

  const handleRemoveDocument = (tempId) => {
    setDocuments((prev) => prev.filter((doc) => doc.temp_id !== tempId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!user?.id) {
      setSubmitError("Please login before publishing a listing.");
      return;
    }
    if (listingLimitReached) {
      setSubmitError("Standard users can publish up to 2 listings. Switch to an agency or promoter account for unlimited listings.");
      return;
    }
    if (!selectedCategory || !selectedType || !selectedCommune) {
      setSubmitError("Please select category, type, wilaya, daira, and commune.");
      return;
    }
    if (!title || !description || !price) {
      setSubmitError("Title, description, and price are required.");
      return;
    }

    setSubmitting(true);
    try {
      const access = localStorage.getItem("auth_access");
      if (!access) {
        setSubmitError("Session expired. Please log in again.");
        setSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append("user_id", String(user.id));
      formData.append("commune_id", String(selectedCommune));
      formData.append("category", String(selectedCategory));
      formData.append("type", String(selectedType));
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", String(price));
      if (area) formData.append("area", String(area));
      formData.append("bedrooms", String(bedrooms));
      formData.append("bathrooms", String(bathrooms));
      if (latitude) formData.append("latitude", String(latitude));
      if (longitude) formData.append("longitude", String(longitude));
      
      selectedAmenities.forEach((id) => formData.append("amenity_ids", String(id)));
      imageFiles.forEach((file) => formData.append("image_files", file));

      const response = await fetch(`${LISTING_BASE_URL}/properties/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data?.detail || JSON.stringify(data));
        setSubmitting(false);
        return;
      }

      setSubmitSuccess("Listing created successfully.");
      
      if (contacts.length && data?.id) {
        try {
          await Promise.all(
            contacts.map((contact) =>
              fetch(`${LISTING_BASE_URL}/properties/${data.id}/contacts/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
                body: JSON.stringify({
                  contact_type: contact.contact_type,
                  value: contact.value,
                  is_primary: contact.is_primary,
                }),
              })
            )
          );
        } catch (err) {
          setSubmitError(err?.message || "Listing created but contacts failed to save.");
        }
      }

      if (documents.length && data?.id) {
        try {
          await Promise.all(
            documents.map((doc) =>
              fetch(`${LISTING_BASE_URL}/properties/${data.id}/documents/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
                body: JSON.stringify({
                  document_type: doc.document_type,
                }),
              })
            )
          );
        } catch (err) {
          setSubmitError(err?.message || "Listing created but documents failed to save.");
        }
      }

      setTitle(""); setDescription(""); setPrice(""); setArea(""); 
      setBedrooms(3); setBathrooms(2); setLatitude(""); setLongitude("");
      setImageFiles([]); setDocuments([]); setContacts([]); 
      contactSeededRef.current = false; setSelectedAmenities([]);
      
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (error) {
      setSubmitError(error?.message || "Failed to publish listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      <main className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">Add Property</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Add New Property</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              Fill in the details below to list your property on Algeria's premier real estate platform.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {loadError}
          </div>
        )}

        {submitError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {submitSuccess}
          </div>
        )}

        {!isUnlimitedRole && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            listingLimitReached
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-white text-slate-600"
          }`}>
            {loadingListingCount
              ? "Checking your current listing count..."
              : `Standard account: ${listingCount}/${standardListingLimit} listings used. Agencies and promoters can publish unlimited listings.`}
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          <BasicInfoSection
            title={title} setTitle={setTitle}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categories}
            selectedType={selectedType} setSelectedType={setSelectedType} types={types}
            loading={loading}
          />
          
          <LocationSection
            wilayas={wilayas} dairas={dairas} communes={communes}
            selectedWilaya={selectedWilaya} setSelectedWilaya={setSelectedWilaya}
            selectedDaira={selectedDaira} setSelectedDaira={setSelectedDaira}
            selectedCommune={selectedCommune} setSelectedCommune={setSelectedCommune}
            latitude={latitude} setLatitude={setLatitude}
            longitude={longitude} setLongitude={setLongitude}
            loading={loading}
          />

          <DetailsSection
            price={price} setPrice={setPrice}
            area={area} setArea={setArea}
            bedrooms={bedrooms} setBedrooms={setBedrooms}
            bathrooms={bathrooms} setBathrooms={setBathrooms}
            description={description} setDescription={setDescription}
          />

          <MediaSection
            amenities={amenities} selectedAmenities={selectedAmenities} toggleAmenity={toggleAmenity}
            imageFiles={imageFiles} setImageFiles={setImageFiles} filePreviews={filePreviews} removeImage={removeImage} moveImage={moveImage}
            contactTypes={contactTypes} contacts={contacts} handleAddContact={handleAddContact} handleRemoveContact={handleRemoveContact} handlePrimaryChange={handlePrimaryChange}
            selectedContactType={selectedContactType} setSelectedContactType={setSelectedContactType} contactValue={contactValue} setContactValue={setContactValue} contactPrimary={contactPrimary} setContactPrimary={setContactPrimary} contactError={contactError}
            documentTypes={documentTypes} documents={documents} handleAddDocument={handleAddDocument} handleRemoveDocument={handleRemoveDocument}
            selectedDocumentType={selectedDocumentType} setSelectedDocumentType={setSelectedDocumentType} documentError={documentError}
          />

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={submitting || loading || loadingListingCount || listingLimitReached}
              type="submit"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">public</span>
                  Publish Listing
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
