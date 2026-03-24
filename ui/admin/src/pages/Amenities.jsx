import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { ADMIN_BASE_URLS, fetchWithFallback, getAdminAuthHeaders } from "../api.js";

export default function AdminAmenities({
  user,
  pendingCount,
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
}) {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const normalized = useMemo(
    () => amenities.map((item) => ({ ...item, name: String(item.name || "").trim() })),
    [amenities]
  );

  const loadAmenities = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/amenities/", {
        headers: getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load amenities");
      }
      setAmenities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmenities();
  }, []);

  const addAmenity = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/amenities/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        const apiError = data?.name?.[0] || data?.detail || "Failed to add amenity";
        throw new Error(apiError);
      }
      setAmenities((prev) => [...prev, data].sort((a, b) => Number(a.id) - Number(b.id)));
      setNewName("");
      setSuccess("Amenity created successfully.");
    } catch (err) {
      setError(err?.message || "Failed to add amenity");
    } finally {
      setSaving(false);
    }
  };

  const saveAmenity = async () => {
    const name = editingName.trim();
    if (!editingId || !name) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/amenities/${editingId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          await loadAmenities();
          throw new Error("Amenity not found. It may have been removed already.");
        }
        const apiError = data?.name?.[0] || data?.detail || "Failed to update amenity";
        throw new Error(apiError);
      }
      setAmenities((prev) =>
        prev.map((item) => (Number(item.id) === Number(editingId) ? data : item))
      );
      setEditingId(null);
      setEditingName("");
      setSuccess("Amenity updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update amenity");
    } finally {
      setSaving(false);
    }
  };

  const removeAmenity = async (amenityId) => {
    setDeletingId(amenityId);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/amenities/${amenityId}/`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 404) {
          await loadAmenities();
          throw new Error("Amenity not found. It may have been removed already.");
        }
        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        throw new Error(data?.detail || "Failed to delete amenity");
      }
      setAmenities((prev) => prev.filter((item) => Number(item.id) !== Number(amenityId)));
      setSuccess("Amenity deleted successfully.");
    } catch (err) {
      setError(err?.message || "Failed to delete amenity");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active="amenities"
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

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
            <div>
              <h1 className="text-lg font-bold">Amenities Management</h1>
              <p className="text-xs text-slate-500">Create, update, and remove property amenities</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-slate-500">Super Admin</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-background-dark/50">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4">Add New Amenity</h2>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={addAmenity}>
                <input
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Amenity name (e.g. Wi-Fi)"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <button
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-70"
                  type="submit"
                  disabled={saving || !newName.trim()}
                >
                  {saving ? "Saving..." : "Add Amenity"}
                </button>
              </form>
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold">All Amenities</h2>
                <button
                  className="text-xs font-bold text-primary hover:underline"
                  type="button"
                  onClick={loadAmenities}
                >
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={3}>
                          Loading amenities...
                        </td>
                      </tr>
                    ) : normalized.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={3}>
                          No amenities found.
                        </td>
                      </tr>
                    ) : (
                      normalized.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 text-sm text-slate-500">#{item.id}</td>
                          <td className="px-6 py-4">
                            {editingId === item.id ? (
                              <input
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                                value={editingName}
                                onChange={(event) => setEditingName(event.target.value)}
                              />
                            ) : (
                              <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingId === item.id ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white disabled:opacity-70"
                                  type="button"
                                  onClick={saveAmenity}
                                  disabled={saving || !editingName.trim()}
                                >
                                  Save
                                </button>
                                <button
                                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingName("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                                  type="button"
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditingName(item.name);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-70"
                                  type="button"
                                  disabled={deletingId === item.id}
                                  onClick={() => removeAmenity(item.id)}
                                >
                                  {deletingId === item.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
