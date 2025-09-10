
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import type { Asset } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const statusVariant = {
  'In Use': 'default',
  'In Repair': 'secondary',
  'Decommissioned': 'destructive',
} as const;

type AssetStatus = keyof typeof statusVariant;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const { toast } = useToast();


  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load assets. Please try again.',
      });
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  }

  const handleStatusChange = async (assetId: string, newStatus: AssetStatus) => {
    try {
      // Mock update
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
                          src={'https://placehold.co/100x100.png'}
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
                          src={'https://placehold.co/400x400.png'}
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
                <TableCell>{new Date(asset.acquired).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'In Use')}>
                          Set to In Use
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'In Repair')}>
                          Set to In Repair
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
