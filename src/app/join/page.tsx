
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function JoinOrganizationPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !inviteCode.trim()) return;
    setIsLoading(true);

    console.log(`User ${appUser.uid} trying to join with code "${inviteCode}"`);
    
    // In a real app, you would:
    // 1. Call a Cloud Function or API route to validate the invite code.
    // 2. If valid, add the user to the organization's staff list.
    // 3. Set custom claims (organizationId, role) on the user.
    // 4. Force a token refresh on the client to get the new claims.
    
    setTimeout(() => {
      alert("This is a mock-up. In a real app, you'd be redirected to your dashboard now.");
      setIsLoading(false);
      router.push('/dashboard');
    }, 2000);
  };

  if (!appUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join an Organization</CardTitle>
          <CardDescription>
            Enter the invite code you received from an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Organization
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Button variant="link" onClick={() => router.push('/create-organization')}>
              Or create a new organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
