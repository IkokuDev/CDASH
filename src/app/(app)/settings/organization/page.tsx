
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { OrganizationProfile, Turnover } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const ORG_PROFILE_DOC_ID = 'main_profile';

export default function OrganizationProfilePage() {
  const [profile, setProfile] = useState<Partial<OrganizationProfile>>({ name: '', address: '', turnovers: [] });
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [newTurnover, setNewTurnover] = useState({ year: '', amount: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { appUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!appUser || !appUser.organizationId) {
        setIsLoading(false);
        return;
      };
      const orgId = appUser.organizationId;
      try {
        const docRef = doc(db, `organizations/${orgId}/profile`, ORG_PROFILE_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as OrganizationProfile;
           setProfile({
            ...data,
            turnovers: data.turnovers ? data.turnovers.sort((a, b) => b.year - a.year) : []
          });
        } else {
          const orgDocRef = doc(db, 'organizations', orgId);
          const orgDocSnap = await getDoc(orgDocRef);
          if (orgDocSnap.exists()) {
             setProfile({ name: orgDocSnap.data().name, address: '', turnovers: []});
          }
        }
      } catch (error) {
        console.error("Error fetching organization profile: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load organization profile.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [appUser, toast]);


  const handleEdit = (year: number) => {
    setEditingYear(year);
  };

  const handleCancelEdit = () => {
    setEditingYear(null);
  };
  
  const handleUpdate = (year: number, newAmount: number) => {
    setProfile(prev => ({
      ...prev,
      turnovers: (prev.turnovers || []).map(t => t.year === year ? { ...t, amount: newAmount } : t)
    }));
    setEditingYear(null);
  };

  const handleAddNew = () => {
      const year = parseInt(newTurnover.year, 10);
      const amount = parseFloat(newTurnover.amount);

      if (year && amount && !(profile.turnovers || []).find(t => t.year === year)) {
          const updatedTurnovers = [...(profile.turnovers || []), { year, amount }].sort((a, b) => b.year - a.year);
          setProfile(prev => ({...prev, turnovers: updatedTurnovers}));
          setNewTurnover({ year: '', amount: '' });
      }
  };

  const handleSaveChanges = async () => {
    if (!appUser || !appUser.organizationId) return;
    const orgId = appUser.organizationId;
    setIsSaving(true);
    try {
      const docRef = doc(db, `organizations/${orgId}/profile`, ORG_PROFILE_DOC_ID);
      await setDoc(docRef, profile, { merge: true });
      toast({
        title: 'Success',
        description: 'Organization profile has been saved successfully.',
      });
    } catch (error) {
      console.error("Error saving organization profile: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save organization profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading Profile...</p>
      </div>
    );
  }


  return (
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
              <Input id="org-name" value={profile.name || ''} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-address">Address</Label>
              <Textarea id="org-address" value={profile.address || ''} onChange={(e) => setProfile(p => ({...p, address: e.target.value}))} />
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
                    <Building className="w-10 h-10 text-muted-foreground" />
                </div>
                <Button variant="outline">Change Logo</Button>
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
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead>Turnover Amount (NGN)</TableHead>
                              <TableHead className="text-right w-[120px]">Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {(profile.turnovers || []).map((t: Turnover) => (
                              <TableRow key={t.year}>
                                  <TableCell>{t.year}</TableCell>
                                  <TableCell>
                                    {editingYear === t.year ? (
                                      <Input 
                                        type="number" 
                                        defaultValue={t.amount}
                                        onBlur={(e) => handleUpdate(t.year, parseFloat(e.target.value))}
                                        className="max-w-xs"
                                      />
                                    ) : (
                                      formatCurrency(t.amount)
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {editingYear === t.year ? (
                                       <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                    ) : (
                                      <Button variant="ghost" size="sm" onClick={() => handleEdit(t.year)}>Edit</Button>
                                    )}
                                  </TableCell>
                              </TableRow>
                          ))}
                           <TableRow>
                                <TableCell>
                                    <Input
                                        placeholder="Year"
                                        type="number"
                                        value={newTurnover.year}
                                        onChange={(e) => setNewTurnover({ ...newTurnover, year: e.target.value })}
                                        className="max-w-[100px]"
                                    />
                                </TableCell>
                                <TableCell>
                                     <Input
                                        placeholder="Amount"
                                        type="number"
                                        value={newTurnover.amount}
                                        onChange={(e) => setNewTurnover({ ...newTurnover, amount: e.target.value })}
                                        className="max-w-xs"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={handleAddNew}>Add New</Button>
                                </TableCell>
                            </TableRow>
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </div>

         <div className="flex justify-end">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
          </div>
      </CardContent>
    </Card>
  );
}
