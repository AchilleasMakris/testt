
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { CourseCard } from './CourseCard';
import { EmptyCourses } from './EmptyCourses';
import { EditCourseForm } from './EditCourseForm';
import { useToast } from '@/hooks/use-toast';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import { logDataAccess } from '@/components/security/SecurityLogger';

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

export const CoursesList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { data: courses = [], isLoading, error } = useSecureQuery({
    queryKey: ['courses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch courses:', error.message);
        throw new Error('Failed to load courses');
      }
      return data as Course[];
    },
    tableName: 'courses',
    operation: 'read'
  });

  const handleEdit = (course: Course) => {
    if (user) {
      logDataAccess('courses', 'read', user.id, { 
        action: 'edit_initiated',
        courseId: course.id 
      });
    }
    setEditingCourse(course);
  };

  const handleDelete = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete courses",
        variant: "destructive",
      });
      return;
    }

    try {
      logDataAccess('courses', 'delete', user.id, { 
        courseId,
        action: 'delete_initiated'
      });

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('user_id', user.id); // Additional security check

      if (error) {
        console.error('Failed to delete course:', error.message);
        throw new Error('Failed to delete course');
      }

      logDataAccess('courses', 'delete', user.id, { 
        courseId,
        action: 'delete_completed'
      });

      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    setEditingCourse(null);
    queryClient.invalidateQueries({ queryKey: ['courses'] });
    toast({
      title: "Success",
      description: "Course updated successfully",
    });
  };

  const handleEditError = (error: any) => {
    console.error('Course edit error:', error);
    toast({
      title: "Error",
      description: "Failed to update course. Please try again.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading courses. Please try again.</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return <EmptyCourses />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editingCourse && (
        <EditCourseForm
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={handleEditSuccess}
          onError={handleEditError}
        />
      )}
    </>
  );
};
