
import React from 'react';
import { CreateButton } from '@/components/ui/CreateButton';

interface CreateNoteButtonProps {
  onCreateNote?: () => void;
  onOpenDialog?: () => void;
}

export const CreateNoteButton: React.FC<CreateNoteButtonProps> = ({ 
  onCreateNote, 
  onOpenDialog 
}) => {
  const handleCreateSuccess = async () => {
    if (onCreateNote) {
      await onCreateNote();
    }
  };

  return (
    <CreateButton
      feature="notes"
      onOpenDialog={() => onOpenDialog?.()}
      onCreateSuccess={handleCreateSuccess}
      className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black"
    >
      Add Note
    </CreateButton>
  );
};
