import React from "react";

export default function MediaSection({
  amenities, selectedAmenities, toggleAmenity,
  imageFiles, setImageFiles, filePreviews, removeImage, moveImage,
  existingImages, handleDeleteImage, imageActionMessage,
  contactTypes, contacts, handleAddContact, handleRemoveContact, handlePrimaryChange,
  selectedContactType, setSelectedContactType, contactValue, setContactValue, contactPrimary, setContactPrimary, contactError,
  documentTypes, documents, handleAddDocument, handleRemoveDocument,
  selectedDocumentType, setSelectedDocumentType, documentError
}) {

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  return (
    <>
      <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <h4 className="text-lg font-bold">Amenities</h4>
        </div>
        {amenities?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                />
                <span>{amenity.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No amenities available.</p>
        )}
      </section>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">photo_library</span>
          <h4 className="text-lg font-bold">Property Images</h4>
        </div>
        
        <div className="mb-6">
          <input
            accept="image/*"
            className="hidden"
            id="image-upload"
            multiple
            type="file"
            onChange={handleImageChange}
          />
          <label
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
            htmlFor="image-upload"
          >
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">add_photo_alternate</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Click to browse or drag images here</span>
            <span className="text-xs text-slate-400 mt-1">High-quality JPG or PNG (max 5MB each)</span>
          </label>
        </div>

        {imageActionMessage && (
          <div className="mb-4 text-sm text-emerald-600 font-medium">
            {imageActionMessage}
          </div>
        )}

        {(filePreviews?.length > 0 || existingImages?.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages?.map((img) => (
              <div key={`existing-${img.id}`} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800">
                <img
                  alt="Existing Property Image"
                  className="w-full h-full object-cover"
                  src={img.image_url || img.url}
                />
                <button
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm hover:bg-red-50"
                  type="button"
                  onClick={() => handleDeleteImage && handleDeleteImage(img.id)}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
            {filePreviews?.map((preview, index) => (
              <div key={`preview-${index}`} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800">
                <img
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                  src={preview.url}
                />
                <button
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm hover:bg-red-50"
                  type="button"
                  onClick={() => removeImage(index)}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">contact_phone</span>
          <h4 className="text-lg font-bold">Contacts</h4>
        </div>
        {contactError && (
          <div className="mb-4 text-sm text-red-500">{contactError}</div>
        )}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
             <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">Type</label>
             <select
               className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 focus:ring-primary"
               value={selectedContactType}
               onChange={(e) => setSelectedContactType(e.target.value)}
             >
               <option value="">Select Type</option>
               {contactTypes?.map((c) => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
             <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">Value</label>
             <input
               className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 focus:ring-primary"
               placeholder="e.g. +213 550 00 00 00"
               type="text"
               value={contactValue}
               onChange={(e) => setContactValue(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2 mb-3">
             <input
               className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2"
               id="primary-contact"
               type="checkbox"
               checked={contactPrimary}
               onChange={(e) => setContactPrimary(e.target.checked)}
             />
             <label className="text-sm font-semibold text-slate-700" htmlFor="primary-contact">
               Primary
             </label>
          </div>
          <button
            className="bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors"
            type="button"
            onClick={handleAddContact}
          >
            Add
          </button>
        </div>
        {contacts?.length > 0 && (
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id || c.temp_id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.contact_type_name}</span>
                    {c.is_primary && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary">Primary</span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium text-sm mt-1">{c.value}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!c.is_primary && (
                    <button className="text-sm text-slate-400 hover:text-primary font-semibold" onClick={() => handlePrimaryChange(c.id || c.temp_id)} type="button">
                      Set Primary
                    </button>
                  )}
                  <button className="text-slate-400 hover:text-red-500 transition-colors" onClick={() => handleRemoveContact(c.id || c.temp_id)} type="button">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">folder_open</span>
          <h4 className="text-lg font-bold">Documents</h4>
        </div>
        {documentError && <div className="mb-4 text-sm text-red-500">{documentError}</div>}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
             <select
               className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 focus:ring-primary"
               value={selectedDocumentType}
               onChange={(e) => setSelectedDocumentType(e.target.value)}
             >
               <option value="">Select Document Type</option>
               {documentTypes?.map((d) => (
                 <option key={d.id} value={d.id}>{d.name}</option>
               ))}
             </select>
          </div>
          <button
            className="bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors"
            type="button"
            onClick={handleAddDocument}
          >
            Add Required Doc
          </button>
        </div>
        {documents?.length > 0 && (
          <div className="space-y-3">
            {documents.map((d) => (
              <div key={d.id || d.temp_id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                  <span className="font-bold text-slate-900">{d.document_type_name}</span>
                </div>
                <button className="text-slate-400 hover:text-red-500 transition-colors" onClick={() => handleRemoveDocument(d.id || d.temp_id)} type="button">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
