
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import Image from 'next/image';

const turnovers = [
  { year: 2023, amount: '₦1,200,000,000' },
  { year: 2022, amount: '₦950,000,000' },
  { year: 2021, amount: '₦800,000,000' },
];

export default function OrganizationProfilePage() {
  const { toast } = useToast();
  const [orgName, setOrgName] = useState('Smart Farmers NG');
  const [orgAddress, setOrgAddress] = useState('123 Innovation Drive, Lagos, Nigeria');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrgProfile = async () => {
      try {
        const orgDocRef = doc(db, 'organization', 'profile');
        const docSnap = await getDoc(orgDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrgName(data.name || 'Smart Farmers NG');
          setOrgAddress(data.address || '123 Innovation Drive, Lagos, Nigeria');
          setLogoUrl(data.logoUrl || null);
        }
      } catch (error) {
        console.error("Error fetching organization profile:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load organization profile.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgProfile();
  }, [toast]);


  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `organization/logo/${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      setLogoUrl(downloadUrl);
      toast({
        title: 'Logo Uploaded',
        description: 'The new logo has been uploaded successfully.',
      });
    } catch (error) {
      console.error("Error uploading logo: ", error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload the logo. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const orgDocRef = doc(db, 'organization', 'profile');
        await setDoc(orgDocRef, {
            name: orgName,
            address: orgAddress,
            logoUrl: logoUrl,
        }, { merge: true });

        toast({
            title: 'Profile Updated',
            description: 'Your organization profile has been successfully saved.',
        });
    } catch(error) {
         console.error("Error saving organization profile:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save organization profile.',
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isLoading && !logoUrl) {
    return <div className="flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /> <span className="ml-2">Loading Profile...</span></div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Manage your company's details, branding, and financial information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" value={orgName} onChange={e => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Address</Label>
                <Textarea id="org-address" value={orgAddress} onChange={e => setOrgAddress(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                    <Label htmlFor="org-logo">Company Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
                           {logoUrl ? (
                             <Image src={logoUrl} alt="Organization Logo" width={80} height={80} className="rounded-lg object-contain" />
                           ) : (
                            <ImageIcon className="w-10 h-10 text-muted-foreground" />
                           )}
                        </div>
                        <div className="relative">
                            <Button type="button" variant="outline" asChild>
                                <Label htmlFor="org-logo-upload" className="cursor-pointer">
                                    <Upload className="w-4 h-4 mr-2" />
                                    <span>{isUploading ? 'Uploading...' : 'Change Logo'}</span>
                                </Label>
                            </Button>
                            <Input id="org-logo-upload" type="file" className="sr-only" onChange={handleLogoUpload} disabled={isUploading} accept="image/*" />
                        </div>
                    </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Financials</h3>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Yearly Business Turnover</CardTitle>
                    <CardDescription className="text-sm">
                        Add and manage your company's turnover for ratio calculations.
                    </CardDescription>
                </Header>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Year</TableHead>
                                <TableHead>Turnover Amount (NGN)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {turnovers.map((t) => (
                                <TableRow key={t.year}>
                                    <TableCell>{t.year}</TableCell>
                                    <TableCell>{t.amount}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-end">
                         <Button variant="outline">Add New Turnover</Button>
                    </div>
                </CardContent>
            </Card>
          </div>

           <div className="flex justify-end">
                <Button type="submit" disabled={isLoading || isUploading}>
                    {isLoading || isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Changes
                </Button>
            </div>
        </CardContent>
      </Card>
    </form>
  );
}
