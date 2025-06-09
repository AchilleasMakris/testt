
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { toast } from 'sonner';
import { ClassTypeToggle } from './ClassTypeToggle';
import { ClassFormFields } from './ClassFormFields';
import { ClassScheduleSection } from './ClassScheduleSection';
import { combineDateTime } from './utils';
import { createOnlineClassSchema, CreateOnlineClassForm, Course, CreateOnlineClassModalProps } from './types';

export const CreateOnlineClassModal: React.FC<CreateOnlineClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();

  const form = useForm<CreateOnlineClassForm>({
    resolver: zodResolver(createOnlineClassSchema),
    defaultValues: {
      class_name: '',
      meeting_link: '',
      classroom_number: '',
      professor: '',
      course_id: '',
      start_hour: '',
      start_minute: '',
      start_period: '',
      end_hour: '',
      end_minute: '',
      end_period: '',
      is_online: true,
    },
  });

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchCourses();
    }
  }, [isOpen, user?.id]);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses for user:', user?.id);
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('user_id', user?.id)
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
      console.log('Courses fetched successfully:', data);
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const onSubmit = async (data: CreateOnlineClassForm) => {
    console.log('Form submission started with data:', data);
    console.log('User object:', user);
    console.log('Start date:', startDate);
    
    if (!user?.id) {
      console.error('No user ID found');
      toast.error('You must be logged in to create a class');
      return;
    }

    // Validate required fields based on class type
    if (isOnline && !data.meeting_link?.trim()) {
      console.error('Meeting link required for online class');
      toast.error('Meeting link is required for online classes');
      return;
    }

    if (!isOnline && !data.classroom_number?.trim()) {
      console.error('Classroom number required for in-person class');
      toast.error('Classroom number is required for in-person classes');
      return;
    }

    // Check if date and time are provided
    if (!startDate) {
      console.error('Start date is required');
      toast.error('Please select a date for the class');
      return;
    }

    if (!data.start_hour || !data.start_minute || !data.start_period) {
      console.error('Start time is incomplete');
      toast.error('Please select a complete start time for the class');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating class with user ID:', user.id);
      
      // Combine date and time for start_time and end_time
      const startTimeISO = combineDateTime(startDate, data.start_hour, data.start_minute, data.start_period);
      const endTimeISO = combineDateTime(startDate, data.end_hour || '', data.end_minute || '', data.end_period || '');

      console.log('Start time ISO:', startTimeISO);
      console.log('End time ISO:', endTimeISO);

      if (!startTimeISO) {
        throw new Error('Failed to create valid start time');
      }

      const classData = {
        user_id: user.id,
        class_name: data.class_name.trim(),
        meeting_link: isOnline ? (data.meeting_link?.trim() || null) : null,
        classroom_number: !isOnline ? (data.classroom_number?.trim() || null) : null,
        professor: data.professor.trim(),
        course_id: data.course_id || null,
        start_time: startTimeISO,
        end_time: endTimeISO, // Can be null if end time is not provided
        is_online: isOnline,
      };

      console.log('Final class data to insert:', classData);

      const { data: insertedData, error } = await supabase
        .from('online_classes')
        .insert([classData])
        .select();

      if (error) {
        console.error('Database error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Class created successfully:', insertedData);
      toast.success('Class created successfully!');
      form.reset();
      setIsOnline(true);
      setStartDate(undefined);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating class:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // More specific error handling
      if (error.message?.includes('row-level security')) {
        toast.error('Authentication issue. Please try logging out and back in.');
      } else if (error.message?.includes('violates check constraint')) {
        toast.error('Invalid data format. Please check your inputs.');
      } else {
        toast.error(`Failed to create class: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setIsOnline(true);
    setStartDate(undefined);
    onClose();
  };

  const handleTypeToggle = (checked: boolean) => {
    setIsOnline(checked);
    form.setValue('is_online', checked);
  };

  const handleCourseChange = (value: string) => {
    form.setValue('course_id', value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Class</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ClassTypeToggle isOnline={isOnline} onToggle={handleTypeToggle} />

          <ClassFormFields
            register={form.register}
            errors={form.formState.errors}
            isOnline={isOnline}
            courses={courses}
            onCourseChange={handleCourseChange}
          />

          <ClassScheduleSection
            startDate={startDate}
            setStartDate={setStartDate}
            setValue={form.setValue}
            watch={form.watch}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 order-1 sm:order-2">
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
