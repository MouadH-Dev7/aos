export default function Contact({
  onHome,
  onProperties,
  onAgencies,
  onPromoters,
  onAbout,
  onContact,
  activeRoute,
}) {
  const navClass = (key) =>
    key === activeRoute
      ? "text-sm font-semibold text-primary underline underline-offset-4"
      : "text-sm font-semibold text-slate-600 transition-colors hover:text-primary";

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      <main>
        <section className="relative py-20 px-6 bg-slate-50 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <span className="text-primary font-bold tracking-[0.25em] text-xs uppercase mb-4 block">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-6">
              Contact Us / اتصل بنا
            </h1>
            <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed">
              Have questions about listings or want to partner with us? We are here to help you navigate Algeria&apos;s real estate market.
            </p>
          </div>
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              {[
                { icon: "mail", title: "Email / البريد", text: "contact@immoalgeria.dz", note: "For inquiries & support" },
                { icon: "call", title: "Phone / الهاتف", text: "+213 (0) 23 45 67 89", note: "Sun-Thu, 9am-6pm" },
                { icon: "location_on", title: "Office / المكتب", text: "05 Rue Didouche Mourad, Algiers", note: "Visit our headquarters" },
                { icon: "schedule", title: "Working Hours / ساعات العمل", text: "09:00 - 18:00 (GMT+1)", note: "Sunday to Thursday" },
              ].map((item) => (
                <div key={item.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary rounded-2xl p-3">
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                      <p className="text-slate-500 text-sm">{item.note}</p>
                      <p className="text-slate-800 font-semibold mt-2">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-widest mb-4">Connect With Us</h4>
                <div className="flex gap-3">
                  {["public", "video_library", "photo_camera", "share"].map((icon) => (
                    <button
                      key={icon}
                      className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                  Send a Message / إرسال رسالة
                </h2>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name / الاسم الكامل</label>
                      <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="John Doe" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email / البريد الإلكتروني</label>
                      <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="john@example.com" type="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject / الموضوع</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="How can we help?" type="text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message / الرسالة</label>
                    <textarea className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" placeholder="Your message here..." rows="5"></textarea>
                  </div>
                  <button className="w-full rounded-xl bg-primary text-white font-bold py-4 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all" type="submit">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 h-[420px]">
            <img
              alt="Map location"
              className="w-full h-full object-cover grayscale opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAjStGvVZZ02HFp1qKscSfsKwj4yPvRl8_7zfvY6Kh0pe8c9v-06Kdd_9KBaFvRFOBS8RmN92A1sCBy1GnmQx-vkAIgLQ97MB-bfc99BD0bXJ4fgocRJRx8DUGSyIx9V0ssB9j4LldmfAMSUEEzsrVQ7g6GCmUh-g2fxRAY9KxNOJMowcpXvN-oNFGdbryV05dRyu-roL6Jr1hbcd6bUjOnwaonn1CllLe5NkA5M6r4J71CxNufSpOL823xFnILjKDNmCIKouBs2wr"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl text-sm font-bold text-slate-800">
                ImmoAlgeria Headquarters
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
