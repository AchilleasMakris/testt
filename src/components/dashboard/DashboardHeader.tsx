
import React from 'react';
import { GraduationCap } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onCreateCourse: () => void;
  onCreateClass: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hi, {userName || 'Student'}</h1>
        <p className="text-gray-600">Let's learn something new today!</p>
      </div>
      <div className="flex items-center">
        <GraduationCap className="h-8 w-8 text-blue-600" />
      </div>
    </div>
  );
};
