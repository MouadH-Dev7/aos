import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { ADMIN_BASE_URLS, fetchWithFallback, getAdminAuthHeaders } from "../api.js";

export default function AdminCategories({
  user,
  pendingCount,
  onGoDashboard,
  onGoListings,
  onGoTypes,
  onGoUsers,
  onGoDocumentTypes,
  onGoAmenities,
  onGoAgencies,
  onGoContractors,
  onLogout,
}) {
  const buildAdminErrorMessage = (response, data, fallback) => {
    if (response?.status === 502 || response?.status === 503) {
      return "خدمة التصنيفات غير متاحة الآن (Listing Service). حاول مرة أخرى بعد قليل.";
    }
    const detail = typeof data?.detail === "string" ? data.detail : "";
    if (detail.toLowerCase().includes("bad gateway")) {
      return "الخدمة الخلفية غير متاحة الآن. حاول مرة أخرى بعد قليل.";
    }
    if (Array.isArray(data?.name) && data.name[0]) {
      return data.name[0];
    }
    return fallback;
  };

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const normalized = useMemo(
    () => categories.map((item) => ({ ...item, name: String(item.name || "").trim() })),
    [categories]
  );

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/categories/", {
        headers: getAdminAuthHeaders(),
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(buildAdminErrorMessage(response, data, "Failed to load categories"));
      }
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/categories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(buildAdminErrorMessage(response, data, "Failed to add category"));
      }
      setCategories((prev) => [...prev, data].sort((a, b) => Number(a.id) - Number(b.id)));
      setNewName("");
      setSuccess("Category created successfully.");
    } catch (err) {
      setError(err?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async () => {
    const name = editingName.trim();
    if (!editingId || !name) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/categories/${editingId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(buildAdminErrorMessage(response, data, "Failed to update category"));
      }
      setCategories((prev) =>
        prev.map((item) => (Number(item.id) === Number(editingId) ? data : item))
      );
      setEditingId(null);
      setEditingName("");
      setSuccess("Category updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (categoryId) => {
    setDeletingId(categoryId);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/categories/${categoryId}/`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (!response.ok) {
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        throw new Error(buildAdminErrorMessage(response, data, "Failed to delete category"));
      }
      setCategories((prev) => prev.filter((item) => Number(item.id) !== Number(categoryId)));
      setSuccess("Category deleted successfully.");
    } catch (err) {
      setError(err?.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active="categories"
          pendingCount={pendingCount}
          onGoDashboard={onGoDashboard}
          onGoListings={onGoListings}
          onGoTypes={onGoTypes}
          onGoCategories={() => {}}
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
              <h1 className="text-lg font-bold">Categories Management</h1>
              <p className="text-xs text-slate-500">Create, update, and remove listing categories</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-slate-500">Super Admin</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-background-dark/50">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4">Add New Category</h2>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={addCategory}>
                <input
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Category name (e.g. Apartment)"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <button
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-70"
                  type="submit"
                  disabled={saving || !newName.trim()}
                >
                  {saving ? "Saving..." : "Add Category"}
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
                <h2 className="text-base font-bold">All Categories</h2>
                <button
                  className="text-xs font-bold text-primary hover:underline"
                  type="button"
                  onClick={loadCategories}
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
                          Loading categories...
                        </td>
                      </tr>
                    ) : normalized.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={3}>
                          No categories found.
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
                                  onClick={saveCategory}
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
                                  onClick={() => removeCategory(item.id)}
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
