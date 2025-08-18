
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Link from 'next/link';

const db = getFirestore(app);

export default function JoinForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Invite code is required.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const orgRef = doc(db, 'organizations', inviteCode.trim());
      const orgDoc = await getDoc(orgRef);

      if (!orgDoc.exists()) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      // User becomes the administrator of this new organization
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        organizationId: orgDoc.id,
        role: 'Administrator', // First user becomes admin
      });

      // Also add this admin user to the staff collection for the org
      const staffRef = doc(db, `organizations/${orgDoc.id}/staff`, user.uid);
      await setDoc(staffRef, {
        name: user.displayName || 'Admin',
        email: user.email,
        position: 'Administrator',
        role: 'Administrator',
        joined: new Date().toISOString().split('T')[0],
        avatar: user.photoURL || 'https://placehold.co/40x40',
        bio: 'Initial administrator account.',
        experience: '0 Yrs',
        salary: 0,
        qualificationsScore: 100,
      });

      toast({
        title: 'Success!',
        description: 'You have successfully joined the organization.',
      });

      // Re-trigger session creation to get new claims
      const idToken = await user.getIdToken(true); // Force refresh
      await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}` }
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error('Error joining organization: ', error);
      toast({
        variant: 'destructive',
        title: 'Join Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
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

  if (!user) {
    router.push('/login');
    return null;
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
          <CardTitle className="text-2xl">Join an Organization</CardTitle>
          <CardDescription>
            Welcome, {user.displayName}! Enter your invite code or{' '}
            <Link href="/create-organization" className="underline">create a new organization</Link>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invite-code">Organization Invite Code</Label>
              <Input
                id="invite-code"
                name="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your code here"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
