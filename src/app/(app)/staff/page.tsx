
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
import { db } from '@/lib/firebase';
import type { Staff } from '@/lib/types';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';


async function getStaff() {
    const staffCollection = collection(db, 'staff');
    const q = query(staffCollection, orderBy('name'));
    const staffSnapshot = await getDocs(q);
    const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
    return staffList;
}

export default async function StaffPage() {
  const staff = await getStaff();
  
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
    <Card>
      <CardHeader>
        <CardTitle>ICT Staff Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="table-header">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Qual. Score</TableHead>
              <TableHead className="w-[30%]">Bio</TableHead>
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
                <TableCell>{member.position}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.joined}</TableCell>
                <TableCell>{member.experience}</TableCell>
                <TableCell>{formatCurrency(member.salary)}</TableCell>
                <TableCell>{member.qualificationsScore}</TableCell>
                <TableCell className="whitespace-normal">{member.bio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
