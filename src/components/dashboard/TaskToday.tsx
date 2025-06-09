
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, GraduationCap } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  course: string | null;
  course_name?: string;
  course_code?: string | null;
}

interface TaskTodayProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskToday: React.FC<TaskTodayProps> = ({ tasks, onTaskClick }) => {
  // Filter tasks for today
  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    try {
      return isToday(parseISO(task.due_date));
    } catch {
      return false;
    }
  });

  // Get the primary task (first one or most important)
  const primaryTask = todayTasks.length > 0 ? todayTasks[0] : null;

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'from-red-100 to-red-200';
      case 'medium': return 'from-yellow-100 to-orange-200';
      case 'low': return 'from-green-100 to-green-200';
      default: return 'from-blue-100 to-purple-200';
    }
  };

  const formatTaskTime = (dateString: string) => {
    const date = parseISO(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Check if time is set (not just midnight)
    if (hours === 0 && minutes === 0) {
      return 'No time set';
    }
    
    return format(date, 'h:mm a');
  };

  if (!primaryTask) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Task Today</CardTitle>
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm">No tasks for today</p>
            <p className="text-xs text-gray-400 mt-1">Enjoy your day!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Task Today</CardTitle>
        <Button variant="ghost" size="sm">
          <Calendar className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className={`bg-gradient-to-r ${getPriorityColor(primaryTask.priority)} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => onTaskClick(primaryTask)}
          >
            <div className="aspect-video bg-white rounded-lg mb-3 overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${getPriorityColor(primaryTask.priority)} flex items-center justify-center`}>
                <GraduationCap className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            <h4 className="font-medium mb-1 text-gray-800">{primaryTask.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{primaryTask.course_name || 'General'}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {primaryTask.due_date ? formatTaskTime(primaryTask.due_date) : 'No time set'}
                </span>
              </div>
              <div className="flex -space-x-1">
                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          {todayTasks.length > 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Other tasks today:</p>
              {todayTasks.slice(1, 3).map((task, index) => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded text-blue-600 flex items-center justify-center text-xs font-medium">
                    {index + 2}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">{task.title}</span>
                    {task.due_date && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatTaskTime(task.due_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  {task.priority && (
                    <Badge variant="secondary" className="text-xs">
                      {task.priority}
                    </Badge>
                  )}
                </div>
              ))}
              {todayTasks.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{todayTasks.length - 3} more tasks
                </p>
              )}
            </div>
          )}

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Go To Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
