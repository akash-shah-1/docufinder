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
import { Settings } from './pages/Settings';
import { AuthCallback } from './pages/AuthCallback';

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

const OAuthHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHandlingOAuth, setIsHandlingOAuth] = React.useState(true);

  React.useEffect(() => {
    // Check if URL contains OAuth tokens in the hash
    const hash = window.location.hash;
    
    if (hash.includes('access_token=')) {
      // Store OAuth params in sessionStorage
      const oauthParams = hash.substring(1); // Remove leading #
      sessionStorage.setItem('oauth_params', oauthParams);
      
      // Redirect to auth callback to handle the OAuth response
      window.location.hash = '#/auth/callback';
    }
    
    setIsHandlingOAuth(false);
  }, []);

  if (isHandlingOAuth) {
    return null; // Brief flash prevention
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <OAuthHandler>
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
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </AppLayout>
        </OAuthHandler>
      </HashRouter>
    </AppProvider>
  );
};

export default App;