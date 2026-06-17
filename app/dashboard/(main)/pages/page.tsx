'use client';

import { useEffect, useState } from 'react';
import { Search, FileText, Edit, Save, X } from 'lucide-react';

interface PageContent {
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

const PAGES = [
  { slug: 'about', label: 'About Us', icon: FileText },
  { slug: 'faq', label: 'FAQ', icon: FileText },
  { slug: 'shipping-policy', label: 'Shipping Policy', icon: FileText },
  { slug: 'return-policy', label: 'Return Policy', icon: FileText },
  { slug: 'privacy', label: 'Privacy Policy', icon: FileText },
  { slug: 'terms-of-use', label: 'Terms of Use', icon: FileText },
] as const;

export default function PagesPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  async function loadPages() {
    setLoading(true);
    try {
      const res = await fetch('/api/pages/content');
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await loadPages();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!editingPage) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/pages/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage),
      });
      
      if (res.ok) {
        setPages(prev => prev.map(p => 
          p.slug === editingPage.slug 
            ? { ...editingPage, lastUpdated: new Date().toISOString() }
            : p
        ));
        setEditingPage(null);
        setSelectedPage(null);
      }
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setSaving(false);
    }
  }

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <p className="text-gray-500 text-sm mt-1">Manage website content pages</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pages List */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : filteredPages.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No pages found</div>
              ) : (
                filteredPages.map((page) => {
                  const pageConfig = PAGES.find(p => p.slug === page.slug);
                  const Icon = pageConfig?.icon || FileText;
                  
                  return (
                    <div
                      key={page.slug}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPage?.slug === page.slug ? 'bg-amber-50' : ''
                      }`}
                      onClick={() => setSelectedPage(page)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {page.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pageConfig?.label || page.slug}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Page Content Editor */}
        <div className="lg:w-2/3">
          {selectedPage ? (
            editingPage?.slug === selectedPage.slug ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <input
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {PAGES.find(p => p.slug === editingPage.slug)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingPage(null);
                        setSelectedPage(selectedPage);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <textarea
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    className="w-full h-96 p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Enter page content..."
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPage.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {PAGES.find(p => p.slug === selectedPage.slug)?.label}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingPage(selectedPage)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {selectedPage.content}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 text-center">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a page to edit</h3>
                <p className="text-gray-500">Choose a page from the list to view and edit its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
