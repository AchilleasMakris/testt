
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, addDays, parseISO, startOfDay, isWithinInterval, subDays } from 'date-fns';

interface Metrics {
  totalCourses: number;
  currentCredits: number;
  tasksCompleted: number;
  pendingTasks: number;
  gpa: number;
  attendanceRate: number;
}

interface WeeklyTaskData {
  name: string;
  tasks: number;
}

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

export const useDashboardMetrics = (userId?: string) => {
  const [loading, setLoading] = useState(true);
  const [weeklyTaskData, setWeeklyTaskData] = useState<WeeklyTaskData[]>([]);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalCourses: 0,
    currentCredits: 0,
    tasksCompleted: 0,
    pendingTasks: 0,
    gpa: 0,
    attendanceRate: 0,
  });

  const fetchAllTasks = async () => {
    if (!userId) {
      return;
    }

    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .not('due_date', 'is', null);

      if (tasksError) {
        throw tasksError;
      }

      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('user_id', userId);

      if (coursesError) {
        throw coursesError;
      }

      const tasksWithCourses = (tasks || []).map(task => {
        const course = courses?.find(c => c.id === task.course);
        return {
          ...task,
          course_name: course?.name || 'No course assigned',
          course_code: course?.code || null
        };
      });

      setAllTasks(tasksWithCourses);
    } catch (error) {
      setAllTasks([]);
    }
  };

  const fetchCourses = async () => {
    if (!userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }

      setCourseData(data || []);
      return data;
    } catch (error) {
      setCourseData([]);
      return [];
    }
  };

  const fetchWeeklyTaskData = async () => {
    if (!userId) {
      setWeeklyTaskData([
        { name: 'S', tasks: 0 },
        { name: 'M', tasks: 0 },
        { name: 'T', tasks: 0 },
        { name: 'W', tasks: 0 },
        { name: 'T', tasks: 0 },
        { name: 'F', tasks: 0 },
        { name: 'S', tasks: 0 }
      ]);
      return;
    }

    const startDate = subDays(new Date(), 6);
    
    try {
      const { data: completedTasks, error } = await supabase
        .from('tasks')
        .select('updated_at, status')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('updated_at', startDate.toISOString());

      if (error) {
        throw error;
      }

      const tasksByDay: { [key: string]: number } = {};
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        tasksByDay[dateKey] = 0;
      }

      (completedTasks || []).forEach(task => {
        if (task.updated_at) {
          try {
            const taskDate = format(parseISO(task.updated_at), 'yyyy-MM-dd');
            if (tasksByDay.hasOwnProperty(taskDate)) {
              tasksByDay[taskDate]++;
            }
          } catch {
            // Skip invalid dates
          }
        }
      });

      const chartData = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayName = format(date, 'EEEEE');
        
        chartData.push({
          name: dayName,
          tasks: tasksByDay[dateKey] || 0
        });
      }

      setWeeklyTaskData(chartData);
    } catch (error) {
      setWeeklyTaskData([
        { name: 'S', tasks: 0 },
        { name: 'M', tasks: 0 },
        { name: 'T', tasks: 0 },
        { name: 'W', tasks: 0 },
        { name: 'T', tasks: 0 },
        { name: 'F', tasks: 0 },
        { name: 'S', tasks: 0 }
      ]);
    }
  };

  const fetchUpcomingTasks = async () => {
    if (!userId) {
      return;
    }

    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (tasksError) {
        throw tasksError;
      }

      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('user_id', userId);

      if (coursesError) {
        throw coursesError;
      }

      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 7);
      
      const upcomingTasks = (tasks || []).filter(task => {
        if (!task.due_date) return false;
        try {
          const taskDate = startOfDay(parseISO(task.due_date));
          return isWithinInterval(taskDate, { start: today, end: nextWeek });
        } catch {
          return false;
        }
      });

      const tasksWithCourses = upcomingTasks.map(task => {
        const course = courses?.find(c => c.id === task.course);
        return {
          ...task,
          course_name: course?.name || 'No course assigned',
          course_code: course?.code || null
        };
      }).slice(0, 3);

      setTaskData(tasksWithCourses);
    } catch (error) {
      setTaskData([]);
    }
  };

  const fetchMetrics = async () => {
    if (!userId) {
      return;
    }

    try {
      const { count: completedCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');
      
      const { count: pendingCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');
      
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId);

      const startOfCurrentMonth = startOfWeek(new Date(), { weekStartsOn: 0 });
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('user_id', userId)
        .gte('date', startOfCurrentMonth.toISOString().split('T')[0]);
      
      let gpa = 0;
      let totalCredits = 0;
      let totalGradePoints = 0;
      
      if (coursesData && coursesData.length > 0) {
        let gradesCount = 0;
        
        coursesData.forEach(course => {
          totalCredits += course.credits || 0;
          
          if (course.grade && course.credits) {
            totalGradePoints += course.grade * course.credits;
            gradesCount += course.credits;
          }
        });
        
        if (gradesCount > 0) {
          gpa = totalGradePoints / gradesCount;
        }
      }

      let attendanceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        attendanceRate = (presentCount / attendanceData.length) * 100;
      }
      
      setMetrics({
        totalCourses: coursesData?.length || 0,
        currentCredits: totalCredits,
        tasksCompleted: completedCount || 0,
        pendingTasks: pendingCount || 0,
        gpa: gpa,
        attendanceRate: attendanceRate,
      });
    } catch (error) {
      // Set default metrics on error
      setMetrics({
        totalCourses: 0,
        currentCredits: 0,
        tasksCompleted: 0,
        pendingTasks: 0,
        gpa: 0,
        attendanceRate: 0,
      });
    }
  };

  const fetchDashboardData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      await Promise.all([
        fetchWeeklyTaskData(),
        fetchUpcomingTasks(),
        fetchAllTasks(),
        fetchCourses(),
        fetchMetrics()
      ]);
    } catch (error) {
      // Silent error handling - metrics will show defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  return {
    loading,
    weeklyTaskData,
    taskData,
    allTasks,
    courseData,
    metrics,
    refetch: fetchDashboardData
  };
};
