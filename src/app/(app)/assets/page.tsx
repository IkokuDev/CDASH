
import Image from 'next/image';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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
import { db } from '@/lib/firebase';
import type { Asset } from '@/lib/types';

const statusVariant = {
  'Active': 'default',
  'Maintenance': 'secondary',
  'Decommissioned': 'destructive',
} as const;

async function getAssets() {
    const assetsCollection = collection(db, 'assets');
    const q = query(assetsCollection, orderBy('name'));
    const assetsSnapshot = await getDocs(q);
    const assetsList = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    return assetsList;
}

export default async function AssetsPage() {
  const assets = await getAssets();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="table-header">
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Acquired</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} className="table-row">
                 <TableCell>
                  <Image
                    src={asset.imageUrl || 'https://placehold.co/100x100.png'}
                    alt={asset.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                    data-ai-hint="asset"
                  />
                </TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{asset.acquired}</TableCell>
                <TableCell>{formatCurrency(asset.cost)}</TableCell>
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
