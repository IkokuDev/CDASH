'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function InitializationPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const isInitialized = localStorage.getItem('ict-central-initialized');
    if (isInitialized) {
      router.replace('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleActivation = () => {
    // In a real app, you'd validate the code
    setStep(2);
  };

  const handleOrgCreation = () => {
    setStep(3);
  };

  const handleAdminCreation = () => {
    if (adminName.trim()) {
      localStorage.setItem('ict-central-initialized', 'true');
      localStorage.setItem('ict-central-admin-name', adminName);
      toast({
        title: 'Setup Complete!',
        description: 'Welcome to ICT Central. Redirecting you to the dashboard.',
      });
      router.push('/dashboard');
    } else {
       toast({
        title: 'Error',
        description: 'Please enter a name for the Super Admin.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {step === 1 && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Activate CDASH</CardTitle>
            <CardDescription>Enter the activation code provided by your developer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input type="text" id="activation-code" placeholder="XXXX-XXXX-XXXX-XXXX" />
          </CardContent>
          <CardFooter>
            <Button onClick={handleActivation} className="w-full">Activate</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create Organization Profile</CardTitle>
            <CardDescription>Set up your organization's details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" placeholder="Organization Name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="org-address">Address</Label>
              <Input id="org-address" placeholder="Address" />
            </div>
            <div>
              <Label htmlFor="org-logo" className="text-sm font-medium">Organization Logo</Label>
              <Input id="org-logo" type="file" className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
            <div>
              <Label htmlFor="brand-color" className="text-sm font-medium">Brand Color</Label>
              <Input id="brand-color" type="color" className="h-12 w-full" defaultValue="#70b7ba" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleOrgCreation} className="w-full">Create Profile</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create Super Admin</CardTitle>
            <CardDescription>Create the primary administrator account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input id="admin-name" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Full Name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input id="admin-email" type="email" placeholder="Email Address" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" placeholder="Password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAdminCreation} className="w-full">Complete Setup</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
