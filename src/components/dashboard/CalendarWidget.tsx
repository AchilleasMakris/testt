import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';

interface CalendarWidgetProps {
  tasksWithDates: Array<{
    due_date: string;
  }>;
  onDateSelect?: (date: Date) => void;
}

interface OnlineClass {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  is_online: boolean | null;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  tasksWithDates,
  onDateSelect
}) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<OnlineClass[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id, currentMonth]);

  const fetchClasses = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('online_classes')
        .select('id, class_name, start_time, end_time, is_online')
        .eq('user_id', user.id)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString());

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
        return;
      }

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the grid
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  // Get days from next month to fill the grid
  const endDate = new Date(monthEnd);
  const remainingDays = 6 - monthEnd.getDay();
  endDate.setDate(endDate.getDate() + remainingDays);

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date: Date) => {
    return tasksWithDates.filter(task => {
      if (!task.due_date) return false;
      try {
        return isSameDay(new Date(task.due_date), date);
      } catch {
        return false;
      }
    });
  };

  const getClassesForDate = (date: Date) => {
    return classes.filter(onlineClass => {
      if (!onlineClass.start_time) return false;
      try {
        return isSameDay(new Date(onlineClass.start_time), date);
      } catch {
        return false;
      }
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Card className="h-fit w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 py-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <CardTitle className="text-sm font-medium min-w-0 flex-shrink-0">
            {format(currentMonth, 'MMM yyyy')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="w-full">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map(day => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const hasTasks = getTasksForDate(day).length > 0;
              const hasClasses = getClassesForDate(day).length > 0;
              const dayIsToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`w-8 h-8 flex items-center justify-center text-xs rounded cursor-pointer transition-colors relative ${
                    !isCurrentMonth
                      ? 'text-gray-300 hover:bg-gray-50'
                      : dayIsToday
                      ? 'bg-black text-white hover:bg-gray-800'
                      : hasTasks || hasClasses
                      ? 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 rounded border border-blue-200 text-blue-800 hover:from-blue-200 hover:to-purple-300'
                      : isSelected
                      ? 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-blue-600 hover:from-blue-200 hover:to-purple-300'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <span className="text-xs leading-none">{format(day, 'd')}</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {hasTasks && isCurrentMonth && (
                      <div className="w-1 h-1 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full"></div>
                    )}
                    {hasClasses && isCurrentMonth && (
                      <div className="w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
