
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  appUser: AppUser | null;
  loading: boolean;
  setAppUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setLoading(true);
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const claims = idTokenResult.claims;
          
          setAppUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            organizationId: claims.organizationId as string | undefined,
            role: claims.role as 'Admin' | 'Member' | undefined,
          });

        } catch (error) {
          console.error("Error fetching user claims, signing out.", error);
          await auth.signOut();
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ appUser, loading, setAppUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
