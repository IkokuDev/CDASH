
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onIdTokenChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app, db } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { useToast } from './use-toast';
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

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
      setLoading(true);
      if (fbUser) {
        // Force refresh of token to get latest custom claims
        const tokenResult = await fbUser.getIdTokenResult(true); 
        const claims = tokenResult.claims;
        
        const currentUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          organizationId: claims.organizationId as string | undefined,
          role: claims.role as any,
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
      
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      // Scenario: New user joining with an invite code
      if (!userDoc.exists() && inviteCode) {
         const orgRef = doc(db, 'organizations', inviteCode);
         const orgDocSnap = await getDoc(orgRef);

         if (!orgDocSnap.exists()) {
           throw new Error('Invalid invite code. Please check and try again.');
         }
         const organizationId = orgDocSnap.id;
         const batch = writeBatch(db);

         // 1. Create the user document in the top-level users collection.
         batch.set(userDocRef, {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            organizationId: organizationId,
            role: 'Administrator',
            createdAt: serverTimestamp(),
         });

         // 2. Create the staff document within the organization, using the user's UID as the document ID.
         const staffRef = doc(db, `organizations/${organizationId}/staff`, fbUser.uid);
         batch.set(staffRef, {
            id: fbUser.uid, 
            name: fbUser.displayName || 'Admin User',
            email: fbUser.email,
            position: 'Administrator',
            role: 'Administrator',
            joined: new Date().toISOString().split('T')[0],
            avatar: fbUser.photoURL || `https://placehold.co/40x40.png`,
            bio: 'Initial administrator account created via invite code.',
            experience: '0 Yrs',
            salary: 0,
            qualificationsScore: 100,
         });

         await batch.commit();
      } else if (!userDoc.exists() && !inviteCode) {
        throw new Error('This account is not associated with an organization. Please use an invite code to join.');
      }
      
      const idToken = await fbUser.getIdToken(); 
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Session creation failed on server:", errorText);
        throw new Error('Failed to create session.');
      }
      
      const sessionData = await response.json();

      if (!sessionData.organizationId) {
        // This case should ideally not be hit if the above logic is correct
        await firebaseSignOut(auth);
        await fetch('/api/auth/session', { method: 'DELETE' });
        throw new Error('No organization associated with this account after sign-in.');
      }
      
      await fbUser.getIdToken(true); // Force refresh token on client to get new claims.
      
      return { organizationId: sessionData.organizationId };

    } catch (error: any) {
      console.error("Authentication error: ", error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Could not sign in with Google. Please try again.',
      });
      await firebaseSignOut(auth).catch(() => {});
      await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
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
