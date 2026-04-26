export default function About({
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

 const values = [
  {
   title: "Trust",
   description:
    "Verified properties and certified partners for a more dependable search.",
   icon: (
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
     />
    </svg>
   ),
  },
  {
   title: "Innovation",
   description:
    "Modern tools, rich media, and smoother discovery from first search to final contact.",
   icon: (
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
   ),
  },
  {
   title: "Transparency",
   description:
    "Clear details, straightforward pricing, and fewer surprises across every listing.",
   icon: (
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
     <path
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
     />
    </svg>
   ),
  },
  {
   title: "Community",
   description:
    "A platform that supports local agencies, promoters, and people looking for the right place to live.",
   icon: (
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
     />
    </svg>
   ),
  },
 ];

 return (
  <div className="bg-brandLight font-sans text-slate-800">
   <header className="relative flex h-[600px] items-center overflow-hidden">
    <div className="absolute inset-0 z-0">
     <img
      alt="Modern Architecture"
      className="h-full w-full object-cover"
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDse6lp6eTRcXL6nKIeUj-r9JjadQ1qYJO4LoZb1737U9YPCE6dG1sWqk95ffjMcKFDIhvDAjpP5We1kVSwuQEHs4Dbf8ydWvI0aaBD-VyeOM76waeyAjwFDkJqYIk0vYtKiSWEMya3Pze85oKbPHWWWWkJasRoojA25NwujnIKqi8DsW4mYioqAK_QPn99Cj7WVYax5jiscrgsEeXLQrwKY9Tl_QigF3IpUjmecb4-VfWlLV1FMpAuCdl1ZLr-WwSHRiRY7yxHRMjC"
     />
     <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75"></div>
    </div>
    <div className="container relative z-10 mx-auto px-6 text-center text-white">
     <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
      Building the Future of Real Estate in Algeria
     </h1>
     <p className="mx-auto mt-8 max-w-3xl text-lg font-light text-slate-200 md:text-xl">
      We are building a clearer, more reliable property experience for buyers,
      renters, agencies, and promoters across Algeria.
     </p>
    </div>
   </header>

   <section className="bg-white py-24">
    <div className="container mx-auto px-6">
     <div className="flex flex-col items-center gap-16 lg:flex-row">
      <div className="lg:w-1/2">
       <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Heritage</span>
       <h2 className="mb-6 mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
        Redefining the Search for Home
       </h2>
       <div className="space-y-6 leading-relaxed text-slate-600">
        <p>
         Founded in 2026, Immo DZ started with a simple goal: make the search
         for property in Algeria feel straightforward, modern, and trustworthy.
        </p>
        <p>
         Today, we connect property seekers with verified listings, agencies,
         and promoters through a platform designed for clarity and confidence.
        </p>
       </div>
      </div>
      <div className="relative lg:w-1/2">
       <div className="overflow-hidden rounded-2xl shadow-2xl">
        <img
         alt="Platform Vision"
         className="h-[500px] w-full object-cover"
         src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI30XQjxirzUkED4Xc38Yq7Psuo5wuqJX_OTcLNwE5NRH1nxGpVlwh6bVug1aBDAuk5lIHSsMglOp0QuVLPNW52xcqRj36CZG2aVkUB6lwOnMS4AEMKQK4IHgmm16fQJRC0wJ3KLtermSuTTHkcn5PZjNumrGI9iK9gXj57M0mTnYUssx9NI1GvNSrQ-YjEv7v5BYDpIDQrBv18Lm-RORkzomv8lhGDfHVRMFmEjqILq_PSHAXTHOnExDG1NV6poC3bS4GbiPuJCsD"
        />
       </div>
       <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-primary p-8 md:block">
        <p className="text-lg font-bold text-white">Since 2026</p>
       </div>
      </div>
     </div>
    </div>
   </section>

   <section className="bg-primary py-16">
    <div className="container mx-auto px-6">
     <div className="grid grid-cols-2 gap-8 text-center text-white lg:grid-cols-4">
      <div>
       <div className="mb-2 text-4xl font-bold md:text-5xl">10k+</div>
       <p className="text-sm uppercase tracking-wider text-blue-100">Premium Listings</p>
      </div>
      <div>
       <div className="mb-2 text-4xl font-bold md:text-5xl">500+</div>
       <p className="text-sm uppercase tracking-wider text-blue-100">Verified Agencies</p>
      </div>
      <div>
       <div className="mb-2 text-4xl font-bold md:text-5xl">15k</div>
       <p className="text-sm uppercase tracking-wider text-blue-100">Monthly Users</p>
      </div>
      <div>
       <div className="mb-2 text-4xl font-bold md:text-5xl">48</div>
       <p className="text-sm uppercase tracking-wider text-blue-100">Wilayas Covered</p>
      </div>
     </div>
    </div>
   </section>

   <section className="bg-brandLight py-24">
    <div className="container mx-auto px-6">
     <div className="mb-16 text-center">
      <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
       Core Values That Drive Us
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-500">
       Our commitment is grounded in clarity, quality, and long-term trust.
      </p>
     </div>
     <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {values.map((value) => (
       <div key={value.title} className="rounded-2xl border border-slate-100 bg-white p-8 hover-lift">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
         {value.icon}
        </div>
        <h3 className="mb-3 text-xl font-bold">{value.title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{value.description}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   <section className="bg-white py-24">
    <div className="container mx-auto px-6">
     <div className="mb-16 text-center">
      <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
       The Minds Behind Immo DZ
      </h2>
      <p className="mt-4 text-slate-500">
       A team of experts dedicated to transforming the market.
      </p>
     </div>
     <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 sm:grid-cols-2">
      <div className="text-center">
       <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 ring-2 ring-primary/10">
        <span className="text-5xl font-black tracking-wide text-white">BM</span>
       </div>
       <h4 className="text-xl font-bold text-slate-900">Bentarzi Mouadh</h4>
       <p className="text-sm font-medium text-primary">Founder &amp; CEO</p>
      </div>
      <div className="text-center">
       <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 ring-2 ring-primary/10">
        <span className="text-5xl font-black tracking-wide text-white">MY</span>
       </div>
       <h4 className="text-xl font-bold text-slate-900">Maamir Mohamed Yanis</h4>
       <p className="text-sm font-medium text-primary">Chief Operations Officer</p>
      </div>
     </div>
    </div>
   </section>

   <section className="border-t border-slate-100 bg-brandLight py-20">
    <div className="container mx-auto px-6 text-center">
     <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-100 bg-white p-12 shadow-xl">
      <h2 className="mb-4 text-3xl font-bold text-slate-900">Join Our Journey</h2>
      <p className="mb-8 leading-relaxed text-slate-600">
       Whether you are searching for your next home or listing premium
       properties, join a real estate platform built for trust and ease.
      </p>
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
       <button
        className="rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-900"
        type="button"
        onClick={onProperties}
       >
        Explore Listings
       </button>
       <button
        className="rounded-xl border-2 border-primary bg-white px-8 py-4 font-bold text-primary transition-all hover:bg-slate-50"
        type="button"
        onClick={onContact}
       >
        Partner With Us
       </button>
      </div>
     </div>
    </div>
   </section>

   <footer className="bg-slate-900 py-16 text-slate-400">
    <div className="container mx-auto px-6">
     <div className="grid grid-cols-1 gap-12 border-b border-slate-800 pb-12 md:grid-cols-4">
      <div className="col-span-1 md:col-span-2">
       <div className="mb-6 text-2xl font-bold text-white">Immo DZ</div>
       <p className="max-w-sm">
        A trusted digital marketplace connecting buyers, renters, agencies,
        and promoters across Algeria with verified listings and professional support.
       </p>
      </div>
      <div>
       <h5 className="mb-6 font-bold text-white">Quick Links</h5>
       <ul className="space-y-4">
        <li><button className={navClass("home")} type="button" onClick={onHome}>Home</button></li>
        <li><button className={navClass("about")} type="button" onClick={onAbout}>About</button></li>
        <li><button className={navClass("contact")} type="button" onClick={onContact}>Contact</button></li>
        <li><button className={navClass("properties")} type="button" onClick={onProperties}>Listings</button></li>
       </ul>
      </div>
      <div>
       <h5 className="mb-6 font-bold text-white">Explore</h5>
       <ul className="space-y-4">
        <li><button className={navClass("agencies")} type="button" onClick={onAgencies}>Agencies</button></li>
        <li><button className={navClass("promoters")} type="button" onClick={onPromoters}>Promoters</button></li>
        <li><a className="transition-colors hover:text-white" href="https://www.linkedin.com" rel="noreferrer" target="_blank">LinkedIn</a></li>
        <li><a className="transition-colors hover:text-white" href="https://www.instagram.com" rel="noreferrer" target="_blank">Instagram</a></li>
       </ul>
      </div>
     </div>
     <div className="pt-8 text-sm">
      <p>(c) 2026 Immo DZ. All rights reserved.</p>
     </div>
    </div>
   </footer>
  </div>
 );
}
