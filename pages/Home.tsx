
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Folder, Search, Bell, ChevronRight, Grid, List, X, Check } from 'lucide-react';
import { DocumentCard } from '../components/DocumentCard';

export const Home = () => {
  const { folders, documents, auth, addFolder } = useApp();
  const navigate = useNavigate();
  const [filterQuery, setFilterQuery] = useState('');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(2);

  // New Folder State
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Filter Folders
  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Filter Docs (Recent)
  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(filterQuery.toLowerCase()))
  ).slice(0, 5);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    // Assign a random nice color
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addFolder(newFolderName, randomColor);
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  return (
    <div className="p-4 pb-24 bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 p-0.5">
             {auth.user && <img src={auth.user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Welcome Back</p>
            <h1 className="text-xl font-bold text-white">{auth.user?.name.split(' ')[0]}</h1>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Filter folders & docs..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>

      {/* Folders Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-bold text-white">My Folders</h2>
           
           <div className="flex items-center gap-3">
             {/* Grid Controls */}
             <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
               <button onClick={() => setGridCols(2)} className={`p-1 rounded ${gridCols === 2 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                 <span className="text-[10px] font-bold px-1">2</span>
               </button>
               <button onClick={() => setGridCols(3)} className={`p-1 rounded ${gridCols === 3 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                 <span className="text-[10px] font-bold px-1">3</span>
               </button>
               <button onClick={() => setGridCols(4)} className={`p-1 rounded ${gridCols === 4 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                 <span className="text-[10px] font-bold px-1">4</span>
               </button>
             </div>
             
             <button onClick={() => navigate('/folders')} className="text-xs text-indigo-400 font-semibold hover:text-indigo-300">
               View All
             </button>
           </div>
        </div>
        
        <div className={`grid gap-3 ${gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {filteredFolders.map(folder => {
            // Quick stats
            const count = documents.filter(d => d.folderId === folder.id).length;
            
            return (
              <button 
                key={folder.id}
                onClick={() => navigate(`/folder/${folder.id}`)}
                className="group relative bg-slate-800 hover:bg-slate-750 rounded-3xl p-4 text-left border border-slate-700 transition-all duration-300 active:scale-95 flex flex-col justify-between h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-2xl ${folder.color} bg-opacity-10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Folder size={20} className={folder.color.replace('bg-', 'text-')} fill="currentColor" fillOpacity={0.2} />
                  </div>
                  {gridCols === 2 && (
                    <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors border border-slate-800">
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-slate-100 leading-tight mb-1 ${gridCols > 2 ? 'text-xs truncate' : 'text-lg'}`}>{folder.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{count} files</p>
                </div>
              </button>
            );
          })}
          
          {/* Add New Folder Button */}
          <button 
            onClick={() => setIsCreateFolderOpen(true)}
            className="rounded-3xl p-4 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-800 transition-all min-h-[100px]"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-xl leading-none pb-1">+</span>
            </div>
            <span className={`font-bold ${gridCols > 2 ? 'text-[10px]' : 'text-xs'}`}>New</span>
          </button>
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Uploads</h2>
        {filteredDocs.length > 0 ? (
          <div className="space-y-4">
            {filteredDocs.map(doc => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
                showFolderBadge 
                folderName={folders.find(f => f.id === doc.folderId)?.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 opacity-40">
            <p className="text-sm">No matching documents.</p>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsCreateFolderOpen(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-white">New Smart Folder</h3>
               <button onClick={() => setIsCreateFolderOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
             </div>
             
             <form onSubmit={handleCreateFolder}>
               <input 
                 autoFocus
                 type="text"
                 placeholder="Folder Name (e.g. Taxes)"
                 value={newFolderName}
                 onChange={e => setNewFolderName(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white mb-6 focus:border-indigo-500 focus:outline-none"
               />
               
               <div className="flex gap-3">
                 <button 
                   type="button"
                   onClick={() => setIsCreateFolderOpen(false)}
                   className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 font-medium"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={!newFolderName.trim()}
                   className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold flex items-center justify-center gap-2"
                 >
                   <Check size={18} /> Create
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
