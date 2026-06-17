export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getB2BAllowedSections, getSession, isSuperAdmin } from '@/lib/auth';
import { getB2BOverview, readB2BAdminStore } from '@/lib/b2bAdminStore';
import B2BHeatmapClient from '@/components/B2BHeatmapClient';

type Period = 'day' | 'week' | 'month' | 'year';

type TrendPoint = {
  key: string;
  label: string;
  leads: number;
  distributors: number;
};

const cards = [
  { key: 'enquiries', label: 'Enquiries', href: '/dashboard/b2b/enquiries' },
  { key: 'distributorApplications', label: 'Distributor Apps', href: '/dashboard/b2b/distributors' },
  { key: 'careerApplications', label: 'Career Apps', href: '/dashboard/b2b/careers' },
  { key: 'installations', label: 'Installations', href: '/dashboard/b2b/installations' },
  { key: 'caseStudies', label: 'Case Studies', href: '/dashboard/b2b/case-studies' },
  { key: 'solutions', label: 'Solutions', href: '/dashboard/b2b/solutions' },
  { key: 'livePages', label: 'Published Pages', href: '/dashboard/b2b/pages' },
  { key: 'pendingCareers', label: 'New Job Applications', href: '/dashboard/b2b/careers' },
  { key: 'pendingSupport', label: 'New Support Tickets', href: '/dashboard/b2b/support' },
] as const;

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const shift = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + shift);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function addPeriod(date: Date, period: Period, amount: number) {
  const next = new Date(date);
  if (period === 'day') next.setDate(next.getDate() + amount);
  if (period === 'week') next.setDate(next.getDate() + amount * 7);
  if (period === 'month') next.setMonth(next.getMonth() + amount);
  if (period === 'year') next.setFullYear(next.getFullYear() + amount);
  return next;
}

