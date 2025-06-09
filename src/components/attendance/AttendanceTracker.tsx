import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { CalendarIcon, Clock, Plus, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { MonthSelector } from './MonthSelector';
interface Course {
  id: string;
  name: string;
  code: string;
}
interface AttendanceRecord {
  id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  method: string;
  notes?: string;
  course?: Course;
}
export const AttendanceTracker: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showFullYear, setShowFullYear] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    course_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present' as 'present' | 'absent' | 'late' | 'excused',
    method: 'manual',
    notes: ''
  });
  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchAttendanceRecords();
    }
  }, [user, selectedMonth, showFullYear]);
  const fetchCourses = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('courses').select('id, name, code').eq('user_id', user?.id).order('name');
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchAttendanceRecords = async () => {
    try {
      let startDate, endDate;
      if (showFullYear) {
        startDate = startOfYear(selectedMonth);
        endDate = endOfYear(selectedMonth);
      } else {
        startDate = startOfMonth(selectedMonth);
        endDate = endOfMonth(selectedMonth);
      }
      const {
        data: attendanceData,
        error
      } = await supabase.from('attendance').select(`
          id,
          course_id,
          date,
          status,
          method,
          notes,
          courses!attendance_course_id_fkey (
            id,
            name,
            code
          )
        `).eq('user_id', user?.id).gte('date', format(startDate, 'yyyy-MM-dd')).lte('date', format(endDate, 'yyyy-MM-dd')).order('date', {
        ascending: false
      });
      if (error) throw error;
      const formattedData = (attendanceData || []).map(record => ({
        ...record,
        status: record.status as 'present' | 'absent' | 'late' | 'excused',
        course: record.courses
      }));
      setAttendanceRecords(formattedData);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };
  const markAttendance = async () => {
    if (!formData.course_id || !formData.date) {
      toast({
        title: "Error",
        description: "Please select a course and date",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('attendance').upsert({
        user_id: user?.id,
        course_id: formData.course_id,
        date: formData.date,
        status: formData.status,
        method: formData.method,
        notes: formData.notes || null
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Attendance marked successfully"
      });
      setFormData({
        course_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
        method: 'manual',
        notes: ''
      });
      setShowAddDialog(false);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-3 w-3" />;
      case 'late':
        return <Clock className="h-3 w-3" />;
      case 'absent':
        return <XCircle className="h-3 w-3" />;
      case 'excused':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };
  const getAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;
    const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
    return {
      total,
      present,
      late,
      absent,
      excused,
      attendanceRate
    };
  };
  const stats = getAttendanceStats();
  const getPeriodTitle = () => {
    if (showFullYear) {
      return `Full Year ${selectedMonth.getFullYear()}`;
    }
    return format(selectedMonth, 'MMMM yyyy');
  };
  return <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-gray-600">Late</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
              <div className="text-sm text-gray-600">Excused</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month selector and add button */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Attendance for {getPeriodTitle()}
          </h2>
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} showFullYear={showFullYear} onFullYearChange={setShowFullYear} />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black">
              <Plus className="h-4 w-4" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Course *</label>
                  <Select value={formData.course_id} onValueChange={value => setFormData({
                  ...formData,
                  course_id: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {course.code} - {course.name}
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Date *</label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({
                  ...formData,
                  date: e.target.value
                })} />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={value => setFormData({
                  ...formData,
                  status: value as any
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Method</label>
                  <Select value={formData.method} onValueChange={value => setFormData({
                  ...formData,
                  method: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="id_scan">ID Scan</SelectItem>
                      <SelectItem value="online_checkin">Online Check-in</SelectItem>
                      <SelectItem value="system_sync">System Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea placeholder="Additional notes (optional)" value={formData.notes} onChange={e => setFormData({
                ...formData,
                notes: e.target.value
              })} />
              </div>

              <div className="flex gap-2">
                <Button onClick={markAttendance} disabled={loading}>
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length > 0 ? <div className="space-y-3">
              {attendanceRecords.map(record => <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {record.course ? `${record.course.code} - ${record.course.name}` : 'Unknown Course'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(record.date), 'PPP')}
                    </div>
                    {record.notes && <div className="text-sm text-gray-500 mt-1">
                        {record.notes}
                      </div>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getStatusColor(record.status)}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status}</span>
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {record.method}
                    </div>
                  </div>
                </div>)}
            </div> : <div className="text-center py-8 text-gray-500">
              No attendance records found for this month
            </div>}
        </CardContent>
      </Card>
    </div>;
};