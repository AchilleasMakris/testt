
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, CheckSquare, BookOpen } from 'lucide-react';

interface QuickActionsProps {
  onActionComplete: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courseOpen, setCourseOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Course form state - now matches Courses page exactly
  const [courseData, setCourseData] = useState({
    name: '',
    code: '',
    credits: '',
    professor: '',
    grade: '',
    semester: '',
    year: ''
  });

  // Task form state - now matches Tasks page exactly
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    course: ''
  });

  // Note form state - matches Notes page
  const [noteData, setNoteData] = useState({
    title: '',
    content: ''
  });

  const [courses, setCourses] = useState<any[]>([]);

  React.useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('courses')
      .select('id, name, code')
      .eq('user_id', user.id);
    
    setCourses(data || []);
  };

  const handleAddCourse = async () => {
    if (!user) return;
    
    if (!courseData.name.trim()) {
      toast({
        title: "Error",
        description: "Course name is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate grade is between 0-10
    if (courseData.grade && (parseFloat(courseData.grade) < 0 || parseFloat(courseData.grade) > 10)) {
      toast({
        title: "Error",
        description: "Grade must be between 0 and 10.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          name: courseData.name.trim(),
          code: courseData.code.trim() || null,
          professor: courseData.professor.trim() || null,
          credits: courseData.credits ? parseInt(courseData.credits) : null,
          grade: courseData.grade ? parseFloat(courseData.grade) : null,
          semester: courseData.semester || null,
          year: courseData.year || null,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course added successfully.",
      });

      setCourseData({ name: '', code: '', credits: '', professor: '', grade: '', semester: '', year: '' });
      setCourseOpen(false);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!user) return;
    
    if (!taskData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          status: 'pending',
          course: taskData.course || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task added successfully.",
      });

      setTaskData({ title: '', description: '', due_date: '', priority: 'medium', course: '' });
      setTaskOpen(false);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!user) return;
    
    if (!noteData.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note saved successfully.",
      });

      setNoteData({ title: '', content: '' });
      setNoteOpen(false);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseData({ name: '', code: '', credits: '', professor: '', grade: '', semester: '', year: '' });
  };

  const resetTaskForm = () => {
    setTaskData({ title: '', description: '', due_date: '', priority: 'medium', course: '' });
  };

  const resetNoteForm = () => {
    setNoteData({ title: '', content: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={resetCourseForm}>
                <GraduationCap className="h-6 w-6" />
                <span className="text-sm">Add Course</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your academic schedule.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name *</Label>
                  <Input
                    id="course-name"
                    value={courseData.name}
                    onChange={(e) => setCourseData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input
                      id="course-code"
                      value={courseData.code}
                      onChange={(e) => setCourseData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course-credits">ECTS</Label>
                    <Input
                      id="course-credits"
                      type="number"
                      min="1"
                      max="20"
                      value={courseData.credits}
                      onChange={(e) => setCourseData(prev => ({ ...prev, credits: e.target.value }))}
                      placeholder="e.g., 6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="course-professor">Professor</Label>
                  <Input
                    id="course-professor"
                    value={courseData.professor}
                    onChange={(e) => setCourseData(prev => ({ ...prev, professor: e.target.value }))}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-grade">Grade (0-10)</Label>
                    <Input
                      id="course-grade"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={courseData.grade}
                      onChange={(e) => setCourseData(prev => ({ ...prev, grade: e.target.value }))}
                      placeholder="e.g., 8.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course-semester">Semester</Label>
                    <Select value={courseData.semester} onValueChange={(value) => setCourseData(prev => ({ ...prev, semester: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Full Year">Full Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-year">Academic Year</Label>
                  <Select value={courseData.year} onValueChange={(value) => setCourseData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCourseOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !courseData.name} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Adding...' : 'Add Course'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={resetTaskForm}>
                <CheckSquare className="h-6 w-6" />
                <span className="text-sm">Add Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your to-do list.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    value={taskData.title}
                    onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Complete assignment 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={taskData.description}
                    onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="datetime-local"
                    value={taskData.due_date}
                    onChange={(e) => setTaskData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={taskData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-course">Course (Optional)</Label>
                  <Select value={taskData.course} onValueChange={(value) => setTaskData(prev => ({ ...prev, course: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !taskData.title} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Adding...' : 'Add Task'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={resetNoteForm}>
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Add Note</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
                <DialogDescription>
                  Create a new note for your studies.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddNote(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Note Title *</Label>
                  <Input
                    id="note-title"
                    value={noteData.title}
                    onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Lecture notes, Study guide, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    value={noteData.content}
                    onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your notes here..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !noteData.title} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
