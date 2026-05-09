export default function DashboardLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-4 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur px-8 py-10 shadow-sm">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-sky-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-sky-700 border-t-transparent animate-spin"></div>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 font-['Space_Grotesk']">Opening store portal</p>
          <p className="text-sm text-gray-500 mt-1 font-['Space_Grotesk']">Loading dashboard and admin tools...</p>
        </div>
      </div>
    </div>
  );
}
