'use client';

import { useRouter } from 'next/navigation';

export default function PortalClient({ canAccessB2B }: { canAccessB2B: boolean }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-gray-900 font-bold text-lg font-['Space_Grotesk']">PRAG</span>
        </div>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
          }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-['Space_Grotesk']"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-widest mb-3 font-['Space_Grotesk']">
            Control Center
          </p>
          <h1 className="text-4xl font-bold text-gray-900 font-['Space_Grotesk']">
            Where are you heading?
          </h1>
          <p className="text-gray-400 mt-3 text-base font-['Space_Grotesk']">
            Select the portal you want to manage today.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <button
            onClick={() => router.push('/dashboard')}
            className="group flex-1 relative bg-white border-2 border-gray-100 hover:border-sky-700 rounded-3xl p-8 text-left transition-all duration-200 hover:shadow-xl hover:shadow-sky-700/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-sky-50 group-hover:bg-sky-700 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200">
              <svg className="w-6 h-6 text-sky-700 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full font-['Space_Grotesk']">B2C</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-['Space_Grotesk']">Consumer Store</h2>
              <p className="text-gray-400 text-sm mt-2 font-['Space_Grotesk'] leading-relaxed">
                Manage products, orders, customers, blog posts and site settings for the PRAG storefront.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sky-700 text-sm font-semibold font-['Space_Grotesk'] group-hover:gap-3 transition-all">
              Enter portal
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => {
              if (canAccessB2B) {
                router.push('/dashboard/b2b');
              }
            }}
            disabled={!canAccessB2B}
            className={`group flex-1 relative bg-white border-2 rounded-3xl p-8 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${canAccessB2B ? 'border-gray-100 hover:border-amber-500 hover:shadow-amber-500/10' : 'border-gray-100 opacity-60 cursor-not-allowed'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200 ${canAccessB2B ? 'bg-amber-50 group-hover:bg-amber-500' : 'bg-gray-50'}`}>
              <svg className={`w-6 h-6 ${canAccessB2B ? 'text-amber-600 group-hover:text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-['Space_Grotesk']">B2B</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full font-['Space_Grotesk'] ${canAccessB2B ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-100'}`}>{canAccessB2B ? 'Live' : 'No access'}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-['Space_Grotesk']">Business Portal</h2>
              <p className="text-gray-400 text-sm mt-2 font-['Space_Grotesk'] leading-relaxed">
                {canAccessB2B
                  ? 'Manage enquiries, distributor applications, installations and B2B site content in one place.'
                  : 'B2B access is not enabled for your account.'}
              </p>
            </div>

            <div className={`flex items-center gap-2 text-sm font-semibold font-['Space_Grotesk'] transition-all ${canAccessB2B ? 'text-amber-600 group-hover:gap-3' : 'text-gray-400'}`}>
              {canAccessB2B ? 'Enter portal' : 'Access required'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        </div>
      </main>

      <footer className="px-8 py-5 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500/50 font-['Space_Grotesk']">PRAG Control Center · Developed by Avario Digitals</p>
      </footer>
    </div>
  );
}