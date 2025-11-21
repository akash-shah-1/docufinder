import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Search, Folder, Plus } from 'lucide-react';

export const AllFolders = () => {
  const { folders, documents } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [gridCols, setGridCols] = useState<2 | 3>(2);

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-900 pb-24 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">All Folders</h1>
        </div>
        
        {/* Grid Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
           <button onClick={() => setGridCols(2)} className={`px-3 py-1 rounded ${gridCols === 2 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
             <span className="text-xs font-bold">2x</span>
           </button>
           <button onClick={() => setGridCols(3)} className={`px-3 py-1 rounded ${gridCols === 3 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
             <span className="text-xs font-bold">3x</span>
           </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Find a folder..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500 outline-none"
        />
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {filteredFolders.map(folder => {
          const count = documents.filter(d => d.folderId === folder.id).length;
          return (
            <button 
              key={folder.id}
              onClick={() => navigate(`/folder/${folder.id}`)}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-left hover:bg-slate-750 transition-all active:scale-95"
            >
              <div className={`w-10 h-10 rounded-xl ${folder.color} bg-opacity-10 flex items-center justify-center text-white mb-3`}>
                <Folder size={20} className={folder.color.replace('bg-', 'text-')} fill="currentColor" fillOpacity={0.3} />
              </div>
              <h3 className="font-bold text-slate-100 truncate">{folder.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{count} items</p>
            </button>
          );
        })}

        {/* Add New */}
        <button className="border-2 border-dashed border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors">
          <Plus size={24} className="mb-2" />
          <span className="text-xs font-bold">Create New</span>
        </button>
      </div>
    </div>
  );
};