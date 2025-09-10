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
import type { Staff, StaffFormData } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/app/(app)/layout';

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
  const [form, setForm] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { refreshData } = useData();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, name?: string) => {
    if (typeof e === 'string') {
       setForm(prev => ({ ...prev, [name!]: e }));
    } else {
      if (e.target.type === 'file') {
        const file = (e.target as HTMLInputElement).files?.[0];
        setImageFile(file || null);
      } else {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newStaffData = {
      name: form['staff-name'] || '',
      position: form['staff-position'] || '',
      joined_date: form['staff-date-joined'] || '',
      experience: Number(form['staff-experience'] || 0),
      salary: Number(form['staff-salary'] || 0),
      qualifications_score: Number(form['staff-qualifications-score'] || 0),
      bio: form['staff-bio'] || '',
      // Note: user creation and role assignment might need separate handling
      // depending on your auth system
    };

    try {
      // Add the new staff member to the database via our API
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStaffData),
        cache: 'no-store',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add staff member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // The response body wasn't valid JSON, so we'll stick with the default error message.
          console.error("Could not parse error response JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      refreshData();
      onStaffAdded();

      toast({
        title: 'Staff Member Added',
        description: 'The new staff member has been successfully added.',
      });
      onOpenChange(false);
      setForm({}); // Reset form
      setImageFile(null);
    } catch (error) {
      console.error('Error adding staff member:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add the staff member: ${errorMessage}`,
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

                <div><Label htmlFor="staff-image">Profile Image</Label><Input id="staff-image" name="staff-image" type="file" onChange={handleFormChange} className="mt-1 file:text-sm" /></div>
                <div><Label htmlFor="staff-date-joined">Date Joined</Label><Input id="staff-date-joined" name="staff-date-joined" value={form['staff-date-joined'] || ''} onChange={handleFormChange} type="date" className="mt-1" required/></div>
                <div><Label htmlFor="staff-experience">Experience (Years)</Label><Input id="staff-experience" name="staff-experience" value={form['staff-experience'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 10" /></div>
                 <div><Label htmlFor="staff-salary">Salary (NGN per month)</Label><Input id="staff-salary" name="staff-salary" value={form['staff-salary'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 1800000" /></div>
                 <div><Label htmlFor="staff-qualifications-score">Qualifications Score</Label><Input id="staff-qualifications-score" value={form['staff-qualifications-score'] || ''} onChange={handleFormChange} name="staff-qualifications-score" type="number" className="mt-1" placeholder="e.g., 88" /></div>
                <div><Label htmlFor="staff-bio">Bio</Label><Textarea id="staff-bio" name="staff-bio" value={form['staff-bio'] || ''} onChange={handleFormChange} className="mt-1" rows={3} placeholder="Brief biography or description of the staff member's role." required /></div>
                <div><Label htmlFor="staff-prev-experience-image">Previous Experience Image</Label><Input id="staff-prev-experience-image" name="staff-prev-experience-image" type="file" onChange={handleFormChange} className="mt-1 file:text-sm" /></div>
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