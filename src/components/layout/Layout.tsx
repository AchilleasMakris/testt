import React from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface LayoutProps {
  children: React.ReactNode;
}
function useIsSidebarMobile() {
  const [isSidebarMobile, setIsSidebarMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsSidebarMobile(window.innerWidth < 1280);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isSidebarMobile;
}
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const isSidebarMobile = useIsSidebarMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const toggleSidebar = React.useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen]);
  const closeSidebar = React.useCallback(() => setSidebarOpen(false), []);

  return <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarMobile && sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={closeSidebar} />}
      
      {/* Desktop Sidebar */}
      {!isSidebarMobile && <div className="relative">
          <Sidebar />
        </div>}
      
      {/* Mobile Sidebar */}
      {isSidebarMobile && <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onNavigate={closeSidebar} />
        </div>}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {isSidebarMobile && <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="Toggle sidebar" className="p-2 font-normal text-lg">
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="w-10" />
          </header>}
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>;
};