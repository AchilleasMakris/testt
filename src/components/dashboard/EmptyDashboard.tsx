
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, GraduationCap } from 'lucide-react';

interface EmptyDashboardProps {
  onNavigateToCourses: () => void;
}

export const EmptyDashboard: React.FC<EmptyDashboardProps> = ({ onNavigateToCourses }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome! Let's set up your academic dashboard.</p>
        </div>
      </div>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-6">
            <AlertCircle className="h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your dashboard is empty</h2>
            <p className="text-gray-600 mb-6">
              Start by adding your courses to see your academic progress here.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={onNavigateToCourses} className="bg-blue-600 hover:bg-blue-700">
                <GraduationCap className="mr-2 h-4 w-4" /> Add Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
