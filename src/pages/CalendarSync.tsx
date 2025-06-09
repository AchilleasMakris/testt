
import React from 'react';
import { CalendarSync as CalendarSyncComponent } from '@/components/calendar/CalendarSync';

const CalendarSync: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar Synchronization</h1>
        <p className="text-gray-600 mt-1">Manage your academic and personal schedules</p>
      </div>
      <CalendarSyncComponent />
    </div>
  );
};

export default CalendarSync;
