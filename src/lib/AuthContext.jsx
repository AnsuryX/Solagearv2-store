import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const enrichUser = async (sessionUser) => {
      if (!sessionUser) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }

      // Add custom role logic - matching the one in base44Client
      const enrichedUser = {
        ...sessionUser,
        role: sessionUser.email === 'solargearlrd@gmail.com' ? 'admin' : 'user'
      };
      
      setUser(enrichedUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      enrichUser(session?.user ?? null);
    }).catch(err => {
      console.error('Auth check error:', err);
      setIsLoadingAuth(false);
    });

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      enrichUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin: user?.role === 'admin',
      isLoadingAuth,
      isLoadingPublicSettings: false, // Mocked for compatibility
      authError,
      appPublicSettings: {}, // Mocked for compatibility
      logout,
      navigateToLogin,
      checkAppState: () => {} // Mocked for compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

