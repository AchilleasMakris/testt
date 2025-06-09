
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from 'date-fns';
import { TimeSelector } from './TimeSelector';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  due_hour: z.string().optional(),
  due_minute: z.string().optional(),
  due_period: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  course: z.string().optional()
});

interface EditTaskModalProps {
  task: any;
  courses: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  courses,
  isOpen,
  onClose,
  onSave,
}) => {
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      due_hour: "",
      due_minute: "",
      due_period: "",
      priority: "medium",
      course: ""
    }
  });

  useEffect(() => {
    if (task && isOpen) {
      taskForm.reset({
        title: task.title || "",
        description: task.description || "",
        due_date: task.due_date ? format(parseISO(task.due_date), 'yyyy-MM-dd') : "",
        priority: task.priority || "medium",
        course: task.course || ""
      });

      if (task.due_date) {
        const taskDate = parseISO(task.due_date);
        setDueDate(taskDate);
        
        // Extract time components
        const hours = taskDate.getHours();
        const minutes = taskDate.getMinutes();
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const period = hours >= 12 ? 'PM' : 'AM';
        
        taskForm.setValue('due_hour', hour12.toString());
        taskForm.setValue('due_minute', minutes.toString().padStart(2, '0'));
        taskForm.setValue('due_period', period);
      }
    }
  }, [task, isOpen, taskForm]);

  const handleSubmit = (values: z.infer<typeof taskSchema>) => {
    let finalDueDate = null;
    
    if (values.due_date) {
      if (values.due_hour && values.due_minute && values.due_period) {
        const hour24 = values.due_period === 'AM' 
          ? (values.due_hour === '12' ? 0 : parseInt(values.due_hour))
          : (values.due_hour === '12' ? 12 : parseInt(values.due_hour) + 12);
        
        const combinedDateTime = new Date(values.due_date);
        combinedDateTime.setHours(hour24, parseInt(values.due_minute), 0, 0);
        finalDueDate = combinedDateTime.toISOString();
      } else {
        finalDueDate = new Date(values.due_date).toISOString();
      }
    }

    onSave({
      ...values,
      due_date: finalDueDate
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update your task details.
          </DialogDescription>
        </DialogHeader>
        <Form {...taskForm}>
          <form onSubmit={taskForm.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={taskForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Complete Math Assignment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={taskForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={taskForm.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {taskForm.watch('due_date') && (
              <TimeSelector
                label="Due Time (Optional)"
                hourValue={taskForm.watch('due_hour')}
                minuteValue={taskForm.watch('due_minute')}
                periodValue={taskForm.watch('due_period')}
                onHourChange={(value) => taskForm.setValue('due_hour', value)}
                onMinuteChange={(value) => taskForm.setValue('due_minute', value)}
                onPeriodChange={(value) => taskForm.setValue('due_period', value)}
              />
            )}
            
            <FormField
              control={taskForm.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={taskForm.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course (Optional)</FormLabel>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                    <option value="">None</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
