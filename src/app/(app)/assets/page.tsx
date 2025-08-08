import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const assets = [
  { name: 'Core Banking App', type: 'Software', acquired: '2022-01-15', cost: '₦25,000,000', status: 'Active' },
  { name: 'Mainframe Server', type: 'Hardware', acquired: '2021-11-20', cost: '₦12,500,000', status: 'Active' },
  { name: 'Fiber Optic Link', type: 'Connectivity', acquired: '2023-03-10', cost: '₦8,300,000', status: 'Active' },
  { name: 'Firewall Appliance', type: 'Hardware', acquired: '2022-08-01', cost: '₦4,000,000', status: 'Maintenance' },
  { name: 'Backup Generator', type: 'Hardware', acquired: '2020-05-12', cost: '₦7,500,000', status: 'Decommissioned' },
];

const statusVariant = {
  'Active': 'default',
  'Maintenance': 'secondary',
  'Decommissioned': 'destructive',
} as const;

export default function AssetsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="table-header">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Acquired</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.name} className="table-row">
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{asset.acquired}</TableCell>
                <TableCell>{asset.cost}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[asset.status as keyof typeof statusVariant] || 'outline'}>
                    {asset.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
