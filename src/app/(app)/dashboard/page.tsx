import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, ShieldCheck } from 'lucide-react';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

const kpiData = [
  { title: "Recurrent Expenditure (YTD)", value: "₦15.2M", icon: DollarSign, change: "+5.2%" },
  { title: "Capital Expenditure (YTD)", value: "₦45.8M", icon: DollarSign, change: "+12.1%" },
  { title: "Expenses/Turnover", value: "12.5%", icon: Percent, change: "-0.5%", changeType: "down" },
  { title: "ICT Maturity Score", value: "78/100", icon: ShieldCheck, change: "+3 pts" },
];

const accessLogs = [
  { user: "John Smith", action: "logged in from", detail: "102.89.33.1", detailColor: "text-yellow-400" },
  { user: "Jane Doe", action: "updated asset", detail: "#HW-004", detailColor: "text-blue-400" },
  { user: "Super Admin", action: "created a new user profile for", detail: "'David Chen'" , detailColor: "text-green-400"},
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-foreground/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{item.value}</div>
              <p className={`text-xs ${item.changeType === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                {item.change} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <DashboardCharts />
        </div>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Access Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-sm text-foreground/70">
                    <span className="font-semibold text-foreground">{log.user}</span> {log.action} <span className={log.detailColor}>{log.detail}</span>.
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
