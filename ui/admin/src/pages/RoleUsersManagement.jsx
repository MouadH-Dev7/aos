import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
<<<<<<< HEAD
import { ADMIN_BASE_URLS, fetchWithFallback } from "../api.js";
=======
import { ADMIN_BASE_URLS, fetchWithFallback, getAdminAuthHeaders } from "../api.js";
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e

const ROLE_IDS = {
  user: 1,
  agency: 2,
  contractor: 3, // Promoters
};

export default function RoleUsersManagement({
  roleType,
  title,
  subtitle,
  activeSidebar,
  addButtonLabel,
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
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    name: "",
    email: "",
    phone: "",
    is_active: true,
    password: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    is_active: true,
  });

  const roleMap = useMemo(() => {
    const map = {};
    roles.forEach((item) => {
      map[String(item.id)] = item.name;
    });
    return map;
  }, [roles]);

  const targetRole = useMemo(
    () => roles.find((role) => Number(role.id) === Number(ROLE_IDS[roleType])) || null,
    [roles, roleType]
  );

  const scopedUsers = useMemo(
    () =>
      users.filter((item) => {
        return Number(item.role_id) === Number(ROLE_IDS[roleType]);
      }),
    [users, roleType]
  );

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return scopedUsers.filter((item) => {
      const statusMatches =
        statusFilter === "all" ||
        (statusFilter === "active" ? Boolean(item.is_active) : !item.is_active);
      const searchMatches =
        !query ||
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.email || "").toLowerCase().includes(query) ||
        String(item.phone || "").toLowerCase().includes(query) ||
        String(item.id || "").toLowerCase().includes(query);
      return statusMatches && searchMatches;
    });
  }, [scopedUsers, searchTerm, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
<<<<<<< HEAD
      const access = localStorage.getItem("admin_access");
      const [rolesRes, usersRes] = await Promise.all([
        fetchWithFallback(ADMIN_BASE_URLS, "/roles/", {
          headers: { Authorization: `Bearer ${access}` },
        }),
        fetchWithFallback(ADMIN_BASE_URLS, "/users/", {
          headers: { Authorization: `Bearer ${access}` },
=======
      const [rolesRes, usersRes] = await Promise.all([
        fetchWithFallback(ADMIN_BASE_URLS, "/roles/", {
          headers: getAdminAuthHeaders(),
        }),
        fetchWithFallback(ADMIN_BASE_URLS, "/users/", {
          headers: getAdminAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        }),
      ]);
      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      if (!rolesRes.ok) throw new Error(rolesData?.detail || "Failed to load roles");
      if (!usersRes.ok) throw new Error(usersData?.detail || "Failed to load users");
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreateUser = async (event) => {
    event.preventDefault();
    if (!targetRole) {
      setError(`Role for ${roleType} is not configured.`);
      return;
    }
    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.phone.trim() ||
      !createForm.password.trim()
    ) {
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
<<<<<<< HEAD
      const access = localStorage.getItem("admin_access");
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
      const payload = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        password: createForm.password,
        role_id: Number(targetRole.id),
        is_active: Boolean(createForm.is_active),
      };
      const response = await fetchWithFallback(ADMIN_BASE_URLS, "/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
<<<<<<< HEAD
          Authorization: `Bearer ${access}`,
=======
          ...getAdminAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.email || data?.detail || "Failed to create user");
      setUsers((prev) => [data, ...prev]);
      setCreateForm({ name: "", email: "", phone: "", password: "", is_active: true });
      setSuccess("Account created successfully.");
    } catch (err) {
      setError(err?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const onSaveUser = async () => {
    if (!editingId || !targetRole) return;
    if (!editingForm.name.trim() || !editingForm.email.trim() || !editingForm.phone.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
<<<<<<< HEAD
      const access = localStorage.getItem("admin_access");
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
      const payload = {
        name: editingForm.name.trim(),
        email: editingForm.email.trim(),
        phone: editingForm.phone.trim(),
        role_id: Number(targetRole.id),
        is_active: Boolean(editingForm.is_active),
      };
      if (editingForm.password.trim()) payload.password = editingForm.password;
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/users/${editingId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
<<<<<<< HEAD
          Authorization: `Bearer ${access}`,
=======
          ...getAdminAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.email || data?.detail || "Failed to update user");
      setUsers((prev) => prev.map((item) => (Number(item.id) === Number(editingId) ? data : item)));
      setEditingId(null);
      setEditingForm({ name: "", email: "", phone: "", is_active: true, password: "" });
      setSuccess("Account updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const onDeactivateUser = async (userId) => {
    setDeletingId(userId);
    setError("");
    setSuccess("");
    try {
<<<<<<< HEAD
      const access = localStorage.getItem("admin_access");
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access}` },
=======
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/users/${userId}/`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
      });
      if (!response.ok) {
        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        throw new Error(data?.detail || "Failed to deactivate user");
      }
      setUsers((prev) =>
        prev.map((item) => (Number(item.id) === Number(userId) ? { ...item, is_active: false } : item))
      );
      setSuccess("Account deactivated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to deactivate user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          active={activeSidebar}
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
              <h1 className="text-lg font-bold">{title}</h1>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-slate-500">Super Admin</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-background-dark/50">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4">{addButtonLabel}</h2>
              <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={onCreateUser}>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Full name"
                  value={createForm.name}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Phone"
                  value={createForm.phone}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                />
                <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm flex items-center text-slate-500">
                  Role: {targetRole?.name || "Not configured"}
                </div>
                <button
                  className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-70"
                  type="submit"
                  disabled={saving || !targetRole}
                >
                  {saving ? "Saving..." : "Add"}
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
                <h2 className="text-base font-bold">All Records</h2>
                <button className="text-xs font-bold text-primary hover:underline" type="button" onClick={loadData}>
                  Refresh
                </button>
              </div>
              <div className="border-b border-slate-100 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  placeholder="Search by id, name, email, or phone"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <select
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={6}>
                          Loading...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-500" colSpan={6}>
                          No records match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 text-sm text-slate-500">#{item.id}</td>
                          <td className="px-6 py-4">
                            {editingId === item.id ? (
                              <input
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                                value={editingForm.name}
                                onChange={(event) =>
                                  setEditingForm((prev) => ({ ...prev, name: event.target.value }))
                                }
                              />
                            ) : (
                              <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === item.id ? (
                              <input
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                                value={editingForm.email}
                                onChange={(event) =>
                                  setEditingForm((prev) => ({ ...prev, email: event.target.value }))
                                }
                              />
                            ) : (
                              <span className="text-sm text-slate-700">{item.email}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === item.id ? (
                              <input
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                                value={editingForm.phone}
                                onChange={(event) =>
                                  setEditingForm((prev) => ({ ...prev, phone: event.target.value }))
                                }
                              />
                            ) : (
                              <span className="text-sm text-slate-700">{item.phone || "-"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === item.id ? (
                              <select
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                                value={editingForm.is_active ? "active" : "inactive"}
                                onChange={(event) =>
                                  setEditingForm((prev) => ({
                                    ...prev,
                                    is_active: event.target.value === "active",
                                  }))
                                }
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
                                  item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {item.is_active ? "Active" : "Inactive"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingId === item.id ? (
                              <div className="inline-flex items-center gap-2">
                                <input
                                  className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs"
                                  placeholder="New password (optional)"
                                  type="password"
                                  value={editingForm.password}
                                  onChange={(event) =>
                                    setEditingForm((prev) => ({ ...prev, password: event.target.value }))
                                  }
                                />
                                <button
                                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white disabled:opacity-70"
                                  type="button"
                                  onClick={onSaveUser}
                                  disabled={saving}
                                >
                                  Save
                                </button>
                                <button
                                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingForm({
                                      name: "",
                                      email: "",
                                      phone: "",
                                      is_active: true,
                                      password: "",
                                    });
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
                                    setEditingForm({
                                      name: item.name || "",
                                      email: item.email || "",
                                      phone: item.phone || "",
                                      is_active: Boolean(item.is_active),
                                      password: "",
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-70"
                                  type="button"
                                  disabled={deletingId === item.id || !item.is_active}
                                  onClick={() => onDeactivateUser(item.id)}
                                >
                                  {deletingId === item.id ? "Deactivating..." : "Deactivate"}
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
