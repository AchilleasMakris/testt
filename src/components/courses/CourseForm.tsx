
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';

interface CourseFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  onClose,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    professor: '',
    credits: '',
    grade: '',
    semester: '',
    year: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onError({ message: 'User not authenticated' });
      return;
    }

    try {
      const courseData = {
        name: formData.name,
        code: formData.code || null,
        professor: formData.professor || null,
        credits: formData.credits ? parseInt(formData.credits) : null,
        grade: formData.grade ? parseFloat(formData.grade) : null,
        semester: formData.semester || null,
        year: formData.year || null,
        user_id: user.id
      };

      const { error } = await supabase
        .from('courses')
        .insert([courseData]);

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
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Fill in the details for your new course.
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
              Add Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
