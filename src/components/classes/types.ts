
import { z } from 'zod';

export const createOnlineClassSchema = z.object({
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

export type CreateOnlineClassForm = z.infer<typeof createOnlineClassSchema>;

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface CreateOnlineClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
