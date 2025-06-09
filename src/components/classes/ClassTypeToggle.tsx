
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Video, MapPin } from 'lucide-react';

interface ClassTypeToggleProps {
  isOnline: boolean;
  onToggle: (checked: boolean) => void;
}

export const ClassTypeToggle: React.FC<ClassTypeToggleProps> = ({
  isOnline,
  onToggle,
}) => {
  return (
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
        <Switch checked={isOnline} onCheckedChange={onToggle} />
      </div>
      <p className="text-sm text-gray-600">
        {isOnline 
          ? 'Class will be conducted online via video conference'
          : 'Class will be conducted in a physical classroom'
        }
      </p>
    </div>
  );
};
