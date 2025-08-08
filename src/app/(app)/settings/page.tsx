
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-foreground">User Groups & Privileges</h4>
          <p className="text-foreground/70 text-sm mb-3">Define roles and permissions for your team members.</p>
          <Button variant="outline" size="sm">Manage Roles</Button>
        </div>

        <Separator />

        <div>
          <h4 className="text-lg font-medium text-foreground">Organization Profile</h4>
          <p className="text-foreground/70 text-sm mb-3">Update your company details, logo, and branding.</p>
          <Button variant="secondary" onClick={() => router.push('/settings/organization')}>
            Edit Profile
          </Button>
        </div>

         <Separator />

        <div>
          <h4 className="text-lg font-medium text-foreground">API & Integrations</h4>
          <p className="text-foreground/70 text-sm mb-3">Manage API keys and connect other services.</p>
          <Button variant="secondary">Manage API Keys</Button>
        </div>
      </CardContent>
    </Card>
  );
}
