import { useEffect, useMemo, useState } from "react";
import "./index.css";

<<<<<<< HEAD
import { ADMIN_BASE_URLS, AUTH_BASE_URLS, fetchWithFallback } from "./api.js";
=======
import { ADMIN_BASE_URLS, AUTH_BASE_URLS, fetchWithFallback, getAdminAuthHeaders } from "./api.js";
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/Dashboard.jsx";
import AdminListings from "./pages/Listings.jsx";
import AdminPropertyDetails from "./pages/PropertyDetails.jsx";
import AdminCategories from "./pages/Categories.jsx";
import AdminTypes from "./pages/Types.jsx";
import AdminDocumentTypes from "./pages/DocumentTypes.jsx";
import AdminUsers from "./pages/Users.jsx";
import AdminAmenities from "./pages/Amenities.jsx";
import AdminAgencies from "./pages/Agencies.jsx";
import AdminContractors from "./pages/Contractors.jsx";

const ADMIN_ROLE_ID = 4;

const getPath = () => window.location.pathname || "/";

const parseRoute = (path) => {
  const normalizedPath = path !== "/" ? path.replace(/\/+$/, "") : path;

  if (normalizedPath.startsWith("/listings/")) {
    const listingId = normalizedPath.split("/")[2];
    if (listingId) {
      return { name: "details", listingId };
    }
  }
  if (normalizedPath === "/listings") {
    return { name: "listings" };
  }
  if (normalizedPath === "/categories") {
    return { name: "categories" };
  }
  if (normalizedPath === "/types") {
    return { name: "types" };
  }
  if (normalizedPath === "/users") {
    return { name: "users" };
  }
  if (normalizedPath === "/document-types") {
    return { name: "document-types" };
  }
  if (normalizedPath === "/amenities") {
    return { name: "amenities" };
  }
  if (normalizedPath === "/agencies") {
    return { name: "agencies" };
  }
  if (normalizedPath === "/contractors") {
    return { name: "contractors" };
  }
  return { name: "dashboard" };
};

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [route, setRoute] = useState(getPath());
  const [detailsBack, setDetailsBack] = useState("/dashboard");

  const navigate = (path) => {
    setRoute((prev) => {
      if (prev === path) return prev;
      window.history.pushState({}, "", path);
      return path;
    });
  };

