
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Terminal, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export default function LoginForm() {
  const { signInWithGoogle, loading, appUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [error] = useState(searchParams.get('error'));
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const inviteCode = searchParams.get('inviteCode');
      const result = await signInWithGoogle(inviteCode);
      
      if (result?.organizationId) {
        toast({
          title: 'Sign In Successful',
          description: "You've been successfully signed in. Redirecting...",
        });
        router.push('/dashboard');
      } else {
        // This case handles existing users without an org, or if the process fails before org assignment
        router.push('/join');
      }

    } catch (error) {
      // The useAuth hook already shows a toast on error, so we don't need another one here.
      console.error("Authentication handle error: ", error);
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return (
       <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
     )
  }

  // This handles the case where the user is already logged in but somehow lands on the login page.
  if (appUser?.organizationId) {
      router.replace('/dashboard');
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-2">Redirecting...</p>
          </div>
      );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <div className="flex items-center justify-center gap-3 mb-4">
             <div className="bg-primary p-3 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-primary-foreground h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">CDASH</h1>
          </div>
          <CardTitle className="text-2xl">Administrator Login</CardTitle>
          <CardDescription>
            Please sign in to access the ICT Central dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === 'unauthorized' && (
             <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Authorization Error</AlertTitle>
              <AlertDescription>
                You are not authorized to view this page. Please contact an administrator if you believe this is a mistake.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col space-y-4">
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
           <p className="px-8 text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our terms of service and privacy policy. If you don't have an account, you must first <Link href="/create-organization" className="underline">create an organization</Link> or get an invite code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
