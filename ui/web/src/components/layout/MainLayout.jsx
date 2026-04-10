import { Link, Outlet, useNavigate } from "react-router-dom";

export default function MainLayout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img
              src="/logo_x.png"
              alt="Immo DZ"
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              <Link to="/properties" className="text-sm font-semibold hover:text-primary transition-colors">Properties</Link>
              <Link to="/agencies" className="text-sm font-semibold hover:text-primary transition-colors">Agencies</Link>
              <Link to="/promoters" className="text-sm font-semibold hover:text-primary transition-colors">Promoters</Link>
              <Link to="/about" className="text-sm font-semibold hover:text-primary transition-colors">About</Link>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-sm font-bold text-slate-600 hover:text-primary">Dashboard</Link>
                  <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <Link to="/settings" className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-primary/20 hover:ring-primary transition-all">
                      <img
                        className="w-full h-full object-cover"
                        alt="User profile"
                        src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || "User")}
                      />
                    </Link>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                      <span className="material-symbols-outlined align-middle">logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="text-sm font-bold bg-primary text-white px-5 py-2.5 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5">
                  Login / Join
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 lg:px-20 bg-white dark:bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2026 Immo DZ. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-primary">Contact Us</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
