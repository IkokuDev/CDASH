import { Card, CardContent } from '@/components/ui/card';
import { FilePieChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center text-center py-20">
        <FilePieChart className="w-16 h-16 mx-auto text-accent mb-4" />
        <h3 className="text-xl font-bold text-foreground">Report Generation</h3>
        <p className="text-foreground/70 mt-2">
          This section will contain tools to generate and view detailed reports.
        </p>
      </CardContent>
    </Card>
  );
}
