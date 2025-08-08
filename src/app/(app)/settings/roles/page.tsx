
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Staff } from '@/lib/types';


const definedRoles = [
  { name: 'Administrator', permissions: ['All Access'] },
  { name: 'ICT Manager', permissions: ['View Assets', 'Edit Assets', 'View Staff'] },
  { name: 'Finance Officer', permissions: ['View Reports', 'View Assets (Cost)'] },
  { name: 'Read Only', permissions: ['View Only'] },
];

async function getStaff() {
    const staffCollection = collection(db, 'staff');
    const staffSnapshot = await getDocs(staffCollection);
    const staffList = staffSnapshot.docs.map(doc => doc.data() as Staff);
    return staffList;
}


export default async function RolesPage() {
  const staff = await getStaff();
  
  const rolesWithCounts = definedRoles.map(role => {
    const userCount = staff.filter(member => member.role === role.name).length;
    return { ...role, userCount };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Groups & Privileges</CardTitle>
          <CardDescription>Manage user roles and their permissions within the application.</CardDescription>
        </div>
        <Button>Add New Role</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolesWithCounts.map((role) => (
              <TableRow key={role.name}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.userCount}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

