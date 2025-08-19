
'use client';
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
import type { Staff } from '@/lib/types';
import { useEffect, useState } from 'react';


const definedRoles = [
  { name: 'Administrator', permissions: ['All Access'] },
  { name: 'ICT Manager', permissions: ['View Assets', 'Edit Assets', 'View Staff'] },
  { name: 'Finance Officer', permissions: ['View Reports', 'View Assets (Cost)'] },
  { name: 'Read Only', permissions: ['View Only'] },
];

const MOCK_ORG_ID = 'mock-organization-id'; // Placeholder

export default function RolesPage() {
    const [staff, setStaff] = useState<Staff[]>([]);

    useEffect(() => {
        async function getStaff() {
            const orgId = MOCK_ORG_ID;
            try {
              // Data fetching logic removed
              setStaff([]);
            } catch(e) {
              console.warn("Could not fetch staff. This is expected if Firestore is not set up.", e);
            }
        }
        getStaff();
    }, []);

  
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
