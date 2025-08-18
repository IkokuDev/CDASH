
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
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
import { db } from '@/lib/firebase';
import type { Staff } from '@/lib/types';
import { EditStaffModal } from '@/components/EditStaffModal';
import { useData } from '../layout';
import { useAuth } from '@/hooks/use-auth';


export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const { refreshData } = useData();
  const { appUser } = useAuth();


  const fetchStaff = async () => {
    if (!appUser || !appUser.organizationId) return;
    const orgId = appUser.organizationId;
    const staffCollection = collection(db, `organizations/${orgId}/staff`);
    const q = query(staffCollection, orderBy('name'));
    const staffSnapshot = await getDocs(q);
    const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
    setStaff(staffList);
  };
  
  useEffect(() => {
    fetchStaff();
  }, [appUser]);

  const handleStaffUpdated = () => {
    fetchStaff();
    refreshData();
  }

  const handleEditOpen = (member: Staff) => {
    setSelectedStaff(member);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteOpen = (member: Staff) => {
    setSelectedStaff(member);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff || !appUser || !appUser.organizationId) return;
    const orgId = appUser.organizationId;

    try {
      await deleteDoc(doc(db, `organizations/${orgId}/staff`, selectedStaff.id));
      toast({
        title: 'Staff Deleted',
        description: `${selectedStaff.name} has been removed from the directory.`,
      });
      fetchStaff(); // Refresh the list
    } catch (error) {
      console.error("Error deleting staff member: ", error);
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

  
  const formatCurrency = (value: number | string) => {
    let numericValue: number;
    if (typeof value === 'string') {
      numericValue = parseFloat(value.replace(/[^0-9.-]+/g,""));
    } else {
      numericValue = value;
    }

    if (isNaN(numericValue)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(numericValue) + '/m';
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>ICT Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Qual. Score</TableHead>
                <TableHead className="w-[30%]">Bio</TableHead>
                {appUser?.role === 'Administrator' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id} className="table-row">
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person" />
                      <AvatarFallback>{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {member.name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.joined}</TableCell>
                  <TableCell>{member.experience}</TableCell>
                  <TableCell>{formatCurrency(member.salary)}</TableCell>
                  <TableCell>{member.qualificationsScore}</TableCell>
                  <TableCell className="whitespace-normal">{member.bio}</TableCell>
                  {appUser?.role === 'Administrator' && (
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
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
