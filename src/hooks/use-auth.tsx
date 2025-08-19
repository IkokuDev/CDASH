
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onIdTokenChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app, db } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { useToast } from './use-toast';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';

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
        const tokenResult = await fbUser.getIdTokenResult(true); // Force refresh of token and claims
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
      
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      // Scenario 1: Existing user, already has an organization
      if (userDoc.exists() && userDoc.data()?.organizationId) {
        organizationId = userDoc.data()?.organizationId;
      }
      // Scenario 2: New or existing user joining with an invite code
      else if (inviteCode) {
         const orgRef = doc(db, 'organizations', inviteCode);
         const orgDocSnap = await getDoc(orgRef);

         if (!orgDocSnap.exists()) {
           throw new Error('Invalid invite code. Please check and try again.');
         }
         organizationId = orgDocSnap.id;

         const batch = writeBatch(db);

         // Set the user document in the top-level users collection
         batch.set(userDocRef, {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            organizationId: organizationId,
            role: 'Administrator', // First user to join via code becomes admin
         }, { merge: true });

         // Set the staff document within the organization
         const staffRef = doc(db, `organizations/${organizationId}/staff`, fbUser.uid);
         batch.set(staffRef, {
            id: fbUser.uid,
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

         await batch.commit();
      }

      // We must get a fresh token AFTER updating the user document to get fresh claims.
      const idToken = await fbUser.getIdToken(true); 
      
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
      // The final organizationId comes from the session creation response
      return { organizationId: sessionData.organizationId };

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
