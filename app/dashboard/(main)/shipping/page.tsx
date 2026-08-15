export const dynamic = 'force-dynamic';

import ShippingClient from './ShippingClient';

const PRAG = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

interface ShippingCity {
  id: number;
  state: string;
  city: string;
  price: number;
  status: 'active' | 'suspended';
}

interface ShippingMethods {
  local_pickup: boolean;
  custom_delivery: boolean;
  city_based: boolean;
}

async function getCities(): Promise<ShippingCity[]> {
  try {
    const res = await fetch(`${PRAG}/prag-core/v1/shipping/cities`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function getMethods(): Promise<ShippingMethods> {
  try {
    const res = await fetch(`${PRAG}/prag-core/v1/shipping/methods`, { cache: 'no-store' });
    if (!res.ok) return { local_pickup: true, custom_delivery: true, city_based: true };
    return await res.json();
  } catch { return { local_pickup: true, custom_delivery: true, city_based: true }; }
}

export default async function ShippingPage() {
  const [cities, methods] = await Promise.all([getCities(), getMethods()]);
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
        <p className="text-gray-500 text-sm mt-1">Manage shipping options, city-based delivery zones and pricing.</p>
      </div>
      <ShippingClient initialCities={cities} initialMethods={methods} />
    </div>
  );
}
