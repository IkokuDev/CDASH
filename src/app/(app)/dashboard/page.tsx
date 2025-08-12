
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { db } from '@/lib/firebase';
import type { Asset, OrganizationProfile, Staff } from '@/lib/types';

const accessLogs = [
  { user: "John Smith", action: "logged in from", detail: "102.89.33.1", detailColor: "text-yellow-400" },
  { user: "Jane Doe", action: "updated asset", detail: "#HW-004", detailColor: "text-blue-400" },
  { user: "Super Admin", action: "created a new user profile for", detail: "'David Chen'" , detailColor: "text-green-400"},
];

async function getData(): Promise<{ assets: Asset[], staff: Staff[], profile: Partial<OrganizationProfile> }> {
    const assetsCollection = collection(db, 'assets');
    const assetsSnapshot = await getDocs(assetsCollection);
    const assets = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));

    const staffCollection = collection(db, 'staff');
    const staffSnapshot = await getDocs(staffCollection);
    const staff = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));

    const profileDoc = await getDoc(doc(db, 'organization', 'main_profile'));
    const profile = profileDoc.exists() ? profileDoc.data() as OrganizationProfile : { turnovers: [] };
    
    return { assets, staff, profile };
}

export default async function DashboardPage() {
  const { assets, staff, profile } = await getData();
  
  const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, ...options }).format(value);
  }
  
  const recurrentExpenditure = assets.reduce((total, asset) => total + (asset.recurrentExpenditure || 0), 0) * 12;
  const capitalExpenditure = assets.reduce((total, asset) => total + asset.cost, 0);
  const totalStaff = staff.length;
  const monthlySalaries = staff.reduce((total, member) => {
    let salary = 0;
    if (typeof member.salary === 'string') {
      // Handle existing string salaries like "₦400,000/m"
      salary = parseFloat(member.salary.replace(/[^0-9.-]+/g,""));
    } else if (typeof member.salary === 'number') {
      salary = member.salary;
    }
    return total + (isNaN(salary) ? 0 : salary);
  }, 0);

  const totalIctExpenses = capitalExpenditure + recurrentExpenditure;
  const latestTurnover = (profile.turnovers || []).sort((a, b) => b.year - a.year)[0]?.amount || 0;
  const expensesToTurnoverRatio = latestTurnover > 0 ? (totalIctExpenses / latestTurnover) * 100 : 0;

  const totalQualificationScore = staff.reduce((total, member) => total + (member.qualificationsScore || 0), 0);
  const averageIctMaturity = staff.length > 0 ? (totalQualificationScore / staff.length) : 0;


  const kpiData = [
    { title: "Recurrent Expenditure (YTD)", value: formatCurrency(recurrentExpenditure, { notation: 'compact' }), change: "+5.2%" },
    { title: "Capital Expenditure (YTD)", value: formatCurrency(capitalExpenditure, { notation: 'compact' }), change: "+12.1%" },
    { title: "Number of Staff", value: totalStaff, change: "+2 this month" },
    { title: "Monthly Salaries", value: formatCurrency(monthlySalaries, { notation: 'compact' }), change: "+3%" },
    { title: "Expenses/Turnover", value: `${expensesToTurnoverRatio.toFixed(1)}%`, change: "-0.5%", changeType: "down" },
    { title: "ICT Maturity Score", value: `${averageIctMaturity.toFixed(0)}/100`, change: "+3 pts" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className={`text-xs ${item.changeType === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                {item.change} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <DashboardCharts assets={assets} recurrentExpenditure={recurrentExpenditure} />
        </div>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Access Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-sm text-foreground/80">
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
