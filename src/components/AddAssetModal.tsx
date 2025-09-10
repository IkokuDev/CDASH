
'use client';

import { useState } from 'react';
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
import { summarizeAsset } from '@/ai/flows/asset-summary';
import { Loader2 } from 'lucide-react';
import type { Asset } from '@/lib/types';
import { useData } from '@/app/(app)/layout';

interface AddAssetModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}


export function AddAssetModal({ isOpen, onOpenChange }: AddAssetModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { refreshData } = useData();
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, name?: string) => {
    if (typeof e === 'string') {
       setForm(prev => ({ ...prev, [name!]: e }));
    } else {
       if (e.target.type === 'file') {
         const file = (e.target as HTMLInputElement).files?.[0];
         setImageFile(file || null);
       } else {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
       }
    }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newAssetData = {
        name: form['asset-name'] || '',
        summary: form['asset-summary'] || '',
        acquired: form['asset-date-acquired'] || '',
        cost: Number(form['asset-cost'] || 0),
        purpose: form['asset-purpose'] || '',
        technicalDetails: form['asset-technical-details'] || '',
        type: form['asset-type'] || 'Other',
        subCategory: form['asset-subcategory-type'] || '',
        status: 'In Use', // Default status
        recurrentExpenditure: Number(form['recurrent-exp-curr'] || 0),
    };

    try {
      // 1. Summarize asset details with AI if needed, or handle it differently.
      // For now, let's skip the AI summary to focus on DB interaction.
      // const summaryResult = await summarizeAsset(...)
      
      const assetToSave = {
          ...newAssetData,
          aiSummary: '', // Placeholder for now
          imageUrl: '', // Placeholder for now
      };

      // 2. Add the new asset to the database via our API
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetToSave),
        cache: 'no-store',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add asset';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // The response body wasn't valid JSON, so we'll stick with the default error message.
          console.error("Could not parse error response JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      refreshData();

      toast({
        title: 'Asset Added',
        description: 'The new asset has been successfully added to the inventory.',
      });
      onOpenChange(false);
      setForm({}); // Reset form
      setImageFile(null);
    } catch (error) {
      console.error('Error adding asset:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add the asset: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
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
              <div><Label htmlFor="asset-name">1. Name</Label><Input id="asset-name" name="asset-name" value={form['asset-name'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., Core Banking Application" required /></div>
              <div><Label htmlFor="asset-icon">2. Icon/Image</Label><Input id="asset-icon" name="asset-icon" type="file" onChange={handleFormChange} className="mt-1 file:text-sm" /></div>
              <div className="md:col-span-2"><Label htmlFor="asset-summary">3. Summary</Label><Textarea id="asset-summary" name="asset-summary" value={form['asset-summary'] || ''} onChange={handleFormChange} className="mt-1" rows={2} placeholder="Brief description of the asset" required /></div>
              <div><Label htmlFor="asset-date-acquired">4. Date Acquired</Label><Input id="asset-date-acquired" name="asset-date-acquired" value={form['asset-date-acquired'] || ''} onChange={handleFormChange} type="date" className="mt-1" required/></div>
              <div><Label htmlFor="asset-cost">5. Cost of Acquisition (NGN)</Label><Input id="asset-cost" name="asset-cost" type="number" value={form['asset-cost'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., 5000000" required/></div>
              <div><Label htmlFor="asset-depreciation">6. Depreciation Per Annum (%)</Label><Input id="asset-depreciation" name="asset-depreciation" type="number" value={form['asset-depreciation'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., 15" /></div>
              <div className="md:col-span-2"><Label htmlFor="asset-purpose">7. Business Purpose</Label><Input id="asset-purpose" name="asset-purpose" value={form['asset-purpose'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., Customer transaction processing" required /></div>
              <div>
                <Label htmlFor="asset-owner">8. Business Owners/Managers</Label>
                <Select name="asset-owner" onValueChange={(value) => handleFormChange(value, 'asset-owner')}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select Staff..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jane-doe">Jane Doe (CTO)</SelectItem>
                    <SelectItem value="john-smith">John Smith (IT Manager)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="recurrent-exp-prev">9. Recurrent Expenditure (p.a. previous)</Label><Input id="recurrent-exp-prev" name="recurrent-exp-prev" value={form['recurrent-exp-prev'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 250000" /></div>
              <div><Label htmlFor="recurrent-exp-curr">10. Recurrent Expenditure (p.m. current)</Label><Input id="recurrent-exp-curr" name="recurrent-exp-curr" value={form['recurrent-exp-curr'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 25000" /></div>
              <div><Label htmlFor="asset-location">11. Location/s of Deployment (Text)</Label><Input id="asset-location" name="asset-location" value={form['asset-location'] || ''} onChange={handleFormChange} className="mt-1" placeholder="e.g., Head Office Data Center" /></div>
              <div className="md:col-span-2"><Label htmlFor="asset-technical-details">12. Technical Details</Label><Textarea id="asset-technical-details" name="asset-technical-details" value={form['asset-technical-details'] || ''} onChange={handleFormChange} className="mt-1" rows={2} placeholder="e.g., Server specs, OS, dependencies" required/></div>
              <div>
                <Label htmlFor="asset-type">13. Type</Label>
                <Select name="asset-type" required onValueChange={(value) => handleFormChange(value, 'asset-type')}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select Type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Connectivity">Connectivity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                 <Label htmlFor="asset-subcategory-type">14. Sub-category Type</Label>
                <Select name="asset-subcategory-type" required onValueChange={(value) => handleFormChange(value, 'asset-subcategory-type')}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select Sub-category..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Core Application">Core Application</SelectItem>
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="ISP">ISP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div><Label htmlFor="asset-historical-cost">15. Historical Cost</Label><Input id="asset-historical-cost" name="asset-historical-cost" value={form['asset-historical-cost'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 4500000" /></div>
               <div><Label htmlFor="asset-projected-cost">16. Projected Cost</Label><Input id="asset-projected-cost" name="asset-projected-cost" value={form['asset-projected-cost'] || ''} onChange={handleFormChange} type="number" className="mt-1" placeholder="e.g., 6000000" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-6">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Asset'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}