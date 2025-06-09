
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, Book } from 'lucide-react';

export const MeetingsSection: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Meetings today</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Study Session</h4>
              <p className="text-sm text-gray-600">Mathematics</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Now</p>
            <Button size="sm" className="mt-1">JOIN</Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Book className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Project Review</h4>
              <p className="text-sm text-gray-600">Computer Science</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">20:00</p>
            <Button size="sm" variant="outline" className="mt-1">JOIN</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
