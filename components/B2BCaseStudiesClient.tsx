'use client';

import { useMemo, useState } from 'react';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import type { B2BCaseStudiesContent, B2BCaseStudy, B2BCaseStudyCategory, B2BCaseStudyProcessStep } from '@/lib/b2bAdminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const areaCls = 'w-full min-h-24 p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

const CATEGORIES: B2BCaseStudyCategory[] = ['Residential', 'Commercial', 'Industrial'];

function makeStudy(category: B2BCaseStudyCategory): B2BCaseStudy {
  const idBase = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    id: idBase,
    category,
    title: '',
    imageUrl: '',
    imageAlt: '',
    imageLeft: true,
    problem: '',
    solution: '',
    tags: [],
    results: [{ label: '', value: '' }],
    featured: false,
    active: true,
  };
}

function makeProcessStep(nextIndex: number): B2BCaseStudyProcessStep {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: String(nextIndex).padStart(2, '0'),
    title: '',
    description: '',
  };
}

export default function B2BCaseStudiesClient({ initialCaseStudies }: { initialCaseStudies: B2BCaseStudiesContent }) {
  const [data, setData] = useState<B2BCaseStudiesContent>(initialCaseStudies);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const grouped = useMemo(() => (
    CATEGORIES.map((category) => ({
      category,
      studies: data.studies.filter((study) => study.category === category),
    }))
  ), [data.studies]);

  function updateStudy(id: string, updater: (study: B2BCaseStudy) => B2BCaseStudy) {
    setData((prev) => ({
      ...prev,
      studies: prev.studies.map((study) => (study.id === id ? updater(study) : study)),
    }));
  }

  function addStudy(category: B2BCaseStudyCategory) {
    setData((prev) => ({
      ...prev,
      studies: [...prev.studies, makeStudy(category)],
    }));
  }

  function removeStudy(id: string) {
    setData((prev) => ({
      ...prev,
      studies: prev.studies.filter((study) => study.id !== id),
    }));
  }

  async function persistCaseStudies(nextCaseStudies: B2BCaseStudiesContent) {
    setSaving(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/admin/b2b/case-studies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseStudies: nextCaseStudies }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Failed to save case studies');

      setData(payload.caseStudies || nextCaseStudies);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/b2b/upload-image', {
      method: 'POST',
      body: formData,
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Image upload failed');
    }

    let nextDataSnapshot: B2BCaseStudiesContent | null = null;
    setData((prev) => {
      const next = {
        ...prev,
        studies: prev.studies.map((study) => (
          study.id === id
            ? {
              ...study,
              imageUrl: payload?.url || study.imageUrl,
              imageAlt: study.imageAlt || payload?.alt || study.title,
            }
            : study
        )),
      };
      nextDataSnapshot = next;
      return next;
    });

    if (nextDataSnapshot) {
      await persistCaseStudies(nextDataSnapshot);
    }
  }

  async function save() {
    await persistCaseStudies(data);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Section Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Section kicker</span>
            <input className={inputCls} value={data.sectionKicker} onChange={(event) => setData((prev) => ({ ...prev, sectionKicker: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Section title</span>
            <input className={inputCls} value={data.sectionTitle} onChange={(event) => setData((prev) => ({ ...prev, sectionTitle: event.target.value }))} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Section description</span>
            <textarea className={areaCls} value={data.sectionDescription} onChange={(event) => setData((prev) => ({ ...prev, sectionDescription: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Section CTA label</span>
            <input className={inputCls} value={data.sectionCtaLabel} onChange={(event) => setData((prev) => ({ ...prev, sectionCtaLabel: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Section CTA href</span>
            <input className={inputCls} value={data.sectionCtaHref} onChange={(event) => setData((prev) => ({ ...prev, sectionCtaHref: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Installations CTA label</span>
            <input className={inputCls} value={data.installationsCtaLabel} onChange={(event) => setData((prev) => ({ ...prev, installationsCtaLabel: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Solution section label</span>
            <input className={inputCls} value={data.solutionSectionLabel} onChange={(event) => setData((prev) => ({ ...prev, solutionSectionLabel: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Results section label</span>
            <input className={inputCls} value={data.resultsSectionLabel} onChange={(event) => setData((prev) => ({ ...prev, resultsSectionLabel: event.target.value }))} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Installations CTA href</span>
            <input className={inputCls} value={data.installationsCtaHref} onChange={(event) => setData((prev) => ({ ...prev, installationsCtaHref: event.target.value }))} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Installations Process</h2>
          <button
            type="button"
            onClick={() => setData((prev) => ({
              ...prev,
              processSteps: [...prev.processSteps, makeProcessStep(prev.processSteps.length + 1)],
            }))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} />
            Add Step
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Process kicker</span>
            <input className={inputCls} value={data.processKicker} onChange={(event) => setData((prev) => ({ ...prev, processKicker: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Process title</span>
            <input className={inputCls} value={data.processTitle} onChange={(event) => setData((prev) => ({ ...prev, processTitle: event.target.value }))} />
          </label>
        </div>

        <div className="space-y-3">
          {data.processSteps.map((step, index) => (
            <div key={step.id} className="rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-[100px_1fr_1fr_auto] gap-3 items-start">
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Label</span>
                <input
                  className={inputCls}
                  value={step.label}
                  onChange={(event) => setData((prev) => ({
                    ...prev,
                    processSteps: prev.processSteps.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item),
                  }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Step title</span>
                <input
                  className={inputCls}
                  value={step.title}
                  onChange={(event) => setData((prev) => ({
                    ...prev,
                    processSteps: prev.processSteps.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                  }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Step description</span>
                <textarea
                  className={areaCls}
                  value={step.description}
                  onChange={(event) => setData((prev) => ({
                    ...prev,
                    processSteps: prev.processSteps.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item),
                  }))}
                />
              </label>
              <button
                type="button"
                onClick={() => setData((prev) => ({
                  ...prev,
                  processSteps: prev.processSteps.filter((_, itemIndex) => itemIndex !== index),
                }))}
                className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {grouped.map(({ category, studies }) => (
        <div key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{category} Case Studies</h2>
            <button
              type="button"
              onClick={() => addStudy(category)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800"
            >
              <Plus size={16} />
              Add Study
            </button>
          </div>

          {studies.length === 0 ? (
            <p className="text-sm text-gray-500">No entries yet for this category.</p>
          ) : studies.map((study) => (
            <div key={study.id} className="rounded-xl border border-gray-200 p-4 md:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-wide">
                  <input
                    type="checkbox"
                    checked={study.featured}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setData((prev) => ({
                        ...prev,
                        studies: prev.studies.map((item) => ({
                          ...item,
                          featured: item.id === study.id ? checked : checked ? false : item.featured,
                        })),
                      }));
                    }}
                  />
                  Featured on Homepage
                </label>
                <button
                  type="button"
                  onClick={() => removeStudy(study.id)}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Title</span>
                  <input className={inputCls} value={study.title} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, title: event.target.value }))} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Image URL</span>
                  <input className={inputCls} value={study.imageUrl} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, imageUrl: event.target.value }))} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Image alt</span>
                  <input className={inputCls} value={study.imageAlt} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, imageAlt: event.target.value }))} />
                </label>
                <div className="md:col-span-2 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={study.imageLeft} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, imageLeft: event.target.checked }))} />
                    Image on left
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={study.active} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, active: event.target.checked }))} />
                    Active
                  </label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
                    <Upload size={15} />
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          await uploadImage(study.id, file);
                        } catch {
                          setStatus('error');
                        }
                      }}
                    />
                  </label>
                </div>
                {study.imageUrl && (
                  <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                    <img src={study.imageUrl} alt={study.imageAlt || study.title} className="w-full max-h-72 object-cover rounded-lg" />
                  </div>
                )}
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Problem</span>
                  <textarea className={areaCls} value={study.problem} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, problem: event.target.value }))} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Solution</span>
                  <textarea className={areaCls} value={study.solution} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, solution: event.target.value }))} />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Tags (comma separated)</span>
                  <input className={inputCls} value={study.tags.join(', ')} onChange={(event) => updateStudy(study.id, (item) => ({ ...item, tags: event.target.value.split(',').map((part) => part.trim()).filter(Boolean) }))} />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">Results</p>
                  <button
                    type="button"
                    onClick={() => updateStudy(study.id, (item) => ({ ...item, results: [...item.results, { label: '', value: '' }] }))}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Plus size={14} />
                    Add result
                  </button>
                </div>

                {study.results.map((result, resultIndex) => (
                  <div key={`${study.id}-result-${resultIndex}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      className={inputCls}
                      value={result.label}
                      onChange={(event) => updateStudy(study.id, (item) => ({
                        ...item,
                        results: item.results.map((entry, index) => index === resultIndex ? { ...entry, label: event.target.value } : entry),
                      }))}
                      placeholder="Metric label"
                    />
                    <input
                      className={inputCls}
                      value={result.value}
                      onChange={(event) => updateStudy(study.id, (item) => ({
                        ...item,
                        results: item.results.map((entry, index) => index === resultIndex ? { ...entry, value: event.target.value } : entry),
                      }))}
                      placeholder="Metric value"
                    />
                    <button
                      type="button"
                      onClick={() => updateStudy(study.id, (item) => ({
                        ...item,
                        results: item.results.filter((_, index) => index !== resultIndex),
                      }))}
                      className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="sticky bottom-4 z-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Case Studies'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Case studies saved successfully.</span>}
          {status === 'error' && <span className="text-sm text-red-600">Failed to save case studies.</span>}
        </div>
      </div>
    </div>
  );
}
