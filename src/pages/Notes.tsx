import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Book, Edit, Trash2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useUserTier } from '@/hooks/useUserTier';
import { LimitDialog } from '@/components/usage/LimitDialog';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';
import { CreateNoteButton } from '@/components/notes/CreateNoteButton';

export const Notes: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    refetch: refetchTier
  } = useUserTier();
  const {
    handleDatabaseError,
    showLimitDialog,
    setShowLimitDialog,
    limitType
  } = useUsageLimits();
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('course');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(courseIdParam || 'all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    course: courseIdParam || ''
  });
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      console.log('Fetching notes for user:', user.id);
      const {
        data,
        error
      } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      console.log('Notes fetched:', data);
      setNotes(data || []);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);
  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching courses for user:', user.id);
      const {
        data,
        error
      } = await supabase.from('courses').select('id, name').eq('user_id', user.id);
      if (error) throw error;
      console.log('Courses fetched:', data);
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  // Load data once when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchNotes();
      fetchCourses();
    }
  }, [user?.id]);

  // Update course filter when courseIdParam changes
  useEffect(() => {
    if (courseIdParam && courses.length > 0) {
      setSelectedCourseFilter(courseIdParam);
    }
  }, [courseIdParam, courses.length]);
  const handleAddNote = async () => {
    if (!user) return;
    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required.",
        variant: "destructive"
      });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: user.id,
          title: newNote.title,
          content: newNote.content,
          course: newNote.course || null
        }])
        .select();

      if (error) {
        const wasLimitError = handleDatabaseError(error, 'notes');
        if (!wasLimitError) {
          throw error;
        }
        return;
      }

      setNotes([data[0], ...notes]);
      setNewNote({
        title: '',
        content: '',
        course: courseIdParam || ''
      });
      toast({
        title: "Success",
        description: "Note added successfully"
      });
      refetchTier();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleUpdateNote = async () => {
    if (!user || !currentNote) return;
    if (!currentNote.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('notes').update({
        title: currentNote.title,
        content: currentNote.content,
        course: currentNote.course || null,
        updated_at: new Date().toISOString()
      }).eq('id', currentNote.id).eq('user_id', user.id);
      if (error) throw error;
      setNotes(notes.map(note => note.id === currentNote.id ? {
        ...currentNote,
        updated_at: new Date().toISOString()
      } : note));
      toast({
        title: "Success",
        description: "Note updated successfully"
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleDeleteNote = async () => {
    if (!user || !currentNote) return;
    try {
      const {
        error
      } = await supabase.from('notes').delete().eq('id', currentNote.id).eq('user_id', user.id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== currentNote.id));
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
      refetchTier();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive"
      });
    }
  };
  const openEditDialog = (note: any) => {
    setCurrentNote({
      ...note
    });
    setIsEditDialogOpen(true);
  };
  const openDeleteDialog = (note: any) => {
    setCurrentNote(note);
    setIsDeleteDialogOpen(true);
  };
  const openViewDialog = (note: any) => {
    setCurrentNote(note);
    setIsViewDialogOpen(true);
  };
  const getCourseName = (courseId: string | null) => {
    if (!courseId || courseId === 'none') return 'No Course';
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };
  const filteredNotes = selectedCourseFilter === 'all' ? notes : notes.filter(note => note.course === selectedCourseFilter);
  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>;
  }
  return <>
      <div className="space-y-6">
        <PageHeader 
          icon={<FileText className="h-6 w-6 text-blue-600" />} 
          title="Notes" 
          subtitle="Manage your course notes and study materials." 
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <p className="text-gray-600 mt-1">Manage your course notes and study materials.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateNoteButton
              onOpenDialog={() => {
                setNewNote({
                  title: '',
                  content: '',
                  course: selectedCourseFilter !== 'all' ? selectedCourseFilter : ''
                });
                setIsAddDialogOpen(true);
              }}
              onCreateNote={() => {
                fetchNotes();
                refetchTier();
              }}
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="mx-auto my-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Book className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">No notes yet</h2>
              <p className="mt-2 text-gray-600">
                {selectedCourseFilter === 'all' ? "Add your first note to start organizing your study materials." : "Add your first note for this course to start organizing your study materials."}
              </p>
              
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => <Card key={note.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="cursor-pointer" onClick={() => openViewDialog(note)}>
                  <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <FileText size={14} className="mr-1" />
                    {getCourseName(note.course)}
                  </CardDescription>
                </CardHeader>
                <CardContent onClick={() => openViewDialog(note)} className="cursor-pointer">
                  <div className="h-24 overflow-hidden text-gray-600 text-sm">
                    {note.content ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') : 'No content'}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="text-xs text-gray-500">
                    {format(new Date(note.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(note)}>
                      <Edit size={16} className="mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(note)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} className="mr-1" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>)}
          </div>}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
            <DialogDescription>
              Create a new study note for your courses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input placeholder="Note Title" value={newNote.title} onChange={e => setNewNote({
              ...newNote,
              title: e.target.value
            })} className="text-lg font-medium" />
            </div>
            <div>
              <Select value={newNote.course} onValueChange={value => setNewNote({
              ...newNote,
              course: value === 'none' ? '' : value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Course</SelectItem>
                  {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Textarea placeholder="Write your note content here..." value={newNote.content} onChange={e => setNewNote({
              ...newNote,
              content: e.target.value
            })} className="min-h-[200px]" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update your study note.
            </DialogDescription>
          </DialogHeader>
          {currentNote && <div className="space-y-4">
              <div>
                <Input placeholder="Note Title" value={currentNote.title} onChange={e => setCurrentNote({
              ...currentNote,
              title: e.target.value
            })} className="text-lg font-medium" />
              </div>
              <div>
                <Select value={currentNote.course || 'none'} onValueChange={value => setCurrentNote({
              ...currentNote,
              course: value === 'none' ? null : value
            })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course</SelectItem>
                    {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Textarea placeholder="Write your note content here..." value={currentNote.content || ''} onChange={e => setCurrentNote({
              ...currentNote,
              content: e.target.value
            })} className="min-h-[200px]" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateNote}>
                  Update Note
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          {currentNote && <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{currentNote.title}</DialogTitle>
                <DialogDescription>
                  {getCourseName(currentNote.course)} • {format(new Date(currentNote.created_at), 'PPP')}
                </DialogDescription>
              </DialogHeader>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {currentNote.content || 'No content'}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => openEditDialog(currentNote)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LimitDialog open={showLimitDialog} onOpenChange={setShowLimitDialog} limitType={limitType} />
    </>;
};

export default Notes;
