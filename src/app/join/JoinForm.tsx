'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function JoinForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  
  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Invite code is required.',
      });
      return;
    }
    // Redirect to the login page, passing the invite code as a query parameter
    router.push(`/login?inviteCode=${inviteCode.trim()}`);
  };

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
            Enter the invite code provided by your administrator to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContinue} className="space-y-4">
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
            <Button type="submit" className="w-full">
              Continue to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
