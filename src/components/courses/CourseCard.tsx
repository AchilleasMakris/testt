
import React from 'react';
import { Edit2, Trash2, User, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  const getLetterGrade = (grade: number) => {
    if (grade >= 9) return 'A';
    if (grade >= 8) return 'B';
    if (grade >= 7) return 'C';
    if (grade >= 6) return 'D';
    if (grade >= 5) return 'E';
    return 'F';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
            {course.code && (
              <CardDescription className="text-sm font-medium">{course.code}</CardDescription>
            )}
          </div>
          <div className="flex space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(course)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the course.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(course.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {course.professor && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {course.professor}
            </div>
          )}
          
          {(course.semester || course.year) && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {course.semester} {course.year}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {course.credits && (
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4 mr-1" />
                {course.credits} ECTS
              </div>
            )}
            
            {course.grade !== null && (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.grade >= 5 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {course.grade}/10 ({getLetterGrade(course.grade)})
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
