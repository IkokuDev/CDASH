
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onIdTokenChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app, db } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { useToast } from './use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: (inviteCode?: string | null) => Promise<{ organizationId?: string } | null>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        const tokenResult = await fbUser.getIdTokenResult();
        const claims = tokenResult.claims;
        
        const currentUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          organizationId: claims.organizationId as string | undefined,
          role: claims.role as 'Administrator' | 'Member' | undefined,
        };
        setAppUser(currentUser);
        setFirebaseUser(fbUser);

      } else {
        setAppUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (inviteCode?: string | null): Promise<{ organizationId?: string } | null> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      let organizationId = inviteCode;

      if (inviteCode) {
         const orgRef = doc(db, 'organizations', inviteCode);
         const orgDoc = await getDoc(orgRef);

         if (!orgDoc.exists()) {
           throw new Error('Invalid invite code. Please check and try again.');
         }

         const userRef = doc(db, 'users', fbUser.uid);
         await setDoc(userRef, {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            organizationId: orgDoc.id,
            role: 'Administrator', // First user to join via code becomes admin
         }, { merge: true });

         const staffRef = doc(db, `organizations/${orgDoc.id}/staff`, fbUser.uid);
         await setDoc(staffRef, {
            name: fbUser.displayName || 'Admin',
            email: fbUser.email,
            position: 'Administrator',
            role: 'Administrator',
            joined: new Date().toISOString().split('T')[0],
            avatar: fbUser.photoURL || `https://placehold.co/40x40.png`,
            bio: 'Initial administrator account.',
            experience: '0 Yrs',
            salary: 0,
            qualificationsScore: 100,
         }, { merge: true });
      } else {
          const userRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
              organizationId = userDoc.data()?.organizationId;
          }
      }

      // We must get a fresh token AFTER updating the user document.
      const idToken = await fbUser.getIdToken(true); 
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Session creation failed:", errorText);
        throw new Error('Failed to create session.');
      }

      const sessionData = await response.json();
      return { organizationId: sessionData.organizationId || organizationId };

    } catch (error: any) {
      console.error("Authentication error: ", error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Could not sign in with Google. Please try again.',
      });
      await firebaseSignOut(auth);
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
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, signInWithGoogle, signOut }}>
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
