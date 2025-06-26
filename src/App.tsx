
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { SubscriptionProvider } from "@/lib/subscription";
import { SidebarProvider } from "@/components/ui/sidebar";

// Pages
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Topics from "./pages/Topics";
import Notes from "./pages/Notes";
import History from "./pages/History";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Activity from "./pages/Activity";
import Simulados from "./pages/Simulados";
import EnemQuestions from "./pages/EnemQuestions";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SidebarProvider>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/app" element={<DashboardLayout><Outlet /></DashboardLayout>}>
                      <Route index element={<Index />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="subjects" element={<Subjects />} />
                      <Route path="subjects/:subjectId/topics" element={<Topics />} />
                      <Route path="notes/:subjectId/:topicId" element={<Notes />} />
                      <Route path="history" element={<History />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="goals" element={<Goals />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="progress" element={<Progress />} />
                      <Route path="activity" element={<Activity />} />
                      <Route path="simulados" element={<Simulados />} />
                      <Route path="enem-questions" element={<EnemQuestions />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarProvider>
              </BrowserRouter>
            </SubscriptionProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
