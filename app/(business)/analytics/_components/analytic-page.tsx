'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAnalyticsData } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const chartConfig = {
  todo: {
    label: 'Todo',
    color: 'var(--chart-1)',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--chart-2)',
  },
  done: {
    label: 'Done',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

const chartData = [
  {
    project: 'testts',
    todo: 2,
    in_progress: 2,
    done: 2,
  },
  {
    project: 'project 1',
    todo: 1,
    in_progress: 0,
    done: 0,
  },
  {
    project: 'project 23',
    todo: 1,
    in_progress: 1,
    done: 1,
  },
];

const AnalyticPage = () => {
  const isMobile = useIsMobile();
  const { data, isLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: getAnalyticsData,
  });
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>This page provides an overview of your analytics data per project.</CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        {isLoading && <div>Loading...</div>}
        {!isLoading && data?.status && data.data.length === 0 && <div className="text-center text-muted-foreground">No analytics data available.</div>}
        {data?.data && (
          <ChartContainer config={chartConfig}>
            {isMobile ? (
              <div className="h-screen">
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" className="">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="project" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="todo" fill={chartConfig.todo.color} radius={5} name="Todo" />
                    <Bar dataKey="in_progress" fill={chartConfig.in_progress.color} radius={5} name="In Progress" />
                    <Bar dataKey="done" fill={chartConfig.done.color} radius={5} name="Done" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <BarChart data={data.data} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 50 }} width={800} height={400}>
                <XAxis dataKey="project" type="category" />
                <YAxis type="number" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="todo" fill={chartConfig.todo.color} name="Todo" radius={[4, 4, 0, 0]} />
                <Bar dataKey="in_progress" fill={chartConfig.in_progress.color} name="In Progress" radius={[4, 4, 0, 0]} />
                <Bar dataKey="done" fill={chartConfig.done.color} name="Done" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticPage;
