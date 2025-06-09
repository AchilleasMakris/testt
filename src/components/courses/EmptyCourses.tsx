
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export const EmptyCourses: React.FC = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
        <p className="mt-2 text-gray-600">
          Get started by adding your first course.
        </p>
      </CardContent>
    </Card>
  );
};
