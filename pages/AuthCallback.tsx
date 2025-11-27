import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Google OAuth returns tokens in the URL hash fragment
      // The URL will be: http://localhost:3000/#access_token=...&token_type=Bearer&...
      // After OAuthHandler redirects, it becomes: http://localhost:3000/#/auth/callback
      // But we need to get the token from sessionStorage where we'll store it
      
      const fullHash = window.location.hash;
      
      // Try to get OAuth params from the current hash
      let oauthString = fullHash.substring(1); // Remove leading #
      
      // Remove the route part if present
      if (oauthString.startsWith('/auth/callback')) {
        // Check if there are OAuth params after the route
        const paramsStart = oauthString.indexOf('&');
        if (paramsStart !== -1) {
          oauthString = oauthString.substring(paramsStart + 1);
        } else {
          // No params in URL, check sessionStorage
          const storedParams = sessionStorage.getItem('oauth_params');
          if (storedParams) {
            oauthString = storedParams;
            sessionStorage.removeItem('oauth_params');
          } else {
            setError('No OAuth parameters found');
            setTimeout(() => navigate('/profile'), 2000);
            return;
          }
        }
      }
      
      const params = new URLSearchParams(oauthString);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        setError('No access token received');
        setTimeout(() => navigate('/profile'), 2000);
        return;
      }

      try {
        // Fetch user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await response.json();
        
        // Login with user info
        await login(userInfo.email, userInfo.name, userInfo.picture);
        
        // Clean up the URL and redirect to home
        window.location.hash = '#/';
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed');
        setTimeout(() => navigate('/profile'), 2000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-400 mb-4">{error}</div>
            <p className="text-slate-400 text-sm">Redirecting...</p>
          </>
        ) : (
          <>
            <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-400">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
};
