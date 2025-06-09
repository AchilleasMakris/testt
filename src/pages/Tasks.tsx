import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useUserTier } from '@/hooks/useUserTier';
import { LimitDialog } from '@/components/usage/LimitDialog';
import { CheckCircle, Clock, Trash2, AlertCircle, BookOpen, Plus, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, isPast, isToday } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';
import { ListTodo, CalendarIcon as ListTodoIcon } from 'lucide-react';
import { TimeSelector } from '@/components/tasks/TimeSelector';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CreateTaskButton } from '@/components/tasks/CreateTaskButton';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  due_hour: z.string().optional(),
  due_minute: z.string().optional(),
  due_period: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  course: z.string().optional()
});

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch: refetchTier } = useUserTier();
  const { handleDatabaseError, showLimitDialog, setShowLimitDialog, limitType, refreshUsageData } = useUsageLimits();
  
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      due_hour: "",
      due_minute: "",
      due_period: "",
      priority: "medium",
      course: ""
    }
  });

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      console.log('Fetching tasks for user:', user.id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      console.log('Tasks fetched:', data);
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching courses for user:', user.id);
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (error) throw error;
      console.log('Courses fetched:', data);
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchCourses();
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('Filtering tasks with filter:', activeTab, 'tasks:', tasks);
    switch (activeTab) {
      case 'pending':
        setFilteredTasks(tasks.filter(task => task.status === 'pending'));
        break;
      case 'completed':
        setFilteredTasks(tasks.filter(task => task.status === 'completed'));
        break;
      case 'overdue':
        setFilteredTasks(tasks.filter(task => {
          if (!task.due_date || task.status === 'completed') return false;
          return isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
        }));
        break;
      case 'today':
        setFilteredTasks(tasks.filter(task => {
          if (!task.due_date) return false;
          return isToday(new Date(task.due_date));
        }));
        break;
      default:
        setFilteredTasks(tasks);
    }
  }, [tasks, activeTab]);

  const filterTasks = (filter: string) => {
    setActiveTab(filter);
  };

  const handleAddTask = async (values: z.infer<typeof taskSchema>) => {
    if (!user) return;
    try {
      let finalDueDate = null;
      
      if (values.due_date) {
        if (values.due_hour && values.due_minute && values.due_period) {
          const hour24 = values.due_period === 'AM' 
            ? (values.due_hour === '12' ? 0 : parseInt(values.due_hour))
            : (values.due_hour === '12' ? 12 : parseInt(values.due_hour) + 12);
          
          const combinedDateTime = new Date(values.due_date);
          combinedDateTime.setHours(hour24, parseInt(values.due_minute), 0, 0);
          finalDueDate = combinedDateTime.toISOString();
        } else {
          finalDueDate = new Date(values.due_date).toISOString();
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: values.title,
          description: values.description || null,
          due_date: finalDueDate,
          priority: values.priority,
          course: values.course || null,
          status: 'pending'
        }])
        .select();

      if (error) {
        const wasLimitError = handleDatabaseError(error, 'tasks');
        if (!wasLimitError) {
          throw error;
        }
        return;
      }

      setTasks([...tasks, data[0]]);
      toast({
        title: "Success",
        description: "Task added successfully"
      });
      
      // Refresh usage data and tier data after successful creation
      await refetchTier();
      await refreshUsageData();
      
      setIsAddDialogOpen(false);
      setDueDate(undefined);
      taskForm.reset();
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTask = async (values: any) => {
    if (!user || !currentTask) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: values.title,
          description: values.description || null,
          due_date: values.due_date,
          priority: values.priority,
          course: values.course || null,
        })
        .eq('id', currentTask.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === currentTask.id 
          ? { ...task, ...values }
          : task
      ));
      
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
      
      setIsEditDialogOpen(false);
      setCurrentTask(null);
      refetchTier();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !currentTask) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', currentTask.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== currentTask.id));
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
      
      // Refresh usage data and tier data after successful deletion
      await refetchTier();
      await refreshUsageData();
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    if (!user) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
      
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`
      });
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTaskSuccess = async () => {
    await refreshUsageData();
    fetchTasks();
  };

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return 'No course';
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown course';
  };

  const getTaskStatusIcon = (task: any) => {
    if (task.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      if (isPast(dueDate) && !isToday(dueDate)) {
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      }
      if (isToday(dueDate)) {
        return <Clock className="h-5 w-5 text-orange-500" />;
      }
    }
    return <Clock className="h-5 w-5 text-blue-500" />;
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getTaskDueDateStyle = (task: any) => {
    if (!task.due_date) return '';
    const dueDate = new Date(task.due_date);
    if (isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed') {
      return 'text-red-600 font-medium';
    }
    if (isToday(dueDate) && task.status !== 'completed') {
      return 'text-orange-600 font-medium';
    }
    return '';
  };

  const formatTaskDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    const dateFormat = format(date, 'MMM d, yyyy');
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Check if time is set (not just midnight)
    if (hours === 0 && minutes === 0) {
      return dateFormat;
    }
    
    const timeFormat = format(date, 'h:mm a');
    return `${dateFormat} at ${timeFormat}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader 
          icon={<ListTodoIcon className="h-6 w-6 text-blue-600" />} 
          title="Tasks" 
          subtitle="Manage your assignments and deadlines" 
        />

        <div className="flex justify-between items-center">
          <CreateTaskButton 
            onOpenDialog={() => setIsAddDialogOpen(true)}
            onCreateTask={handleCreateTaskSuccess}
          />
        </div>

        <div className="md:hidden">
          <Select value={activeTab} onValueChange={filterTasks}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full hidden md:block" onValueChange={filterTasks}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          {filteredTasks.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-10 pb-10">
                <div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">No tasks found</h2>
                <p className="mt-2 text-gray-600">
                  {activeTab === 'all' 
                    ? "You don't have any tasks yet. Start by adding a new task." 
                    : `You don't have any ${activeTab} tasks.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map(task => (
                <Card key={task.id} className={task.status === 'completed' ? 'opacity-70' : ''}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mt-1" 
                        onClick={() => handleToggleTaskStatus(task)}
                      >
                        {getTaskStatusIcon(task)}
                      </Button>
                      <div className="ml-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          <div className="flex space-x-1">
                            <Badge variant={getPriorityBadgeVariant(task.priority)}>
                              {task.priority || 'low'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{getCourseName(task.course)}</p>
                        {task.due_date && (
                          <p className={`text-xs mt-1 ${getTaskDueDateStyle(task)}`}>
                            Due: {formatTaskDateTime(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex ml-4 space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setCurrentTask(task);
                          setIsViewDetailsDialogOpen(true);
                        }}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setCurrentTask(task);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => {
                          setCurrentTask(task);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new task or assignment.</DialogDescription>
            </DialogHeader>
            <Form {...taskForm}>
              <form onSubmit={taskForm.handleSubmit(handleAddTask)} className="space-y-4">
                <FormField
                  control={taskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Complete Math Assignment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={taskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the task" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={taskForm.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(date) => {
                              setDueDate(date);
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {taskForm.watch('due_date') && (
                  <TimeSelector
                    label="Due Time (Optional)"
                    hourValue={taskForm.watch('due_hour')}
                    minuteValue={taskForm.watch('due_minute')}
                    periodValue={taskForm.watch('due_period')}
                    onHourChange={(value) => taskForm.setValue('due_hour', value)}
                    onMinuteChange={(value) => taskForm.setValue('due_minute', value)}
                    onPeriodChange={(value) => taskForm.setValue('due_period', value)}
                  />
                )}
                
                <FormField
                  control={taskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={taskForm.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course (Optional)</FormLabel>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                        <option value="">None</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Add Task</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <EditTaskModal
          task={currentTask}
          courses={courses}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setCurrentTask(null);
          }}
          onSave={handleEditTask}
        />

        <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {currentTask && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{currentTask.title}</h3>
                  <Badge variant={getPriorityBadgeVariant(currentTask.priority)} className="mt-1">
                    {currentTask.priority || 'low'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={currentTask.status === 'completed' ? 'outline' : 'default'} className="mt-1">
                    {currentTask.status}
                  </Badge>
                </div>
                
                {currentTask.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm mt-1">{currentTask.description}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p className="text-sm mt-1">{getCourseName(currentTask.course)}</p>
                </div>
                
                {currentTask.due_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className={`text-sm mt-1 ${getTaskDueDateStyle(currentTask)}`}>
                      {formatTaskDateTime(currentTask.due_date)}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm mt-1">
                    {format(parseISO(currentTask.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    className="flex-1" 
                    variant={currentTask.status === 'completed' ? 'outline' : 'default'} 
                    onClick={() => {
                      handleToggleTaskStatus(currentTask);
                      setIsViewDetailsDialogOpen(false);
                    }}
                  >
                    {currentTask.status === 'completed' ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsViewDetailsDialogOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this task and remove it from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <LimitDialog 
        open={showLimitDialog} 
        onOpenChange={setShowLimitDialog} 
        limitType={limitType} 
      />
    </>
  );
};

export default Tasks;
