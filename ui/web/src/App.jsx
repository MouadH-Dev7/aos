import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import AddProperty from "./AddProperty";
import MyListings from "./MyListings";
import PropertyDetails from "./PropertyDetails";
import EditProperty from "./EditProperty";
import Properties from "./Properties";
import Agencies from "./Agencies";
import Promoters from "./Promoters";
import About from "./About";
import Settings from "./Settings";
import AgencyDetails from "./AgencyDetails";
import PromoterDetails from "./PromoterDetails";
import Contact from "./Contact";
import Terms from "./Terms";
import Login from "./Login";
import MainLayout from "./components/layout/MainLayout";
import "./index.css";

function PropertyDetailsRoute({
  user,
  onMyListings,
  onDashboard,
  onEditListing,
  onDeleted,
}) {
  const { id } = useParams();
  return (
    <PropertyDetails
      user={user}
      listingId={id}
      onMyListings={onMyListings}
      onDashboard={onDashboard}
      onEditListing={onEditListing}
      onDeleted={onDeleted}
    />
  );
}

function AgencyDetailsRoute({
  user,
  onLogin,
  onLogout,
  onDashboard,
  onAddProperty,
  onHome,
  onProperties,
  onAgencies,
  onPromoters,
  onAbout,
  onViewListing,
}) {
  const { id } = useParams();
  return (
    <AgencyDetails
      user={user}
      agencyId={id}
      onLogin={onLogin}
      onLogout={onLogout}
      onDashboard={onDashboard}
      onAddProperty={onAddProperty}
      onHome={onHome}
      onProperties={onProperties}
      onAgencies={onAgencies}
      onPromoters={onPromoters}
      onAbout={onAbout}
      onViewListing={onViewListing}
    />
  );
}

function PromoterDetailsRoute({
  user,
  onLogin,
  onLogout,
  onDashboard,
  onAddProperty,
  onHome,
  onProperties,
  onAgencies,
  onPromoters,
  onAbout,
  onViewListing,
}) {
  const { id } = useParams();
  return (
    <PromoterDetails
      user={user}
      promoterId={id}
      onLogin={onLogin}
      onLogout={onLogout}
      onDashboard={onDashboard}
      onAddProperty={onAddProperty}
      onHome={onHome}
      onProperties={onProperties}
      onAgencies={onAgencies}
      onPromoters={onPromoters}
      onAbout={onAbout}
      onViewListing={onViewListing}
    />
  );
}

