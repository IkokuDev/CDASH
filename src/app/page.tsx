
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function InitializationPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (appUser) {
        if (appUser.organizationId) {
          router.replace('/dashboard');
        } else {
          router.replace('/join');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [appUser, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
