'use client';

import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Code } from 'lucide-react';

const FULL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const SIMPLE_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  simple?: boolean;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, label, simple = false, placeholder }: Props) {
  const [sourceMode, setSourceMode] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <button
            type="button"
            onClick={() => setSourceMode((s) => !s)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              sourceMode
                ? 'bg-sky-100 text-sky-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code size={13} />
            {sourceMode ? 'Visual' : 'Source'}
          </button>
        </div>
      )}

      {sourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={simple ? 4 : 10}
          className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none font-mono"
          placeholder={placeholder}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 transition-all">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={simple ? SIMPLE_MODULES : FULL_MODULES}
            placeholder={placeholder}
            className="bg-white"
          />
        </div>
      )}
    </div>
  );
}
