import React from "react";

export default function BasicInfoSection({ 
  title, setTitle, 
  selectedCategory, setSelectedCategory, categories, 
  selectedType, setSelectedType, types, loading 
}) {
  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary">info</span>
        <h4 className="text-lg font-bold">Basic Info</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Property Title</label>
          <input
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary transition-all p-3"
            placeholder="e.g. Modern Villa with Sea View in Zeralda"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary p-3"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            disabled={loading || !categories?.length}
          >
            <option value="">Select Category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Property Type</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary p-3"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            disabled={loading || !types?.length}
          >
            <option value="">Select Type</option>
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
