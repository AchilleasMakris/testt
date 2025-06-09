
import React from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { LayoutDashboard, Award, BookOpen } from 'lucide-react';
import { useDashboardMetrics } from '@/components/dashboard/DashboardMetrics';

// Lazy load components to improve initial load time
const ActivityChart = React.lazy(() => import('@/components/dashboard/ActivityChart').then(module => ({ default: module.ActivityChart })));
const RunningTaskCard = React.lazy(() => import('@/components/dashboard/RunningTaskCard').then(module => ({ default: module.RunningTaskCard })));
const OnlineClassesSection = React.lazy(() => import('@/components/dashboard/OnlineClassesSection').then(module => ({ default: module.OnlineClassesSection })));
const UpcomingTasksSection = React.lazy(() => import('@/components/dashboard/UpcomingTasksSection').then(module => ({ default: module.UpcomingTasksSection })));
const CalendarWidget = React.lazy(() => import('@/components/dashboard/CalendarWidget').then(module => ({ default: module.CalendarWidget })));
const TaskToday = React.lazy(() => import('@/components/dashboard/TaskToday').then(module => ({ default: module.TaskToday })));
const EmptyDashboard = React.lazy(() => import('@/components/dashboard/EmptyDashboard').then(module => ({ default: module.EmptyDashboard })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="h-8 w-8 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    loading,
    weeklyTaskData,
    taskData,
    allTasks,
    courseData,
    metrics
  } = useDashboardMetrics(user?.id);

  const createTaskUrl = React.useCallback((task: any) => {
    const courseCode = task.course_code?.toLowerCase().replace(/\s+/g, '') || 'general';
    const taskSlug = task.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);
    return `/tasks#${courseCode}-${taskSlug}-${task.id.substring(0, 8)}`;
  }, []);

  const handleTaskClick = React.useCallback((task: any) => navigate(createTaskUrl(task)), [navigate, createTaskUrl]);
  const handleCalendarDateSelect = React.useCallback(() => navigate('/calendar'), [navigate]);
  const navigateToCourses = React.useCallback(() => navigate('/courses'), [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 sm:h-10 sm:w-10 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const emptyState = !user || (courseData.length === 0 && taskData.length === 0);

  if (emptyState) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <EmptyDashboard onNavigateToCourses={navigateToCourses} />
      </React.Suspense>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="h-6 w-6 text-blue-600" />}
        title="Dashboard"
        subtitle="Overview of your academic activity and progress"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <React.Suspense fallback={<LoadingSpinner />}>
            <ActivityChart data={weeklyTaskData} />
          </React.Suspense>
          
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <React.Suspense fallback={<LoadingSpinner />}>
              <RunningTaskCard 
                pendingTasks={metrics.pendingTasks}
                completedTasks={metrics.tasksCompleted}
              />
            </React.Suspense>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">GPA</p>
                  <h3 className="text-2xl font-bold text-gray-900">{metrics.gpa.toFixed(1)}</h3>
                  <p className="text-gray-500 text-xs mt-1">Current average</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total ECTS</p>
                  <h3 className="text-2xl font-bold text-gray-900">{metrics.currentCredits}</h3>
                  <p className="text-gray-500 text-xs mt-1">Credits earned</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          <React.Suspense fallback={<LoadingSpinner />}>
            <OnlineClassesSection />
          </React.Suspense>
          
          <React.Suspense fallback={<LoadingSpinner />}>
            <UpcomingTasksSection 
              tasks={taskData}
              onTaskClick={handleTaskClick}
            />
          </React.Suspense>
        </div>

        <div className="space-y-6">
          <React.Suspense fallback={<LoadingSpinner />}>
            <CalendarWidget 
              tasksWithDates={allTasks} 
              onDateSelect={handleCalendarDateSelect}
            />
          </React.Suspense>
          
          <React.Suspense fallback={<LoadingSpinner />}>
            <TaskToday 
              tasks={allTasks} 
              onTaskClick={handleTaskClick}
            />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
