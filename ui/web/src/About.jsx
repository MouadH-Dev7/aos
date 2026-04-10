export default function About({ onHome, onProperties, onAgencies, onPromoters, onAbout, onContact, activeRoute }) {
 const navClass = (key) =>
  key === activeRoute
   ? "text-sm font-semibold text-primary underline underline-offset-4"
   : "text-sm font-semibold text-slate-600 transition-colors hover:text-primary";

 return (
  <div className="bg-brandLight font-sans text-slate-800">
   <header className="relative h-[600px] flex items-center overflow-hidden">
    <div className="absolute inset-0 z-0">
     <img
      alt="Modern Architecture"
      className="w-full h-full object-cover"
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDse6lp6eTRcXL6nKIeUj-r9JjadQ1qYJO4LoZb1737U9YPCE6dG1sWqk95ffjMcKFDIhvDAjpP5We1kVSwuQEHs4Dbf8ydWvI0aaBD-VyeOM76waeyAjwFDkJqYIk0vYtKiSWEMya3Pze85oKbPHWWWWkJasRoojA25NwujnIKqi8DsW4mYioqAK_QPn99Cj7WVYax5jiscrgsEeXLQrwKY9Tl_QigF3IpUjmecb4-VfWlLV1FMpAuCdl1ZLr-WwSHRiRY7yxHRMjC"
     />
     <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75"></div>
    </div>
    <div className="container mx-auto px-6 relative z-10 text-white text-center">
     <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
      Building the Future of Real Estate in Algeria
     </h1>
     <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
      <div className="ltr border-r border-white/20 pr-8">
       <p className="text-lg md:text-xl text-slate-200 font-light">
        We are dedicated to revolutionizing the Algerian property market through digital excellence and unparalleled transparency.
       </p>
      </div>
      <div className="rtl border-l border-white/20 pl-8 font-light">
       <p className="text-lg md:text-xl text-slate-200">
        نحن نعيد تشكيل سوق العقار الجزائري عبر حلول رقمية شفافة وتجربة بحث سهلة وآمنة لكل العملاء.
       </p>
      </div>
     </div>
    </div>
   </header>

   <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
     <div className="flex flex-col lg:flex-row items-center gap-16">
      <div className="lg:w-1/2">
       <span className="text-primary font-bold tracking-widest uppercase text-xs">Our Heritage</span>
       <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-6">Redefining the Search for Home</h2>
       <div className="space-y-6 text-slate-600 leading-relaxed">
        <p>
<<<<<<< HEAD
         Founded in 2026, Immo DZ emerged from a simple observation: finding a home in Algeria shouldn't be a hurdle. We set out to bridge the gap between dreamers and developers, property seekers and trusted agencies.
=======
         Founded in 2026, ImmoAlgeria emerged from a simple observation: finding a home in Algeria shouldn't be a hurdle. We set out to bridge the gap between dreamers and developers, property seekers and trusted agencies.
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
        </p>
        <p className="rtl text-right italic border-r-4 border-primary/20 pr-4">
         تأسست إيمو ألجيريا عام 2026 بعد ملاحظة بسيطة: البحث عن منزل في الجزائر يجب أن يكون واضحا وسلسا. هدفنا هو ربط الباحثين عن السكن بالمطورين والوكالات الموثوقة في مكان واحد.
        </p>
        <p>
         Today, we stand as a trusted marketplace for listings and verified partners, using modern technology to help every user find the right property with confidence.
        </p>
       </div>
      </div>
      <div className="lg:w-1/2 relative">
       <div className="rounded-2xl overflow-hidden shadow-2xl">
        <img
         alt="Platform Vision"
         className="w-full h-[500px] object-cover"
         src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI30XQjxirzUkED4Xc38Yq7Psuo5wuqJX_OTcLNwE5NRH1nxGpVlwh6bVug1aBDAuk5lIHSsMglOp0QuVLPNW52xcqRj36CZG2aVkUB6lwOnMS4AEMKQK4IHgmm16fQJRC0wJ3KLtermSuTTHkcn5PZjNumrGI9iK9gXj57M0mTnYUssx9NI1GvNSrQ-YjEv7v5BYDpIDQrBv18Lm-RORkzomv8lhGDfHVRMFmEjqILq_PSHAXTHOnExDG1NV6poC3bS4GbiPuJCsD"
        />
       </div>
       <div className="absolute -bottom-6 -left-6 bg-primary p-8 rounded-2xl hidden md:block">
        <p className="text-white font-bold text-lg">Since 2026</p>
       </div>
      </div>
     </div>
    </div>
   </section>

   <section className="py-16 bg-primary">
    <div className="container mx-auto px-6">
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
      <div>
       <div className="text-4xl md:text-5xl font-bold mb-2">10k+</div>
       <p className="text-blue-100 text-sm uppercase tracking-wider">Premium Listings</p>
      </div>
      <div>
       <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
       <p className="text-blue-100 text-sm uppercase tracking-wider">Verified Agencies</p>
      </div>
      <div>
       <div className="text-4xl md:text-5xl font-bold mb-2">15k</div>
       <p className="text-blue-100 text-sm uppercase tracking-wider">Monthly Users</p>
      </div>
      <div>
       <div className="text-4xl md:text-5xl font-bold mb-2">48</div>
       <p className="text-blue-100 text-sm uppercase tracking-wider">Wilayas Covered</p>
      </div>
     </div>
    </div>
   </section>

   <section className="py-24 bg-brandLight">
    <div className="container mx-auto px-6">
     <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Core Values That Drive Us</h2>
      <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Our commitment is built on pillars of integrity and innovation to serve the Algerian community better.</p>
     </div>
     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 hover-lift">
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
       </div>
       <h3 className="text-xl font-bold mb-3">Trust</h3>
       <p className="text-slate-600 text-sm leading-relaxed">Verified properties and certified partners for your peace of mind.</p>
       <p className="rtl text-right text-xs mt-3 text-primary">ثقة مبنية على التحقق</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-100 hover-lift">
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
       </div>
       <h3 className="text-xl font-bold mb-3">Innovation</h3>
       <p className="text-slate-600 text-sm leading-relaxed">Utilizing AI and virtual tours to make remote viewing a reality.</p>
       <p className="rtl text-right text-xs mt-3 text-primary">ابتكار يصنع تجربة أفضل</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-100 hover-lift">
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
         <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
       </div>
       <h3 className="text-xl font-bold mb-3">Transparency</h3>
       <p className="text-slate-600 text-sm leading-relaxed">No hidden fees, accurate pricing, and honest property details.</p>
       <p className="rtl text-right text-xs mt-3 text-primary">شفافية بلا مفاجآت</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-100 hover-lift">
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
       </div>
       <h3 className="text-xl font-bold mb-3">Community</h3>
       <p className="text-slate-600 text-sm leading-relaxed">Supporting local development and sustainable urban living.</p>
       <p className="rtl text-right text-xs mt-3 text-primary">مجتمع يدعم التنمية</p>
      </div>
     </div>
    </div>
   </section>

   <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
     <div className="text-center mb-16">
<<<<<<< HEAD
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900">The Minds Behind Immo DZ</h2>
=======
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900">The Minds Behind ImmoAlgeria</h2>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
      <p className="text-slate-500 mt-4">A team of experts dedicated to transforming the market.</p>
     </div>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mx-auto">
      <div className="text-center">
       <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 ring-2 ring-primary/10 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center">
        <span className="text-5xl font-black text-white tracking-wide">BM</span>
       </div>
       <h4 className="text-xl font-bold text-slate-900">Bentarzi Mouadh</h4>
       <p className="text-primary font-medium text-sm">Founder &amp; CEO</p>
      </div>
      <div className="text-center">
       <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 ring-2 ring-primary/10 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 flex items-center justify-center">
        <span className="text-5xl font-black text-white tracking-wide">MY</span>
       </div>
       <h4 className="text-xl font-bold text-slate-900">Maamir Mohamed Yanis</h4>
       <p className="text-primary font-medium text-sm">Chief Operations Officer</p>
      </div>
     </div>
    </div>
   </section>

   <section className="py-20 bg-brandLight border-t border-slate-100">
    <div className="container mx-auto px-6 text-center">
     <div className="max-w-3xl mx-auto bg-white p-12 rounded-[2rem] shadow-xl border border-slate-100">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Join Our Journey</h2>
      <p className="text-slate-600 mb-8 leading-relaxed">
       Whether you are searching for your next home or listing premium properties, join the most trusted real estate community in Algeria.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
       <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-primary/20" type="button" onClick={onProperties}>
        Explore Listings
       </button>
       <button className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all" type="button" onClick={onContact}>
        Partner With Us
       </button>
      </div>
     </div>
    </div>
   </section>

   <footer className="bg-slate-900 py-16 text-slate-400">
    <div className="container mx-auto px-6">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
      <div className="col-span-1 md:col-span-2">
<<<<<<< HEAD
       <div className="text-white text-2xl font-bold mb-6">Immo DZ</div>
=======
       <div className="text-white text-2xl font-bold mb-6">ImmoAlgeria</div>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
       <p className="max-w-sm">
        A trusted digital marketplace connecting buyers, renters, agencies, and promoters across Algeria with verified listings and professional support.
       </p>
      </div>
      <div>
       <h5 className="text-white font-bold mb-6">Quick Links</h5>
       <ul className="space-y-4">
        <li><button className="hover:text-white transition-colors" type="button" onClick={onHome}>Home</button></li>
        <li><button className="hover:text-white transition-colors" type="button" onClick={onAbout}>About</button></li>
        <li><button className="hover:text-white transition-colors" type="button" onClick={onContact}>Contact</button></li>
        <li><button className="hover:text-white transition-colors" type="button" onClick={onContact}>Privacy Policy</button></li>
       </ul>
      </div>
      <div>
       <h5 className="text-white font-bold mb-6">Connect</h5>
       <ul className="space-y-4">
        <li><a className="hover:text-white transition-colors" href="https://www.linkedin.com" rel="noreferrer" target="_blank">LinkedIn</a></li>
        <li><a className="hover:text-white transition-colors" href="https://www.facebook.com" rel="noreferrer" target="_blank">Facebook</a></li>
        <li><a className="hover:text-white transition-colors" href="https://www.instagram.com" rel="noreferrer" target="_blank">Instagram</a></li>
       </ul>
      </div>
     </div>
     <div className="pt-8 text-sm flex flex-col md:flex-row justify-between items-center">
<<<<<<< HEAD
      <p>© 2026 Immo DZ. All rights reserved.</p>
=======
      <p>© 2026 ImmoAlgeria. All rights reserved.</p>
>>>>>>> 0a3aee41df08352ed85b07b5fe48d7f19cfc7a08
      <p className="rtl mt-4 md:mt-0">© 2026 إيمو ألجيريا. جميع الحقوق محفوظة.</p>
     </div>
    </div>
   </footer>
  </div>
 );
}