function AppRoutes({ currentUser, dashboardStats, handleLogout, handleUserUpdated, handleLoginSuccess }) {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goProperties = () => navigate("/properties");
  const goAgencies = () => navigate("/agencies");
  const goPromoters = () => navigate("/promoters");
  const goAbout = () => navigate("/about");
  const goContact = () => navigate("/contact");
  const goDashboard = () => navigate("/dashboard");
  const goMyListings = () => navigate("/my-listings");
  const goAddProperty = () => navigate("/add-property");
  const goSettings = () => navigate("/settings");
  const goLogin = () => navigate("/login");

  const goListing = (listing) => {
    if (!listing?.id) return;
    navigate(`/listing/${listing.id}`, { state: { listing } });
  };

  const goAgency = (agency) => {
    if (!agency?.id) return;
    navigate(`/agency/${agency.id}`);
  };

  const goPromoter = (promoter) => {
    if (!promoter?.id) return;
    navigate(`/promoter/${promoter.id}`);
  };

  const goEditListing = (listing) => {
    if (!listing?.id) return;
    navigate(`/edit-property/${listing.id}`);
  };

  const goAfterDelete = () => {
    navigate("/my-listings");
  };

  // Auth Guard Component
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Routes>
      {/* The home page includes the login form. */}
      <Route
        path="/"
        element={
          <Home
            user={currentUser}
            onLogout={handleLogout}
            onUserUpdated={handleUserUpdated}
          />
        }
      />
      <Route
        path="/login"
        element={
          <Login onLoginSuccess={handleLoginSuccess} />
        }
      />

      {/* The rest of the pages render inside MainLayout. */}
      <Route element={<MainLayout user={currentUser} onLogout={handleLogout} />}>
        <Route
          path="/properties"
          element={
            <Properties
              user={currentUser}
              onLogin={goLogin}
              onLogout={handleLogout}
              onDashboard={goDashboard}
              onAddProperty={goAddProperty}
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              activeRoute="properties"
              onViewListing={goListing}
            />
          }
        />
        <Route
          path="/agencies"
          element={
            <Agencies
              user={currentUser}
              onLogin={goLogin}
              onLogout={handleLogout}
              onDashboard={goDashboard}
              onAddProperty={goAddProperty}
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              activeRoute="agencies"
              onViewAgency={goAgency}
            />
          }
        />
        <Route
          path="/agency/:id"
          element={
            <AgencyDetailsRoute
              user={currentUser}
              onLogin={goLogin}
              onLogout={handleLogout}
              onDashboard={goDashboard}
              onAddProperty={goAddProperty}
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              onViewListing={goListing}
            />
          }
        />
        <Route
          path="/promoters"
          element={
            <Promoters
              user={currentUser}
              onLogin={goLogin}
              onLogout={handleLogout}
              onDashboard={goDashboard}
              onAddProperty={goAddProperty}
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              activeRoute="promoters"
              onViewPromoter={goPromoter}
            />
          }
        />
        <Route
          path="/promoter/:id"
          element={
            <PromoterDetailsRoute
              user={currentUser}
              onLogin={goLogin}
              onLogout={handleLogout}
              onDashboard={goDashboard}
              onAddProperty={goAddProperty}
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              onViewListing={goListing}
            />
          }
        />
        <Route
          path="/about"
          element={
            <About
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              onContact={goContact}
              activeRoute="about"
            />
          }
        />
        <Route
          path="/contact"
          element={
            <Contact
              onHome={goHome}
              onProperties={goProperties}
              onAgencies={goAgencies}
              onPromoters={goPromoters}
              onAbout={goAbout}
              onContact={goContact}
              activeRoute="contact"
            />
          }
        />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/listing/:id"
          element={
            <PropertyDetailsRoute
              user={currentUser}
              onMyListings={goMyListings}
              onDashboard={goDashboard}
              onEditListing={goEditListing}
              onDeleted={goAfterDelete}
            />
          }
        />

        {/* Protected routes requiring login. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                user={currentUser}
                stats={dashboardStats}
                onLogout={handleLogout}
                onHome={goHome}
                onAddProperty={goAddProperty}
                onMyListings={goMyListings}
                onViewListing={goListing}
                onSettings={goSettings}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings
                user={currentUser}
                onHome={goHome}
                onDashboard={goDashboard}
                onAddProperty={goAddProperty}
                onViewListing={goListing}
                onEditListing={goEditListing}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-property"
          element={
            <ProtectedRoute>
              <AddProperty user={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-property/:id"
          element={
            <ProtectedRoute>
              <EditProperty user={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings
                user={currentUser}
                onHome={goHome}
                onDashboard={goDashboard}
                onMyListings={goMyListings}
                onLogout={handleLogout}
                onUserUpdated={handleUserUpdated}
              />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect when the user enters an unknown route. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [dashboardStats, setDashboardStats] = useState(() => {
    const readCount = (key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return 0;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
        const num = Number(parsed);
        return Number.isFinite(num) ? num : 0;
      } catch {
        return 0;
      }
    };
    return {
      favorites: readCount("favorites"),
      inquiries: readCount("inquiries"),
      messages: readCount("messages"),
    };
  });

  const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8080/api/auth";

  useEffect(() => {
    const access = localStorage.getItem("auth_access");
    if (!access) return;

    const verifySession = async () => {
      try {
        const response = await fetch(`${AUTH_BASE_URL}/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!response.ok) {
          throw new Error("Session expired");
        }
        const data = await response.json();
        setCurrentUser(data);
      } catch {
        handleLogout();
      }
    };

    verifySession();
  }, [AUTH_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem("auth_access");
    localStorage.removeItem("auth_refresh");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("selected_listing_id");
    localStorage.removeItem("selected_agency_id");
    localStorage.removeItem("selected_promoter_id");
    setCurrentUser(null);
  };

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  const handleLoginSuccess = (user) => {
    if (!user) return;
    setCurrentUser(user);
    localStorage.setItem("auth_user", JSON.stringify(user));
  };

  return (
    <BrowserRouter>
      <AppRoutes
        currentUser={currentUser}
        dashboardStats={dashboardStats}
        handleLogout={handleLogout}
        handleUserUpdated={handleUserUpdated}
        handleLoginSuccess={handleLoginSuccess}
      />
    </BrowserRouter>
  );
}
