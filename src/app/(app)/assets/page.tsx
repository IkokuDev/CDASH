
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Asset } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const statusVariant = {
  'Active': 'default',
  'Maintenance': 'secondary',
  'Decommissioned': 'destructive',
} as const;

type AssetStatus = keyof typeof statusVariant;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const { toast } = useToast();
  const { appUser } = useAuth();


  const fetchAssets = async () => {
    if (!appUser || !appUser.organizationId) return;
    const orgId = appUser.organizationId;
    const assetsCollection = collection(db, `organizations/${orgId}/assets`);
    const q = query(assetsCollection, orderBy('name'));
    const assetsSnapshot = await getDocs(q);
    const assetsList = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    setAssets(assetsList);
  };

  useEffect(() => {
    fetchAssets();
  }, [appUser]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  }

  const handleStatusChange = async (assetId: string, newStatus: AssetStatus) => {
    if (!appUser || !appUser.organizationId) return;
    const orgId = appUser.organizationId;
    const assetDocRef = doc(db, `organizations/${orgId}/assets`, assetId);
    try {
      await updateDoc(assetDocRef, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Asset status has been changed to ${newStatus}.`,
      });
      fetchAssets(); // Refresh the data
    } catch (error) {
       console.error("Error updating asset status: ", error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update asset status. Please try again.',
      });
    }
  };

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} className="table-row">
                 <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button>
                        <Image
                          src={asset.imageUrl || 'https://placehold.co/100x100.png'}
                          alt={asset.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                          data-ai-hint="asset"
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                       <Image
                          src={asset.imageUrl || 'https://placehold.co/400x400.png'}
                          alt={asset.name}
                          width={200}
                          height={200}
                          className="rounded-md object-cover"
                        />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{asset.acquired}</TableCell>
                <TableCell>{formatCurrency(asset.cost)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[asset.status as AssetStatus] || 'outline'}>
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'Active')}>
                          Set to Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'Maintenance')}>
                          Set to Maintenance
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'Decommissioned')} className="text-destructive">
                          Set to Decommissioned
                        </DropdownMenuItem>
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
