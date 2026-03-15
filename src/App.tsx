import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import AppLayout from "@/components/AppLayout";

// Lazy-loaded route components for code splitting
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Feed = lazy(() => import("@/pages/Feed"));
const Explore = lazy(() => import("@/pages/Explore"));
const CampusInfo = lazy(() => import("@/pages/CampusInfo"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Timetable = lazy(() => import("@/pages/Timetable"));
const Grades = lazy(() => import("@/pages/Grades"));
const Resources = lazy(() => import("@/pages/Resources"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <OfflineBanner />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Feed />} />
                    <Route path="explore" element={<Explore />} />
                    <Route path="campus" element={<CampusInfo />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="timetable" element={<Timetable />} />
                    <Route path="grades" element={<Grades />} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/:userId" element={<UserProfile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
