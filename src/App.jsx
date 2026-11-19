import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import StoreOwnerPortal from './components/StoreOwnerPortal';
import SaasAdminCockpit from './components/SaasAdminCockpit';

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('plannest_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'

  // Support direct admin access via URL parameter (e.g., pos.plannestapp.com?admin=1)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1' || params.get('mode') === 'signin') {
        setAuthMode('signin');
        setIsAuthOpen(true);
      }
    } catch {}
  }, []);

  const handleOpenAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (newSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('plannest_session');
  };

  // If user is logged in
  if (session) {
    if (session.role === 'super_admin') {
      return <SaasAdminCockpit onLogout={handleLogout} />;
    }

    if (session.role === 'store_owner') {
      return <StoreOwnerPortal session={session} onLogout={handleLogout} />;
    }
  }

  // Otherwise, render Public Marketing Landing Page
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
