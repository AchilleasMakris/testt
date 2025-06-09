
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, addHours, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Plus, RefreshCw, ExternalLink, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: 'academic' | 'personal' | 'university';
  course_id?: string;
  is_synced: boolean;
  course?: Course;
}

export const CalendarSync: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: 'personal' as 'academic' | 'personal' | 'university',
    course_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchEvents();
    }
  }, [user, selectedDate]);

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
    }
  };

  const fetchEvents = async () => {
    try {
      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);

      const { data: eventData, error } = await supabase
        .from('calendar_events')
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          location,
          event_type,
          course_id,
          is_synced,
          courses!calendar_events_course_id_fkey (
            id,
            name,
            code
          )
        `)
        .eq('user_id', user?.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');

      if (error) throw error;

      const formattedData = (eventData || []).map(event => ({
        ...event,
        event_type: event.event_type as 'academic' | 'personal' | 'university',
        course: event.courses
      }));

      setEvents(formattedData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const createEvent = async () => {
    if (!formData.title || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${formData.start_time}`);
      const endDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${formData.end_time}`);

      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user?.id,
          title: formData.title,
          description: formData.description || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: formData.location || null,
          event_type: formData.event_type,
          course_id: formData.course_id || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        event_type: 'personal',
        course_id: ''
      });
      setShowAddForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncWithExternal = async (provider: 'google' | 'ios') => {
    toast({
      title: "Sync Feature",
      description: `${provider === 'google' ? 'Google' : 'iOS'} calendar sync would be implemented here with the respective API integration.`,
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'university':
        return 'bg-purple-100 text-purple-800';
      case 'personal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <BookOpen className="h-3 w-3" />;
      case 'university':
        return <Clock className="h-3 w-3" />;
      case 'personal':
        return <CalendarIcon className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with sync options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Calendar Synchronization
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncWithExternal('google')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Sync Google
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncWithExternal('ios')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Sync iOS
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Manage your academic and personal schedules. Sync with external calendar providers for seamless integration.
          </p>
        </CardContent>
      </Card>

      {/* Date picker and add event */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Events for {format(selectedDate, 'PPP')}
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        {event.course && (
                          <div className="text-sm text-blue-600 mt-1">
                            {event.course.code} - {event.course.name}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {getEventTypeIcon(event.event_type)}
                          <span className="ml-1 capitalize">{event.event_type}</span>
                        </Badge>
                        {event.is_synced && (
                          <Badge variant="outline" className="text-xs">
                            <RefreshCw className="h-2 w-2 mr-1" />
                            Synced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No events scheduled for this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Event title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({...formData, event_type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Start Time *</label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Time *</label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Event location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              {formData.event_type === 'academic' && (
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({...formData, course_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Event description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createEvent} disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
