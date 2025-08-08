
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building } from 'lucide-react';

const initialTurnovers = [
  { year: 2023, amount: 1200000000 },
  { year: 2022, amount: 950000000 },
  { year: 2021, amount: 800000000 },
];

export default function OrganizationProfilePage() {
  const [turnovers, setTurnovers] = useState(initialTurnovers);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [newTurnover, setNewTurnover] = useState({ year: '', amount: '' });

  const handleEdit = (year: number) => {
    setEditingYear(year);
  };

  const handleCancelEdit = () => {
    setEditingYear(null);
  };
  
  const handleUpdate = (year: number, newAmount: number) => {
    setTurnovers(turnovers.map(t => t.year === year ? { ...t, amount: newAmount } : t));
    setEditingYear(null);
  };

  const handleAddNew = () => {
      const year = parseInt(newTurnover.year, 10);
      const amount = parseFloat(newTurnover.amount);

      if (year && amount && !turnovers.find(t => t.year === year)) {
          setTurnovers([...turnovers, { year, amount }].sort((a, b) => b.year - a.year));
          setNewTurnover({ year: '', amount: '' });
      }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Profile</CardTitle>
        <CardDescription>Manage your company's details, branding, and financial information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" defaultValue="Smart Farmers NG" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-address">Address</Label>
              <Textarea id="org-address" defaultValue="123 Innovation Drive, Lagos, Nigeria" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <Label htmlFor="org-logo">Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
                    <Building className="w-10 h-10 text-muted-foreground" />
                </div>
                <Button variant="outline">Change Logo</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Financials</h3>
           <Card>
              <CardHeader>
                  <CardTitle className="text-base">Yearly Business Turnover</CardTitle>
                  <CardDescription className="text-sm">
                      Add and manage your company's turnover for ratio calculations.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead>Turnover Amount (NGN)</TableHead>
                              <TableHead className="text-right w-[120px]">Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {turnovers.map((t) => (
                              <TableRow key={t.year}>
                                  <TableCell>{t.year}</TableCell>
                                  <TableCell>
                                    {editingYear === t.year ? (
                                      <Input 
                                        type="number" 
                                        defaultValue={t.amount}
                                        onBlur={(e) => handleUpdate(t.year, parseFloat(e.target.value))}
                                        className="max-w-xs"
                                      />
                                    ) : (
                                      formatCurrency(t.amount)
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {editingYear === t.year ? (
                                       <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                    ) : (
                                      <Button variant="ghost" size="sm" onClick={() => handleEdit(t.year)}>Edit</Button>
                                    )}
                                  </TableCell>
                              </TableRow>
                          ))}
                           <TableRow>
                                <TableCell>
                                    <Input
                                        placeholder="Year"
                                        value={newTurnover.year}
                                        onChange={(e) => setNewTurnover({ ...newTurnover, year: e.target.value })}
                                        className="max-w-[100px]"
                                    />
                                </TableCell>
                                <TableCell>
                                     <Input
                                        placeholder="Amount"
                                        value={newTurnover.amount}
                                        onChange={(e) => setNewTurnover({ ...newTurnover, amount: e.target.value })}
                                        className="max-w-xs"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={handleAddNew}>Add New</Button>
                                </TableCell>
                            </TableRow>
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </div>

         <div className="flex justify-end">
              <Button>Save Changes</Button>
          </div>
      </CardContent>
    </Card>
  );
}
