import { useState } from "react";

export default function AdminLogin({ onLogin, loading, error }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(form);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[650px]">
        <section className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white flex-col justify-between p-12 relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-900">domain</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">ImmoAlgeria</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Advanced Property Management</h1>
            <p className="text-blue-100 text-lg font-light leading-relaxed">
              Access the enterprise-grade dashboard to manage listings, track leads, and oversee your real estate portfolio across Algeria.
            </p>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-full">
                <span className="material-symbols-outlined text-blue-200">verified_user</span>
              </div>
              <span className="text-sm font-medium tracking-wide uppercase">Enterprise Grade Security</span>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-blue-300">© 2026 ImmoAlgeria. Secure Admin Portal v4.2</p>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-white">
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-white">domain</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">ImmoAlgeria</h2>
          </div>

          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100">
              <span className="material-symbols-outlined text-sm mr-2">lock</span>
              Protected Admin Access
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Welcome Back</h3>
            <p className="text-gray-500 mt-2">Please enter your credentials to manage the platform.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition duration-150 outline-none"
                id="email"
                name="email"
                placeholder="admin@immoalgeria.dz"
                required
                type="email"
                value={form.email}
                onChange={onChange}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                  Password
                </label>
                <button className="text-xs font-medium text-blue-700 hover:text-blue-900" type="button">
                  Forgot password?
                </button>
              </div>
              <input
                className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition duration-150 outline-none"
                id="password"
                name="password"
                placeholder="ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½"
                required
                type="password"
                value={form.password}
                onChange={onChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input className="h-4 w-4 text-blue-900 focus:ring-blue-900 border-gray-300 rounded cursor-pointer" id="remember-me" name="remember-me" type="checkbox" />
                <label className="ml-2 block text-sm text-gray-600 cursor-pointer" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
            </div>
            <button
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors duration-200"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Portal"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
