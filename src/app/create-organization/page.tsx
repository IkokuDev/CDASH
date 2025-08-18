
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const db = getFirestore(app);

export default function CreateOrganizationPage() {
  const { appUser, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Organization name is required.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const orgCollection = collection(db, 'organizations');
      const orgDoc = await addDoc(orgCollection, {
        name: orgName,
        createdAt: new Date(),
        createdBy: appUser?.uid,
      });

      setInviteCode(orgDoc.id);

      toast({
        title: 'Organization Created!',
        description: 'Your organization has been successfully created.',
      });
    } catch (error: any) {
      console.error('Error creating organization: ', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
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

  if (!appUser) {
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
          <CardTitle className="text-2xl">Create New Organization</CardTitle>
          <CardDescription>
            Fill out the form below to register your company and get your invite code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!inviteCode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  name="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Acme Inc."
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Get Code
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
               <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Your Invite Code</AlertTitle>
                <AlertDescription>
                  Share this code with the designated administrator. They will use it to join the organization.
                </AlertDescription>
              </Alert>
              <div className="relative">
                <Input value={inviteCode} readOnly className="pr-12 text-lg font-mono tracking-wider" />
                <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={handleCopy}>
                  {hasCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button asChild className="w-full">
                  <Link href="/join">Go to Join Page</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
