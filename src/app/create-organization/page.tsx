
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !orgName.trim()) return;
    setIsLoading(true);

    // Mock API call
    console.log(`Creating organization "${orgName}" for user ${appUser.uid}`);
    
    // In a real app, you would:
    // 1. Call a Cloud Function or API route to create the organization document.
    // 2. Create the staff document for the user with an 'Admin' role.
    // 3. Set custom claims (organizationId, role) on the user.
    // 4. Force a token refresh on the client to get the new claims.
    
    setTimeout(() => {
      // This timeout mocks the async operations.
      // After claims are set, onAuthStateChanged in use-auth would update the appUser
      // which would trigger a redirect from this page's useEffect.
      alert("This is a mock-up. In a real app, you'd be redirected to your dashboard now.");
      setIsLoading(false);
      // A real implementation would redirect after claims are updated.
      // For now, we will manually route to dashboard.
      router.push('/dashboard');
    }, 2000);
  };

  useEffect(() => {
    if (appUser?.organizationId) {
      router.replace('/dashboard');
    }
  }, [appUser, router]);

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
          <CardTitle>Create a New Organization</CardTitle>
          <CardDescription>
            Set up a new workspace for you and your team. This page should be restricted to administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
