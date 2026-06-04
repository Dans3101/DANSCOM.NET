import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, FacebookAuthProvider } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../lib/firebase';

const AuthContext = createContext<{ user: User | null; loading: boolean; signInWithGoogle: () => Promise<void>; signInWithFacebook: () => Promise<void>; logOut: () => Promise<void> }>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };
  
  const signInWithFacebook = async () => {
    await signInWithPopup(auth, facebookProvider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithFacebook, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
