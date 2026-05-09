import { MapPin } from 'lucide-react';

export default function InstallationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage B2B installation projects</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <MapPin size={24} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Installations Coming Soon</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Installation tracking and project management for B2B clients will be available here.
        </p>
      </div>
    </div>
  );
}
