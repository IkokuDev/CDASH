'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function InitializationPage() {
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4">Loading application...</p>
    </div>
  );
}
