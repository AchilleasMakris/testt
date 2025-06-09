
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format, isWithinInterval, addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  course: string | null;
}

interface Course {
  id: string;
  name: string;
  code: string | null;
}

interface OnlineClass {
  id: string;
  class_name: string;
  professor: string;
  course_id: string | null;
  start_time: string | null;
  end_time: string | null;
  is_online: boolean | null;
  courses?: {
    name: string;
    code: string;
  };
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([fetchTasks(), fetchCourses(), fetchClasses()]).then(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .not('due_date', 'is', null);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks.",
        variant: "destructive"
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('online_classes')
        .select(`
          *,
          courses (name, code)
        `)
        .eq('user_id', user?.id)
        .not('start_time', 'is', null)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive"
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      try {
        const taskDate = parseISO(task.due_date);
        return isSameDay(taskDate, date);
      } catch {
        return false;
      }
    });
  };

  const getClassesForDate = (date: Date) => {
    return classes.filter(onlineClass => {
      if (!onlineClass.start_time) return false;
      try {
        const classDate = parseISO(onlineClass.start_time);
        return isSameDay(classDate, date);
      } catch {
        return false;
      }
    });
  };

  const getUpcomingItems = (items: any[], dateField: string) => {
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);
    
    return items.filter(item => {
      if (!item[dateField]) return false;
      try {
        const itemDate = startOfDay(parseISO(item[dateField]));
        return isWithinInterval(itemDate, { start: today, end: nextWeek });
      } catch {
        return false;
      }
    }).sort((a, b) => {
      if (!a[dateField] || !b[dateField]) return 0;
      return new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime();
    });
  };

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return 'General';
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const getCourseCode = (courseId: string | null) => {
    if (!courseId) return 'general';
    const course = courses.find(c => c.id === courseId);
    return course?.code?.toLowerCase().replace(/\s+/g, '') || 'general';
  };

  const createTaskUrl = (task: Task) => {
    const courseCode = getCourseCode(task.course);
    const taskSlug = task.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);
    return `/tasks#${courseCode}-${taskSlug}-${task.id.substring(0, 8)}`;
  };

  const createClassUrl = (onlineClass: OnlineClass) => {
    return `/classes#classid-${onlineClass.id.substring(0, 8)}`;
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white border-red-600 shadow-md hover:bg-red-600';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-600 shadow-md hover:bg-yellow-600';
      case 'low': return 'bg-green-500 text-white border-green-600 shadow-md hover:bg-green-600';
      default: return 'bg-gray-500 text-white border-gray-600 shadow-md hover:bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateClasses = selectedDate ? getClassesForDate(selectedDate) : [];
  const upcomingDeadlines = getUpcomingItems(tasks, 'due_date');
  const upcomingClasses = getUpcomingItems(classes, 'start_time');

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<CalendarIcon className="h-6 w-6 text-blue-600" />}
        title="Calendar"
        subtitle="Track your deadlines, classes and schedule"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar Widget */}
        <div className="lg:col-span-1">
          <CalendarWidget
            tasksWithDates={[
              ...tasks.map(t => ({ due_date: t.due_date })),
              ...classes.map(c => ({ due_date: c.start_time }))
            ]}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Tasks & Classes of selected day */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Tasks for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '...'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No tasks for this day</div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => navigate(createTaskUrl(task))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{getCourseName(task.course)}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {task.due_date && (
                            <span className="text-xs text-gray-500">
                              {format(parseISO(task.due_date), 'HH:mm')}
                            </span>
                          )}
                          {task.priority && (
                            <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Classes for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '...'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateClasses.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No classes for this day</div>
              ) : (
                <div className="space-y-3">
                  {selectedDateClasses.map(onlineClass => (
                    <div
                      key={onlineClass.id}
                      className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => navigate(createClassUrl(onlineClass))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{onlineClass.class_name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{onlineClass.professor}</p>
                          {onlineClass.courses && (
                            <p className="text-xs text-gray-500 mt-1">
                              Course: {onlineClass.courses.name}
                            </p>
                          )}
                          {onlineClass.start_time && (
                            <p className="text-xs text-gray-500 mt-1">
                              Time: {format(parseISO(onlineClass.start_time), 'HH:mm')}
                              {onlineClass.end_time && ` - ${format(parseISO(onlineClass.end_time), 'HH:mm')}`}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={onlineClass.is_online ? 
                            'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-blue-800' : 
                            'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-purple-800'
                          }>
                            {onlineClass.is_online ? 'Online' : 'In-Person'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Items */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No upcoming deadlines</div>
              ) : (
                upcomingDeadlines.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => navigate(createTaskUrl(task))}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{getCourseName(task.course)}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {task.due_date && (
                          <span className="text-xs text-gray-500">
                            {format(parseISO(task.due_date), 'MMM d')}
                          </span>
                        )}
                        {task.priority && (
                          <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No upcoming classes</div>
              ) : (
                upcomingClasses.slice(0, 5).map(onlineClass => (
                  <div
                    key={onlineClass.id}
                    className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => navigate(createClassUrl(onlineClass))}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{onlineClass.class_name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{onlineClass.professor}</p>
                        {onlineClass.courses && (
                          <p className="text-xs text-gray-500 mt-1">
                            Course: {onlineClass.courses.name}
                          </p>
                        )}
                        {onlineClass.start_time && (
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(onlineClass.start_time), 'MMM d, HH:mm')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={onlineClass.is_online ? 
                          'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-blue-800' : 
                          'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-purple-800'
                        }>
                          {onlineClass.is_online ? 'Online' : 'In-Person'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
