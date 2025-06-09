
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityData {
  name: string;
  tasks: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Activity</CardTitle>
          <CardDescription>Tasks Completed This Week</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          This Week
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                className="text-sm" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow-lg">
                        <p className="text-sm font-medium">{`${label}: ${payload[0].value} tasks`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
