export default function Terms() {
  return (
    <div className="bg-background-light text-slate-900 min-h-screen">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3">Legal</p>
        <h1 className="text-3xl md:text-4xl font-black mb-4">Terms of Service</h1>
        <p className="text-slate-600 mb-8">
          These terms outline how users can access and use ImmoAlgeria services.
          Replace this placeholder with your official terms and legal notices.
        </p>
        <div className="space-y-6 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Use of Platform</h2>
            <p>
              Users agree to provide accurate information and use the platform in compliance
              with local laws and regulations.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Listings & Content</h2>
            <p>
              All listings must be truthful and kept up to date. ImmoAlgeria reserves the right
              to remove content that violates policy.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Liability</h2>
            <p>
              The platform provides listings “as is” and does not guarantee the accuracy of
              third-party information.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
