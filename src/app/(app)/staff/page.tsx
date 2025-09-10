'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { MoreHorizontal } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Staff } from '@/lib/types';
import { EditStaffModal } from '@/components/EditStaffModal';
import { useData } from '@/components/ClientLayout';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { toast } = useToast();

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const staffData = await response.json();
        setStaff(staffData);
      } else {
        console.error('Failed to fetch staff');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load staff data.',
        });
      }
    } catch (error) {
      console.error("Could not fetch staff:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load staff data.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch staff data on component mount and when refreshData changes
  useEffect(() => {
    fetchStaff();
  }, []); // Remove refreshData dependency since it's causing issues

  // Listen for refresh events from the layout
  useEffect(() => {
    const handleRefresh = () => {
      fetchStaff();
    };
    
    // Custom event listener approach
    window.addEventListener('staff-refresh', handleRefresh);
    return () => window.removeEventListener('staff-refresh', handleRefresh);
  }, []);

  const handleStaffUpdated = () => {
    fetchStaff();
  }

  const handleEditOpen = (member: any) => {
    setSelectedStaff(member);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteOpen = (member: any) => {
    setSelectedStaff(member);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;

    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Staff Deleted',
          description: `${selectedStaff.name} has been removed from the directory.`,
        });
        fetchStaff(); // Refresh the list
      } else {
        throw new Error('Failed to delete staff member');
      }
    } catch (error) {
      console.error("Error deleting staff member:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete staff member. Please try again.',
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setSelectedStaff(null);
    }
  };

  const formatStaffSalary = (value: number | string) => {
    let numericValue: number;
    if (typeof value === 'string') {
      numericValue = parseFloat(value.replace(/[^0-9.-]+/g,""));
    } else {
      numericValue = value;
    }

    if (isNaN(numericValue)) {
      return 'N/A';
    }
    return formatCurrency(numericValue, 'NGN') + '/m';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ICT Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div>Loading staff data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>ICT Staff Directory ({staff.length} members)</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff members found. Add your first staff member using the button above.
            </div>
          ) : (
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Qual. Score</TableHead>
                  <TableHead className="w-[30%]">Bio</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id} className="table-row">
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {member.name}
                    </TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>{formatDate(member.joined_date)}</TableCell>
                    <TableCell>{member.experience} years</TableCell>
                    <TableCell>{formatStaffSalary(member.salary)}</TableCell>
                    <TableCell>{member.qualifications_score}</TableCell>
                    <TableCell className="whitespace-normal">{member.bio}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditOpen(member)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteOpen(member)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {selectedStaff && (
        <EditStaffModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          staff={selectedStaff}
          onStaffUpdated={handleStaffUpdated}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member{' '}
              <span className="font-bold">{selectedStaff?.name}</span> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}