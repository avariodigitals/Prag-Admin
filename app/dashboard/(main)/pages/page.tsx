'use client';

import { useEffect, useState } from 'react';
import { Search, FileText, Edit, Save, X, Eye, Plus } from 'lucide-react';

interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
  status: 'published' | 'draft';
}

interface PageSection {
  id: string;
  type: 'text' | 'heading' | 'list' | 'image' | 'stats' | 'values';
  content: any;
  order: number;
}

const PAGES = [
  { slug: 'about', label: 'About Us', icon: FileText },
  { slug: 'faq', label: 'FAQ', icon: FileText },
  { slug: 'shipping-policy', label: 'Shipping Policy', icon: FileText },
  { slug: 'return-policy', label: 'Return Policy', icon: FileText },
  { slug: 'privacy', label: 'Privacy Policy', icon: FileText },
  { slug: 'terms-of-use', label: 'Terms of Use', icon: FileText },
] as const;

function PageEditor({ page, onSave, onClose }: { page: PageContent; onSave: (page: PageContent) => void; onClose: () => void }) {
  const [editingPage, setEditingPage] = useState<PageContent>(page);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Parse content into sections
    try {
      const parsed = JSON.parse(editingPage.content);
      setSections(parsed.sections || []);
    } catch {
      // If content is plain text, create a default text section
      setSections([{
        id: 'default',
        type: 'text',
        content: { text: editingPage.content },
        order: 0
      }]);
    }
  }, [editingPage.content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedContent = JSON.stringify({ sections });
      const updatedPage = { ...editingPage, content: updatedContent };
      await onSave(updatedPage);
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: sections.length
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, content: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  function getDefaultContent(type: PageSection['type']) {
    switch (type) {
      case 'heading':
        return { text: 'New Heading', level: 2 };
      case 'text':
        return { text: 'Enter your text content here...' };
      case 'list':
        return { items: ['Item 1', 'Item 2', 'Item 3'] };
      case 'image':
        return { url: '', alt: 'Image description', caption: '' };
      case 'stats':
        return { items: [{ value: '50K+', label: 'Stat 1' }] };
      case 'values':
        return { items: [{ title: 'Value 1', description: 'Description' }] };
      default:
        return {};
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex-1">
            <input
              value={editingPage.title}
              onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
              className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
              placeholder="Page Title"
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
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="p-6 space-y-6">
          {/* Add Section Button */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Add Section:</span>
            <button
              onClick={() => addSection('heading')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Heading
            </button>
            <button
              onClick={() => addSection('text')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Text
            </button>
            <button
              onClick={() => addSection('list')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              List
            </button>
            <button
              onClick={() => addSection('image')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Image
            </button>
            <button
              onClick={() => addSection('stats')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Stats
            </button>
            <button
              onClick={() => addSection('values')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Values
            </button>
          </div>

          {/* Sections */}
          {sections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 capitalize">{section.type}</span>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              
              {section.type === 'heading' && (
                <div className="space-y-2">
                  <input
                    value={section.content.text}
                    onChange={(e) => updateSection(section.id, { ...section.content, text: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Heading text"
                  />
                  <select
                    value={section.content.level}
                    onChange={(e) => updateSection(section.id, { ...section.content, level: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value={1}>H1</option>
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                    <option value={4}>H4</option>
                  </select>
                </div>
              )}

              {section.type === 'text' && (
                <textarea
                  value={section.content.text}
                  onChange={(e) => updateSection(section.id, { ...section.content, text: e.target.value })}
                  className="w-full h-32 p-2 border border-gray-200 rounded-lg resize-none"
                  placeholder="Text content"
                />
              )}

              {section.type === 'list' && (
                <div className="space-y-2">
                  {section.content.items.map((item: string, i: number) => (
                    <input
                      key={i}
                      value={item}
                      onChange={(e) => {
                        const newItems = [...section.content.items];
                        newItems[i] = e.target.value;
                        updateSection(section.id, { ...section.content, items: newItems });
                      }}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder={`Item ${i + 1}`}
                    />
                  ))}
                  <button
                    onClick={() => updateSection(section.id, { ...section.content, items: [...section.content.items, ''] })}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Add Item
                  </button>
                </div>
              )}

              {section.type === 'image' && (
                <div className="space-y-2">
                  <input
                    value={section.content.url}
                    onChange={(e) => updateSection(section.id, { ...section.content, url: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Image URL"
                  />
                  <input
                    value={section.content.alt}
                    onChange={(e) => updateSection(section.id, { ...section.content, alt: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Alt text"
                  />
                  <input
                    value={section.content.caption}
                    onChange={(e) => updateSection(section.id, { ...section.content, caption: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Caption"
                  />
                </div>
              )}

              {section.type === 'stats' && (
                <div className="space-y-2">
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={item.value}
                        onChange={(e) => {
                          const newItems = [...section.content.items];
                          newItems[i] = { ...item, value: e.target.value };
                          updateSection(section.id, { ...section.content, items: newItems });
                        }}
                        className="flex-1 p-2 border border-gray-200 rounded-lg"
                        placeholder="Value"
                      />
                      <input
                        value={item.label}
                        onChange={(e) => {
                          const newItems = [...section.content.items];
                          newItems[i] = { ...item, label: e.target.value };
                          updateSection(section.id, { ...section.content, items: newItems });
                        }}
                        className="flex-1 p-2 border border-gray-200 rounded-lg"
                        placeholder="Label"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateSection(section.id, { ...section.content, items: [...section.content.items, { value: '', label: '' }] })}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Add Stat
                  </button>
                </div>
              )}

              {section.type === 'values' && (
                <div className="space-y-2">
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...section.content.items];
                          newItems[i] = { ...item, title: e.target.value };
                          updateSection(section.id, { ...section.content, items: newItems });
                        }}
                        className="w-full p-2 border border-gray-200 rounded-lg"
                        placeholder="Title"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...section.content.items];
                          newItems[i] = { ...item, description: e.target.value };
                          updateSection(section.id, { ...section.content, items: newItems });
                        }}
                        className="w-full h-20 p-2 border border-gray-200 rounded-lg resize-none"
                        placeholder="Description"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateSection(section.id, { ...section.content, items: [...section.content.items, { title: '', description: '' }] })}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Add Value
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        const pagesWithIds = (data.pages || []).map((p: any, index: number) => ({
          ...p,
          id: p.id || `page-${index}`,
          status: p.status || 'published'
        }));
        setPages(pagesWithIds);
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

  async function handleSave(updatedPage: PageContent) {
    setSaving(true);
    try {
      const res = await fetch('/api/pages/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPage),
      });
      
      if (res.ok) {
        setPages(prev => prev.map(p => 
          p.slug === updatedPage.slug 
            ? { ...updatedPage, lastUpdated: new Date().toISOString() }
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
                      key={page.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPage?.id === page.id ? 'bg-amber-50' : ''
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
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          page.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {page.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="lg:w-2/3">
          {selectedPage ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPage.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {PAGES.find(p => p.slug === selectedPage.slug)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPage(selectedPage)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700">
                    {selectedPage.content}
                  </div>
                </div>
              </div>
            </div>
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

      {/* Page Editor Modal */}
      {editingPage && (
        <PageEditor
          page={editingPage}
          onSave={handleSave}
          onClose={() => setEditingPage(null)}
        />
      )}
    </div>
  );
}
