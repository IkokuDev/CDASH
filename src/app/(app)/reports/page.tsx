
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { generateReport, ReportGenerationInput } from '@/ai/flows/report-generation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Asset, Staff } from '@/lib/types';

const assetTypes = ['Software', 'Hardware', 'Connectivity', 'Other'];

export default function ReportsPage() {
  const [report, setReport] = useState<string | null>(null);
  const [reportName, setReportName] = useState<string>('Generated Report');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const assetsCollection = collection(db, 'assets');
        const assetsSnapshot = await getDocs(assetsCollection);
        const assetsList = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        setAssets(assetsList);

        const staffCollection = collection(db, 'staff');
        const staffSnapshot = await getDocs(staffCollection);
        const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
        setStaff(staffList);
      } catch (error) {
        console.error("Error fetching data for reports: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load necessary data for report generation.',
        });
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setReport(null);

    const formData = new FormData(e.currentTarget);
    const selectedAssetTypes = assetTypes.filter(type => formData.has(type));
    const currentReportName = formData.get('reportName') as string;
    setReportName(currentReportName || 'Generated Report');

    const input: ReportGenerationInput = {
      reportName: currentReportName,
      reportType: formData.get('reportType') as string,
      dateFrom: formData.get('dateFrom') as string,
      dateTo: formData.get('dateTo') as string,
      assetTypes: selectedAssetTypes,
      staffDetails: formData.get('staffDetails') as string,
      additionalNotes: formData.get('additionalNotes') as string,
      assetData: JSON.stringify(assets, null, 2),
      staffData: JSON.stringify(staff, null, 2),
    };

    try {
      const result = await generateReport(input);
      setReport(result.report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Fill in the form below to generate a new report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input id="reportName" name="reportName" placeholder="e.g., Q3 Asset Performance" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select name="reportType" required>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comprehensive Asset Analysis">Comprehensive Asset Analysis</SelectItem>
                  <SelectItem value="Expenditure Overview">Expenditure Overview</SelectItem>
                  <SelectItem value="Staff and Asset Allocation">Staff & Asset Allocation</SelectItem>
                  <SelectItem value="ICT Maturity & Recommendations">ICT Maturity & Recommendations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From</Label>
                <Input id="dateFrom" name="dateFrom" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To</Label>
                <Input id="dateTo" name="dateTo" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Asset Types to Include</Label>
              <div className="grid grid-cols-2 gap-2">
                {assetTypes.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox id={type} name={type} />
                    <Label htmlFor={type} className="font-normal">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffDetails">Staff Details</Label>
              <Textarea
                id="staffDetails"
                name="staffDetails"
                placeholder="Specify staff to include or leave blank for all..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                placeholder="e.g., Focus on decommissioned assets, include projected costs..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading || isDataLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : isDataLoading ? (
                 <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Data...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{reportName}</CardTitle>
            <CardDescription>
              The AI-generated report will appear below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
                <h3 className="text-xl font-bold text-foreground">Generating your report...</h3>
                <p className="text-foreground/70 mt-2">
                  The AI is analyzing the data. This may take a moment.
                </p>
              </div>
            )}
            {!isLoading && !report && (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <FileText className="w-16 h-16 mx-auto text-accent mb-4" />
                <h3 className="text-xl font-bold text-foreground">Ready to Start</h3>
                <p className="text-foreground/70 mt-2">
                  Your generated report will be displayed here.
                </p>
              </div>
            )}
            {report && (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br />') }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
