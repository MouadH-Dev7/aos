import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import BasicInfoSection from "./components/property/BasicInfoSection";
import LocationSection from "./components/property/LocationSection";
import DetailsSection from "./components/property/DetailsSection";
import MediaSection from "./components/property/MediaSection";
import { useReferenceData } from "./hooks/useReferenceData";

export default function EditProperty({ user }) {
  const navigate = useNavigate();
  const { id: listingId } = useParams();

  const { categories, types, amenities, documentTypes, contactTypes, wilayas, dairas, communes, loading: refLoading, loadError: refError } = useReferenceData();

  const [currentListing, setCurrentListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(false);
  const [listingError, setListingError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [imageActionMessage, setImageActionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedDaira, setSelectedDaira] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [documentError, setDocumentError] = useState("");
  
  const [contacts, setContacts] = useState([]);
  const [selectedContactType, setSelectedContactType] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [contactPrimary, setContactPrimary] = useState(false);
  const [contactError, setContactError] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  const [imageFiles, setImageFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [locationInitialized, setLocationInitialized] = useState(false);

  const LISTING_BASE_URL = import.meta.env.VITE_LISTING_BASE_URL || "http://localhost:8004";
  const loading = refLoading || loadingListing;
  const loadError = refError || listingError;
  const getAuthHeaders = () => {
    const access = localStorage.getItem("auth_access");
    return access ? { Authorization: `Bearer ${access}` } : {};
  };

  useEffect(() => {
    if (!listingId) return;
    if (!user?.id) {
      setForbidden(true);
      setListingError("You must be logged in to edit a listing.");
      return;
    }
    const loadListing = async () => {
      setListingError("");
      setLoadingListing(true);
      try {
        const directRes = await fetch(`${LISTING_BASE_URL}/properties/${listingId}/`);
        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData && String(directData.user_id) !== String(user.id)) {
            setForbidden(true);
            setListingError("You are not allowed to edit this listing.");
            setCurrentListing(null);
            return;
          }
          setCurrentListing(directData || null);
          return;
        }

        const response = await fetch(`${LISTING_BASE_URL}/properties/list/?user_id=${user.id}`, {
          headers: { ...getAuthHeaders() },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load listing.");
        }
        const found = Array.isArray(data)
          ? data.find((item) => String(item.id) === String(listingId))
          : null;
        if (!found) {
          setForbidden(true);
          setListingError("You are not allowed to edit this listing.");
          setCurrentListing(null);
          return;
        }
        setCurrentListing(found || null);
      } catch (error) {
        setListingError(error?.message || "Failed to load listing.");
      } finally {
        setLoadingListing(false);
      }
    };
    loadListing();
  }, [LISTING_BASE_URL, listingId, user?.id]);

  useEffect(() => {
    if (!currentListing || initialized) return;
    setSelectedCategory(currentListing.category ? String(currentListing.category) : "");
    setSelectedType(currentListing.type ? String(currentListing.type) : "");
    setSelectedCommune(currentListing.commune_id ? String(currentListing.commune_id) : "");
    setTitle(currentListing.title || "");
    setDescription(currentListing.description || "");
    setPrice(currentListing.price ?? "");
    setArea(currentListing.area ?? "");
    setBedrooms(currentListing.bedrooms ?? 0);
    setBathrooms(currentListing.bathrooms ?? 0);
    setLatitude(currentListing.latitude ?? "");
    setLongitude(currentListing.longitude ?? "");
    setSelectedAmenities((currentListing.amenities || []).map((a) => a.id));
    setDocuments(currentListing.documents || []);
    setContacts(currentListing.contacts || []);
    setInitialized(true);
  }, [currentListing, initialized]);

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
    if (!submitSuccess) return;
    const timer = setTimeout(() => setSubmitSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [submitSuccess]);

  useEffect(() => {
    if (!imageActionMessage) return;
    const timer = setTimeout(() => setImageActionMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [imageActionMessage]);

  useEffect(() => {
    if (locationInitialized) return;
    if (!selectedCommune || !communes.length || !dairas.length) return;
    const commune = communes.find((item) => String(item.id) === String(selectedCommune));
    if (!commune) {
      setLocationInitialized(true);
      return;
    }
    const dairaId = commune.daira_id ? String(commune.daira_id) : "";
    setSelectedDaira(dairaId);
    const daira = dairas.find((item) => String(item.id) === dairaId);
    if (daira?.wilaya_id) {
      setSelectedWilaya(String(daira.wilaya_id));
    }
    setLocationInitialized(true);
  }, [communes, dairas, locationInitialized, selectedCommune]);

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id != amenityId) : [...prev, amenityId]
    );
  };
  const removeImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  const moveImage = (fromIndex, toIndex) => {};

  const handleAddContact = async () => {
    if (!currentListing?.id) return;
    setContactError("");
    if (!selectedContactType || !contactValue.trim()) {
      setContactError("Select a contact type and enter a value.");
      return;
    }
    if (contacts.some((c) => String(c.contact_type) === String(selectedContactType) && String(c.value).trim().toLowerCase() === contactValue.trim().toLowerCase())) {
      setContactError("This contact is already added.");
      return;
    }
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          contact_type: Number(selectedContactType),
          value: contactValue.trim(),
          is_primary: contactPrimary || contacts.length === 0,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || JSON.stringify(data));
      
      const contactTypeName = data.contact_type_name || (contactTypes.find((type) => String(type.id) === String(selectedContactType)) || {}).name || "Contact";
      const nextContact = { ...data, contact_type: data.contact_type ?? Number(selectedContactType), contact_type_name: contactTypeName, value: data.value ?? contactValue.trim(), is_primary: data.is_primary ?? contactPrimary };
      
      setContacts((prev) => [nextContact, ...prev].map((contact) => nextContact.is_primary && String(contact.id) !== String(nextContact.id) ? { ...contact, is_primary: false } : contact));
      setSelectedContactType(""); setContactValue(""); setContactPrimary(false);
    } catch (error) {
      setContactError(error?.message || "Failed to add contact.");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!currentListing?.id || !contactId) return;
    setContactError("");
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/contacts/${contactId}/`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error("Failed to delete contact.");
      setContacts((prev) => prev.filter((contact) => String(contact.id || contact.temp_id) !== String(contactId)));
    } catch (error) {
      setContactError(error?.message || "Failed to delete contact.");
    }
  };

  const handleMakePrimary = async (contactId) => {
    if (!currentListing?.id || !contactId) return;
    setContactError("");
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/contacts/${contactId}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ is_primary: true }),
      });
      if (!response.ok) throw new Error("Failed to update primary contact.");
      setContacts((prev) => prev.map((contact) => ({ ...contact, is_primary: String(contact.id) === String(contactId) })));
    } catch (error) {
      setContactError(error?.message || "Failed to update primary contact.");
    }
  };

  const handleAddDocument = async () => {
    if (!currentListing?.id) return;
    setDocumentError("");
    if (!selectedDocumentType) {
      setDocumentError("Select a document type.");
      return;
    }
    if (documents.some((doc) => String(doc.document_type) === String(selectedDocumentType))) {
      setDocumentError("This document type is already added.");
      return;
    }
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/documents/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ document_type: Number(selectedDocumentType) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || JSON.stringify(data));
      setDocuments((prev) => [data, ...prev]);
      setSelectedDocumentType("");
    } catch (error) {
      setDocumentError(error?.message || "Failed to add document.");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!currentListing?.id) return;
    setDocumentError("");
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/documents/${docId}/`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error("Failed to delete document.");
      setDocuments((prev) => prev.filter((doc) => String(doc.id || doc.temp_id) !== String(docId)));
    } catch (error) {
      setDocumentError(error?.message || "Failed to delete document.");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!currentListing?.id || !imageId) return;
    setImageActionMessage("");
    try {
      const response = await fetch(`${LISTING_BASE_URL}/properties/${currentListing.id}/images/${imageId}/`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error("Failed to delete image.");
      setCurrentListing((prev) => {
        if (!prev) return prev;
        return { ...prev, images: (prev.images || []).filter((img) => String(img.id) !== String(imageId)) };
      });
      setImageActionMessage("Image deleted successfully.");
    } catch (error) {
      setSubmitError(error?.message || "Failed to delete image.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(""); setSubmitSuccess("");

    if (!user?.id) { setSubmitError("Please login before updating a listing."); return; }
    if (!listingId && !currentListing?.id) { setSubmitError("Listing id is missing."); return; }
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
      const targetId = listingId || currentListing?.id;
      let response;
      if (imageFiles.length) {
        const formData = new FormData();
        formData.append("commune_id", String(selectedCommune));
        formData.append("category", String(selectedCategory));
        formData.append("type", String(selectedType));
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("price", String(price));
        formData.append("bedrooms", String(bedrooms));
        formData.append("bathrooms", String(bathrooms));
        if (area !== "") formData.append("area", String(area));
        if (latitude !== "") formData.append("latitude", String(latitude));
        if (longitude !== "") formData.append("longitude", String(longitude));
        selectedAmenities.forEach((id) => formData.append("amenity_ids", String(id)));
        imageFiles.forEach((file) => formData.append("image_files", file));

        response = await fetch(`${LISTING_BASE_URL}/properties/${targetId}/`, {
          method: "PATCH",
          headers: { ...getAuthHeaders() },
          body: formData,
        });
      } else {
        const payload = {
          commune_id: Number(selectedCommune),
          category: Number(selectedCategory),
          type: Number(selectedType),
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          amenity_ids: selectedAmenities,
        };
        if (area !== "") payload.area = Number(area);
        if (latitude !== "") payload.latitude = Number(latitude);
        if (longitude !== "") payload.longitude = Number(longitude);

        response = await fetch(`${LISTING_BASE_URL}/properties/${targetId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || JSON.stringify(data));

      setSubmitSuccess("Listing updated successfully.");
      setImageFiles([]); setImageActionMessage("Listing saved successfully.");
      setTimeout(() => navigate('/my-listings'), 2000);
    } catch (error) {
      setSubmitError(error?.message || "Failed to update listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentListing) {
    return <div className="min-h-screen bg-background-light px-6 py-10 text-sm text-slate-500">Loading listing...</div>;
  }

  if (!currentListing && !loading) {
    return (
      <div className="min-h-screen bg-background-light px-6 py-10">
        <p className="text-sm text-slate-500">{loadError || "Listing not found."}</p>
        <button
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
          type="button"
          onClick={() => navigate(forbidden ? "/" : "/my-listings")}
        >
          {forbidden ? "Back to Home" : "Back to My Listings"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light text-slate-900 font-display min-h-screen">
      <main className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link to="/my-listings" className="hover:text-primary">My Listings</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 font-medium">Edit Property</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Edit Property</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              Update the details below to keep your listing accurate and appealing.
            </p>
          </div>
        </div>

        {loadError && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{loadError}</div>}
        {submitError && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
        {submitSuccess && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{submitSuccess}</div>}

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
            existingImages={currentListing?.images} handleDeleteImage={handleDeleteImage} imageActionMessage={imageActionMessage}
            contactTypes={contactTypes} contacts={contacts} handleAddContact={handleAddContact} handleRemoveContact={handleDeleteContact} handlePrimaryChange={handleMakePrimary}
            selectedContactType={selectedContactType} setSelectedContactType={setSelectedContactType} contactValue={contactValue} setContactValue={setContactValue} contactPrimary={contactPrimary} setContactPrimary={setContactPrimary} contactError={contactError}
            documentTypes={documentTypes} documents={documents} handleAddDocument={handleAddDocument} handleRemoveDocument={handleDeleteDocument}
            selectedDocumentType={selectedDocumentType} setSelectedDocumentType={setSelectedDocumentType} documentError={documentError}
          />

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-200">
            <button
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={submitting || loading}
              type="submit"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
