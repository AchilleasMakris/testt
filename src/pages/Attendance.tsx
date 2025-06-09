import React from 'react';
import { AttendanceTracker } from '@/components/attendance/AttendanceTracker';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserCheck } from 'lucide-react';

const Attendance: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<UserCheck className="h-6 w-6 text-blue-600" />}
        title="Attendance Tracker"
        subtitle="Track and manage your class attendance"
      />
      <AttendanceTracker />
    </div>
  );
};

export default Attendance;
