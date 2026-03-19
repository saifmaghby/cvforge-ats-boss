import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import MyCVs from "./pages/MyCVs.tsx";
import CVBuilder from "./pages/CVBuilder.tsx";
import ATSChecker from "./pages/ATSChecker.tsx";
import Settings from "./pages/Settings.tsx";
import JobTracker from "./pages/JobTracker.tsx";
import CoverLetterGenerator from "./pages/CoverLetterGenerator.tsx";
import MyPortfolios from "./pages/MyPortfolios.tsx";
import PortfolioBuilder from "./pages/PortfolioBuilder.tsx";
import InterviewPrep from "./pages/InterviewPrep.tsx";
import LinkedInOptimizer from "./pages/LinkedInOptimizer.tsx";
import JobMatch from "./pages/JobMatch.tsx";
import FollowUpEmail from "./pages/FollowUpEmail.tsx";
import JobSearch from "./pages/JobSearch.tsx";
import ArabicCVBuilder from "./pages/ArabicCVBuilder.tsx";
import MockInterview from "./pages/MockInterview.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-cvs"
              element={
                <ProtectedRoute>
                  <MyCVs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <ProtectedRoute>
                  <CVBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ats-checker"
              element={
                <ProtectedRoute>
                  <ATSChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-tracker"
              element={
                <ProtectedRoute>
                  <JobTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cover-letter"
              element={
                <ProtectedRoute>
                  <CoverLetterGenerator />
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
              path="/portfolios"
              element={
                <ProtectedRoute>
                  <MyPortfolios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio/builder"
              element={
                <ProtectedRoute>
                  <PortfolioBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-prep"
              element={
                <ProtectedRoute>
                  <InterviewPrep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/linkedin-optimizer"
              element={
                <ProtectedRoute>
                  <LinkedInOptimizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-match"
              element={
                <ProtectedRoute>
                  <JobMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-up-email"
              element={
                <ProtectedRoute>
                  <FollowUpEmail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-search"
              element={
                <ProtectedRoute>
                  <JobSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/arabic-cv"
              element={
                <ProtectedRoute>
                  <ArabicCVBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ProtectedRoute>
                  <MockInterview />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
