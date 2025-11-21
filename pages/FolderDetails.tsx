import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DocumentCard } from '../components/DocumentCard';
import { ArrowLeft, Share2, Plus, UploadCloud, X, Check, Image as ImageIcon, LayoutGrid, List, FileText, Trash2, AlertTriangle } from 'lucide-react';

// Mock recent gallery items for the drawer
const MOCK_DRAWER_ITEMS = [
  { id: 'd1', url: 'https://placehold.co/300x400/1e293b/ffffff?text=Invoice', title: 'Invoice #102' },
  { id: 'd2', url: 'https://picsum.photos/seed/d2/300/300', title: 'Random IMG' },
  { id: 'd3', url: 'https://placehold.co/300x400/1e293b/ffffff?text=ID Card', title: 'ID Front' },
  { id: 'd4', url: 'https://picsum.photos/seed/d4/300/300', title: 'Picnic' },
  { id: 'd5', url: 'https://placehold.co/300x400/1e293b/ffffff?text=Contract', title: 'Lease' },
  { id: 'd6', url: 'https://picsum.photos/seed/d6/300/300', title: 'Cat' },
];

export const FolderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFolderById, getDocumentsByFolder, shareFolder, addDocument, removeFolder } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emailToShare, setEmailToShare] = useState('');
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Drawer State
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<Set<string>>(new Set());

  const folder = getFolderById(id || '');
  const docs = getDocumentsByFolder(id || '');

  if (!folder) return <div className="p-8 text-white">Folder not found</div>;

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      navigate('/upload', { state: { folderId: folder.id, file: file } });
    }
  };

  // --- Drawer Logic ---
  const toggleGallerySelection = (itemId: string) => {
    const newSet = new Set(selectedGalleryIds);
    if (newSet.has(itemId)) newSet.delete(itemId);
    else newSet.add(itemId);
    setSelectedGalleryIds(newSet);
  };

  const handleImportSelected = () => {
    const items = MOCK_DRAWER_ITEMS.filter(i => selectedGalleryIds.has(i.id));
    items.forEach(item => {
      addDocument({
        id: Math.random().toString(36).substr(2, 9),
        title: item.title,
        summary: 'Imported from gallery via quick add.',
        category: folder.name, // Assign current folder category roughly
        tags: ['quick-import'],
        imageUrl: item.url,
        folderId: folder.id,
        createdAt: Date.now(),
        contentAnalysis: '',
        dateLabel: 'Imported'
      });
    });
    setIsAddDrawerOpen(false);
    setSelectedGalleryIds(new Set());
  };

  const handleDeleteFolder = async () => {
    if (folder.id) {
      await removeFolder(folder.id);
      navigate('/');
    }
  };

  return (
    <div 
      className={`min-h-screen bg-slate-900 pb-24 transition-colors duration-300 ${isDragging ? 'bg-indigo-900/20' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`sticky top-0 z-20 backdrop-blur-xl border-b border-slate-800 transition-colors ${folder.color.replace('bg-', 'bg-opacity-10 bg-')}`}>
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShareModalOpen(true)} className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Share2 size={20} />
            </button>
            <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-slate-300 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors">
              <Trash2 size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold ml-2">
              {docs.length}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 mb-1">
             <div className={`w-3 h-3 rounded-full ${folder.color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}></div>
             <span className="text-indigo-300 text-xs font-bold tracking-wider uppercase">Smart Folder</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{folder.name}</h1>
        </div>
      </div>

      {/* Drop Zone Indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center">
          <div className="border-4 border-dashed border-indigo-500 rounded-3xl p-10 text-center">
            <UploadCloud size={64} className="text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">Drop to Upload</h3>
            <p className="text-indigo-300">Add to {folder.name}</p>
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="px-4 py-6 flex items-center justify-between">
         <button 
           onClick={() => setIsAddDrawerOpen(true)}
           className="flex-1 mr-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
         >
           <Plus size={20} /> Add / Scan
         </button>
         
         <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
            >
              <LayoutGrid size={20} />
            </button>
         </div>
      </div>

      {/* Documents List */}
      <div className="px-4">
        <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">Documents</h2>
        {docs.length > 0 ? (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-2 gap-3'}>
            {docs.map(doc => {
               const isPdf = doc.mimeType === 'application/pdf' || doc.title.toLowerCase().endsWith('.pdf') || doc.imageUrl?.startsWith('data:application/pdf');
               
               return viewMode === 'list' ? (
                <DocumentCard key={doc.id} doc={doc} />
              ) : (
                <div 
                  key={doc.id}
                  onClick={() => navigate(`/document/${doc.id}`)}
                  className="bg-slate-800 rounded-2xl p-3 border border-slate-700 aspect-[4/5] flex flex-col justify-between hover:bg-slate-750 transition-colors active:scale-95"
                >
                   <div className="w-full flex-1 bg-slate-900 rounded-xl mb-3 overflow-hidden relative border border-slate-800/50">
                      {isPdf ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-2">
                                <FileText size={24} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PDF</span>
                        </div>
                      ) : (
                        doc.imageUrl ? (
                            <img src={doc.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon /></div>
                        )
                      )}
                   </div>
                   <div>
                     <p className="font-bold text-sm text-white truncate">{doc.title}</p>
                     <p className="text-[10px] text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center opacity-50">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
               <UploadCloud size={32} />
             </div>
             <p className="text-slate-400">This folder is empty.</p>
             <p className="text-slate-600 text-xs mt-1">Drag files here or tap Add File</p>
          </div>
        )}
      </div>

      {/* Add File Drawer (Bottom Sheet) */}
      {isAddDrawerOpen && (
        <>
          {/* High Z-Index to appear ABOVE Bottom Nav */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" onClick={() => setIsAddDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl z-[101] border-t border-slate-700 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl shadow-black">
            
            {/* Drawer Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-2 shrink-0"></div>
            
            {/* Drawer Header */}
            <div className="px-6 pb-4 flex justify-between items-center border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold text-white">Add to {folder.name}</h3>
              <button onClick={() => setIsAddDrawerOpen(false)} className="p-1 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto no-scrollbar space-y-6 flex-1">
              
              {/* Primary Action: New Upload */}
              <button 
                onClick={() => navigate('/upload', { state: { folderId: folder.id } })}
                className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 transition-all group active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                   <UploadCloud size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                   <h4 className="font-bold text-white text-lg">Tap to Upload</h4>
                   <p className="text-indigo-200 text-xs">Scan doc or pick from device</p>
                </div>
              </button>

              {/* Quick Gallery Select */}
              <div>
                <div className="flex items-center justify-between mb-3">
                   <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 tracking-wider">
                     <ImageIcon size={12} /> Recent Images
                   </h4>
                   {selectedGalleryIds.size > 0 && (
                     <span className="px-2 py-0.5 bg-indigo-500 rounded-full text-[10px] text-white font-bold animate-in zoom-in">
                       {selectedGalleryIds.size} selected
                     </span>
                   )}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_DRAWER_ITEMS.map(item => {
                    const isSelected = selectedGalleryIds.has(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleGallerySelection(item.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        
                        {/* Checkmark Overlay */}
                        <div className={`absolute inset-0 transition-all duration-200 flex items-center justify-center ${isSelected ? 'bg-indigo-500/40' : 'bg-transparent'}`}>
                           {isSelected && (
                             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                               <Check size={18} className="text-white" strokeWidth={3} />
                             </div>
                           )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Footer Action with increased bottom padding for safety */}
            <div className="p-4 pb-12 border-t border-slate-800 bg-slate-900 shrink-0">
              <button 
                onClick={handleImportSelected}
                disabled={selectedGalleryIds.size === 0}
                className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                  selectedGalleryIds.size > 0 
                  ? 'bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10 translate-y-0' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                {selectedGalleryIds.size > 0 ? (
                  <>
                    <Check size={20} />
                    <span>Import {selectedGalleryIds.size} Items</span>
                  </>
                ) : (
                   <span>Select items to import</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Share {folder.name}</h3>
            <input 
              type="email" 
              placeholder="Email address..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white mb-4 focus:border-indigo-500 focus:outline-none"
              value={emailToShare}
              onChange={e => setEmailToShare(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShareModalOpen(false)} className="flex-1 py-3 text-slate-300 hover:bg-slate-700 rounded-xl">Cancel</button>
              <button 
                onClick={() => {
                  shareFolder(folder.id, emailToShare);
                  setShareModalOpen(false);
                  setEmailToShare('');
                }}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Delete Folder?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Are you sure you want to delete <strong>{folder.name}</strong>? 
              <br/><br/>
              <span className="text-indigo-300 text-xs bg-indigo-500/10 px-2 py-1 rounded">Safe Delete:</span> Files inside will be moved to 'Unfiled' (Root).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 text-slate-300 hover:bg-slate-700 rounded-xl font-medium">Cancel</button>
              <button 
                onClick={handleDeleteFolder}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 shadow-lg shadow-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
