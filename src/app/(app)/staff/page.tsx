import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const staff = [
  { name: 'Jane Doe', position: 'CTO', joined: '2020-05-01', experience: '15 Yrs', salary: '₦2,500,000/m' },
  { name: 'John Smith', position: 'IT Manager', joined: '2021-02-15', experience: '10 Yrs', salary: '₦1,800,000/m' },
  { name: 'David Chen', position: 'Network Engineer', joined: '2023-09-01', experience: '5 Yrs', salary: '₦950,000/m' },
  { name: 'Maria Garcia', position: 'Systems Analyst', joined: '2022-07-19', experience: '8 Yrs', salary: '₦1,200,000/m' },
];

export default function StaffPage() {
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
              <TableHead>Date Joined</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.name} className="table-row">
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>{member.joined}</TableCell>
                <TableCell>{member.experience}</TableCell>
                <TableCell>{member.salary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
