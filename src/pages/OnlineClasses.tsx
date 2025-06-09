
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Book, ExternalLink, Edit, Trash2, MapPin, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { toast } from 'sonner';
import { CreateOnlineClassModal } from '@/components/classes/CreateOnlineClassModal';
import { EditOnlineClassModal } from '@/components/classes/EditOnlineClassModal';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';

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

const OnlineClasses: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<OnlineClass | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchOnlineClasses();
    }
  }, [user?.id]);

  const fetchOnlineClasses = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('online_classes').select(`
          *,
          courses (
            name,
            code
          )
        `).eq('user_id', user?.id).order('start_time', {
        ascending: true
      });
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = (onlineClass: OnlineClass) => {
    setClassToEdit(onlineClass);
    setIsEditModalOpen(true);
  };

  const handleJoinClass = (meetingLink: string, className: string) => {
    // Validate and sanitize the meeting link
    let sanitizedLink = meetingLink.trim();
    try {
      // Add protocol if missing
      if (!sanitizedLink.startsWith('http://') && !sanitizedLink.startsWith('https://')) {
        sanitizedLink = 'https://' + sanitizedLink;
      }

      // Validate URL format
      const url = new URL(sanitizedLink);

      // Only allow http and https protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        toast.error('Invalid meeting link format');
        return;
      }
      window.open(sanitizedLink, '_blank', 'noopener,noreferrer');
      toast.success(`Joining ${className}`);
    } catch (error) {
      toast.error('Invalid meeting link');
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(`Are you sure you want to delete "${className}"?`)) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('online_classes').delete().eq('id', classId);
      if (error) throw error;
      toast.success('Class deleted successfully');
      fetchOnlineClasses();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const formatDateTime = (timeString: string | null) => {
    if (!timeString) return 'Not scheduled';
    try {
      const date = new Date(timeString);
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading classes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader 
        icon={<Video className="h-6 w-6 text-blue-600" />} 
        title="Classes" 
        subtitle="Manage your virtual and in-person class sessions" 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first class</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classes.map((onlineClass) => (
            <Card key={onlineClass.id} className="hover:shadow-md transition-shadow flex flex-col relative">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 flex items-center justify-center flex-shrink-0">
                    {onlineClass.is_online ? (
                      <Video className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MapPin className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <CardTitle className="text-lg leading-tight truncate">
                      {onlineClass.class_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {onlineClass.professor}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        onlineClass.is_online 
                          ? 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-blue-700' 
                          : 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-purple-700'
                      }`}>
                        {onlineClass.is_online ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons positioned absolute in top right */}
                <div className="absolute top-4 right-4 flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditClass(onlineClass)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClass(onlineClass.id, onlineClass.class_name)}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col pt-0">
                <div className="space-y-4 mb-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Course</p>
                    <p className="font-medium truncate text-sm">
                      {onlineClass.courses?.name || 'General'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Schedule</p>
                    <p className="font-medium text-sm leading-relaxed">
                      {formatDateTime(onlineClass.start_time)}
                    </p>
                  </div>
                </div>

                {/* Action button positioned at bottom */}
                {onlineClass.is_online && onlineClass.meeting_link ? (
                  <Button 
                    onClick={() => handleJoinClass(onlineClass.meeting_link!, onlineClass.class_name)} 
                    className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-slate-950 w-full"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Class
                  </Button>
                ) : !onlineClass.is_online && onlineClass.classroom_number ? (
                  <div className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-slate-950">Location</p>
                    <p className="text-slate-950 text-sm truncate">
                      {onlineClass.classroom_number}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateOnlineClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchOnlineClasses();
        }} 
      />

      <EditOnlineClassModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setClassToEdit(null);
        }} 
        onSuccess={() => {
          setIsEditModalOpen(false);
          setClassToEdit(null);
          fetchOnlineClasses();
        }} 
        classToEdit={classToEdit} 
      />
    </div>
  );
};

export default OnlineClasses;
