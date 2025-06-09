
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Book, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Task {
  id: string;
  title: string;
  course_name?: string;
  due_date: string | null;
}

interface UpcomingTasksSectionProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const formatTaskDateTime = (dateString: string) => {
  const date = parseISO(dateString);
  const dateFormat = format(date, 'MMM d');
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // Check if time is set (not just midnight)
  if (hours === 0 && minutes === 0) {
    return dateFormat;
  }
  
  const timeFormat = format(date, 'h:mm a');
  return `${dateFormat} at ${timeFormat}`;
};

export const UpcomingTasksSection: React.FC<UpcomingTasksSectionProps> = ({
  tasks,
  onTaskClick,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Task</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.slice(0, 2).map((task) => (
            <div key={task.id} className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100" onClick={() => onTaskClick(task)}>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                <Book className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">{task.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{task.course_name}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {task.due_date ? formatTaskDateTime(task.due_date) : 'No due date'}
                  </span>
                </div>
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
