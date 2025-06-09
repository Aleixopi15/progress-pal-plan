
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { SubscriptionProvider } from "@/lib/subscription";
import { ThemeProvider } from "@/hooks/useTheme";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Subjects from "./pages/Subjects";
import Topics from "./pages/Topics";
import Notes from "./pages/Notes";
import Activity from "./pages/Activity";
import History from "./pages/History";
import Simulados from "./pages/Simulados";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="studytrack-theme">
      <TooltipProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                } />
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Index />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/calendar" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Calendar />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/progress" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Progress />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/goals" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Goals />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/resources" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Resources />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/profile" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/subjects" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Subjects />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/topics/:subjectId" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Topics />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/notes/:subjectId/:topicId" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Notes />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/activity" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Activity />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/history" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <History />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="/simulados" element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Simulados />
                    </DashboardLayout>
                  </RequireAuth>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
