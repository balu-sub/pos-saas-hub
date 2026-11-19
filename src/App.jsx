import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import StoreOwnerPortal from './components/StoreOwnerPortal';
import SaasAdminCockpit from './components/SaasAdminCockpit';
import SuperAdminLogin from './components/SuperAdminLogin';

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('plannest_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase();
    }
    return '/';
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'

  // Route & search params tracking
  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        setCurrentPath(window.location.pathname.toLowerCase());
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1') {
        // Direct admin query parameter
        if (window.location.pathname !== '/admin') {
          window.history.replaceState({}, '', '/admin');
          setCurrentPath('/admin');
        }
      } else if (params.get('mode') === 'signin') {
        setAuthMode('signin');
        setIsAuthOpen(true);
      }
    } catch {}

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleOpenAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (newSession) => {
    setSession(newSession);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('plannest_session');
  };

  const handleNavigateHome = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
  };

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin/';

  // 1. If user is logged in as Super Admin
  if (session && session.role === 'super_admin') {
    return <SaasAdminCockpit onLogout={handleLogout} />;
  }

  // 2. If user is logged in as Store Owner
  if (session && session.role === 'store_owner') {
    return <StoreOwnerPortal session={session} onLogout={handleLogout} />;
  }

  // 3. If accessing https://pos.plannestapp.com/admin without session -> Render Superadmin Login Page
  if (isAdminRoute) {
    return (
      <SuperAdminLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // 4. Otherwise, render Public Marketing Landing Page
  return (
    <>
      <LandingPage onOpenAuth={handleOpenAuth} />
      {isAuthOpen && (
        <AuthModal
          key={authMode}
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
