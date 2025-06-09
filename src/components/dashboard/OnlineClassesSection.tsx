
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, Book, ExternalLink, Video, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { toast } from 'sonner';

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

export const OnlineClassesSection: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOnlineClasses();
    }
  }, [user?.id]);

  const fetchOnlineClasses = async () => {
    try {
      // Calculate date range: today to 7 days from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('online_classes')
        .select(`
          *,
          courses (
            name,
            code
          )
        `)
        .eq('user_id', user?.id)
        .gte('start_time', today.toISOString())
        .lte('start_time', sevenDaysFromNow.toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } else {
        setClasses(data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (meetingLink: string, className: string) => {
    // Validate and sanitize the meeting link
    let sanitizedLink = meetingLink.trim();
    
    // Basic URL validation
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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not scheduled';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid time';
    }
  };

  const formatTimeRange = (startTime: string | null, endTime: string | null) => {
    if (!startTime) return 'Not scheduled';
    
    try {
      const start = new Date(startTime);
      const startFormatted = start.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      
      if (endTime) {
        const end = new Date(endTime);
        const endFormatted = end.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
        return `${startFormatted} - ${endFormatted}`;
      }
      
      return startFormatted;
    } catch {
      return 'Invalid time';
    }
  };

  const formatDateAndTime = (timeString: string | null, endTime: string | null) => {
    if (!timeString) return 'Not scheduled';
    
    try {
      const classTime = new Date(timeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const classDate = new Date(classTime.getFullYear(), classTime.getMonth(), classTime.getDate());

      // Check if it's happening now
      const endTimeDate = endTime ? new Date(endTime) : new Date(classTime.getTime() + 60 * 60 * 1000);
      if (now >= classTime && now <= endTimeDate) {
        return 'Now';
      }

      // Check if it's today
      if (classDate.getTime() === today.getTime()) {
        return {
          primary: 'Today',
          secondary: formatTimeRange(timeString, endTime)
        };
      }

      // Different day - show date and time
      return {
        primary: classTime.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        secondary: formatTimeRange(timeString, endTime)
      };
    } catch {
      return 'Invalid date';
    }
  };

  const isClassHappening = (startTime: string | null, endTime: string | null) => {
    if (!startTime) return false;
    try {
      const now = new Date();
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000);
      return now >= start && now <= end;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 text-sm">Loading classes...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Classes This Week</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 flex items-center justify-center">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-base font-medium">No classes scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Add your first class to get started</p>
          </div>
        ) : (
          classes.map((onlineClass) => {
            const isHappening = isClassHappening(onlineClass.start_time, onlineClass.end_time);
            const timeDisplay = formatDateAndTime(onlineClass.start_time, onlineClass.end_time);

            return (
              <div
                key={onlineClass.id}
                className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 flex items-center justify-center flex-shrink-0">
                    {isHappening ? (
                      <Users className="h-5 w-5 text-blue-600" />
                    ) : onlineClass.is_online ? (
                      <Video className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MapPin className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm leading-5">
                      {onlineClass.class_name}
                    </h4>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {onlineClass.professor} • {onlineClass.courses?.name || 'General'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          onlineClass.is_online
                            ? 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-blue-700'
                            : 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-purple-700'
                        }`}
                      >
                        {onlineClass.is_online ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-2 text-right ml-4">
                  <div>
                    {typeof timeDisplay === 'string' ? (
                      <p className="text-sm font-medium text-gray-900">{timeDisplay}</p>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{timeDisplay.primary}</p>
                        <p className="text-xs text-gray-500">{timeDisplay.secondary}</p>
                      </div>
                    )}
                    {!onlineClass.is_online && onlineClass.classroom_number && (
                      <p className="text-xs text-gray-600 mt-1">{onlineClass.classroom_number}</p>
                    )}
                  </div>
                  {onlineClass.is_online && onlineClass.meeting_link && (
                    <Button
                      size="sm"
                      className={`text-xs px-3 py-1 h-7 ${
                        isHappening 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                          : 'bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-blue-700 hover:from-blue-200 hover:to-purple-300'
                      }`}
                      variant={isHappening ? "default" : "outline"}
                      onClick={() => handleJoinClass(onlineClass.meeting_link!, onlineClass.class_name)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      JOIN
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
