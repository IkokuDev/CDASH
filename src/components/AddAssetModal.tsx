'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface AddAssetModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddAssetModal({ isOpen, onOpenChange }: AddAssetModalProps) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onOpenChange(false);
    toast({
      title: 'Asset Added',
      description: 'The new asset has been successfully added to the inventory.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new asset to the inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div><Label htmlFor="asset-name">1. Name</Label><Input id="asset-name" className="mt-1" placeholder="e.g., Core Banking Application" /></div>
              <div><Label htmlFor="asset-icon">2. Icon</Label><Input id="asset-icon" type="file" className="mt-1 file:text-sm" /></div>
              <div className="md:col-span-2"><Label htmlFor="asset-summary">3. Summary</Label><Textarea id="asset-summary" className="mt-1" rows={2} placeholder="Brief description of the asset" /></div>
              <div><Label htmlFor="asset-date-acquired">4. Date Acquired</Label><Input id="asset-date-acquired" type="date" className="mt-1" /></div>
              <div><Label htmlFor="asset-cost">5. Cost of Acquisition (NGN)</Label><Input id="asset-cost" type="number" className="mt-1" placeholder="e.g., 5000000" /></div>
              <div><Label htmlFor="asset-depreciation">6. Depreciation Per Annum (%)</Label><Input id="asset-depreciation" type="number" className="mt-1" placeholder="e.g., 15" /></div>
              <div className="md:col-span-2"><Label htmlFor="asset-purpose">7. Business Purpose</Label><Input id="asset-purpose" className="mt-1" placeholder="e.g., Customer transaction processing" /></div>
              <div>
                <Label htmlFor="asset-owner">8. Business Owners/Managers</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select Staff..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jane-doe">Jane Doe (CTO)</SelectItem>
                    <SelectItem value="john-smith">John Smith (IT Manager)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>9. Recurrent Expenditure (p.a. previous)</Label><Input type="number" className="mt-1" placeholder="e.g., 250000" /></div>
              <div><Label>10. Recurrent Expenditure (p.m. current)</Label><Input type="number" className="mt-1" placeholder="e.g., 25000" /></div>
              <div><Label>11. Location/s of Deployment (Text)</Label><Input className="mt-1" placeholder="e.g., Head Office Data Center" /></div>
              <div className="md:col-span-2"><Label>12. Technical Details</Label><Textarea className="mt-1" rows={2} placeholder="e.g., Server specs, OS, dependencies" /></div>
              <div>
                <Label>13. Type</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select Type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="connectivity">Connectivity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                 <Label>14. Sub-category Type</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select Sub-category..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core-app">Core Application</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="isp">ISP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div><Label>15. Historical Cost</Label><Input type="number" className="mt-1" placeholder="e.g., 4500000" /></div>
               <div><Label>16. Projected Cost</Label><Input type="number" className="mt-1" placeholder="e.g., 6000000" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-6">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Asset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
