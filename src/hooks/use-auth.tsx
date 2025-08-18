
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onIdTokenChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ organizationId?: string } | null>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claims = tokenResult.claims;
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          organizationId: claims.organizationId as string | undefined,
          role: claims.role as 'Admin' | 'Member' | undefined,
        });

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ organizationId?: string } | null> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData = await response.json();
      return { organizationId: sessionData.organizationId };

    } catch (error) {
      console.error("Authentication error: ", error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Could not sign in with Google. Please try again.',
      });
      return null;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
