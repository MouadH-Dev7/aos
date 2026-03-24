import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { ADMIN_BASE_URLS, fetchWithFallback, getAdminAuthHeaders } from "../api.js";

export default function AdminDocumentTypes({
  user,
  pendingCount,
  onGoDashboard,
  onGoListings,
  onGoTypes,
  onGoCategories,
  onGoUsers,
  onGoAmenities,
  onGoAgencies,
  onGoContractors,
  onLogout,
}) {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const normalized = useMemo(
    () => documentTypes.map((item) => ({ ...item, name: String(item.name || "").trim() })),
    [documentTypes]
  );

  const loadDocumentTypes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/document-types/", {
        headers: getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load document types");
      }
      setDocumentTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load document types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentTypes();
  }, []);

  const addDocumentType = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/document-types/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        const apiError = data?.name?.[0] || data?.detail || "Failed to add document type";
        throw new Error(apiError);
      }
      setDocumentTypes((prev) => [...prev, data].sort((a, b) => Number(a.id) - Number(b.id)));
      setNewName("");
      setSuccess("Document type created successfully.");
    } catch (err) {
      setError(err?.message || "Failed to add document type");
    } finally {
      setSaving(false);
    }
  };

  const saveDocumentType = async () => {
    const name = editingName.trim();
    if (!editingId || !name) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/document-types/${editingId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        const apiError = data?.name?.[0] || data?.detail || "Failed to update document type";
        throw new Error(apiError);
      }
      setDocumentTypes((prev) =>
        prev.map((item) => (Number(item.id) === Number(editingId) ? data : item))
      );
      setEditingId(null);
      setEditingName("");
      setSuccess("Document type updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update document type");
    } finally {
      setSaving(false);
    }
  };

  const removeDocumentType = async (documentTypeId) => {
    setDeletingId(documentTypeId);
    setError("");
    setSuccess("");
    try {
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/document-types/${documentTypeId}/`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (!response.ok) {
        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        throw new Error(data?.detail || "Failed to delete document type");
      }
      setDocumentTypes((prev) => prev.filter((item) => Number(item.id) !== Number(documentTypeId)));
      setSuccess("Document type deleted successfully.");
    } catch (err) {
      setError(err?.message || "Failed to delete document type");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active="document-types"
          pendingCount={pendingCount}
          onGoDashboard={onGoDashboard}
          onGoListings={onGoListings}
          onGoTypes={onGoTypes}
          onGoCategories={onGoCategories}
          onGoUsers={onGoUsers}
          onGoDocumentTypes={() => {}}
          onGoAmenities={onGoAmenities}
          onGoAgencies={onGoAgencies}
          onGoContractors={onGoContractors}
          onLogout={onLogout}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
            <div>
              <h1 className="text-lg font-bold">Document Types Management</h1>
              <p className="text-xs text-slate-500">Create, update, and remove document types</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-slate-500">Super Admin</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-background-dark/50">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4">Add New Document Type</h2>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={addDocumentType}>
                <input
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Document type name (e.g. Ownership Deed)"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <button
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-70"
                  type="submit"
                  disabled={saving || !newName.trim()}
                >
                  {saving ? "Saving..." : "Add Document Type"}
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
                <h2 className="text-base font-bold">All Document Types</h2>
                <button
                  className="text-xs font-bold text-primary hover:underline"
                  type="button"
                  onClick={loadDocumentTypes}
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
                          Loading document types...
                        </td>
                      </tr>
                    ) : normalized.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={3}>
                          No document types found.
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
                                  onClick={saveDocumentType}
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
                                  onClick={() => removeDocumentType(item.id)}
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
