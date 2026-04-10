import { useEffect, useState } from "react";
import { cachedFetchJson } from "./utils/apiCache";
import { useNavigate } from "react-router-dom";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8001";
  const ACCOUNT_BASE_URL = import.meta.env.VITE_ACCOUNT_BASE_URL || "http://localhost:8002";
  const LOCATION_BASE_URL = import.meta.env.VITE_LOCATION_BASE_URL || "http://localhost:8003";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [communeId, setCommuneId] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [wilayas, setWilayas] = useState([]);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState("");
  const [selectedDairaId, setSelectedDairaId] = useState("");
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");

  const loginWithCredentials = async (loginEmail, loginPassword) => {
    const response = await fetch(`${AUTH_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || "Login failed");
    }
    if (data?.access) {
      localStorage.setItem("auth_access", data.access);
    }
    if (data?.refresh) {
      localStorage.setItem("auth_refresh", data.refresh);
    }
    if (data?.user) {
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      onLoginSuccess?.(data.user);
    }
    if (!remember) {
      localStorage.removeItem("auth_refresh");
    }
    return data?.user || null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") {
        await loginWithCredentials(email, password);
        navigate("/dashboard");
        return;
      }

      if (!fullName.trim() || !phone.trim()) {
        throw new Error("Full name and phone are required.");
      }
      if (roleId === 2 || roleId === 3) {
        if (!companyName.trim() || !ownerName.trim() || !registrationNumber.trim()) {
          throw new Error("Company name, owner name, and registration number are required.");
        }
        if (!communeId) {
          throw new Error("Please select a commune.");
        }
      }

      const response = await fetch(`${AUTH_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email,
          password,
          phone: phone.trim(),
          role_id: roleId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message =
          data?.detail ||
          data?.email ||
          data?.role_id ||
          "Registration failed";
        throw new Error(message);
      }

      const user = await loginWithCredentials(email, password);

      if (roleId === 2 || roleId === 3) {
        const access = localStorage.getItem("auth_access");
        const endpoint = roleId === 2 ? "/agences/" : "/promoteurs/";
        const formData = new FormData();
        formData.append("user_id", String(data?.id));
        formData.append("company_name", companyName.trim());
        formData.append("owner_name", ownerName.trim());
        formData.append("registration_number", registrationNumber.trim());
        formData.append("commune_id", String(communeId));
        formData.append("description", description.trim());
        if (logoFile) {
          formData.append("logo_file", logoFile);
        }
        const accountRes = await fetch(`${ACCOUNT_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: access ? { Authorization: `Bearer ${access}` } : {},
          body: formData,
        });
        const accountData = await accountRes.json().catch(() => ({}));
        if (!accountRes.ok) {
          const message = accountData?.detail || "Failed to save agency/promoter details.";
          throw new Error(message);
        }
      }

      if (user && (Number(user.role_id) === 2 || Number(user.role_id) === 3)) {
        navigate("/settings");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let alive = true;
    if (mode !== "register" || (roleId !== 2 && roleId !== 3)) return;
    const loadLocations = async () => {
      setLocationsLoading(true);
      setLocationsError("");
      try {
        const [wilayasData, dairasData, communesData] = await Promise.all([
          cachedFetchJson(`${LOCATION_BASE_URL}/wilayas/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LOCATION_BASE_URL}/dairas/`, { ttlMs: 900000 }),
          cachedFetchJson(`${LOCATION_BASE_URL}/communes/`, { ttlMs: 900000 }),
        ]);
        if (!alive) return;
        setWilayas(Array.isArray(wilayasData) ? wilayasData : []);
        setDairas(Array.isArray(dairasData) ? dairasData : []);
        setCommunes(Array.isArray(communesData) ? communesData : []);
      } catch (err) {
        if (!alive) return;
        setLocationsError(err?.message || "Failed to load locations.");
      } finally {
        if (!alive) return;
        setLocationsLoading(false);
      }
    };
    loadLocations();
    return () => {
      alive = false;
    };
  }, [LOCATION_BASE_URL, mode, roleId]);

  useEffect(() => {
    if (mode !== "register") return;
    setError("");
  }, [mode, roleId]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex min-h-screen w-full">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
          <img
            alt="Luxury Modern Architecture"
            className="absolute inset-0 object-cover w-full h-full"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZlCW3TM269EzIbK0vTFG--T7sePM-4WbnHe3IWIp4BJnr8mzjYhVtPyakvmnDwYV5z9ds0FfIhjpILIZmbPv8iDS67DDrLk5W8aUwo30Q5Cz9J0ncrbIZL4mEDiZkimPNrFW1Nu6t6wAi1TOlza2VYGYIUvziE4UtRZANRjk-nXQaErOEHk1br-eV24ImSv6wKhJXJqDQQZAJ9l1EpsLkcgOYuusjMLD98R4WLAT6pouiUn7--dCFSJ98TmAc_2qUHJ-V54L0P8GV"
          />
          <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <img
                src="/logo_x.png"
                alt="Immo DZ"
                className="h-14 w-auto object-contain"
              />
=======
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                <span className="material-symbols-outlined text-white text-3xl">domain</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">ImmoAlgeria</h2>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
            </div>
            <div className="max-w-md">
              <h1 className="text-5xl font-extrabold leading-tight mb-6">
                Your Gateway to the Algerian Real Estate Market
              </h1>
              <p className="text-xl text-blue-100 font-medium leading-relaxed">
                Connecting you to the finest architectural gems and premium investment
                opportunities across Algeria&apos;s most vibrant cities.
              </p>
              <div className="mt-10 flex gap-4">
                <div className="flex -space-x-3">
                  <img
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGCOeQU34jgcVA0qA8wO5gI8-KLm3UH_KTHiObPoUytPnGxLJ0GcGGzBLdLvj6xhdqjfV44QoWQOb3yU0NJNOP-pR9U0GaiTMNL1syyWL6Gmbxh6koaPPGYI_cSzyELODSxOWFAEuGGU6xHMofsEKZBFlWfr5yb2AGrdlvduK-h5e3MtXKUkY-HLMR-ls7OLj9oLUJ0nmmJXtXO6it6B_ftcz_tCj_EhnP7ubn2fcFbuspt2E5ujqkOOUwx5rCgsoKgKM_3TJACh29"
                  />
                  <img
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4_TY3YKFDNRJnwRSw_mqorw2zcId9az2K8OGln9NXh1D7wJU7LurOY_xspnLFChd0WC8c0Xn9khW4F0a3E-H6f9wriPTBQ3kAfYmovIdHzeMf610Uaj_WK__I6tVJivgcJBvyFKH-UWZSA658O9lQB7LR-jCjhSVK2VFbcIFeEreSOJ1Q_Pkhm71ZF-2OQvfwcmEcWk9YMa2E3NxHESZ7yiMvbyk1gDFiApAGkPQ77rA7Xfwx8YP6ZPAVtrSO_bq9sp4o1e50XHkY"
                  />
                  <img
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsdZjJtf0LLHxDRSL7G76dbxPQA87J2XnP3j4EWFsQCsbRrIoapFl7bpkYBjTF9O9skKmbNj-rgV_bErRuI9Wu8-4Raf9rU25CrAYtt-t_cd2xeC_zT3qUhD0-kKbrhpGR-J4FHGD66W5wcZZa8TDFB1pXd3irWgiuizRmnAbBxfLeyTC1H_pCCce3QE5mcDOgtS_Otlgtr8mcPGx3Yb3uvq2io8K-Ix7V8AiqGptDJ3M8wCe9ZdKq4s1FOoZHqAx6WS5PDKe1zpSZ"
                  />
                </div>
                <p className="text-sm self-center text-blue-50 font-medium">Join 5,000+ active investors</p>
              </div>
            </div>
<<<<<<< HEAD
            <div className="text-sm font-medium text-blue-200">© 2026 Immo DZ. All rights reserved.</div>
=======
            <div className="text-sm font-medium text-blue-200">© 2026 ImmoAlgeria. All rights reserved.</div>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 bg-white dark:bg-background-dark overflow-y-auto no-scrollbar">
          <div className="w-full max-w-[480px]">
            <div className="lg:hidden flex items-center gap-3 mb-10">
<<<<<<< HEAD
              <img
                src="/logo_x.png"
                alt="Immo DZ"
                className="h-12 w-auto object-contain"
              />
=======
              <div className="bg-primary p-2 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">domain</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">ImmoAlgeria</h2>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
              <button
                className={`flex-1 pb-4 text-sm font-bold border-b-2 ${
                  mode === "login"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                type="button"
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 pb-4 text-sm font-bold border-b-2 ${
                  mode === "register"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                type="button"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {mode === "login" ? "Welcome Back" : "Create an Account"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {mode === "login"
                  ? "Please enter your details to access your account."
                  : "Choose your account type and fill in your information."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "register" && (
                <>
                  <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex">
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg ${
                        roleId === 1 ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-500"
                      }`}
                      type="button"
                      onClick={() => setRoleId(1)}
                    >
                      User
                    </button>
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg ${
                        roleId === 2 ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-500"
                      }`}
                      type="button"
                      onClick={() => setRoleId(2)}
                    >
                      Agency
                    </button>
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg ${
                        roleId === 3 ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-500"
                      }`}
                  type="button"
                  onClick={() => setRoleId(3)}
                >
                  Promoter
                </button>
              </div>

                  {(roleId === 2 || roleId === 3) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                          <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            type="text"
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                            required={roleId === 2 || roleId === 3}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Owner Name</label>
                          <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            type="text"
                            value={ownerName}
                            onChange={(event) => setOwnerName(event.target.value)}
                            required={roleId === 2 || roleId === 3}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Registration Number
                          </label>
                          <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            type="text"
                            value={registrationNumber}
                            onChange={(event) => setRegistrationNumber(event.target.value)}
                            required={roleId === 2 || roleId === 3}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Logo Image (optional)</label>
                          <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setLogoFile(file);
                              if (!file) {
                                setLogoPreview("");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => setLogoPreview(String(reader.result || ""));
                              reader.readAsDataURL(file);
                            }}
                          />
                          {logoPreview && (
                            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
                              <img
                                alt="Logo preview"
                                className="h-16 w-16 object-cover rounded-md"
                                src={logoPreview}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {locationsLoading && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          Loading locations...
                        </div>
                      )}
                      {locationsError && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          {locationsError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Wilaya</label>
                          <select
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={selectedWilayaId}
                            onChange={(event) => {
                              const value = event.target.value;
                              setSelectedWilayaId(value);
                              setSelectedDairaId("");
                              setCommuneId("");
                            }}
                            disabled={locationsLoading}
                            required={roleId === 2 || roleId === 3}
                          >
                            <option value="">Select wilaya</option>
                            {wilayas.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name_en || item.name_ar}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daira</label>
                          <select
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={selectedDairaId}
                            onChange={(event) => {
                              const value = event.target.value;
                              setSelectedDairaId(value);
                              setCommuneId("");
                            }}
                            disabled={!selectedWilayaId || locationsLoading}
                            required={roleId === 2 || roleId === 3}
                          >
                            <option value="">Select daira</option>
                            {dairas
                              .filter((item) => String(item.wilaya_id) === String(selectedWilayaId))
                              .map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name_en || item.name_ar}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Commune</label>
                          <select
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={communeId}
                            onChange={(event) => setCommuneId(event.target.value)}
                            disabled={!selectedDairaId || locationsLoading}
                            required={roleId === 2 || roleId === 3}
                          >
                            <option value="">Select commune</option>
                            {communes
                              .filter((item) => String(item.daira_id) === String(selectedDairaId))
                              .map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name_en || item.name_ar}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description (optional)</label>
                        <textarea
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          rows="3"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required={mode === "register"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+213"
                        required={mode === "register"}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    placeholder="name@company.dz"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <button className="text-xs font-bold text-primary hover:underline" type="button">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <label className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer" htmlFor="remember">
                  Remember me for 30 days
                </label>
              </div>

              <button
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? mode === "login"
                    ? "Signing In..."
                    : "Creating Account..."
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-background-dark px-2 text-slate-400 font-medium tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" type="button">
                <img
                  alt="Google"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA01xViebUsh651WKhJchYOZJX9kTx59GEoYcBOXVkd_CDcrhHSkyLFtsri5LF319LjG0pTqmYJSXyLF13am4JF9fjknKo7sUz_Fxh6jmCmbJfJOwmdCT7wam67mm_8iZxBIfOB0idJr54gQPIQGkvzK8wkLSxE-WmJY7H1JN3XkBjberu3E62JzQRP8JWSTysd747WfSNJmaJZTNNvEpcpeJUDRTJpzvDr4pguya9uZ89oef6An-XvFnAeLO1cppBuyBDo7yy83-cu"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" type="button">
                <img
                  alt="Facebook"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrm7_RqVKBwGJ8_EF9MY2sgikjWFPp9b3NZzDTGUxqTdXKZp4rUa0zBA6RynoHFfpCQX_uD_ghmwgAHouRzaM26nDCCpflTleNLXq04mr1xUmnnuOQGx29r6sChcd1scyB8ONT8kk4dKrmAiUBSaXqkalalJkMoj13nbxfgCZMcnw3CEUIxbZm3Wqs_l8grkNs3tTMb41XQa0gt5rvvTIvHmYDdQQ3ZC0L1dZpagjuuHsXrsVOEm3GgiDojOlG8keQqWS_5NBF5M9q"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
