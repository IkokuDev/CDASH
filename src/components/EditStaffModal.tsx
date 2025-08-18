
'use client';

import { useState, useEffect } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Staff } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

const roles = ['Administrator', 'ICT Manager', 'Finance Officer', 'Read Only'];

interface EditStaffModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  staff: Staff;
  onStaffUpdated: () => void;
}

export function EditStaffModal({ isOpen, onOpenChange, staff, onStaffUpdated }: EditStaffModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Partial<Staff>>({});
  const { appUser } = useAuth();

  useEffect(() => {
    if (staff) {
      setForm({
        ...staff,
        experience: staff.experience.replace(/[^0-9]/g, ''), // Extract number from "X Yrs"
      });
    }
  }, [staff]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, name?: string) => {
    if (typeof e === 'string') {
       setForm(prev => ({ ...prev, [name!]: e }));
    } else {
       setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!staff || !appUser || !appUser.organizationId) return;
    
    setIsLoading(true);

    const updatedStaffMember = {
        name: form.name,
        email: form.email,
        position: form.position,
        joined: form.joined,
        experience: `${form.experience || 0} Yrs`,
        salary: Number(form.salary || 0),
        qualificationsScore: Number(form.qualificationsScore || 0),
        bio: form.bio,
        role: form.role,
    };

    try {
      const orgId = appUser.organizationId;
      const staffDocRef = doc(db, `organizations/${orgId}/staff`, staff.id);
      await updateDoc(staffDocRef, updatedStaffMember);
      
      toast({
        title: 'Staff Member Updated',
        description: 'The staff member\\'s details have been successfully updated.',
      });
      onStaffUpdated(); // Callback to refresh the data on the parent page
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update the staff member. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Modify the details below to update the staff member's information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-4">
                <div><Label htmlFor="name">Full Name</Label><Input id="name" name="name" value={form.name || ''} onChange={handleFormChange} className="mt-1" required /></div>
                <div><Label htmlFor="email">Email Address</Label><Input id="email" name="email" value={form.email || ''} onChange={handleFormChange} className="mt-1" required /></div>
                <div><Label htmlFor="position">Position</Label><Input id="position" name="position" value={form.position || ''} onChange={handleFormChange} className="mt-1" required /></div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required onValueChange={(value) => handleFormChange(value, 'role')} value={form.role}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select a role..." /></SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div><Label htmlFor="staff-image">Profile Image</Label><Input id="staff-image" name="staff-image" type="file" className="mt-1 file:text-sm" /></div>
                <div><Label htmlFor="joined">Date Joined</Label><Input id="joined" name="joined" value={form.joined || ''} onChange={handleFormChange} type="date" className="mt-1" required/></div>
                <div><Label htmlFor="experience">Experience (Years)</Label><Input id="experience" name="experience" value={form.experience || ''} onChange={handleFormChange} type="number" className="mt-1" /></div>
                 <div><Label htmlFor="salary">Salary (NGN per month)</Label><Input id="salary" name="salary" value={form.salary || ''} onChange={handleFormChange} type="number" className="mt-1" /></div>
                 <div><Label htmlFor="qualificationsScore">Qualifications Score</Label><Input id="qualificationsScore" value={form.qualificationsScore || ''} onChange={handleFormChange} name="qualificationsScore" type="number" className="mt-1" /></div>
                <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" name="bio" value={form.bio || ''} onChange={handleFormChange} className="mt-1" rows={3} required /></div>
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
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
