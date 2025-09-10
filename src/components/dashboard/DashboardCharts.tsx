
'use client';

import { Bar, BarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell as RechartsCell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { Asset } from '@/lib/types';


const chartConfig = {
  capital: {
    label: 'Capital Expenditure',
    color: 'hsl(var(--chart-1))',
  },
  recurrent: {
    label: 'Recurrent Expenditure',
    color: 'hsl(var(--chart-2))',
  },
  hardware: { label: 'Hardware', color: 'hsl(var(--chart-1))' },
  software: { label: 'Software', color: 'hsl(var(--chart-2))' },
  connectivity: { label: 'Connectivity', color: 'hsl(var(--chart-3))' },
  other: { label: 'Other', color: 'hsl(var(--chart-4))' },
};

export default function DashboardCharts({ assets, recurrentExpenditure }: { assets: Asset[], recurrentExpenditure: number }) {
  
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
  
  const expenditureComparisonData = [
      { name: 'Capital', value: assets.reduce((acc, asset) => acc + asset.cost, 0), fill: 'var(--color-capital)' },
      { name: 'Recurrent', value: recurrentExpenditure, fill: 'var(--color-recurrent)' },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Capital vs Recurrent Expenditure</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={expenditureComparisonData} layout="vertical">
                <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(Number(value), 'NGN', { notation: 'compact' })} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                 <Bar dataKey="value" layout="vertical" radius={[4, 4, 0, 0]}>
                    {expenditureComparisonData.map((entry) => (
                        <RechartsCell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                 </Bar>
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
                        <span className="font-bold">{formatCurrency(value as number, 'NGN')}</span>
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
                  <RechartsCell key={`cell-${index}`} fill={entry.fill} />
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
