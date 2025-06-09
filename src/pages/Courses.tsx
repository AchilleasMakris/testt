import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useUserTier } from '@/hooks/useUserTier';
import { GraduationCap, Plus, BookOpen, Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CourseCard } from '@/components/courses/CourseCard';
import { CreateCourseButton } from '@/components/courses/CreateCourseButton';

interface Course {
  id: string;
  name: string;
  code: string | null;
  professor: string | null;
  credits: number | null;
  grade: number | null;
  semester: string | null;
  year: string | null;
  user_id: string;
}

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch: refetchTier } = useUserTier();
  const { handleDatabaseError, refreshUsageData } = useUsageLimits();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    professor: '',
    credits: '',
    grade: '',
    semester: '',
    year: ''
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('courses').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Course name is required.",
        variant: "destructive"
      });
      return;
    }

    // Validate grade is between 0-10
    if (formData.grade && (parseFloat(formData.grade) < 0 || parseFloat(formData.grade) > 10)) {
      toast({
        title: "Error",
        description: "Grade must be between 0 and 10.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const courseData = {
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        professor: formData.professor.trim() || null,
        credits: formData.credits ? parseInt(formData.credits) : null,
        grade: formData.grade ? parseFloat(formData.grade) : null,
        semester: formData.semester || null,
        year: formData.year || null,
        user_id: user?.id
      };
      
      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Course updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);
        if (error) {
          // Handle database errors (including usage limits)
          const wasLimitError = handleDatabaseError(error, 'courses');
          if (!wasLimitError) {
            throw error;
          }
          return;
        }
        toast({
          title: "Success",
          description: "Course added successfully."
        });

        // Refresh user tier data and usage data to update usage counts
        await refetchTier();
        await refreshUsageData();
      }
      fetchCourses();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code || '',
      professor: course.professor || '',
      credits: course.credits?.toString() || '',
      grade: course.grade?.toString() || '',
      semester: course.semester || '',
      year: course.year || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    try {
      const {
        error
      } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
      fetchCourses();
      // Refresh user tier data and usage data to update usage counts
      await refetchTier();
      await refreshUsageData();
      toast({
        title: "Success",
        description: "Course deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      professor: '',
      credits: '',
      grade: '',
      semester: '',
      year: ''
    });
    setEditingCourse(null);
  };

  const handleCreateCourseSuccess = async () => {
    await refreshUsageData();
    fetchCourses();
  };

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

  const getTotalECTS = () => {
    return courses.reduce((total, course) => total + (course.credits || 0), 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>;
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          icon={<GraduationCap className="h-6 w-6 text-blue-600" />}
          title="Courses"
          subtitle="Manage your academic courses and track your progress"
        />

        <div className="flex items-center justify-between">
          <CreateCourseButton 
            onOpenDialog={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            onCreateCourse={handleCreateCourseSuccess}
          />
        </div>

        {/* GPA and ECTS Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Current GPA</p>
                  <h3 className="text-3xl font-bold text-blue-900">{calculateGPA()}</h3>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total ECTS</p>
                  <h3 className="text-3xl font-bold text-green-900">{getTotalECTS()}</h3>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {courses.length === 0 && <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
              <p className="mt-2 text-gray-600">
                Get started by adding your first course.
              </p>
            </CardContent>
          </Card>}

        {/* Course Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Update the course information below.' : 'Add a new course to your academic schedule.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))} placeholder="e.g., Introduction to Computer Science" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input id="code" value={formData.code} onChange={e => setFormData(prev => ({
                    ...prev,
                    code: e.target.value
                  }))} placeholder="e.g., CS101" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="credits">ECTS</Label>
                    <Input id="credits" type="number" min="1" max="20" value={formData.credits} onChange={e => setFormData(prev => ({
                    ...prev,
                    credits: e.target.value
                  }))} placeholder="e.g., 6" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="professor">Professor</Label>
                  <Input id="professor" value={formData.professor} onChange={e => setFormData(prev => ({
                  ...prev,
                  professor: e.target.value
                }))} placeholder="e.g., Dr. Smith" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade (0-10)</Label>
                    <Input id="grade" type="number" min="0" max="10" step="0.1" value={formData.grade} onChange={e => setFormData(prev => ({
                    ...prev,
                    grade: e.target.value
                  }))} placeholder="e.g., 8.5" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={formData.semester} onValueChange={value => setFormData(prev => ({
                    ...prev,
                    semester: value
                  }))}>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Academic Year</Label>
                    <Select value={formData.year} onValueChange={value => setFormData(prev => ({
                    ...prev,
                    year: value
                  }))}>
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
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </>
  );
};

export default Courses;
