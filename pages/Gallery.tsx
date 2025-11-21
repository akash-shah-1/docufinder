
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Image as ImageIcon, Cloud, Smartphone, AlertCircle, RefreshCw, Filter, FileText, Plus } from 'lucide-react';

// Mock data to simulate camera roll
const MOCK_GALLERY_ITEMS = [
  { id: 'g1', url: 'https://placehold.co/400x600/1e293b/ffffff?text=Aadhaar', isDoc: true },
  { id: 'g2', url: 'https://picsum.photos/seed/1/400/400', isDoc: false },
  { id: 'g3', url: 'https://placehold.co/400x500/1e293b/ffffff?text=Bill', isDoc: true },
  { id: 'g4', url: 'https://picsum.photos/seed/2/400/400', isDoc: false },
  { id: 'g5', url: 'https://placehold.co/400x600/1e293b/ffffff?text=Notes', isDoc: true },
  { id: 'g6', url: 'https://picsum.photos/seed/3/400/400', isDoc: false },
  { id: 'g7', url: 'https://picsum.photos/seed/4/400/400', isDoc: false },
  { id: 'g8', url: 'https://placehold.co/400x600/1e293b/ffffff?text=Ticket', isDoc: true },
  { id: 'g9', url: 'https://picsum.photos/seed/5/400/400', isDoc: false },
  { id: 'g10', url: 'https://picsum.photos/seed/6/400/400', isDoc: false },
  { id: 'g11', url: 'https://placehold.co/400x600/1e293b/ffffff?text=Receipt', isDoc: true },
  { id: 'g12', url: 'https://picsum.photos/seed/7/400/400', isDoc: false },
];

export const Gallery = () => {
  const navigate = useNavigate();
  const { documents, syncGallery, folders } = useApp();
  
  // View State
  const [activeTab, setActiveTab] = useState<'uploads' | 'import'>('uploads');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  
  // Library Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Import Logic State
  const [isScanning, setIsScanning] = useState(false);
  const [galleryItems, setGalleryItems] = useState<typeof MOCK_GALLERY_ITEMS>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Load "Local" images by default for import tab
  useEffect(() => {
    setGalleryItems(MOCK_GALLERY_ITEMS);
  }, []);

  const handleSync = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const docIds = MOCK_GALLERY_ITEMS.filter(i => i.isDoc).map(i => i.id);
      setSelectedIds(new Set(docIds));
    }, 1500);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleImport = async () => {
    setIsSyncing(true);
    try {
      const itemsToImport = galleryItems
        .filter(item => selectedIds.has(item.id))
        .map(item => ({
          id: Math.random().toString(36).substr(2, 9), // Temp ID, backend will assign real one
          title: item.isDoc ? 'Scanned Document' : 'Gallery Image', 
          summary: 'Imported from device gallery',
          category: 'Unsorted',
          tags: ['import'],
          imageUrl: item.url,
          folderId: 'root',
          createdAt: Date.now(),
          contentAnalysis: '',
          dateLabel: 'Imported'
        }));
      
      await syncGallery(itemsToImport);
      
      setActiveTab('uploads');
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Import failed", e);
      alert("Import failed. Check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Derived Data for Uploads
  const categories = ['All', ...Array.from(new Set(documents.map(d => d.category)))];
  const filteredDocs = documents.filter(d => selectedCategory === 'All' || d.category === selectedCategory);

  const getGridClass = () => {
    if (gridCols === 2) return 'grid-cols-2';
    if (gridCols === 3) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-24 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-4 pb-3 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          
          {/* Grid Controls */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[2, 3, 4].map((cols) => (
              <button 
                key={cols}
                onClick={() => setGridCols(cols as any)}
                className={`w-8 h-7 rounded flex items-center justify-center transition-colors ${gridCols === cols ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
              >
                <span className="text-xs font-bold">{cols}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 mb-2">
          <button 
            onClick={() => setActiveTab('uploads')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'uploads' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            My Uploads
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Device Import
          </button>
        </div>

        {/* Filters (Only for Uploads) */}
        {activeTab === 'uploads' && (
           <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 mt-2 mask-fade-right">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selectedCategory === cat 
                    ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        )}

        {/* Import Actions (Only for Import) */}
        {activeTab === 'import' && (
           <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                 <Smartphone size={14} />
                 <span>Camera Roll</span>
              </div>
              <button onClick={handleSync} className="text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-300">
                 <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} /> Rescan
              </button>
           </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-1">
        {activeTab === 'uploads' ? (
            /* UPLOADS GRID */
            filteredDocs.length > 0 ? (
                <div className={`grid ${getGridClass()} gap-1`}>
                    {filteredDocs.map(doc => {
                        const isPdf = doc.mimeType === 'application/pdf' || doc.imageUrl?.includes('application/pdf');
                        return (
                            <div 
                                key={doc.id}
                                onClick={() => navigate(`/document/${doc.id}`)}
                                className="relative aspect-square bg-slate-800 border border-slate-700/50 cursor-pointer overflow-hidden group"
                            >
                                {doc.imageUrl && !isPdf ? (
                                    <img src={doc.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-800/50">
                                        {isPdf ? <FileText size={32} className="mb-2 opacity-50" /> : <ImageIcon size={32} className="mb-2 opacity-50" />}
                                        {isPdf && <span className="text-[10px] font-bold uppercase tracking-wider">PDF</span>}
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <p className="text-[10px] text-white font-medium truncate">{doc.title}</p>
                                    <p className="text-[9px] text-slate-400 truncate">{doc.category}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 opacity-60">
                    <Cloud size={48} className="mb-4" strokeWidth={1} />
                    <p>No documents in cloud.</p>
                </div>
            )
        ) : (
            /* IMPORT GRID */
            <div className="relative min-h-[200px]">
                {isScanning && (
                    <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 size={32} className="text-indigo-500 animate-spin mb-3" />
                        <p className="text-white text-sm font-bold animate-pulse">Scanning device...</p>
                    </div>
                )}
                
                <div className={`grid ${getGridClass()} gap-1`}>
                    {galleryItems.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                        <div 
                            key={item.id} 
                            onClick={() => toggleSelection(item.id)}
                            className={`relative aspect-square bg-slate-800 overflow-hidden cursor-pointer transition-all duration-150 ${isSelected ? 'ring-2 ring-indigo-500 z-10' : 'opacity-100'}`}
                        >
                            <img src={item.url} className="w-full h-full object-cover" />
                            
                            <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-indigo-500/30' : 'bg-transparent'}`} />
                            
                            {isSelected && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                </div>
                            )}

                            {item.isDoc && !isSelected && (
                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-indigo-400 rounded-full ring-2 ring-slate-900"></div>
                            )}
                        </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Floating Actions */}
      {activeTab === 'import' && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-10">
            <button 
                onClick={handleImport}
                disabled={isSyncing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-black/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
                {isSyncing ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18} />}
                <span>Import {selectedIds.size} Items</span>
            </button>
        </div>
      )}
      
      {/* Quick Add FAB for Uploads Tab */}
      {activeTab === 'uploads' && (
         <div className="fixed bottom-24 right-4 z-40">
            <button 
              onClick={() => navigate('/upload')}
              className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-900/50 border-4 border-slate-900 hover:scale-105 transition-transform"
            >
               <Plus size={32} />
            </button>
         </div>
      )}
    </div>
  );
};
