
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ArrowLeft, 
  Trash2, 
  Download, 
  Calendar, 
  Folder as FolderIcon, 
  FileText,
  FolderInput,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  Maximize2,
  Loader2,
  AlignLeft
} from 'lucide-react';

// Set up PDF worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, folders, deleteDocument, updateDocument } = useApp();
  const [imageError, setImageError] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // PDF State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);

  // View State
  const [activeTab, setActiveTab] = useState<'analysis' | 'ocr'>('analysis');
  
  const doc = documents.find(d => d.id === id);
  const folder = folders.find(f => f.id === doc?.folderId);

  // Responsive PDF width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!doc) {
    return <div className="p-10 text-center text-slate-500">Document not found</div>;
  }

  // Check for PDF type
  const isPdf = doc.mimeType === 'application/pdf' || doc.title.toLowerCase().endsWith('.pdf') || doc.imageUrl?.startsWith('data:application/pdf');

  const handleDelete = () => {
    deleteDocument(doc.id);
    setDeleteModalOpen(false);
    navigate(-1);
  };

  const handleDownload = async () => {
    if (!doc.imageUrl) {
      alert("No file available.");
      return;
    }

    try {
      // Attempt to fetch as blob to force download
      const response = await fetch(doc.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Try to guess extension or default to jpg
      const ext = isPdf ? '.pdf' : '.jpg'; 
      link.download = `${doc.title}${ext}`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback for cross-origin issues or data urls
      const link = document.createElement('a');
      link.href = doc.imageUrl;
      link.target = '_blank';
      link.download = doc.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleMoveFolder = (folderId: string) => {
    updateDocument(doc.id, { folderId });
    setIsMoveMode(false);
  };

  const handleGetInsights = () => {
    navigate('/search', { state: { query: `Analyze this document specifically: "${doc.title}". Tell me what it is and any key details.` } });
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      
      {/* Full Screen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-200">
          {/* Full Screen Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
             <div className="pointer-events-auto">
                <h2 className="text-white font-bold text-lg drop-shadow-md truncate max-w-[70vw]">{doc.title}</h2>
                <p className="text-white/70 text-xs drop-shadow-md">{isPdf ? `${numPages || 0} Pages` : 'Image Viewer'}</p>
             </div>
             <button 
               onClick={() => setIsFullScreen(false)}
               className="pointer-events-auto p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors shadow-lg border border-white/10"
             >
               <X size={24} />
             </button>
          </div>
          
          {/* Full Screen Content */}
          <div className="flex-1 w-full h-full relative bg-black overflow-auto flex justify-center p-0 pt-20 pb-10">
             {isPdf ? (
                <div className="max-w-4xl w-full px-2" onClick={(e) => e.stopPropagation()}>
                  <Document
                    file={doc.imageUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="text-white text-center mt-20">Loading Document...</div>}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page 
                        key={`page_${index + 1}`}
                        pageNumber={index + 1} 
                        renderTextLayer={false} 
                        renderAnnotationLayer={false}
                        className="mx-auto shadow-2xl mb-4"
                        width={window.innerWidth > 800 ? 800 : window.innerWidth - 20}
                      />
                    ))}
                  </Document>
                </div>
             ) : (
                <div className="flex items-center justify-center h-full w-full">
                   <img 
                     src={doc.imageUrl} 
                     className="w-full h-full object-contain" 
                     alt="Fullscreen" 
                   />
                </div>
             )}
          </div>
        </div>
      )}

      {/* Standard Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
           <button onClick={() => setIsMoveMode(true)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors" title="Move to Folder">
             <FolderInput size={20} />
           </button>
           <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors" title="Download">
             <Download size={20} />
           </button>
           <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors" title="Delete">
             <Trash2 size={20} />
           </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Document Viewer Box */}
        <div 
            ref={containerRef}
            className={`rounded-3xl bg-slate-950 shadow-2xl border border-slate-800 relative group flex justify-center ${isPdf ? 'h-[500px] overflow-y-auto pt-4' : 'min-h-[300px] items-center overflow-hidden bg-slate-900/50'}`}
        >
          
          {/* Content */}
          {!imageError && doc.imageUrl ? (
            isPdf ? (
               <div className="w-full px-0">
                  <Document
                    file={doc.imageUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 size={32} className="animate-spin text-indigo-500"/>
                        <span className="text-slate-500 text-xs font-bold">Loading PDF...</span>
                      </div>
                    }
                    error={
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                            <AlertTriangle size={24} />
                        </div>
                        <p className="text-slate-300 text-sm mb-4">Preview unavailable for this file.</p>
                        <button onClick={handleDownload} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-white border border-slate-700">
                            Download to View
                        </button>
                      </div>
                    }
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page 
                        key={`page_${index + 1}`}
                        pageNumber={index + 1} 
                        width={containerWidth} 
                        renderTextLayer={false} 
                        renderAnnotationLayer={false} 
                        className="w-full mb-2"
                      />
                    ))}
                  </Document>
               </div>
            ) : (
              <img 
                src={doc.imageUrl} 
                alt={doc.title} 
                className="w-full h-full object-contain max-h-[65vh]"
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <FileText size={48} className="mb-2 opacity-50" />
               <p>Preview Unavailable</p>
            </div>
          )}
          
          {/* Full Screen Button */}
          {!imageError && doc.imageUrl && (
            <div className="absolute bottom-4 right-4 z-20">
               <button 
                 onClick={() => setIsFullScreen(true)} 
                 className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md rounded-full text-white shadow-lg shadow-indigo-900/50 border border-white/10 transition-all active:scale-95"
               >
                 <Maximize2 size={18} />
                 <span className="text-xs font-bold">Full Screen</span>
               </button>
            </div>
          )}
        </div>

        {/* Title & Summary */}
        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-white leading-tight">{doc.title}</h1>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              {doc.category}
            </span>
          </div>
          <p className="text-slate-400 mt-3 leading-relaxed">{doc.summary}</p>
        </div>

        {/* AI Action Button */}
        <button 
          onClick={handleGetInsights}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full text-indigo-100">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Ask AI about this doc</p>
              <p className="text-xs text-indigo-200">Get summaries, insights, and answers</p>
            </div>
          </div>
          <ArrowLeft size={18} className="rotate-180 text-indigo-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
              <FolderIcon size={12} />
              Location
            </div>
            <div className="text-white font-medium truncate">{folder?.name || 'Unfiled'}</div>
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
              <Calendar size={12} />
              {doc.dateLabel || 'Date'}
            </div>
            <div className="text-white font-medium">{doc.importantDate || new Date(doc.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {doc.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300 border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content Analysis & OCR Tabs */}
        <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50 min-h-[200px]">
          <div className="flex items-center gap-6 mb-4 border-b border-slate-700/50 pb-1">
             <button 
               onClick={() => setActiveTab('analysis')}
               className={`text-xs font-bold uppercase tracking-wider pb-2 transition-colors ${activeTab === 'analysis' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                AI Summary
             </button>
             <button 
               onClick={() => setActiveTab('ocr')}
               className={`text-xs font-bold uppercase tracking-wider pb-2 transition-colors flex items-center gap-2 ${activeTab === 'ocr' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Extracted Text <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[9px]">OCR</span>
             </button>
          </div>

          {activeTab === 'analysis' ? (
            <div className="text-sm text-slate-300 leading-relaxed opacity-90 animate-in fade-in duration-300">
               <div className="flex items-start gap-2 mb-2">
                  <Sparkles size={14} className="text-indigo-400 mt-1 shrink-0" />
                  <p>{doc.contentAnalysis ? (() => {
                      try { return JSON.parse(doc.contentAnalysis).summary; } 
                      catch { return doc.summary; }
                  })() : doc.summary}</p>
               </div>
               {/* Also show key data points from analysis if available */}
               {doc.contentAnalysis && (() => {
                  try {
                    const analysis = JSON.parse(doc.contentAnalysis);
                    return (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {analysis.importantDate && (
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                              <p className="text-[10px] text-slate-500 uppercase">Date Found</p>
                              <p className="text-xs text-white">{analysis.importantDate}</p>
                           </div>
                        )}
                         <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                            <p className="text-[10px] text-slate-500 uppercase">Category</p>
                            <p className="text-xs text-white">{analysis.category}</p>
                         </div>
                      </div>
                    )
                  } catch { return null; }
               })()}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
                <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold">Raw text read from document:</p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 h-48 overflow-y-auto custom-scrollbar">
                   <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed selection:bg-indigo-500/30">
                     {doc.ocrText ? doc.ocrText : (
                        <span className="text-slate-600 italic">No text could be extracted from this file. It might be an image without clear text.</span>
                     )}
                   </p>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Move Folder Modal */}
      {isMoveMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsMoveMode(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderInput size={18} className="text-indigo-400" /> Move to...
              </h3>
              <button onClick={() => setIsMoveMode(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
              {folders.map(f => (
                <button 
                  key={f.id}
                  onClick={() => handleMoveFolder(f.id)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition-colors ${f.id === doc.folderId ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-slate-900 hover:bg-slate-700 border border-slate-800'}`}
                >
                  <span className={`text-sm font-medium ${f.id === doc.folderId ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {f.name}
                  </span>
                  {f.id === doc.folderId && <Check size={16} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl transform transition-all scale-100">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
               <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Document?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete <strong>"{doc.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-colors shadow-lg shadow-red-500/20"
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