function formatPeriodLabel(date: Date, period: Period) {
  if (period === 'day') {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  if (period === 'week') {
    const weekEnd = addPeriod(date, 'week', 1);
    weekEnd.setDate(weekEnd.getDate() - 1);
    return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  }
  if (period === 'month') {
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  }
  return String(date.getFullYear());
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolvePeriodForRange(from: Date, to: Date): Period {
  const ms = Math.max(to.getTime() - from.getTime(), 0);
  const dayCount = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  if (dayCount <= 45) return 'day';
  if (dayCount <= 180) return 'week';
  if (dayCount <= 900) return 'month';
  return 'year';
}

function toPeriodStart(date: Date, period: Period) {
  if (period === 'day') return startOfDay(date);
  if (period === 'week') return startOfWeek(date);
  if (period === 'month') return startOfMonth(date);
  return startOfYear(date);
}

function getBucketsForRange(from: Date, to: Date, period: Period) {
  const first = toPeriodStart(from, period);
  const limit = addPeriod(toPeriodStart(to, period), period, 1);
  const buckets: Array<{ key: string; label: string; start: Date; end: Date }> = [];

  let cursor = first;
  while (cursor < limit) {
    const start = new Date(cursor);
    const end = addPeriod(start, period, 1);
    buckets.push({
      key: start.toISOString(),
      label: formatPeriodLabel(start, period),
      start,
      end,
    });
    cursor = end;
  }

  return buckets;
}

function buildTrend(points: Array<{ createdAt?: string }>, pointsTwo: Array<{ createdAt?: string }>, from: Date, to: Date): TrendPoint[] {
  const period = resolvePeriodForRange(from, to);
  const buckets = getBucketsForRange(from, to, period);
  const firstStart = buckets[0]?.start;
  const lastEnd = buckets[buckets.length - 1]?.end;
  if (!firstStart || !lastEnd) return [];

  const leadDates = points.map((item) => parseDate(item.createdAt)).filter((value): value is Date => Boolean(value));
  const distDates = pointsTwo.map((item) => parseDate(item.createdAt)).filter((value): value is Date => Boolean(value));

  return buckets.map((bucket) => {
    const leads = leadDates.filter((date) => date >= bucket.start && date < bucket.end && date >= firstStart && date < lastEnd).length;
    const distributors = distDates.filter((date) => date >= bucket.start && date < bucket.end && date >= firstStart && date < lastEnd).length;
    return {
      key: bucket.key,
      label: bucket.label,
      leads,
      distributors,
    };
  });
}

function buildTrendByPeriod(
  points: Array<{ createdAt?: string }>,
  pointsTwo: Array<{ createdAt?: string }>,
  from: Date,
  to: Date,
  period: Period,
): TrendPoint[] {
  const buckets = getBucketsForRange(from, to, period);
  const firstStart = buckets[0]?.start;
  const lastEnd = buckets[buckets.length - 1]?.end;
  if (!firstStart || !lastEnd) return [];

  const leadDates = points.map((item) => parseDate(item.createdAt)).filter((value): value is Date => Boolean(value));
  const distDates = pointsTwo.map((item) => parseDate(item.createdAt)).filter((value): value is Date => Boolean(value));

  return buckets.map((bucket) => {
    const leads = leadDates.filter((date) => date >= bucket.start && date < bucket.end && date >= firstStart && date < lastEnd).length;
    const distributors = distDates.filter((date) => date >= bucket.start && date < bucket.end && date >= firstStart && date < lastEnd).length;
    return {
      key: bucket.key,
      label: formatPeriodLabel(bucket.start, period),
      leads,
      distributors,
    };
  });
}

function createChartPath(values: number[], width: number, height: number, maxValue: number) {
  if (values.length === 0) return '';
  const topPad = 14;
  const bottomPad = 20;
  const leftPad = 12;
  const rightPad = 12;
  const plotWidth = width - leftPad - rightPad;
  const plotHeight = height - topPad - bottomPad;

  if (values.length === 1) {
    const y = topPad + plotHeight - (values[0] / Math.max(maxValue, 1)) * plotHeight;
    return `M ${leftPad} ${y.toFixed(2)} L ${leftPad + plotWidth} ${y.toFixed(2)}`;
  }

  return values
    .map((value, index) => {
      const x = leftPad + (index / (values.length - 1)) * plotWidth;
      const y = topPad + plotHeight - (value / Math.max(maxValue, 1)) * plotHeight;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function normalizeStatus(value?: string) {
  return String(value ?? '').trim().toLowerCase();
}

function toLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function B2BAdminOverviewPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const superAdmin = await isSuperAdmin(session.token);
  if (!superAdmin) {
    const allowed = await getB2BAllowedSections(session.token);
    if (Array.isArray(allowed) && allowed.length > 0 && !allowed.includes('overview')) {
      const first = allowed[0];
      redirect(`/dashboard/b2b/${first}`);
    }
  }

  const store = await readB2BAdminStore();
  const overview = getB2BOverview(store);
  const params = await searchParams;
  const today = startOfDay(new Date());
  const defaultFrom = addPeriod(today, 'day', -29);
  const parsedFrom = parseDate(params?.from);
  const parsedTo = parseDate(params?.to);
  const fromDate = parsedFrom ? startOfDay(parsedFrom) : defaultFrom;
  const toDate = parsedTo ? startOfDay(parsedTo) : today;
  const safeFrom = fromDate <= toDate ? fromDate : toDate;
  const safeTo = toDate >= fromDate ? toDate : fromDate;

  const trend = buildTrend(store.enquiries, store.distributorApplications, safeFrom, safeTo);
  const monthlyTrend = buildTrendByPeriod(store.enquiries, store.distributorApplications, safeFrom, safeTo, 'month');
  const maxValue = trend.reduce((max, point) => Math.max(max, point.leads, point.distributors), 1);
  const chartWidth = 860;
  const chartHeight = 260;
  const leadsValues = trend.map((point) => point.leads);
  const distributorValues = trend.map((point) => point.distributors);
  const leadsPath = createChartPath(leadsValues, chartWidth, chartHeight, maxValue);
  const distributorsPath = createChartPath(distributorValues, chartWidth, chartHeight, maxValue);

  const leadActions = {
    contacted: store.enquiries.filter((item) => normalizeStatus(item.status) === 'contacted').length,
    resolved: store.enquiries.filter((item) => normalizeStatus(item.status) === 'resolved').length,
    converted: store.enquiries.filter((item) => normalizeStatus(item.status) === 'converted').length,
  };

  const distributorActions = {
    contacted: store.distributorApplications.filter((item) => normalizeStatus(item.status) === 'contacted').length,
    resolved: store.distributorApplications.filter((item) => normalizeStatus(item.status) === 'resolved').length,
    converted: store.distributorApplications.filter((item) => normalizeStatus(item.status) === 'converted').length,
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">B2B Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 max-w-2xl">Manage b2b enquiries, distributor applications, installations, pages and site controls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link key={card.key} href={card.href} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview[card.key].toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lead Actions</h2>
            <p className="text-sm text-gray-500">Current action progress from enquiries.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(leadActions).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{toLabel(key)}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Distributor Actions</h2>
            <p className="text-sm text-gray-500">Current action progress from distributor tracking.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(distributorActions).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{toLabel(key)}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Leads and Distributor Tracking</h2>
            <p className="text-sm text-gray-500">Track submitted leads and distributor applications with a custom date range.</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-2 sm:items-end" action="/dashboard/b2b" method="get">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              From
              <input type="date" name="from" defaultValue={formatDateInput(safeFrom)} className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              To
              <input type="date" name="to" defaultValue={formatDateInput(safeTo)} className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </label>
            <button type="submit" className="h-10 px-4 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold">Apply</button>
          </form>
        </div>

        <p className="text-xs text-gray-500">
          Showing {trend.length} grouped points from {safeFrom.toLocaleDateString('en-GB')} to {safeTo.toLocaleDateString('en-GB')}.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Leads</h3>
              <span className="text-xs text-gray-500">Total: {leadsValues.reduce((sum, value) => sum + value, 0)}</span>
            </div>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              <line x1="12" y1={chartHeight - 20} x2={chartWidth - 12} y2={chartHeight - 20} stroke="#dbeafe" strokeWidth="1" />
              <path d={leadsPath} fill="none" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
              {trend.map((point) => (
                <span key={`lead-${point.key}`} className="px-2 py-1 rounded-full bg-white border border-gray-200">{point.label}: {point.leads}</span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Distributor</h3>
              <span className="text-xs text-gray-500">Total: {distributorValues.reduce((sum, value) => sum + value, 0)}</span>
            </div>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              <line x1="12" y1={chartHeight - 20} x2={chartWidth - 12} y2={chartHeight - 20} stroke="#d1fae5" strokeWidth="1" />
              <path d={distributorsPath} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
              {trend.map((point) => (
                <span key={`dist-${point.key}`} className="px-2 py-1 rounded-full bg-white border border-gray-200">{point.label}: {point.distributors}</span>
              ))}
            </div>
          </div>
        </div>

        {trend.length === 0 && (
          <div className="rounded-xl border border-gray-100 p-5 text-sm text-gray-500">
            No submissions found in the selected date range.
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Trend Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Month</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Leads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Distributors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyTrend.map((point) => (
                <tr key={`row-${point.key}`}>
                  <td className="px-4 py-3 text-gray-700">{point.label}</td>
                  <td className="px-4 py-3 font-semibold text-sky-700">{point.leads}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{point.distributors}</td>
                </tr>
              ))}
              {monthlyTrend.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-sm text-gray-500">No monthly trend data for selected range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <B2BHeatmapClient
        enquiryDates={store.enquiries.map((item) => item.createdAt)}
        distributorDates={store.distributorApplications.map((item) => item.createdAt)}
      />
    </div>
  );
}
