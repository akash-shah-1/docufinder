
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DocumentItem } from '../types';
import { 
  FileText, 
  MoreVertical, 
  Clock, 
  IdCard, 
  CreditCard, 
  Plane, 
  GraduationCap, 
  Receipt, 
  Activity, 
  Edit2,
  Trash2,
  Check
} from 'lucide-react';

interface Props {
  doc: DocumentItem;
  showFolderBadge?: boolean;
  folderName?: string;
}

export const DocumentCard: React.FC<Props> = ({ doc, showFolderBadge, folderName }) => {
  const navigate = useNavigate();
  const { deleteDocument, updateDocument } = useApp();
  
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Edit State
  const [editTitle, setEditTitle] = useState(doc.title);
  const [editSummary, setEditSummary] = useState(doc.summary);

  // Determine color for badge based on date label
  const isExpiry = doc.dateLabel?.toLowerCase().includes('expir');
  const isDue = doc.dateLabel?.toLowerCase().includes('due');
  
  let badgeColor = 'bg-slate-800 text-slate-400 border border-slate-700';
  if (isExpiry) badgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
  if (isDue) badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    if (action === 'delete') {
      if (confirm('Delete this document?')) {
        deleteDocument(doc.id);
      }
    } else if (action === 'edit') {
      setIsEditMode(true);
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateDocument(doc.id, { title: editTitle, summary: editSummary });
    setIsEditMode(false);
  };

  // Helper to render category-specific fallback UI
  const renderFallbackUI = () => {
    const cat = doc.category.toLowerCase();
    let Icon = FileText;
    let colorClass = "text-slate-400";
    let bgClass = "bg-slate-800";

    if (cat.includes('identity') || cat.includes('passport') || cat.includes('license')) {
      Icon = IdCard; colorClass = "text-blue-400"; bgClass = "bg-blue-500/10";
    } else if (cat.includes('finance') || cat.includes('bank') || cat.includes('tax')) {
      Icon = CreditCard; colorClass = "text-emerald-400"; bgClass = "bg-emerald-500/10";
    } else if (cat.includes('travel') || cat.includes('ticket')) {
      Icon = Plane; colorClass = "text-sky-400"; bgClass = "bg-sky-500/10";
    } else if (cat.includes('education') || cat.includes('school')) {
      Icon = GraduationCap; colorClass = "text-amber-400"; bgClass = "bg-amber-500/10";
    } else if (cat.includes('receipt') || cat.includes('bill')) {
      Icon = Receipt; colorClass = "text-purple-400"; bgClass = "bg-purple-500/10";
    } else if (cat.includes('medical')) {
      Icon = Activity; colorClass = "text-rose-400"; bgClass = "bg-rose-500/10";
    }

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${bgClass} p-2 text-center`}>
        <Icon size={28} className={`${colorClass} mb-1`} />
        <span className={`text-[8px] font-bold uppercase tracking-wider ${colorClass} opacity-80`}>
          {doc.category.split(' ')[0]}
        </span>
      </div>
    );
  };

  return (
    <>
      <div 
        onClick={() => navigate(`/document/${doc.id}`)}
        className={`relative group bg-slate-800 rounded-2xl p-3 mb-3 border border-slate-700 hover:bg-slate-750 transition-all shadow-sm active:scale-[0.99] cursor-pointer flex items-start gap-3 overflow-visible ${isMenuOpen ? 'z-50' : 'z-0'}`}
      >
        {/* Thumbnail / Fallback Icon */}
        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-700/50 relative">
          {!imageError && doc.imageUrl ? (
            <img 
              src={doc.imageUrl} 
              alt={doc.title} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderFallbackUI()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5 relative">
          <div className="flex justify-between items-start mb-1 pr-6">
            <h3 className="text-base font-semibold text-slate-100 truncate leading-tight">{doc.title}</h3>
          </div>
          
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2.5 pr-4">{doc.summary}</p>
          
          <div className="flex flex-wrap gap-2 items-center">
            {showFolderBadge && (
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[10px] font-semibold text-indigo-300">
                {folderName || 'Unfiled'}
              </span>
            )}
            
            {doc.importantDate ? (
               <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center ${badgeColor}`}>
                 <Clock size={10} className="mr-1" />
                 {doc.dateLabel}: {doc.importantDate}
               </span>
            ) : (
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[10px] text-slate-500">
                 {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Menu Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="absolute top-3 right-2 text-slate-500 hover:text-white p-1 z-10 hover:bg-slate-700 rounded-full transition-colors"
        >
          <MoreVertical size={18} />
        </button>

        {/* Popup Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
            
            {/* Menu Dropdown - High Z-Index */}
            <div className="absolute top-10 right-2 w-44 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/50">
              <button onClick={(e) => handleMenuAction('edit', e)} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800 text-left transition-colors border-b border-slate-800">
                <Edit2 size={16} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">Edit Details</span>
              </button>
              <button onClick={(e) => handleMenuAction('delete', e)} className="flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/10 text-left transition-colors group/del">
                <Trash2 size={16} className="text-slate-500 group-hover/del:text-red-400 transition-colors" />
                <span className="text-sm font-medium text-slate-300 group-hover/del:text-red-400 transition-colors">Delete</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal Overlay */}
      {isEditMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Edit2 size={18} className="text-indigo-400" /> Edit Document
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Title</label>
                <input 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Summary</label>
                <textarea 
                  value={editSummary}
                  onChange={e => setEditSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditMode(false); }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center gap-2"
              >
                <Check size={16} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};