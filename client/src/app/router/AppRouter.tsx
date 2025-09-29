import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { lazy } from "react";

// Lazy loaded components
const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage'));
const CreateJobPage = lazy(() => import('../../pages/jobs/CreateJobPage'));
const JobPage = lazy(() => import('../../pages/jobs/JobPage'));
const CandidatesPage = lazy(() => import('../../pages/dashboard/CandidatesPage'));
const ApplicationPage = lazy(() => import('../../pages/applications/ApplicationPage'));

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const routing = (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        } />
        <Route path="/jobs/create" element={
            <ProtectedRoute>
                <CreateJobPage />
            </ProtectedRoute>
        } />
        <Route path="/candidates" element={
            <ProtectedRoute>
                <CandidatesPage />
            </ProtectedRoute>
        } />
        <Route path="/jobs/:shareablelink" element={<JobPage />} />
        <Route path="/jobs/:shareablelink/apply" element={<ApplicationPage />} />
        <Route path="/" element={
            <ProtectedRoute>
                <Navigate to="/dashboard" replace />
            </ProtectedRoute>
        } />    
    </Routes>
)

export const AppRouter = () => {
    return (
        <BrowserRouter>
            {routing}
        </BrowserRouter>
    );
}