import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  BarChart3,
  User
} from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/statistics', icon: BarChart3, label: 'Stats' },
];

interface MobileBottomNavProps {
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className }) => {
  const { isMobile, isNative, hapticFeedback } = useMobile();
  const location = useLocation();

  if (!isMobile) return null;

  const handleNavClick = async () => {
    if (isNative) {
      await hapticFeedback('light');
    }
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-white/95 backdrop-blur-lg border-t border-gray-200",
      "dark:bg-gray-900/95 dark:border-gray-800",
      "mobile-tab-bar",
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-[60px] py-2 px-3 rounded-lg",
                "transition-all duration-200",
                "mobile-touch mobile-button",
                {
                  "text-blue-600 dark:text-blue-400": isActive,
                  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100": !isActive,
                }
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 mb-1",
                  {
                    "scale-110": isActive,
                  }
                )} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                {
                  "font-semibold": isActive,
                }
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

// Hook to get mobile navigation height for main content padding
export const useMobileNavHeight = () => {
  const { isMobile } = useMobile();
  return isMobile ? 'pb-20' : '';
};
