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
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  const handleOpenAuth = (mode = 'signin') => {
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
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
