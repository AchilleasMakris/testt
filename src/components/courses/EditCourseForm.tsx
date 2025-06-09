
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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

interface EditCourseFormProps {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export const EditCourseForm: React.FC<EditCourseFormProps> = ({
  course,
  onClose,
  onSuccess,
  onError
}) => {
  const [formData, setFormData] = useState({
    name: course.name,
    code: course.code || '',
    professor: course.professor || '',
    credits: course.credits ? course.credits.toString() : '',
    grade: course.grade ? course.grade.toString() : '',
    semester: course.semester || '',
    year: course.year || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const courseData = {
        name: formData.name,
        code: formData.code || null,
        professor: formData.professor || null,
        credits: formData.credits ? parseInt(formData.credits) : null,
        grade: formData.grade ? parseFloat(formData.grade) : null,
        semester: formData.semester || null,
        year: formData.year || null,
      };

      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', course.id);

      if (error) {
        onError(error);
        return;
      }

      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the details for your course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., CS101"
              />
            </div>
            
            <div>
              <Label htmlFor="professor">Professor</Label>
              <Input
                id="professor"
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                placeholder="e.g., Dr. Smith"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credits">Credits (ECTS)</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  placeholder="6"
                />
              </div>
              
              <div>
                <Label htmlFor="grade">Grade (0-10)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="8.5"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={formData.semester} 
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
