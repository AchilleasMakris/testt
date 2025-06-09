
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateOnlineClassForm, Course } from './types';

interface ClassFormFieldsProps {
  register: UseFormRegister<CreateOnlineClassForm>;
  errors: FieldErrors<CreateOnlineClassForm>;
  isOnline: boolean;
  courses: Course[];
  onCourseChange: (value: string) => void;
}

export const ClassFormFields: React.FC<ClassFormFieldsProps> = ({
  register,
  errors,
  isOnline,
  courses,
  onCourseChange,
}) => {
  return (
    <>
      {/* Class Name */}
      <div>
        <Label htmlFor="class_name" className="text-sm font-medium">Class Name *</Label>
        <Input
          id="class_name"
          {...register('class_name')}
          placeholder="e.g., Weekly Study Session"
          className="mt-1"
        />
        {errors.class_name && (
          <p className="text-sm text-red-600 mt-1">
            {errors.class_name.message}
          </p>
        )}
      </div>

      {/* Meeting Link or Classroom Number */}
      {isOnline ? (
        <div>
          <Label htmlFor="meeting_link" className="text-sm font-medium">Meeting Link *</Label>
          <Input
            id="meeting_link"
            {...register('meeting_link')}
            placeholder="e.g., https://zoom.us/j/1234567890"
            className="mt-1"
          />
          {errors.meeting_link && (
            <p className="text-sm text-red-600 mt-1">
              {errors.meeting_link.message}
            </p>
          )}
        </div>
      ) : (
        <div>
          <Label htmlFor="classroom_number" className="text-sm font-medium">Classroom Number *</Label>
          <Input
            id="classroom_number"
            {...register('classroom_number')}
            placeholder="e.g., Room 204, Building A"
            className="mt-1"
          />
          {errors.classroom_number && (
            <p className="text-sm text-red-600 mt-1">
              {errors.classroom_number.message}
            </p>
          )}
        </div>
      )}

      {/* Professor */}
      <div>
        <Label htmlFor="professor" className="text-sm font-medium">Professor *</Label>
        <Input
          id="professor"
          {...register('professor')}
          placeholder="e.g., Dr. Smith"
          className="mt-1"
        />
        {errors.professor && (
          <p className="text-sm text-red-600 mt-1">
            {errors.professor.message}
          </p>
        )}
      </div>

      {/* Course */}
      <div>
        <Label htmlFor="course_id" className="text-sm font-medium">Course (Optional)</Label>
        <Select onValueChange={onCourseChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.code ? `${course.code} - ${course.name}` : course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
