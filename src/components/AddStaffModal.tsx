
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Staff, StaffFormData } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

// This should eventually come from a central data source or API
const roles = ['Administrator', 'ICT Manager', 'Finance Officer', 'Read Only'];

interface AddStaffModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStaffAdded: () => void;
}

export function AddStaffModal({ isOpen, onOpenChange, onStaffAdded }: AddStaffModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Partial<StaffFormData>>({});
  const { user } = useAuth();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, name?: string) => {
    if (typeof e === 'string') {
       setForm(prev => ({ ...prev, [name!]: e }));
    } else {
       setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     if (!user || !user.organizationId) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be part of an organization to add staff.' });
        return;
    }
    setIsLoading(true);

    const newStaffMember: Omit<Staff, 'id'> = {
      name: form['staff-name'] || '',
      email: form['staff-email'] || '',
      position: form['staff-position'] || '',
      avatar: 'https://placehold.co/40x40', // Placeholder avatar
      joined: form['staff-date-joined'] || '',
      experience: `${form['staff-experience'] || 0} Yrs`,
      salary: Number(form['staff-salary'] || 0),
      qualificationsScore: Number(form['staff-qualifications-score'] || 0),
      bio: form['staff-bio'] || '',
      role: form['staff-role'] || 'Read Only',
    };

    try {
      const orgId = user.organizationId;
      const docRef = await addDoc(collection(db, `organizations/${orgId}/staff`), newStaffMember);
      console.log('Document written with ID: ', docRef.id);
      
      onStaffAdded();

      toast({
        title: 'Staff Member Added',
        description: 'The new staff member has been successfully added.',
      });
      onOpenChange(false);
      setForm({}); // Reset form
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add the staff member. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new staff member to the directory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-4">
                <div><Label htmlFor="staff-name">Full Name</Label><Input id="staff-name" name="staff-name" value={form['staff-name'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., John Smith" required /></div>
                <div><Label htmlFor="staff-email">Email Address</Label><Input id="staff-email" name="staff-email" type="email" value={form['staff-email'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., john.smith@example.com" required /></div>
                <div><Label htmlFor="staff-position">Position</Label><Input id="staff-position" name="staff-position" value={form['staff-position'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., IT Manager" required /></div>
                
                <div>
                  <Label htmlFor="staff-role">Role</Label>
                  <Select name="staff-role" required onValueChange={(value) => handleFormChange(value, 'staff-role')}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select a role..." /></SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div><Label htmlFor="staff-image">Profile Image</Label><Input id="staff-image" name="staff-image" type="file" className="mt-1 file:text-sm" /></div>
                <div><Label htmlFor="staff-date-joined">Date Joined</Label><Input id="staff-date-joined" name="staff-date-joined" value={form['staff-date-joined'] || ''} onChange={handleFormChange} type="date" className="mt-1" required/></div>
                <div><Label htmlFor="staff-experience">Experience (Years)</Label><Input id="staff-experience" name="staff-experience" value={form['staff-experience'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 10" /></div>
                 <div><Label htmlFor="staff-salary">Salary (NGN per month)</Label><Input id="staff-salary" name="staff-salary" value={form['staff-salary'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 1800000" /></div>
                 <div><Label htmlFor="staff-qualifications-score">Qualifications Score</Label><Input id="staff-qualifications-score" value={form['staff-qualifications-score'] || ''} onChange={handleFormChange} name="staff-qualifications-score" type="number" className="mt-1" placeholder="e.g., 88" /></div>
                <div><Label htmlFor="staff-bio">Bio</Label><Textarea id="staff-bio" name="staff-bio" value={form['staff-bio'] || ''} onChange={handleFormChange} className="mt-1" rows={3} placeholder="Brief biography or description of the staff member's role." required /></div>
                <div><Label htmlFor="staff-prev-experience-image">Previous Experience Image</Label><Input id="staff-prev-experience-image" name="staff-prev-experience-image" type="file" className="mt-1 file:text-sm" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-6">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Staff Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
