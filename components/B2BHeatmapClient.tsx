'use client';

import { useMemo, useState } from 'react';

type HeatmapDisplay = 'week' | 'month';

type HeatCell = {
  label: string;
  value: number;
};

const MONTH_OPTIONS = [
  { label: 'All Months', value: 'all' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}

function getHeatValueClass(value: number, maxValue: number) {
  if (maxValue <= 0 || value <= 0) return 'bg-gray-50 text-gray-500 border-gray-200';
  const ratio = value / maxValue;
  if (ratio >= 0.8) return 'bg-emerald-600 text-white border-emerald-600';
  if (ratio >= 0.6) return 'bg-emerald-500 text-white border-emerald-500';
  if (ratio >= 0.4) return 'bg-emerald-300 text-emerald-900 border-emerald-300';
  if (ratio >= 0.2) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
}

function buildHeatmapData(records: Date[], display: HeatmapDisplay): HeatCell[] {
  if (display === 'week') {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((label, idx) => {
      const dayIndex = idx + 1;
      const value = records.filter((date) => {
        const jsDay = date.getDay();
        const normalized = jsDay === 0 ? 7 : jsDay;
        return normalized === dayIndex;
      }).length;
      return { label, value };
    });
  }

  const labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
  return labels.map((label, idx) => {
    const week = idx + 1;
    const value = records.filter((date) => getWeekOfMonth(date) === week).length;
    return { label, value };
  });
}

export default function B2BHeatmapClient({ enquiryDates, distributorDates }: { enquiryDates: string[]; distributorDates: string[] }) {
  const allDates = useMemo(
    () => [...enquiryDates, ...distributorDates].map((value) => parseDate(value)).filter((value): value is Date => Boolean(value)),
    [enquiryDates, distributorDates],
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxDataYear = allDates.reduce((max, date) => Math.max(max, date.getFullYear()), 2021);
    const endYear = Math.max(currentYear + 20, maxDataYear);
    const values: number[] = [];
    for (let year = endYear; year >= 2021; year -= 1) values.push(year);
    return values;
  }, [allDates]);

  const [year, setYear] = useState<number>(years[0]);
  const [month, setMonth] = useState<'all' | number>('all');
  const [display, setDisplay] = useState<HeatmapDisplay>('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filteredDates = useMemo(() => {
    const fromDate = customFrom ? parseDate(customFrom) : null;
    const toDate = customTo ? parseDate(customTo) : null;
    const rangeStart = fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) : null;
    const rangeEnd = toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999) : null;

    return allDates.filter((date) => {
      if (date.getFullYear() !== year) return false;
      if (month !== 'all' && date.getMonth() + 1 !== month) return false;
      if (rangeStart && date < rangeStart) return false;
      if (rangeEnd && date > rangeEnd) return false;
      return true;
    });
  }, [allDates, year, month, customFrom, customTo]);

  const heatmapData = useMemo(() => buildHeatmapData(filteredDates, display), [filteredDates, display]);
  const maxValue = useMemo(() => heatmapData.reduce((max, item) => Math.max(max, item.value), 0), [heatmapData]);
  const selectedMonthLabel = MONTH_OPTIONS.find((option) => option.value === String(month))?.label ?? 'All Months';
  const hasCustomRange = Boolean(customFrom || customTo);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Best Performing Time Heatmap</h2>
        <p className="text-sm text-gray-500">Compare performance by day-of-week or week-of-month without leaving this page.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Display</p>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
              <button
                type="button"
                onClick={() => setDisplay('week')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${display === 'week' ? 'bg-sky-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Week View
              </button>
              <button
                type="button"
                onClick={() => setDisplay('month')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${display === 'month' ? 'bg-sky-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Month View
              </button>
            </div>
          </div>

          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Year
            <select
              value={String(year)}
              onChange={(event) => setYear(Number(event.target.value))}
              className="mt-1 h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {years.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Month
            <select
              value={String(month)}
              onChange={(event) => {
                const value = event.target.value;
                setMonth(value === 'all' ? 'all' : Number(value));
              }}
              className="mt-1 h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Custom From
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="mt-1 h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Custom To
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="mt-1 h-10 w-full px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setCustomFrom('');
              setCustomTo('');
            }}
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear Range
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Showing: {year} | {selectedMonthLabel} | {display === 'week' ? 'Week View (Days)' : 'Month View (Weeks)'}{hasCustomRange ? ' | Custom Range Enabled' : ''}
        </p>
      </div>

      <div className={`grid gap-3 ${display === 'week' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7' : 'grid-cols-2 md:grid-cols-5'}`}>
        {heatmapData.map((cell) => (
          <div key={cell.label} className={`rounded-xl border p-4 ${getHeatValueClass(cell.value, maxValue)}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">{cell.label}</p>
            <p className="text-2xl font-bold mt-1">{cell.value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Scale is relative to the highest bucket in the current selection ({maxValue}).
      </p>
    </div>
  );
}
