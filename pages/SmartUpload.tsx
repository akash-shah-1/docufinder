
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { analyzeDocument } from '../services/aiService';
import { Upload, X, Check, Loader2, FileText, FolderPlus, Plus, AlertCircle, Play, ScanLine, Eye } from 'lucide-react';

interface QueueItem {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  errorMsg?: string;
  analysisTitle?: string;
}

export const SmartUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addDocument, addFolder, folders, auth } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  // Check if we were passed a file or folderId via navigation state
  const stateParams = location.state as { folderId?: string; file?: File; files?: FileList } | null;
  const preSelectedFolderId = stateParams?.folderId;

  // State
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);

  // Load dropped files immediately if present
  useEffect(() => {
    if (stateParams?.file) {
      addFilesToQueue([stateParams.file]);
    }
    if (stateParams?.files) {
        addFilesToQueue(Array.from(stateParams.files));
    }
  }, [stateParams]);

  // Auto-scroll to bottom when queue changes
  useEffect(() => {
    if (queue.length > 0 && !isProcessing) {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [queue.length, isProcessing]);

  const addFilesToQueue = async (files: File[]) => {
    // Convert files to base64 data URLs for persistent previews
    const newItemsPromises = files.map(async (file) => {
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview,
        status: 'idle' as const
      };
    });
    
    const newItems = await Promise.all(newItemsPromises);
    setQueue(prev => [...prev, ...newItems]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
    // Reset input so same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateItemStatus = (id: string, status: QueueItem['status'], title?: string, errorMsg?: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status, analysisTitle: title, errorMsg };
      }
      return item;
    }));
  };

  const processQueue = async () => {
    if (queue.length === 0) return;
    if (!auth.user) {
      alert("Please sign in first");
      return;
    }

    setIsProcessing(true);

    // Process sequentially for the visual "step-by-step" effect
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      // Skip already done
      if (item.status === 'done') continue;

      setProcessingIndex(i);
      updateItemStatus(item.id, 'analyzing');

      try {
        // 1. Analyze
        // Artificial delay for UI satisfaction if analysis is too fast
        const [analysis] = await Promise.all([
           analyzeDocument(item.file),
           new Promise(resolve => setTimeout(resolve, 2000)) // Min 2s animation for "OCR" feel
        ]);
        
        // Determine Folder
        let targetFolderId = preSelectedFolderId;
        
        // Auto-Arrange Logic (Only if no folder pre-selected)
        if (!targetFolderId) {
          let targetFolder = folders.find(f => 
            f.name.toLowerCase() === analysis.category.toLowerCase()
          );
          
          if (!targetFolder) {
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const newFolder = await addFolder(analysis.category, randomColor);
            if (newFolder) {
              targetFolder = newFolder;
            }
          }
          targetFolderId = targetFolder?.id || folders[0]?.id;
        }

        // 2. Create Document
        const docId = Math.random().toString(36).substring(2, 9);
        
        addDocument({
          id: docId,
          title: analysis.title,
          summary: analysis.summary,
          category: analysis.category,
          tags: analysis.tags,
          imageUrl: item.preview || '',
          mimeType: item.file.type,
          folderId: targetFolderId || 'root',
          createdAt: Date.now(),
          contentAnalysis: JSON.stringify(analysis),
          importantDate: analysis.importantDate,
          dateLabel: analysis.dateLabel,
          fileSize: item.file.size,
          ocrText: analysis.ocrText // Save the OCR text!
        });

        // Update status to done
        updateItemStatus(item.id, 'done', analysis.title);

      } catch (error) {
        console.error(error);
        updateItemStatus(item.id, 'error', undefined, "Failed to analyze");
      }
    }

    // All done
    setTimeout(() => {
      if (preSelectedFolderId) {
        navigate(`/folder/${preSelectedFolderId}`);
      } else {
        navigate('/');
      }
    }, 1000);
  };

  return (
    <div className="p-4 h-screen flex flex-col pb-24 bg-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {preSelectedFolderId ? 'Add to Folder' : 'Scan Documents'}
        </h1>
        {queue.length > 0 && !isProcessing && (
          <button 
            onClick={() => setQueue([])}
            className="text-xs text-red-400 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <input 
        type="file" 
        multiple
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,application/pdf"
      />

      {/* EMPTY STATE */}
      {queue.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-indigo-500/30 rounded-3xl flex flex-col items-center justify-center bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-all group"
        >
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-xl border border-slate-700 relative">
            <Upload size={32} />
            <div className="absolute top-0 right-0 bg-indigo-500 rounded-full p-1.5 border-4 border-slate-900">
              <Plus size={12} className="text-white" strokeWidth={4} />
            </div>
          </div>
          <p className="text-white font-bold text-lg">Tap to select files</p>
          <p className="text-slate-400 text-sm mt-2 text-center px-10 leading-relaxed">
            Upload multiple images or PDFs. <br/>AI will organize them automatically.
          </p>
        </div>
      ) : (
        /* QUEUE / PROCESSING LIST */
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 pb-4">
            {queue.map((item, index) => {
              const isPdf = item.file.type === 'application/pdf';
              // Identify if this specific item is actively being processed
              const isCurrent = item.status === 'analyzing';
              const isWaiting = isProcessing && item.status === 'idle';
              
              return (
                <div 
                  key={item.id}
                  className={`relative flex items-center gap-4 p-3 rounded-2xl border transition-all duration-500 ${
                    isCurrent 
                      ? 'bg-indigo-900/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20 scale-[1.02] z-10' 
                      : 'bg-slate-800 border-slate-700'
                  } ${isWaiting ? 'opacity-40' : 'opacity-100'}`}
                >
                  {/* Preview Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-900 flex-shrink-0 overflow-hidden border border-slate-700 relative">
                    {isPdf ? (
                       <div className="w-full h-full flex items-center justify-center text-red-400">
                         <FileText size={24} />
                       </div>
                    ) : (
                      <img src={item.preview} className="w-full h-full object-cover" alt="" />
                    )}
                    
                    {/* Status Overlay on Thumbnail */}
                    {item.status === 'analyzing' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                         <ScanLine size={20} className="text-indigo-400 animate-pulse" />
                      </div>
                    )}
                    {item.status === 'done' && (
                      <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Check size={20} className="text-white shadow-sm" strokeWidth={3} />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center animate-in fade-in">
                        <AlertCircle size={20} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`font-bold text-sm truncate transition-colors duration-300 ${item.status === 'done' ? 'text-emerald-400' : 'text-white'}`}>
                        {item.analysisTitle || item.file.name}
                      </p>
                      
                      {!isProcessing && (
                        <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 p-1 -mr-2">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Status Text */}
                    <div className="mt-1 flex items-center h-5">
                       {item.status === 'idle' && <span className="text-xs text-slate-500">Queued • {(item.file.size / 1024).toFixed(0)}KB</span>}
                       {item.status === 'analyzing' && (
                         <span className="text-xs text-indigo-400 flex items-center gap-1.5 font-medium animate-pulse">
                           <Eye size={12} /> Reading text & extracting...
                         </span>
                       )}
                       {item.status === 'done' && (
                         <span className="text-xs text-emerald-500/80 flex items-center gap-1">
                           OCR Complete & Organized
                         </span>
                       )}
                       {item.status === 'error' && <span className="text-xs text-red-400">Failed to process</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Add More Button (Only in selection mode) */}
            {!isProcessing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
              >
                <Plus size={20} />
                <span className="font-bold text-sm">Add More Files</span>
              </button>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-4 border-t border-slate-800/50">
             {isProcessing ? (
               <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center relative">
                       <Loader2 size={20} className="text-white animate-spin" />
                     </div>
                     <div>
                       <p className="text-white font-bold text-sm">Processing Queue</p>
                       <p className="text-slate-400 text-xs">Extracting text & details...</p>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-3">
                 <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FolderPlus size={16} />
                    </div>
                    <div className="flex-1">
                       {preSelectedFolderId ? (
                          <p className="text-xs font-medium text-indigo-200">Target: Current Folder</p>
                       ) : (
                          <p className="text-xs font-medium text-indigo-200">AI will auto-create folders</p>
                       )}
                    </div>
                 </div>

                 <button 
                   onClick={processQueue}
                   className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                 >
                   <Play size={20} fill="currentColor" />
                   <span>Start Analysis ({queue.length})</span>
                 </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
