
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

interface AddStaffModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddStaffModal({ isOpen, onOpenChange }: AddStaffModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Connect to a backend to actually save the staff member
    console.log('Form submitted');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      toast({
        title: 'Staff Member Added',
        description: 'The new staff member has been successfully added.',
      });
      onOpenChange(false);
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
                <div><Label htmlFor="staff-name">Full Name</Label><Input id="staff-name" name="staff-name" className="mt-1" placeholder="e.g., John Smith" required /></div>
                <div><Label htmlFor="staff-position">Position</Label><Input id="staff-position" name="staff-position" className="mt-1" placeholder="e.g., IT Manager" required /></div>
                <div><Label htmlFor="staff-image">Profile Image</Label><Input id="staff-image" name="staff-image" type="file" className="mt-1 file:text-sm" /></div>
                <div><Label htmlFor="staff-date-joined">Date Joined</Label><Input id="staff-date-joined" name="staff-date-joined" type="date" className="mt-1" required/></div>
                <div><Label htmlFor="staff-experience">Experience (Years)</Label><Input id="staff-experience" name="staff-experience" type="number" className="mt-1" placeholder="e.g., 10" /></div>
                 <div><Label htmlFor="staff-salary">Salary (NGN per month)</Label><Input id="staff-salary" name="staff-salary" type="number" className="mt-1" placeholder="e.g., 1800000" /></div>
                 <div><Label htmlFor="staff-qualifications-score">Qualifications Score</Label><Input id="staff-qualifications-score" name="staff-qualifications-score" type="number" className="mt-1" placeholder="e.g., 88" /></div>
                <div><Label htmlFor="staff-bio">Bio</Label><Textarea id="staff-bio" name="staff-bio" className="mt-1" rows={3} placeholder="Brief biography or description of the staff member's role." required /></div>
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
