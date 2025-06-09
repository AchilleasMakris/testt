import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PieChartIcon, BarChart3, CheckCircle2, XCircle, ArrowUpCircle, ArrowDownCircle, Download, TrendingUp, Calendar, Users, Activity } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TierBadge } from '@/components/tier/TierBadge';
interface Course {
  id: string;
  name: string;
  grade: number | null;
  credits: number | null;
  year: string | null;
}
interface Task {
  id: string;
  title: string;
  status: string | null;
  due_date: string | null;
  course: string | null;
  created_at: string;
}
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
const Statistics: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    tierData,
    loading: tierLoading
  } = useUserTier();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('all-time');
  const isPremiumUser = tierData?.user_tier === 'premium' || tierData?.user_tier === 'university';
  useEffect(() => {
    if (user) {
      Promise.all([fetchCourses(), fetchTasks(), fetchNotes(), fetchAttendance()]).then(() => {
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load statistics data.",
          variant: "destructive"
        });
        setLoading(false);
      });
    }
  }, [user, timeframe, selectedYear]);
  const fetchCourses = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('courses').select('*').eq('user_id', user?.id);
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };
  const getDateFilter = () => {
    const now = new Date();
    switch (timeframe) {
      case 'fall':
        const fallStart = new Date(now.getFullYear(), 8, 1); // September 1st
        const fallEnd = new Date(now.getFullYear(), 11, 31); // December 31st
        return { start: fallStart.toISOString(), end: fallEnd.toISOString() };
      case 'spring':
        const springStart = new Date(now.getFullYear(), 0, 1); // January 1st
        const springEnd = new Date(now.getFullYear(), 4, 31); // May 31st
        return { start: springStart.toISOString(), end: springEnd.toISOString() };
      case 'summer':
        const summerStart = new Date(now.getFullYear(), 5, 1); // June 1st
        const summerEnd = new Date(now.getFullYear(), 7, 31); // August 31st
        return { start: summerStart.toISOString(), end: summerEnd.toISOString() };
      default:
        return null;
    }
  };

  const fetchTasks = async () => {
    try {
      let query = supabase.from('tasks').select('*').eq('user_id', user?.id);
      
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };

  const fetchNotes = async () => {
    try {
      let query = supabase.from('notes').select('*').eq('user_id', user?.id);
      
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  };

  const fetchAttendance = async () => {
    try {
      let query = supabase.from('attendance').select(`
        *,
        courses!attendance_course_id_fkey (
          id,
          name,
          code
        )
      `).eq('user_id', user?.id);
      
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('date', dateFilter.start.split('T')[0]).lte('date', dateFilter.end.split('T')[0]);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  };
  const getFilteredCoursesByYear = () => {
    if (selectedYear === 'all') return courses;
    return courses.filter(course => course.year === selectedYear);
  };

  const getFilteredTasksByYear = () => {
    const filteredCourses = getFilteredCoursesByYear();
    const courseIds = filteredCourses.map(c => c.id);
    if (selectedYear === 'all') return tasks;
    return tasks.filter(task => courseIds.includes(task.course));
  };

  const getFilteredNotesByYear = () => {
    const filteredCourses = getFilteredCoursesByYear();
    const courseIds = filteredCourses.map(c => c.id);
    if (selectedYear === 'all') return notes;
    return notes.filter(note => courseIds.includes(note.course));
  };

  const getFilteredAttendanceByYear = () => {
    const filteredCourses = getFilteredCoursesByYear();
    const courseIds = filteredCourses.map(c => c.id);
    if (selectedYear === 'all') return attendance;
    return attendance.filter(att => courseIds.includes(att.course_id));
  };

  const calculateAdvancedMetrics = () => {
    const filteredTasks = getFilteredTasksByYear();
    const filteredNotes = getFilteredNotesByYear();
    const filteredAttendance = getFilteredAttendanceByYear();
    
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const taskProgress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
    
    const filteredCourses = getFilteredCoursesByYear();
    const averageGrade = filteredCourses.length > 0 ? filteredCourses.reduce((sum, course) => sum + (course.grade || 0), 0) / filteredCourses.length : 0;
    const totalClasses = filteredCourses.length;
    
    // Calculate attendance percentage
    const totalAttendance = filteredAttendance.length;
    const presentAttendance = filteredAttendance.filter(att => att.status === 'present' || att.status === 'late').length;
    const attendancePercentage = totalAttendance > 0 ? Math.round(presentAttendance / totalAttendance * 100) : 0;
    
    return {
      totalTasks: `${completedTasks}/${totalTasks}`,
      assignmentAverage: averageGrade.toFixed(1),
      totalClasses,
      taskProgress,
      averageGrade,
      attendancePercentage,
      totalNotes: filteredNotes.length
    };
  };
  const getActivityData = () => {
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = { tasks: 0, notes: 0, attendance: 0 };
    });
    
    // Count tasks by month
    tasks.forEach(task => {
      if (task.created_at) {
        const month = months[new Date(task.created_at).getMonth()];
        monthlyData[month].tasks++;
      }
    });
    
    // Count notes by month
    notes.forEach(note => {
      if (note.created_at) {
        const month = months[new Date(note.created_at).getMonth()];
        monthlyData[month].notes++;
      }
    });
    
    // Count attendance by month
    attendance.forEach(att => {
      if (att.date) {
        const month = months[new Date(att.date).getMonth()];
        monthlyData[month].attendance++;
      }
    });
    
    return months.map(month => ({
      month,
      tasks: monthlyData[month].tasks,
      notes: monthlyData[month].notes,
      attendance: monthlyData[month].attendance
    }));
  };
  const handleExport = () => {
    if (!isPremiumUser) {
      toast({
        title: "Premium Feature",
        description: "Export functionality is available for Premium and University users.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Export Started",
      description: "Your analytics report is being generated..."
    });
  };

  // Calculate GPA using Greek grading system (0-10 scale)
  const calculateGPA = () => {
    if (!courses.length) return "0.0";
    let totalWeightedGrade = 0;
    let totalCredits = 0;
    courses.forEach(course => {
      if (course.grade !== null && course.credits !== null) {
        totalWeightedGrade += course.grade * course.credits;
        totalCredits += course.credits;
      }
    });
    return totalCredits > 0 ? (totalWeightedGrade / totalCredits).toFixed(1) : "0.0";
  };

  // Get unique years from courses
  const getAvailableYears = () => {
    const years = [...new Set(courses.map(course => course.year).filter(Boolean))];
    return years.sort();
  };

  // Attendance statistics
  const getAttendanceStatusData = () => {
    const filteredAttendance = getFilteredAttendanceByYear();
    const statusCounts: Record<string, number> = {
      'present': 0,
      'late': 0,
      'absent': 0,
      'excused': 0
    };
    
    filteredAttendance.forEach(att => {
      if (att.status) {
        statusCounts[att.status] = (statusCounts[att.status] || 0) + 1;
      }
    });

    // Filter out 0% entries
    return Object.keys(statusCounts).filter(key => statusCounts[key] > 0).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: statusCounts[key]
    }));
  };

  // Task statistics
  const getTaskStatusData = () => {
    const filteredTasks = getFilteredTasksByYear();
    const statusCounts: Record<string, number> = {
      'completed': 0,
      'pending': 0,
      'in-progress': 0
    };
    filteredTasks.forEach(task => {
      if (task.status) {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      } else {
        statusCounts['pending'] = (statusCounts['pending'] || 0) + 1;
      }
    });

    // Filter out 0% entries
    return Object.keys(statusCounts).filter(key => statusCounts[key] > 0).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: statusCounts[key]
    }));
  };

  // Course attendance percentage
  const getCourseAttendanceData = () => {
    const filteredCourses = getFilteredCoursesByYear();
    return filteredCourses.map(course => {
      const courseAttendance = attendance.filter(att => att.course_id === course.id);
      const total = courseAttendance.length;
      const present = courseAttendance.filter(att => att.status === 'present' || att.status === 'late').length;
      const percentage = total > 0 ? Math.round(present / total * 100) : 0;
      
      return {
        name: course.name,
        attendance: percentage
      };
    });
  };

  // Study productivity data  
  const getStudyProductivityData = () => {
    const filteredNotes = getFilteredNotesByYear();
    const monthlyNotes = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => monthlyNotes[month] = 0);
    
    filteredNotes.forEach(note => {
      if (note.created_at) {
        const month = months[new Date(note.created_at).getMonth()];
        monthlyNotes[month]++;
      }
    });
    
    return months.map(month => ({
      month,
      notes: monthlyNotes[month]
    }));
  };

  // Get filtered task completion data
  const getFilteredTaskCompletionData = () => {
    const filteredTasks = getFilteredTasksByYear();
    const data = [{
      name: 'Completed',
      count: filteredTasks.filter(task => task.status === 'completed').length
    }, {
      name: 'In Progress',
      count: filteredTasks.filter(task => task.status === 'in-progress').length
    }, {
      name: 'Pending',
      count: filteredTasks.filter(task => task.status === 'pending' || !task.status).length
    }];

    // Filter out entries with 0 count
    return data.filter(item => item.count > 0);
  };
  if (loading || tierLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>;
  }
  const metrics = calculateAdvancedMetrics();
  if (!isPremiumUser) {
    return <div className="space-y-6 p-4 md:p-6">
        <PageHeader icon={<BarChart3 className="h-6 w-6 text-blue-600" />} title="Statistics" subtitle="Track your academic progress" />
        
        <Card className="p-6 md:p-8 text-center">
          <div className="max-w-md mx-auto">
            <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Advanced Analytics</h2>
            <p className="text-gray-600 mb-6">
              Unlock detailed insights, progress tracking, and advanced analytics with a Premium or University subscription.
            </p>
            <div className="flex justify-center mb-4">
              <TierBadge tier={tierData?.user_tier || 'free'} size="lg" />
            </div>
            <Button size="lg" className="w-full">
              Upgrade to Premium
            </Button>
          </div>
        </Card>
      </div>;
  }
  return <div className="space-y-6 p-4 md:p-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-100 via-blue-200 to-indigo-200 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Advanced Analytics</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Comprehensive insights into your academic performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <TierBadge tier={tierData?.user_tier || 'premium'} />
          
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-700">Timeframe:</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All-Time</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-700">Year:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {getAvailableYears().map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Layout: Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Side: 6 Metric Cards in Responsive Grid */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {/* Total Tasks Card */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">Total Tasks</p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 text-gray-900">{metrics.totalTasks}</h3>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Average Grade Card */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">Assignment Av. Grade</p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 text-gray-900">{metrics.assignmentAverage}</h3>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-green-500 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Classes Card */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">Total Classes</p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 text-gray-900">{metrics.totalClasses}</h3>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-purple-500 rounded-2xl flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Progress Card */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">Assignment Progress</p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 text-gray-900">{metrics.taskProgress}%</h3>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 lg:h-2.5 mt-2">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{
                      width: `${metrics.taskProgress}%`
                    }}></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-indigo-500 rounded-2xl flex items-center justify-center ml-3">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Percentage Card */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">Attendance Rate</p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 text-gray-900">{metrics.attendancePercentage}%</h3>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 lg:h-2.5 mt-2">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{
                      width: `${metrics.attendancePercentage}%`
                    }}></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-cyan-500 rounded-2xl flex items-center justify-center ml-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Notes Card */}
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">Study Notes</p>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mt-1 text-gray-900">{metrics.totalNotes}</h3>
                    <div className="mt-2 h-6 sm:h-8 lg:h-10" style={{
                    width: '100%'
                  }}>
                      <LineChart width={80} height={window.innerWidth >= 1024 ? 40 : window.innerWidth >= 640 ? 32 : 24} data={getStudyProductivityData().slice(-6)}>
                        <Line type="monotone" dataKey="notes" stroke="#f97316" strokeWidth={2} dot={false} />
                      </LineChart>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-orange-500 rounded-2xl flex items-center justify-center ml-3">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side: Activity Chart - Wider */}
        <div className="xl:col-span-2">
          <Card className="h-full rounded-3xl border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-lg md:text-xl">Activity</span>
                <Select defaultValue="month">
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
                <BarChart data={getActivityData()}>
                  <XAxis dataKey="month" tick={{
                  fontSize: 12
                }} axisLine={false} tickLine={false} />
                  <YAxis tick={{
                  fontSize: 12
                }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Charts */}
      <Tabs defaultValue="tasks">
        <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks Analysis</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance Stats</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs sm:text-sm">Course Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Task Status Distribution</CardTitle>
                <CardDescription className="text-sm">
                  Breakdown of your tasks by completion status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie data={getTaskStatusData()} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                    name,
                    percent
                  }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {getTaskStatusData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Study Productivity</CardTitle>
                <CardDescription className="text-sm">
                  Monthly notes created over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <LineChart data={getStudyProductivityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="notes" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Attendance Status Distribution</CardTitle>
                <CardDescription className="text-sm">
                  Breakdown of your attendance by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie data={getAttendanceStatusData()} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                    name,
                    percent
                  }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {getAttendanceStatusData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Course Attendance Rates</CardTitle>
                <CardDescription className="text-sm">
                  Attendance percentage by course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={getCourseAttendanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <div className="grid grid-cols-1 gap-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Course Grades (Greek System: 0-10)</CardTitle>
                <CardDescription className="text-sm">
                  Visual representation of your grades across all courses using the Greek grading system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getFilteredCoursesByYear().length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <XCircle className="h-12 w-12 text-gray-400" />
                    <p className="mt-2">No course data available</p>
                  </div> : <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
                    <BarChart data={getFilteredCoursesByYear().map(course => ({ name: course.name, grade: course.grade || 0 }))} margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="grade" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">GPA Overview</CardTitle>
                  <CardDescription className="text-sm">
                    Your current GPA using the Greek grading system (0-10)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl md:text-3xl font-bold">{calculateGPA()}</span>
                        </div>
                        <div className="h-32 w-32 md:h-48 md:w-48 rounded-full border-8 border-blue-100">
                          <div className="h-full w-full rounded-full border-8" style={{
                          borderColor: parseFloat(calculateGPA()) >= 5.0 ? '#4ade80' : '#f87171',
                          borderTopColor: 'transparent',
                          transform: 'rotate(45deg)'
                        }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      {parseFloat(calculateGPA()) >= 5.0 ? <div className="flex items-center text-green-600">
                          <ArrowUpCircle className="h-5 w-5 mr-1" />
                          <span className="text-sm">Passing Grade</span>
                        </div> : <div className="flex items-center text-red-600">
                          <ArrowDownCircle className="h-5 w-5 mr-1" />
                          <span className="text-sm">Below Passing</span>
                        </div>}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Greek System: 5.0+ = Pass</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Credit Distribution</CardTitle>
                  <CardDescription className="text-sm">
                    Breakdown of credits by course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getFilteredCoursesByYear().length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <XCircle className="h-12 w-12 text-gray-400" />
                      <p className="mt-2">No course data available</p>
                    </div> : <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                      <PieChart>
                        <Pie data={getFilteredCoursesByYear().filter(course => course.credits !== null).map(course => ({
                      name: course.name,
                      value: course.credits || 0
                    }))} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                      name,
                      percent
                    }) => {
                      const courseName = String(name);
                      return `${courseName.substring(0, 10)}${courseName.length > 10 ? '...' : ''}: ${(percent * 100).toFixed(0)}%`;
                    }}>
                          {getFilteredCoursesByYear().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Statistics;