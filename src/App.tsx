import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useRoutes,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/ClerkAuthContext";
import { Layout } from "@/components/layout/Layout";
import { Analytics } from "@vercel/analytics/react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import OnlineClasses from "./pages/OnlineClasses";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import Attendance from "./pages/Attendance";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import routes from "tempo-routes";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <SignedIn>
      <Layout>{children}</Layout>
    </SignedIn>
  );
};

// Check if we're on the auth subdomain in production (not needed for preview)
const isOnAuthSubdomain = () => {
  return window.location.hostname === "accounts.unitracker.store";
};

const AppRoutes = () => {
  // For the tempo routes
  {
    import.meta.env.VITE_TEMPO && useRoutes(routes);
  }

  // If we're on the auth subdomain in production, only show auth routes
  if (isOnAuthSubdomain()) {
    return (
      <Routes>
        <Route
          path="/sign-in"
          element={
            <SignedOut>
              <Auth />
            </SignedOut>
          }
        />
        <Route
          path="/sign-up"
          element={
            <SignedOut>
              <Auth />
            </SignedOut>
          }
        />
        <Route
          path="*"
          element={<Navigate to="/sign-in" replace />}
        />
      </Routes>
    );
  }

  // For all other domains (including Lovable preview), show full app routes
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SignedOut>
              <Landing />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/auth/*"
        element={
          <>
            <SignedOut>
              <Auth />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <OnlineClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy"
        element={<Privacy />}
      />
      <Route
        path="/terms"
        element={<Terms />}
      />
      {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
