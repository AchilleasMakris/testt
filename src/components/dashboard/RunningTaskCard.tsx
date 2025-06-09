
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface RunningTaskCardProps {
  pendingTasks: number;
  completedTasks: number;
}

export const RunningTaskCard: React.FC<RunningTaskCardProps> = ({
  pendingTasks,
  completedTasks,
}) => {
  const totalTasks = completedTasks + pendingTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-300 text-sm mb-1">Running Tasks</p>
            <h3 className="text-2xl font-bold mb-1">{pendingTasks}</h3>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">{completionPercentage}%</span>
              <span className="text-gray-400 text-xs">{totalTasks} Total</span>
            </div>
          </div>
          <TrendingUp className="h-6 w-6 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};
