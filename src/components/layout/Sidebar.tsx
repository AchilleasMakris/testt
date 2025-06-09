import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { UserButton } from '@clerk/clerk-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar, 
  Activity, 
  GraduationCap, 
  ListTodo, 
  FileText, 
  Cog,
  Grid2X2,
  X,
  UserCheck,
  Book
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Grid2X2, label: 'Dashboard' },
  { to: '/courses', icon: GraduationCap, label: 'Courses' },
  { to: '/classes', icon: Book, label: 'Classes' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/attendance', icon: UserCheck, label: 'Attendance' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/statistics', icon: Activity, label: 'Statistics' },
  { to: '/settings', icon: Cog, label: 'Settings' },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className={`${isMobile ? 'w-80' : 'w-64'} bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 text-gray-800 h-screen flex flex-col border-r border-blue-200 min-h-0`}>
      <div className={`p-4 sm:p-6 border-b border-blue-300/50 flex-shrink-0 ${isMobile ? 'flex items-center justify-between' : ''}`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1a202c' }}>
            UniTracker
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: '#1a202c' }}>Academic Management</p>
        </div>
        {isMobile && onNavigate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigate}
            className="text-blue-800 hover:text-blue-900 hover:bg-blue-200/50 p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-300/60 text-blue-900 shadow-lg border border-blue-400/70 font-semibold'
                    : 'hover:bg-blue-200/50 hover:text-blue-900 font-medium'
                }`
              }
              style={{ color: '#1a202c' }}
            >
              <IconComponent size={isMobile ? 18 : 20} style={{ color: '#1a202c' }} />
              <span className="text-sm sm:text-base">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-3 sm:p-4 border-t border-blue-300/50 flex-shrink-0">
        <div className="mb-3">
          <p className="text-xs sm:text-sm font-medium" style={{ color: '#1a202c' }}>Signed in as</p>
          <p className="font-semibold text-xs sm:text-sm leading-tight break-words" style={{ color: '#1a202c' }}>{user?.email || 'User'}</p>
        </div>
        <div className="flex items-center justify-between">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              }
            }}
          />
          <Button
            onClick={signOut}
            variant="outline"
            className="bg-transparent border-blue-500 hover:bg-blue-200/50 hover:border-blue-600 text-xs sm:text-sm py-2 ml-3 font-medium"
            style={{ color: '#1a202c' }}
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
