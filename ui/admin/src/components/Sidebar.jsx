export default function Sidebar({
  active,
  pendingCount,
  onGoDashboard = () => {},
  onGoListings = () => {},
  onGoTypes = () => {},
  onGoCategories = () => {},
  onGoUsers = () => {},
  onGoDocumentTypes = () => {},
  onGoAmenities = () => {},
  onGoAgencies = () => {},
  onGoContractors = () => {},
  onLogout,
}) {
  const baseItem =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors w-full text-left";
  const inactive = "text-slate-400 hover:text-white hover:bg-slate-800";
  const activeItem = "bg-primary/20 text-white";

  return (
    <aside className="w-72 bg-slate-900 flex-shrink-0 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-primary p-2 rounded-xl">
          <span className="material-symbols-outlined text-white">apartment</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">ImmoAlgeria</h1>
          <p className="text-slate-400 text-xs">Enterprise Admin</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider px-3 mb-2">Main Menu</div>
        <button
          className={`${baseItem} ${active === "dashboard" ? activeItem : inactive}`}
          type="button"
          onClick={onGoDashboard}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-medium">Overview</span>
        </button>
        <button
          className={`${baseItem} ${active === "listings" ? activeItem : inactive}`}
          type="button"
          onClick={onGoListings}
        >
          <span className="material-symbols-outlined">real_estate_agent</span>
          <span className="text-sm font-medium">Listings</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <span className="material-symbols-outlined">fact_check</span>
          <span className="text-sm font-medium">Moderation Queue</span>
          <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{pendingCount}</span>
        </div>
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider px-3 mt-6 mb-2">Management</div>
        <button
          className={`${baseItem} ${active === "categories" ? activeItem : inactive}`}
          type="button"
          onClick={onGoCategories}
        >
          <span className="material-symbols-outlined">category</span>
          <span className="text-sm font-medium">Categories</span>
        </button>
        <button
          className={`${baseItem} ${active === "types" ? activeItem : inactive}`}
          type="button"
          onClick={onGoTypes}
        >
          <span className="material-symbols-outlined">home_work</span>
          <span className="text-sm font-medium">Types</span>
        </button>
        <button
          className={`${baseItem} ${active === "document-types" ? activeItem : inactive}`}
          type="button"
          onClick={onGoDocumentTypes}
        >
          <span className="material-symbols-outlined">description</span>
          <span className="text-sm font-medium">Document Types</span>
        </button>
        <button
          className={`${baseItem} ${active === "users" ? activeItem : inactive}`}
          type="button"
          onClick={onGoUsers}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-sm font-medium">Users</span>
        </button>
        <button
          className={`${baseItem} ${active === "agencies" ? activeItem : inactive}`}
          type="button"
          onClick={onGoAgencies}
        >
          <span className="material-symbols-outlined">corporate_fare</span>
          <span className="text-sm font-medium">Agencies</span>
        </button>
        <button
          className={`${baseItem} ${active === "contractors" ? activeItem : inactive}`}
          type="button"
          onClick={onGoContractors}
        >
          <span className="material-symbols-outlined">engineering</span>
          <span className="text-sm font-medium">Contractors</span>
        </button>
        <button
          className={`${baseItem} ${active === "amenities" ? activeItem : inactive}`}
          type="button"
          onClick={onGoAmenities}
        >
          <span className="material-symbols-outlined">chair</span>
          <span className="text-sm font-medium">Amenities</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <span className="material-symbols-outlined">location_on</span>
          <span className="text-sm font-medium">Locations</span>
        </div>
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider px-3 mt-6 mb-2">System</div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-sm font-medium">Reports</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <span className="material-symbols-outlined">history_edu</span>
          <span className="text-sm font-medium">Audit Logs</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          type="button"
          onClick={onLogout}
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
