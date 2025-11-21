import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Mail, Shield, Lock, Cloud, PieChart, HardDrive, FileText, Loader2, Edit2, Trash2, AlertTriangle, X, Check } from 'lucide-react';

export const Profile = () => {
  const { auth, login, logout, documents, folders, updateProfile, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Edit Profile State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Account State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    // Simulate network/auth delay for realism
    setTimeout(() => {
      login();
      setIsLoggingIn(false);
    }, 1500);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      await updateProfile(editName);
      setIsEditOpen(false);
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      // Redirect is handled by logout in context clearing state
    } catch (error) {
      alert("Failed to delete account");
      setIsDeleting(false);
    }
  };

  const openEditModal = () => {
    setEditName(auth.user?.name || '');
    setIsEditOpen(true);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center pb-20 bg-slate-900">
        <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10 rotate-3">
          <Cloud size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">DocuMind</h1>
        <p className="text-slate-400 mb-10 max-w-xs text-sm leading-relaxed">
          Your personal AI document assistant. Store, organize, and chat with your files.
        </p>
        
        <div className="w-full max-w-xs space-y-4">
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-70"
          >
            {isLoggingIn ? (
              <Loader2 size={20} className="animate-spin text-slate-900" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <div className="text-[10px] text-slate-600 mt-8">
             By continuing, you agree to our Terms & Privacy Policy.
          </div>
        </div>
      </div>
    );
  }

  // Storage Calculations
  const totalStorageBytes = documents.reduce((acc, doc) => acc + (doc.fileSize || 500000), 0); // Default 500KB if missing
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
  const maxStorageMB = 100; // 100MB limit for demo
  const usagePercent = Math.min(100, (Number(totalStorageMB) / maxStorageMB) * 100);

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
      
      {/* User Info Card */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700 flex items-center justify-between shadow-lg relative group">
        <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 p-0.5">
            {auth.user?.avatar ? (
                <img src={auth.user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center rounded-full">
                <UserIcon />
                </div>
            )}
            </div>
            <div>
            <h2 className="text-xl font-bold text-white">{auth.user?.name}</h2>
            <p className="text-sm text-slate-400 flex items-center mt-1">
                <Mail size={12} className="mr-1.5" />
                {auth.user?.email}
            </p>
            </div>
        </div>
        <button 
            onClick={openEditModal}
            className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors"
        >
            <Edit2 size={16} />
        </button>
      </div>

      {/* Storage Dashboard */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-6 border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <HardDrive size={18} className="text-indigo-400" />
            <span>Storage Usage</span>
          </div>
          <span className="text-xs text-slate-400">{totalStorageMB} MB / {maxStorageMB} MB</span>
        </div>
        
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" 
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-center">
          <div className="bg-slate-900/50 rounded-xl p-2 flex-1 mr-2 border border-slate-700/50">
             <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Docs</p>
             <p className="text-lg font-bold text-white">{documents.length}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 flex-1 mr-2 border border-slate-700/50">
             <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Folders</p>
             <p className="text-lg font-bold text-white">{folders.length}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 flex-1 border border-slate-700/50">
             <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Free</p>
             <p className="text-lg font-bold text-white">{(maxStorageMB - Number(totalStorageMB)).toFixed(0)}MB</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        
        {/* Investor Button (New) */}
        <button 
          onClick={() => navigate('/pitch-deck')}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 p-0.5 rounded-xl group relative overflow-hidden shadow-lg mb-4"
        >
           <div className="bg-slate-900 rounded-[10px] p-4 flex items-center justify-between group-hover:bg-slate-800/50 transition-colors">
             <div className="flex items-center text-white">
               <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mr-3 text-white">
                 <FileText size={16} />
               </div>
               <div className="text-left">
                 <span className="font-bold block text-sm">Investor Pitch Deck</span>
                 <span className="text-[10px] text-indigo-300">Download PDF Presentation</span>
               </div>
             </div>
           </div>
        </button>

        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
           <div className="p-4 border-b border-slate-700 flex items-center justify-between hover:bg-slate-700/50 transition-colors cursor-pointer">
              <div className="flex items-center text-slate-200">
                <Lock size={18} className="mr-3 text-slate-400" />
                <span className="font-medium">Security & Privacy</span>
              </div>
           </div>
           <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center text-slate-200">
                <Shield size={18} className="mr-3 text-slate-400" />
                <span className="font-medium">App Permissions</span>
              </div>
           </div>
           <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center text-slate-200">
                <PieChart size={18} className="mr-3 text-slate-400" />
                <span className="font-medium">Analytics</span>
              </div>
           </div>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-slate-800 text-slate-300 font-bold py-4 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 hover:bg-slate-700 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

        <button 
            onClick={() => setIsDeleteOpen(true)}
            className="w-full bg-red-500/5 text-red-400/80 font-medium py-3 rounded-xl border border-red-500/10 flex items-center justify-center space-x-2 hover:bg-red-500/10 transition-colors text-sm mt-4"
        >
            <Trash2 size={16} />
            <span>Delete Account</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsEditOpen(false)}>
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                    <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdateProfile}>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Display Name</label>
                    <input 
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white mb-6 focus:border-indigo-500 focus:outline-none"
                    />
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsEditOpen(false)}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isUpdating || !editName.trim()}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsDeleteOpen(false)}>
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-red-500/30 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">Delete Account?</h3>
                <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
                    This will <strong>permanently delete</strong> all your documents, folders, and data. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsDeleteOpen(false)}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        Confirm
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};