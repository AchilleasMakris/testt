
import React from 'react';
import { CreateButton } from '@/components/ui/CreateButton';

interface CreateCourseButtonProps {
  onCreateCourse?: () => void;
  onOpenDialog?: () => void;
}

export const CreateCourseButton: React.FC<CreateCourseButtonProps> = ({ 
  onCreateCourse, 
  onOpenDialog 
}) => {
  const handleCreateSuccess = async () => {
    if (onCreateCourse) {
      await onCreateCourse();
    }
  };

  return (
    <CreateButton
      feature="courses"
      onOpenDialog={() => onOpenDialog?.()}
      onCreateSuccess={handleCreateSuccess}
      className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black"
    >
      Add Course
    </CreateButton>
  );
};
