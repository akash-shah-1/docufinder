import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { SmartUpload } from './pages/SmartUpload';
import { AiSearch } from './pages/AiSearch';
import { Profile } from './pages/Profile';
import { Gallery } from './pages/Gallery';
import { FolderDetails } from './pages/FolderDetails';
import { DocumentDetails } from './pages/DocumentDetails';
import { PitchDeck } from './pages/PitchDeck';
import { AllFolders } from './pages/AllFolders';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide bottom nav on pitch deck page
  const hideNav = location.pathname === '/pitch-deck';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 max-w-md mx-auto relative shadow-2xl shadow-black overflow-hidden print:max-w-none print:overflow-visible">
      <div className="h-full overflow-y-auto no-scrollbar">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/upload" element={<SmartUpload />} />
            <Route path="/search" element={<AiSearch />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/folder/:id" element={<FolderDetails />} />
            <Route path="/document/:id" element={<DocumentDetails />} />
            <Route path="/pitch-deck" element={<PitchDeck />} />
            <Route path="/folders" element={<AllFolders />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;