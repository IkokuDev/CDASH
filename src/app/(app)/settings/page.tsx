import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-foreground">User Groups & Privileges</h4>
          <p className="text-foreground/70 text-sm mb-3">Define roles for your team.</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="bg-accent text-accent-foreground">Admins</Badge>
            <Badge variant="secondary">Viewers</Badge>
            <Badge variant="secondary">Editors</Badge>
            <Button variant="outline" size="sm">Manage Roles</Button>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-lg font-medium text-foreground">Organization Profile</h4>
          <p className="text-foreground/70 text-sm mb-3">Update your company details.</p>
          <Button variant="secondary">Edit Profile</Button>
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
