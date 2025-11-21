import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Search, User, Image as ImageIcon } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-4 pt-2 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
      <div className="flex justify-between items-end px-6 relative">
        
        {/* Left Side */}
        <Link 
          to="/" 
          className={`flex flex-col items-center space-y-1 ${isActive('/') ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link 
          to="/gallery" 
          className={`flex flex-col items-center space-y-1 ${isActive('/gallery') ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <ImageIcon size={24} strokeWidth={isActive('/gallery') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Gallery</span>
        </Link>

        {/* Center Floating Button */}
        <div className="relative -top-5">
          <Link 
            to="/upload" 
            state={{ from: 'nav' }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white shadow-lg border-4 border-slate-900 hover:bg-indigo-500 transition-transform active:scale-95"
          >
            <Plus size={32} strokeWidth={3} />
          </Link>
        </div>

        {/* Right Side */}
        <Link 
          to="/search" 
          className={`flex flex-col items-center space-y-1 ${isActive('/search') ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Search size={24} strokeWidth={isActive('/search') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link 
          to="/profile" 
          className={`flex flex-col items-center space-y-1 ${isActive('/profile') ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>

      </div>
    </div>
  );
};