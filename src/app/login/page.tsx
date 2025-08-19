
'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { appUser } = useAuth();

  useEffect(() => {
    if (appUser) {
      if (appUser.organizationId) {
        router.replace('/dashboard');
      } else {
        router.replace('/create-organization');
      }
    }
  }, [appUser, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener in useAuth will handle the redirect
    } catch (error) {
      console.error('Error during Google Sign-In: ', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to ICT Central</CardTitle>
          <CardDescription>Sign in to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
