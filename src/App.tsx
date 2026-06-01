// force-rebuild-v3
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import AppLayout from "@/components/AppLayout";
import RouteSEO from "@/components/RouteSEO";
import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";
import Feed from "@/pages/Feed";

const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
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
const LogViewer = lazy(() => import("@/pages/LogViewer"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const warmRouteModules = [
  () => import("@/pages/Explore"),
  () => import("@/pages/CampusInfo"),
  () => import("@/pages/Calendar"),
  () => import("@/pages/Timetable"),
  () => import("@/pages/Grades"),
  () => import("@/pages/Resources"),
  () => import("@/pages/Notifications"),
  () => import("@/pages/Profile"),
];

const RouteWarmup = () => {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const preloadRoutes = () => {
      warmRouteModules.forEach((loadModule) => {
        void loadModule();
      });
    };

    const windowWithIdleCallback = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (windowWithIdleCallback.requestIdleCallback) {
      const idleId = windowWithIdleCallback.requestIdleCallback(preloadRoutes, { timeout: 1200 });
      return () => windowWithIdleCallback.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(preloadRoutes, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
};

const LogFocusNavigationBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleViewLogEntry = (event: Event) => {
      const focusId = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!focusId) return;
      navigate(`/logs?focus=${encodeURIComponent(focusId)}`);
    };

    window.addEventListener('infohub:view-log-entry', handleViewLogEntry);
    return () => window.removeEventListener('infohub:view-log-entry', handleViewLogEntry);
  }, [navigate]);

  return null;
};

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
              <LogFocusNavigationBridge />
              <RouteWarmup />
              <RouteSEO />
              <Suspense fallback={<PageLoadingSkeleton />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<ErrorBoundary><Feed /></ErrorBoundary>} />
                    <Route path="explore" element={<Explore />} />
                    <Route path="campus" element={<CampusInfo />} />
                    <Route path="calendar" element={<ErrorBoundary><Calendar /></ErrorBoundary>} />
                    <Route path="timetable" element={<Timetable />} />
                    <Route path="grades" element={<ErrorBoundary><Grades /></ErrorBoundary>} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
                    <Route path="profile/:userId" element={<ErrorBoundary><UserProfile /></ErrorBoundary>} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="logs" element={<LogViewer />} />
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
