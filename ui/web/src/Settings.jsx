import { useEffect, useMemo, useState } from "react";

export default function Settings({
  user,
  onHome,
  onDashboard,
  onMyListings,
  onLogout,
  onUserUpdated,
}) {
  const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8080/api/auth";
  const ACCOUNT_BASE_URL = import.meta.env.VITE_ACCOUNT_BASE_URL || "http://localhost:8080/api/account";
  const LOCATION_BASE_URL = import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8080/api/location";
  const roleId = Number(user?.role_id || 0);
  const isBusinessRole = roleId === 2 || roleId === 3;
  const profileDraftKey = user?.id ? `profile_settings_${user.id}` : "";

  const storedDraft = useMemo(() => {
    if (!profileDraftKey) return {};
    try {
      const raw = localStorage.getItem(profileDraftKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [profileDraftKey]);

  const initialForm = useMemo(
    () => ({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      companyName: storedDraft?.companyName || "",
      ownerName: storedDraft?.ownerName || "",
      registrationNumber: storedDraft?.registrationNumber || "",
      communeId: storedDraft?.communeId || "",
      logoUrl: storedDraft?.logoUrl || "",
      description: storedDraft?.description || "",
    }),
    [storedDraft, user]
  );
  const initialAvatarPreview = useMemo(() => String(storedDraft?.avatarPreview || ""), [storedDraft]);

  const [form, setForm] = useState(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRoleInfo, setIsLoadingRoleInfo] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarPreview);
  const [savedAvatarPreview, setSavedAvatarPreview] = useState(initialAvatarPreview);
  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState("");
  const [wilayas, setWilayas] = useState([]);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState("");
  const [selectedDairaId, setSelectedDairaId] = useState("");

  useEffect(() => {
    setForm(initialForm);
    setSavedForm(initialForm);
    setAvatarPreview(initialAvatarPreview);
    setSavedAvatarPreview(initialAvatarPreview);
    setBusinessLogoFile(null);
    setBusinessLogoPreview("");
    setSuccess("");
    setError("");
  }, [initialForm, initialAvatarPreview]);

  useEffect(() => {
    let isMounted = true;
    const loadRoleDetails = async () => {
      if (!user?.id) return;
      if (!isBusinessRole) return;

      try {
        setIsLoadingRoleInfo(true);
        const endpoint =
          roleId === 2
            ? `${ACCOUNT_BASE_URL}/agences/by-user/${user.id}/`
            : `${ACCOUNT_BASE_URL}/promoteurs/by-user/${user.id}/`;
        const access = localStorage.getItem("auth_access");
        const authHeader = access ? { Authorization: `Bearer ${access}` } : {};
        const response = await fetch(endpoint, { headers: authHeader });
        if (!response.ok) {
          if (response.status === 404) return;
          const payload = await readApiBody(response);
          throw new Error(extractErrorMessage(payload));
        }
        const payload = await readApiBody(response);
        if (!isMounted) return;
        const nextBusinessState = {
          companyName: payload?.company_name || "",
          ownerName: payload?.owner_name || "",
          registrationNumber: payload?.registration_number || "",
          communeId: payload?.commune_id ? String(payload.commune_id) : "",
          logoUrl: payload?.logo_url || "",
          description: payload?.description || "",
        };
        setForm((prev) => ({ ...prev, ...nextBusinessState }));
        setSavedForm((prev) => ({ ...prev, ...nextBusinessState }));
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load account details.");
      } finally {
        if (isMounted) setIsLoadingRoleInfo(false);
      }
    };

    loadRoleDetails();
    return () => {
      isMounted = false;
    };
  }, [ACCOUNT_BASE_URL, isBusinessRole, roleId, user?.id]);

  useEffect(() => {
    let isMounted = true;
    const loadLocations = async () => {
      if (!isBusinessRole) return;
      try {
        setIsLoadingLocations(true);
        const [wilayaRes, dairaRes, communeRes] = await Promise.all([
          fetch(`${LOCATION_BASE_URL}/wilayas/`),
          fetch(`${LOCATION_BASE_URL}/dairas/`),
          fetch(`${LOCATION_BASE_URL}/communes/`),
        ]);
        if (!wilayaRes.ok || !dairaRes.ok || !communeRes.ok) {
          throw new Error("Failed to load location lists.");
        }

        const [wilayasData, dairasData, communesData] = await Promise.all([
          readApiBody(wilayaRes),
          readApiBody(dairaRes),
          readApiBody(communeRes),
        ]);

        if (!isMounted) return;
        setWilayas(Array.isArray(wilayasData) ? wilayasData : []);
        setDairas(Array.isArray(dairasData) ? dairasData : []);
        setCommunes(Array.isArray(communesData) ? communesData : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load location lists.");
      } finally {
        if (isMounted) setIsLoadingLocations(false);
      }
    };

    loadLocations();
    return () => {
      isMounted = false;
    };
  }, [LOCATION_BASE_URL, isBusinessRole]);

  useEffect(() => {
    if (!isBusinessRole) return;
    if (!form.communeId) {
      setSelectedWilayaId("");
      setSelectedDairaId("");
      return;
    }
    if (!communes.length) return;
    const commune = communes.find((item) => String(item.id) === String(form.communeId));
    if (!commune) return;
    setSelectedWilayaId(String(commune.wilaya_id || ""));
    setSelectedDairaId(String(commune.daira_id || ""));
  }, [communes, form.communeId, isBusinessRole]);

  const filteredDairas = useMemo(() => {
    if (!selectedWilayaId) return dairas;
    return dairas.filter((item) => String(item.wilaya_id) === String(selectedWilayaId));
  }, [dairas, selectedWilayaId]);

  const filteredCommunes = useMemo(() => {
    let result = communes;
    if (selectedWilayaId) {
      result = result.filter((item) => String(item.wilaya_id) === String(selectedWilayaId));
    }
    if (selectedDairaId) {
      result = result.filter((item) => String(item.daira_id) === String(selectedDairaId));
    }
    return result;
  }, [communes, selectedDairaId, selectedWilayaId]);

  const hasUnsavedChanges =
    Object.keys(form).some((key) => form[key] !== savedForm[key]) ||
    avatarPreview !== savedAvatarPreview ||
    Boolean(businessLogoFile);

  const onFieldChange = (key, value) => {
    setSuccess("");
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onUploadAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ""));
      setSuccess("");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const onUploadBusinessLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBusinessLogoFile(file);
      setBusinessLogoPreview(String(reader.result || ""));
      setSuccess("");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const onCancel = () => {
    setForm(savedForm);
    setAvatarPreview(savedAvatarPreview);
    setBusinessLogoFile(null);
    setBusinessLogoPreview("");
    setSuccess("");
    setError("");
  };

  const readApiBody = async (response) => {
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return { detail: `HTTP ${response.status}` };
      }
    }
    const text = await response.text();
    return { detail: text || `HTTP ${response.status}` };
  };

  const extractErrorMessage = (payload) => {
    if (!payload) return "Failed to update profile.";
    if (typeof payload === "string") return payload;
    if (typeof payload.detail === "string") return payload.detail;
    if (typeof payload.email === "string") return payload.email;
    if (Array.isArray(payload.email) && payload.email[0]) return String(payload.email[0]);
    return "Failed to update profile.";
  };

  const validateBusinessFields = () => {
    if (!isBusinessRole) return "";
    if (!form.companyName.trim()) return "Company name is required.";
    if (!form.ownerName.trim()) return "Owner name is required.";
    if (!form.registrationNumber.trim()) return "Registration number is required.";
    if (!form.communeId.trim()) return "Commune is required.";
    const communeValue = Number(form.communeId);
    if (!Number.isFinite(communeValue) || communeValue <= 0) return "Commune is invalid.";
    return "";
  };

  const buildBusinessPayload = (updatedUser) => ({
    user_id: updatedUser.id,
    company_name: form.companyName.trim(),
    owner_name: form.ownerName.trim(),
    registration_number: form.registrationNumber.trim(),
    commune_id: Number(form.communeId),
    description: form.description.trim(),
  });

  const buildBusinessRequestOptions = (method, payload) => {
    const access = localStorage.getItem("auth_access");
    const authHeader = access ? { Authorization: `Bearer ${access}` } : {};
    if (businessLogoFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      formData.append("logo_file", businessLogoFile);
      return { method, headers: { ...authHeader }, body: formData };
    }

    return {
      method,
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify(payload),
    };
  };

  const syncAccountPersonalInfo = async (updatedUser, fullName, phone) => {
    const userId = updatedUser?.id;
    const roleId = Number(updatedUser?.role_id || 0);
    if (!userId || !roleId) return;

    if (roleId === 1) {
      const profileUrl = `${ACCOUNT_BASE_URL}/profiles/by-user/${userId}/`;
      const access = localStorage.getItem("auth_access");
      const authHeader = access ? { Authorization: `Bearer ${access}` } : {};
      const patchRes = await fetch(profileUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          full_name: fullName,
          phone,
        }),
      });

      if (patchRes.status === 404) {
        const createRes = await fetch(`${ACCOUNT_BASE_URL}/profiles/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            user_id: userId,
            full_name: fullName,
            phone,
          }),
        });
        if (!createRes.ok) {
          const createBody = await readApiBody(createRes);
          throw new Error(extractErrorMessage(createBody));
        }
        return await readApiBody(createRes);
      }

      if (!patchRes.ok) {
        const patchBody = await readApiBody(patchRes);
        throw new Error(extractErrorMessage(patchBody));
      }
      return await readApiBody(patchRes);
    }

    if (roleId === 2) {
      const payload = buildBusinessPayload(updatedUser);
      const res = await fetch(
        `${ACCOUNT_BASE_URL}/agences/by-user/${userId}/`,
        buildBusinessRequestOptions("PATCH", payload)
      );
      if (res.status === 404) {
        const createRes = await fetch(
          `${ACCOUNT_BASE_URL}/agences/`,
          buildBusinessRequestOptions("POST", payload)
        );
        if (!createRes.ok) {
          const body = await readApiBody(createRes);
          throw new Error(extractErrorMessage(body));
        }
        return await readApiBody(createRes);
      }
      if (!res.ok) {
        const body = await readApiBody(res);
        throw new Error(extractErrorMessage(body));
      }
      return await readApiBody(res);
    }

    if (roleId === 3) {
      const payload = buildBusinessPayload(updatedUser);
      const res = await fetch(
        `${ACCOUNT_BASE_URL}/promoteurs/by-user/${userId}/`,
        buildBusinessRequestOptions("PATCH", payload)
      );
      if (res.status === 404) {
        const createRes = await fetch(
          `${ACCOUNT_BASE_URL}/promoteurs/`,
          buildBusinessRequestOptions("POST", payload)
        );
        if (!createRes.ok) {
          const body = await readApiBody(createRes);
          throw new Error(extractErrorMessage(body));
        }
        return await readApiBody(createRes);
      }
      if (!res.ok) {
        const body = await readApiBody(res);
        throw new Error(extractErrorMessage(body));
      }
      return await readApiBody(res);
    }

    return null;
  };

  const onSave = async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setIsSaving(true);
    setSuccess("");
    setError("");

    try {
      const validationError = validateBusinessFields();
      if (validationError) {
        throw new Error(validationError);
      }

      const access = localStorage.getItem("auth_access");
      if (!access) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(`${AUTH_BASE_URL}/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });

      const payload = await readApiBody(response);
      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      const updatedUser = payload;
      const accountPayload = await syncAccountPersonalInfo(
        updatedUser,
        form.fullName.trim(),
        form.phone.trim()
      );
      const nextSavedForm = {
        fullName: updatedUser?.name ?? form.fullName,
        email: updatedUser?.email ?? form.email,
        phone: updatedUser?.phone ?? form.phone,
        companyName: form.companyName,
        ownerName: form.ownerName,
        registrationNumber: form.registrationNumber,
        communeId: form.communeId,
        logoUrl: accountPayload?.logo_url ?? form.logoUrl,
        description: form.description,
      };

      if (profileDraftKey) {
        localStorage.setItem(
          profileDraftKey,
          JSON.stringify({
            companyName: nextSavedForm.companyName,
            ownerName: nextSavedForm.ownerName,
            registrationNumber: nextSavedForm.registrationNumber,
            communeId: nextSavedForm.communeId,
            logoUrl: nextSavedForm.logoUrl,
            description: nextSavedForm.description,
            avatarPreview,
          })
        );
      }

      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      onUserUpdated?.(updatedUser);

      setForm(nextSavedForm);
      setSavedForm(nextSavedForm);
      setSavedAvatarPreview(avatarPreview);
      setBusinessLogoFile(null);
      setBusinessLogoPreview("");
      setSuccess("Profile information updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <main className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full md:px-6 lg:px-10 py-8 gap-8">
        <aside className="w-full md:w-64 flex flex-col gap-1 px-4 md:px-0">
          <div className="mb-4 px-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Management</h3>
          </div>
          <div className="bg-primary/10 text-primary border-l-4 border-primary flex items-center gap-3 px-4 py-3 rounded-lg font-medium">
            <span className="material-symbols-outlined">person</span>
            <div className="flex flex-col">
              <span className="text-sm">Profile</span>
              <span className="text-[10px] opacity-70">Personal information</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Account</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all">
            <span className="material-symbols-outlined">shield</span>
            <span className="text-sm">Security</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all">
            <span className="material-symbols-outlined">notifications_active</span>
            <span className="text-sm">Notifications</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all">
            <span className="material-symbols-outlined">translate</span>
            <span className="text-sm">Language and Theme</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-4 mx-3"></div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all">
            <span className="material-symbols-outlined">lock</span>
            <span className="text-sm">Privacy</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-all">
            <span className="material-symbols-outlined">delete_forever</span>
            <span className="text-sm font-bold">Danger Zone</span>
          </div>
        </aside>

        <div className="flex-1 flex flex-col gap-6 px-4 md:px-0 pb-32">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Update your personal information and public presence on the platform.
            </p>
          </div>

          {success && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-4 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-red-600">error</span>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoadingRoleInfo && (
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-slate-600">hourglass_top</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Loading your {roleId === 2 ? "agency" : "promoter"} profile details...
              </p>
            </div>
          )}

          {isBusinessRole && isLoadingLocations && (
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-slate-600">map</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">Loading location lists...</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden ring-4 ring-white dark:ring-slate-900">
                  {isBusinessRole ? (
                    businessLogoPreview || form.logoUrl ? (
                      <img
                        alt="Company logo"
                        className="w-full h-full object-cover"
                        src={businessLogoPreview || form.logoUrl}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-slate-500">
                        {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )
                  ) : avatarPreview ? (
                    <img alt="Avatar" className="w-full h-full object-cover" src={avatarPreview} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-slate-500">
                      {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={isBusinessRole ? onUploadBusinessLogo : onUploadAvatar}
                  />
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBusinessRole ? "Company Logo" : "Profile Picture"}
                </h2>
                <p className="text-xs text-slate-500 mb-3">JPG, GIF or PNG. Max size of 2MB</p>
                {isBusinessRole && businessLogoFile && (
                  <p className="text-xs text-slate-500">Selected: {businessLogoFile.name}</p>
                )}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                  placeholder="Enter your full name"
                  type="text"
                  value={form.fullName}
                  onChange={(event) => onFieldChange("fullName", event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                  placeholder="your@email.com"
                  type="email"
                  value={form.email}
                  onChange={(event) => onFieldChange("email", event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                  placeholder="+213 555 123 456"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => onFieldChange("phone", event.target.value)}
                />
              </div>

              {isBusinessRole && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                    <input
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      placeholder="Company name"
                      type="text"
                      value={form.companyName}
                      onChange={(event) => onFieldChange("companyName", event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Owner Name</label>
                    <input
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      placeholder="Owner name"
                      type="text"
                      value={form.ownerName}
                      onChange={(event) => onFieldChange("ownerName", event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Registration Number
                    </label>
                    <input
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      placeholder="Registration number"
                      type="text"
                      value={form.registrationNumber}
                      onChange={(event) => onFieldChange("registrationNumber", event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Wilaya</label>
                    <select
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      value={selectedWilayaId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSelectedWilayaId(value);
                        setSelectedDairaId("");
                        onFieldChange("communeId", "");
                      }}
                      disabled={isLoadingLocations}
                    >
                      <option value="">Select wilaya</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.id}>
                          {wilaya.name_en || wilaya.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daira</label>
                    <select
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      value={selectedDairaId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSelectedDairaId(value);
                        onFieldChange("communeId", "");
                      }}
                      disabled={!selectedWilayaId || isLoadingLocations}
                    >
                      <option value="">Select daira</option>
                      {filteredDairas.map((daira) => (
                        <option key={daira.id} value={daira.id}>
                          {daira.name_en || daira.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Commune</label>
                    <select
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      value={form.communeId}
                      onChange={(event) => onFieldChange("communeId", event.target.value)}
                      disabled={!selectedDairaId || isLoadingLocations}
                    >
                      <option value="">Select commune</option>
                      {filteredCommunes.map((commune) => (
                        <option key={commune.id} value={commune.id}>
                          {commune.name_en || commune.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                    <textarea
                      className="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      placeholder="Describe your company..."
                      rows="4"
                      value={form.description}
                      onChange={(event) => onFieldChange("description", event.target.value)}
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500 dark:text-slate-400">Your changes are automatically drafted.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              type="button"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </footer>

      {hasUnsavedChanges && (
        <div className="fixed bottom-24 right-4 z-50">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 max-w-xs">
            <span className="material-symbols-outlined text-yellow-400">warning</span>
            <p className="text-xs font-medium">You have unsaved changes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
