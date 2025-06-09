
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

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

interface CourseStatsProps {
  courses: Course[];
}

export const CourseStats: React.FC<CourseStatsProps> = ({ courses }) => {
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

  const getCompletedCourses = () => {
    return courses.filter(course => course.grade !== null).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GPA</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calculateGPA()}</div>
          <p className="text-xs text-muted-foreground">
            Based on {getCompletedCourses()} completed courses
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total ECTS</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalECTS()}</div>
          <p className="text-xs text-muted-foreground">
            Credits earned
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courses.length}</div>
          <p className="text-xs text-muted-foreground">
            {getCompletedCourses()} completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
