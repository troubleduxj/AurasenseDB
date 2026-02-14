import React, { useState } from 'react';
import { Scissors, Copy, Edit, Tag, Plus, X, Trash2, Check, Code, Search } from 'lucide-react';

interface Snippet {
    id: number;
    title: string;
    desc: string;
    sql: string;
    tags: string[];
}

const INITIAL_SNIPPETS: Snippet[] = [
    { id: 1, title: 'Exclude Maintenance Hours', desc: 'Where clause to filter out weekends and nights', sql: 'WHERE hour(ts) BETWEEN 8 AND 18 AND dayofweek(ts) BETWEEN 1 AND 5', tags: ['filter', 'util'] },
    { id: 2, title: 'Weighted Moving Average', desc: 'Complex calculation for smoothing', sql: 'SELECT (val * 0.5 + lag(val) * 0.3 + lag(val, 2) * 0.2) as wma ...', tags: ['math', 'analytics'] },
    { id: 3, title: 'Session Window Grouping', desc: 'Group events by session gap of 30s', sql: 'SESSION(ts, 30s)', tags: ['window'] },
];

export const QuerySnippets: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>(INITIAL_SNIPPETS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', desc: '', sql: '', tags: '' });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (snippet?: Snippet) => {
      if (snippet) {
          setEditingId(snippet.id);
          setFormData({
              title: snippet.title,
              desc: snippet.desc,
              sql: snippet.sql,
              tags: snippet.tags.join(', ')
          });
      } else {
          setEditingId(null);
          setFormData({ title: '', desc: '', sql: '', tags: '' });
      }
      setModalOpen(true);
  };

  const handleSave = () => {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      if (editingId) {
          setSnippets(snippets.map(s => s.id === editingId ? { ...s, ...formData, tags: tagsArray } : s));
      } else {
          const newSnippet: Snippet = {
              id: Date.now(),
              title: formData.title || 'Untitled Snippet',
              desc: formData.desc,
              sql: formData.sql,
              tags: tagsArray
          };
          setSnippets([newSnippet, ...snippets]);
      }
      setModalOpen(false);
  };

  const handleDelete = (id: number) => {
      if (confirm('Are you sure you want to delete this snippet?')) {
          setSnippets(snippets.filter(s => s.id !== id));
      }
  };

  const handleCopy = (id: number, sql: string) => {
      navigator.clipboard.writeText(sql);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSnippets = snippets.filter(s => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-100">SQL Snippets</h1>
           <p className="text-sm text-gray-400 mt-1">Shared library of reusable query fragments.</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search snippets..." 
                    className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 outline-none w-64" 
                />
             </div>
             <button 
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-900/20"
             >
                <Plus className="w-4 h-4 mr-2" /> New Snippet
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map(snip => (
              <div key={snip.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col hover:border-gray-500 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-700 rounded text-blue-400">
                             <Code className="w-4 h-4" />
                          </div>
                          <h3 className="font-bold text-gray-100 truncate max-w-[180px]" title={snip.title}>{snip.title}</h3>
                      </div>
                      <button 
                        onClick={() => handleCopy(snip.id, snip.sql)}
                        className={`text-gray-500 hover:text-white transition-colors ${copiedId === snip.id ? 'text-green-400' : ''}`}
                        title="Copy to clipboard"
                      >
                          {copiedId === snip.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{snip.desc}</p>
                  
                  <div className="flex-1 bg-gray-900 rounded p-3 mb-4 border border-gray-700/50 overflow-hidden relative group/code">
                      <code className="text-xs font-mono text-blue-300 block leading-relaxed break-all">
                          {snip.sql}
                      </code>
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50 group-hover/code:opacity-20 transition-opacity"></div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2 flex-wrap">
                          {snip.tags.map((tag, i) => (
                              <span key={i} className="flex items-center text-[10px] text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded border border-gray-600/30">
                                  <Tag className="w-3 h-3 mr-1 opacity-50" /> {tag}
                              </span>
                          ))}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(snip)} className="text-gray-500 hover:text-blue-400 p-1.5 hover:bg-gray-700 rounded"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(snip.id)} className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                  </div>
              </div>
          ))}
          
          {/* Empty State */}
          {filteredSnippets.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/50 rounded-xl border border-gray-700/50 border-dashed">
                  <Scissors className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No snippets found.</p>
              </div>
          )}
      </div>

      {/* Modal */}
      {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center p-6 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-gray-100">{editingId ? 'Edit Snippet' : 'New SQL Snippet'}</h2>
                      <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                          <input 
                              type="text" 
                              value={formData.title}
                              onChange={e => setFormData({...formData, title: e.target.value})}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                              placeholder="e.g. Time Zone Conversion"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <input 
                              type="text" 
                              value={formData.desc}
                              onChange={e => setFormData({...formData, desc: e.target.value})}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                              placeholder="Short description of what this does"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">SQL Code</label>
                          <textarea 
                              value={formData.sql}
                              onChange={e => setFormData({...formData, sql: e.target.value})}
                              className="w-full h-32 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm outline-none focus:border-blue-500 resize-none"
                              placeholder="SELECT ..."
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
                          <input 
                              type="text" 
                              value={formData.tags}
                              onChange={e => setFormData({...formData, tags: e.target.value})}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 outline-none focus:border-blue-500"
                              placeholder="e.g. math, window, util"
                          />
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-700 bg-gray-750 flex justify-end gap-3 rounded-b-xl">
                      <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
                      <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium shadow-lg shadow-blue-900/20">
                          {editingId ? 'Update Snippet' : 'Save Snippet'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};