<<<<<<< HEAD
=======
  const buildAuthHeaders = () => getAdminAuthHeaders();

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem("admin_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
  useEffect(() => {
    const handlePop = () => setRoute(getPath());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

<<<<<<< HEAD
=======
  useEffect(() => {
    if (authUser) return;
    const storedUser = readStoredUser();
    if (storedUser) {
      setAuthUser(storedUser);
    }
  }, [authUser]);

>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
  const routeInfo = useMemo(() => parseRoute(route), [route]);

  useEffect(() => {
    if (authUser && route === "/") {
      navigate("/dashboard");
    }
  }, [authUser, route]);

  useEffect(() => {
<<<<<<< HEAD
    const access = localStorage.getItem("admin_access");
    if (!access) return;

    const verify = async () => {
      try {
        const response = await fetchWithFallback(AUTH_BASE_URLS, "/me/", {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!response.ok) throw new Error("Session expired");
        const data = await response.json();
        if (Number(data.role_id) !== ADMIN_ROLE_ID) {
          throw new Error("You are not authorized as admin.");
        }
        setAuthUser(data);
      } catch {
        localStorage.removeItem("admin_access");
        localStorage.removeItem("admin_refresh");
        localStorage.removeItem("admin_user");
        setAuthUser(null);
      }
    };

    verify();
  }, []);

  useEffect(() => {
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
    if (!authUser) return;
    const loadListings = async () => {
      setListingsError("");
      setListingsLoading(true);
      try {
<<<<<<< HEAD
        const access = localStorage.getItem("admin_access");
        const response = await fetchWithFallback(ADMIN_BASE_URLS, "/listings/", {
          headers: { Authorization: `Bearer ${access}` },
=======
        const response = await fetchWithFallback(ADMIN_BASE_URLS, "/listings/", {
          headers: buildAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load listings");
        }
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        setListingsError(err?.message || "Failed to load listings");
      } finally {
        setListingsLoading(false);
      }
    };

    loadListings();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    const loadStatuses = async () => {
      try {
<<<<<<< HEAD
        const access = localStorage.getItem("admin_access");
        const response = await fetchWithFallback(ADMIN_BASE_URLS, "/statuses/", {
          headers: { Authorization: `Bearer ${access}` },
=======
        const response = await fetchWithFallback(ADMIN_BASE_URLS, "/statuses/", {
          headers: buildAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to load statuses");
        }
        const map = {};
        (Array.isArray(data) ? data : []).forEach((status) => {
          map[String(status.name || "").toLowerCase()] = status.id;
        });
        setStatusMap(map);
      } catch {
        setStatusMap({});
      }
    };

    loadStatuses();
  }, [authUser]);

  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((item) => String(item.status_name || "").toLowerCase() === "active").length;
    const pending = listings.filter((item) => String(item.status_name || "").toLowerCase() === "pending").length;
    const rejected = listings.filter((item) => String(item.status_name || "").toLowerCase() === "rejected").length;
    return { total, active, pending, rejected };
  }, [listings]);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithFallback(AUTH_BASE_URLS, "/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Login failed");
      }
      if (Number(data?.user?.role_id) !== ADMIN_ROLE_ID) {
        throw new Error("This account is not an admin.");
      }
<<<<<<< HEAD
      localStorage.setItem("admin_access", data.access);
      localStorage.setItem("admin_refresh", data.refresh);
=======
      const accessToken = data?.access || data?.access_token || data?.token;
      const refreshToken = data?.refresh || data?.refresh_token;
      if (!accessToken) {
        throw new Error("Login succeeded but access token is missing.");
      }
      localStorage.setItem("admin_access", accessToken);
      if (refreshToken) {
        localStorage.setItem("admin_refresh", refreshToken);
      } else {
        localStorage.removeItem("admin_refresh");
      }
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      setAuthUser(data.user);
      if (route === "/") {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_user");
    setAuthUser(null);
    setListings([]);
    setSelectedListing(null);
    navigate("/");
  };

  const updateListingStatus = async (listing, statusName) => {
    if (!listing?.id) return;
    const statusId = statusMap[String(statusName).toLowerCase()];
    if (!statusId) {
      setActionError("Status is not configured on the server.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
<<<<<<< HEAD
      const access = localStorage.getItem("admin_access");
=======
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
      const response = await fetchWithFallback(ADMIN_BASE_URLS, `/properties/${listing.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
<<<<<<< HEAD
          Authorization: `Bearer ${access}`,
=======
          ...buildAuthHeaders(),
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
        },
        body: JSON.stringify({ status: statusId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to update status");
      }
      setListings((prev) =>
        prev.map((item) => (String(item.id) === String(listing.id) ? { ...item, status_name: data.status_name || statusName } : item))
      );
      setSelectedListing((prev) => (prev && String(prev.id) === String(listing.id) ? { ...prev, status_name: data.status_name || statusName } : prev));
      setActionSuccess(`Listing ${statusName.toLowerCase()} successfully.`);
    } catch (err) {
      setActionError(err?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const openListingFrom = (listing, backPath) => {
    setSelectedListing(listing);
    setActionError("");
    setActionSuccess("");
    setDetailsBack(backPath);
    navigate(`/listings/${listing.id}`);
  };

  const routeListing = useMemo(() => {
    if (routeInfo.name !== "details" || !routeInfo.listingId) return null;
    return listings.find((item) => String(item.id) === String(routeInfo.listingId)) || null;
  }, [listings, routeInfo]);

  const listingForDetails =
    selectedListing && routeInfo.name === "details" && String(selectedListing.id) === String(routeInfo.listingId)
      ? selectedListing
      : routeListing;

  if (!authUser) {
    return <AdminLogin onLogin={handleLogin} loading={loading} error={error} />;
  }

  if (routeInfo.name === "details") {
    return (
      <AdminPropertyDetails
        listing={listingForDetails}
        onBack={() => navigate(detailsBack || "/dashboard")}
        onApprove={(listing) => updateListingStatus(listing, "Active")}
        onReject={(listing) => updateListingStatus(listing, "Rejected")}
        actionLoading={actionLoading}
        actionError={actionError}
        actionSuccess={actionSuccess}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoUsers={() => navigate("/users")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
        pendingCount={stats.pending}
      />
    );
  }

  if (routeInfo.name === "listings") {
    return (
      <AdminListings
        user={authUser}
        listings={listings}
        loading={listingsLoading}
        error={listingsError}
        onBack={() => navigate("/dashboard")}
        onSelectListing={(listing) => openListingFrom(listing, "/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoUsers={() => navigate("/users")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "categories") {
    return (
      <AdminCategories
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoUsers={() => navigate("/users")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "types") {
    return (
      <AdminTypes
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoUsers={() => navigate("/users")}
        onGoCategories={() => navigate("/categories")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "users") {
    return (
      <AdminUsers
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "document-types") {
    return (
      <AdminDocumentTypes
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoUsers={() => navigate("/users")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "amenities") {
    return (
      <AdminAmenities
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoUsers={() => navigate("/users")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "agencies") {
    return (
      <AdminAgencies
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoUsers={() => navigate("/users")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  if (routeInfo.name === "contractors") {
    return (
      <AdminContractors
        user={authUser}
        pendingCount={stats.pending}
        onGoDashboard={() => navigate("/dashboard")}
        onGoListings={() => navigate("/listings")}
        onGoTypes={() => navigate("/types")}
        onGoCategories={() => navigate("/categories")}
        onGoUsers={() => navigate("/users")}
        onGoDocumentTypes={() => navigate("/document-types")}
        onGoAmenities={() => navigate("/amenities")}
        onGoAgencies={() => navigate("/agencies")}
        onGoContractors={() => navigate("/contractors")}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminDashboard
      user={authUser}
      onLogout={handleLogout}
      listings={listings}
      stats={stats}
      loading={listingsLoading}
      error={listingsError}
      selectedListing={selectedListing}
      onSelectListing={(listing) => openListingFrom(listing, "/dashboard")}
      onGoListings={() => navigate("/listings")}
      onGoDashboard={() => navigate("/dashboard")}
      onGoTypes={() => navigate("/types")}
      onGoCategories={() => navigate("/categories")}
      onGoUsers={() => navigate("/users")}
      onGoDocumentTypes={() => navigate("/document-types")}
      onGoAmenities={() => navigate("/amenities")}
      onGoAgencies={() => navigate("/agencies")}
      onGoContractors={() => navigate("/contractors")}
      onApprove={(listing) => updateListingStatus(listing, "Active")}
      onReject={(listing) => updateListingStatus(listing, "Rejected")}
      actionLoading={actionLoading}
      actionError={actionError}
      actionSuccess={actionSuccess}
    />
  );
}
