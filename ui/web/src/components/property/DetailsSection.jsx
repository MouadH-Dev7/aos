import React from "react";

export default function DetailsSection({
  price, setPrice,
  area, setArea,
  bedrooms, setBedrooms,
  bathrooms, setBathrooms,
  description, setDescription
}) {
  return (
    <>
      <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">sell</span>
          <h4 className="text-lg font-bold">Details & Pricing</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Price (DA)</label>
            <div className="relative">
              <input
                className="w-full pl-4 pr-16 py-3 rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary text-right"
                placeholder="0.00"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-slate-400 font-bold text-sm">DA</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Area (m²)</label>
            <div className="relative">
              <input
                className="w-full pl-4 pr-12 py-3 rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary"
                placeholder="120"
                type="number"
                value={area}
                onChange={(event) => setArea(event.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-slate-400 font-bold text-sm">m²</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Bedrooms</label>
            <div className="flex items-center bg-background-light dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                className="px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-l-lg"
                type="button"
                onClick={() => setBedrooms((prev) => Math.max(0, Number(prev || 0) - 1))}
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <input
                className="w-full text-center border-none bg-transparent focus:ring-0 appearance-none"
                type="number"
                value={bedrooms}
                onChange={(event) => setBedrooms(event.target.value)}
              />
              <button
                className="px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-r-lg"
                type="button"
                onClick={() => setBedrooms((prev) => Number(prev || 0) + 1)}
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Bathrooms</label>
            <div className="flex items-center bg-background-light dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                className="px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-l-lg"
                type="button"
                onClick={() => setBathrooms((prev) => Math.max(0, Number(prev || 0) - 1))}
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <input
                className="w-full text-center border-none bg-transparent focus:ring-0 appearance-none"
                type="number"
                value={bathrooms}
                onChange={(event) => setBathrooms(event.target.value)}
              />
              <button
                className="px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-r-lg"
                type="button"
                onClick={() => setBathrooms((prev) => Number(prev || 0) + 1)}
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">description</span>
          <h4 className="text-lg font-bold">Description</h4>
        </div>
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" type="button">
              <span className="material-symbols-outlined text-xl">format_bold</span>
            </button>
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" type="button">
              <span className="material-symbols-outlined text-xl">format_italic</span>
            </button>
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" type="button">
              <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1" type="button">
              <span className="material-symbols-outlined text-xl">language</span>
              <span className="text-xs font-bold">AR</span>
            </button>
          </div>
          <textarea
            className="w-full border-none focus:ring-0 bg-white dark:bg-slate-900 p-4 text-slate-700 dark:text-slate-300"
            placeholder="Describe your property's best features, surroundings, and amenities..."
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          ></textarea>
        </div>
      </section>
    </>
  );
}
