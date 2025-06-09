
import React from 'react';
import { CreateButton } from '@/components/ui/CreateButton';

interface CreateTaskButtonProps {
  onCreateTask?: () => void;
  onOpenDialog?: () => void;
}

export const CreateTaskButton: React.FC<CreateTaskButtonProps> = ({ 
  onCreateTask, 
  onOpenDialog 
}) => {
  const handleCreateSuccess = async () => {
    if (onCreateTask) {
      await onCreateTask();
    }
  };

  return (
    <CreateButton
      feature="tasks"
      onOpenDialog={() => onOpenDialog?.()}
      onCreateSuccess={handleCreateSuccess}
      className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black"
    >
      Add Task
    </CreateButton>
  );
};
