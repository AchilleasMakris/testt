
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { toast } from 'sonner';
import { Clock, MapPin, Video, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const editOnlineClassSchema = z.object({
  class_name: z.string().min(1, 'Class name is required'),
  meeting_link: z.string().optional(),
  classroom_number: z.string().optional(),
  professor: z.string().min(1, 'Professor name is required'),
  course_id: z.string().optional(),
  start_hour: z.string().optional(),
  start_minute: z.string().optional(),
  start_period: z.string().optional(),
  end_hour: z.string().optional(),
  end_minute: z.string().optional(),
  end_period: z.string().optional(),
  is_online: z.boolean().default(true),
});

type EditOnlineClassForm = z.infer<typeof editOnlineClassSchema>;

interface Course {
  id: string;
  name: string;
  code: string;
}

interface OnlineClass {
  id: string;
  class_name: string;
  meeting_link: string | null;
  classroom_number: string | null;
  professor: string;
  course_id: string | null;
  start_time: string | null;
  end_time: string | null;
  is_online: boolean | null;
  courses?: {
    name: string;
    code: string;
  };
}

interface EditOnlineClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classToEdit: OnlineClass | null;
}

export const EditOnlineClassModal: React.FC<EditOnlineClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classToEdit,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const form = useForm<EditOnlineClassForm>({
    resolver: zodResolver(editOnlineClassSchema),
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

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return { value: hour.toString(), label: hour.toString() };
  });

  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    return { value: i.toString().padStart(2, '0'), label: i.toString().padStart(2, '0') };
  });

  // AM/PM options
  const periodOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchCourses();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (classToEdit) {
      console.log('Setting form values for classToEdit:', classToEdit);
      
      let startHour = '';
      let startMinute = '';
      let startPeriod = '';
      let endHour = '';
      let endMinute = '';
      let endPeriod = '';
      let parsedStartDate: Date | undefined = undefined;
      let parsedEndDate: Date | undefined = undefined;

      if (classToEdit.start_time) {
        const startDateTime = new Date(classToEdit.start_time);
        parsedStartDate = startDateTime;
        setStartDate(startDateTime);
        
        let hours = startDateTime.getHours();
        const minutes = startDateTime.getMinutes();
        
        // Convert to 12-hour format
        startPeriod = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        
        startHour = hours.toString();
        startMinute = minutes.toString().padStart(2, '0');
        
        console.log('Parsed start date/time:', startDateTime, startHour, startMinute, startPeriod);
      }

      if (classToEdit.end_time) {
        const endDateTime = new Date(classToEdit.end_time);
        parsedEndDate = endDateTime;
        setEndDate(endDateTime);
        
        let hours = endDateTime.getHours();
        const minutes = endDateTime.getMinutes();
        
        // Convert to 12-hour format
        endPeriod = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        
        endHour = hours.toString();
        endMinute = minutes.toString().padStart(2, '0');
        
        console.log('Parsed end date/time:', endDateTime, endHour, endMinute, endPeriod);
      }
      
      form.reset({
        class_name: classToEdit.class_name,
        meeting_link: classToEdit.meeting_link || '',
        classroom_number: classToEdit.classroom_number || '',
        professor: classToEdit.professor,
        course_id: classToEdit.course_id || '',
        start_hour: startHour,
        start_minute: startMinute,
        start_period: startPeriod,
        end_hour: endHour,
        end_minute: endMinute,
        end_period: endPeriod,
        is_online: classToEdit.is_online ?? true,
      });
      setIsOnline(classToEdit.is_online ?? true);
    }
  }, [classToEdit, form]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const combineDateTime = (date: Date | undefined, hour: string, minute: string, period: string): string | null => {
    if (!date || !hour || !minute || !period) {
      return null;
    }

    try {
      let hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);

      // Convert to 24-hour format
      if (period === 'PM' && hourNum !== 12) {
        hourNum += 12;
      } else if (period === 'AM' && hourNum === 12) {
        hourNum = 0;
      }

      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(hourNum, minuteNum, 0, 0);
      
      console.log('Combined date time:', combinedDateTime.toISOString());
      return combinedDateTime.toISOString();
    } catch (error) {
      console.error('Error combining date and time:', error);
      return null;
    }
  };

  const onSubmit = async (data: EditOnlineClassForm) => {
    if (!user?.id || !classToEdit) {
      toast.error('You must be logged in to edit a class');
      return;
    }

    if (isOnline && !data.meeting_link) {
      toast.error('Meeting link is required for online classes');
      return;
    }

    if (!isOnline && !data.classroom_number) {
      toast.error('Classroom number is required for in-person classes');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time for start_time and end_time
      const startTimeISO = combineDateTime(startDate, data.start_hour || '', data.start_minute || '', data.start_period || '');
      const endTimeISO = combineDateTime(endDate, data.end_hour || '', data.end_minute || '', data.end_period || '');

      console.log('Combined start time:', startTimeISO);
      console.log('Combined end time:', endTimeISO);

      const classData = {
        class_name: data.class_name,
        meeting_link: isOnline ? data.meeting_link : null,
        classroom_number: !isOnline ? data.classroom_number : null,
        professor: data.professor,
        course_id: data.course_id || null,
        start_time: startTimeISO,
        end_time: endTimeISO,
        is_online: isOnline,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('online_classes')
        .update(classData)
        .eq('id', classToEdit.id);

      if (error) throw error;

      toast.success('Class updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setIsOnline(true);
    setStartDate(undefined);
    setEndDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Class Type Toggle */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Video className="h-5 w-5 text-blue-600" />
                ) : (
                  <MapPin className="h-5 w-5 text-green-600" />
                )}
                <Label className="text-base font-medium">
                  {isOnline ? 'Online Class' : 'In-Person Class'}
                </Label>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={(checked) => {
                  setIsOnline(checked);
                  form.setValue('is_online', checked);
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {isOnline 
                ? 'Class will be conducted online via video conference'
                : 'Class will be conducted in a physical classroom'
              }
            </p>
          </div>

          {/* Class Name */}
          <div>
            <Label htmlFor="class_name" className="text-sm font-medium">Class Name *</Label>
            <Input
              id="class_name"
              {...form.register('class_name')}
              placeholder="e.g., Weekly Study Session"
              className="mt-1"
            />
            {form.formState.errors.class_name && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.class_name.message}
              </p>
            )}
          </div>

          {/* Meeting Link or Classroom Number */}
          {isOnline ? (
            <div>
              <Label htmlFor="meeting_link" className="text-sm font-medium">Meeting Link *</Label>
              <Input
                id="meeting_link"
                {...form.register('meeting_link')}
                placeholder="e.g., https://zoom.us/j/1234567890"
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="classroom_number" className="text-sm font-medium">Classroom Number *</Label>
              <Input
                id="classroom_number"
                {...form.register('classroom_number')}
                placeholder="e.g., Room 204, Building A"
                className="mt-1"
              />
            </div>
          )}

          {/* Professor */}
          <div>
            <Label htmlFor="professor" className="text-sm font-medium">Professor *</Label>
            <Input
              id="professor"
              {...form.register('professor')}
              placeholder="e.g., Dr. Smith"
              className="mt-1"
            />
            {form.formState.errors.professor && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.professor.message}
              </p>
            )}
          </div>

          {/* Course */}
          <div>
            <Label htmlFor="course_id" className="text-sm font-medium">Course (Optional)</Label>
            <Select onValueChange={(value) => form.setValue('course_id', value)} value={form.watch('course_id')}>
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

          {/* Enhanced Time Section with Dropdowns */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <Label className="text-base font-medium text-blue-900">Class Schedule</Label>
            </div>
            
            {/* Date Selection Row */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
              {/* Start Time */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="start_hour" className="text-xs text-gray-600">Hour</Label>
                    <Select onValueChange={(value) => form.setValue('start_hour', value)} value={form.watch('start_hour')}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {hourOptions.map((hour) => (
                          <SelectItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start_minute" className="text-xs text-gray-600">Minutes</Label>
                    <Select onValueChange={(value) => form.setValue('start_minute', value)} value={form.watch('start_minute')}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Minutes" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {minuteOptions.map((minute) => (
                          <SelectItem key={minute.value} value={minute.value}>
                            {minute.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start_period" className="text-xs text-gray-600">AM/PM</Label>
                    <Select onValueChange={(value) => form.setValue('start_period', value)} value={form.watch('start_period')}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="end_hour" className="text-xs text-gray-600">Hour</Label>
                    <Select onValueChange={(value) => form.setValue('end_hour', value)} value={form.watch('end_hour')}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {hourOptions.map((hour) => (
                          <SelectItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="end_minute" className="text-xs text-gray-600">Minutes</Label>
                    <Select onValueChange={(value) => form.setValue('end_minute', value)} value={form.watch('end_minute')}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Minutes" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {minuteOptions.map((minute) => (
                          <SelectItem key={minute.value} value={minute.value}>
                            {minute.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="end_period" className="text-xs text-gray-600">AM/PM</Label>
                    <Select onValueChange={(value) => form.setValue('end_period', value)} value={form.watch('end_period')}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-blue-600 mt-2">
              Set the date and time for this class session
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 order-1 sm:order-2">
              {loading ? 'Updating...' : 'Update Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
