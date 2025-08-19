
'use client';

import { useState } from 'react';
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
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome, {appUser.displayName}!</h1>
          <p className="text-muted-foreground">Let's get your organization set up.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 md:gap-8">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Create a New Organization</CardTitle>
              <CardDescription>
                Set up a new workspace for you and your team.
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
          <div className="md:col-span-2 mt-8 md:mt-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">OR</p>
              <Button variant="outline" className="w-full" onClick={() => router.push('/join')}>
                Join an Existing Organization
              </Button>
               <p className="text-xs text-muted-foreground mt-2">
                You'll need an invite code from an administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
