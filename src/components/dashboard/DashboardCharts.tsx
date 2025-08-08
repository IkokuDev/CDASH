
'use client';

import { Bar, BarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { Asset } from '@/lib/types';


const recurrentData = [
  { month: 'Jan', expenditure: 1.8 },
  { month: 'Feb', expenditure: 2.1 },
  { month: 'Mar', expenditure: 2.0 },
  { month: 'Apr', expenditure: 2.5 },
  { month: 'May', expenditure: 2.8 },
  { month: 'Jun', expenditure: 4.0 },
];

const chartConfig = {
  expenditure: {
    label: 'Recurrent Expenditure (₦M)',
    color: 'hsl(var(--primary))',
  },
  hardware: { label: 'Hardware', color: 'hsl(var(--chart-1))' },
  software: { label: 'Software', color: 'hsl(var(--chart-2))' },
  connectivity: { label: 'Connectivity', color: 'hsl(var(--chart-3))' },
  other: { label: 'Other', color: 'hsl(var(--chart-4))' },
};

export default function DashboardCharts({ assets }: { assets: Asset[] }) {
  const capitalDataByType = assets.reduce((acc, asset) => {
    const typeKey = asset.type.toLowerCase();
    const existingType = acc.find(item => item.name === asset.type);
    if (existingType) {
        existingType.value += asset.cost;
    } else {
        acc.push({ name: asset.type, value: asset.cost, fill: `var(--color-${typeKey})` });
    }
    return acc;
  }, [] as { name: string; value: number; fill: string }[]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Recurrent Expenditure Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={recurrentData}>
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}M`} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="expenditure" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Capital Expenditure</CardTitle>
           <CardDescription>Breakdown by category</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full"
          >
            <RechartsPieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel formatter={(value, name, props) => (
                    <div className="flex flex-col">
                        <span>{props.payload.name}</span>
                        <span className="font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value as number)}</span>
                    </div>
                )} />}
              />
              <Pie
                data={capitalDataByType}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {capitalDataByType.map((entry, index) => (
                  <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
