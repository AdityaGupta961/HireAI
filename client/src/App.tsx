import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ApplicationPage from './pages/applications/ApplicationPage';
import RootLayout from './RootLayout';
import CandidatesPage from './pages/dashboard/CandidatesPage';

// Lazy loaded components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const CreateJobPage = lazy(() => import('./pages/jobs/CreateJobPage'));
const JobPage = lazy(() => import('./pages/jobs/JobPage'));

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

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/jobs/create',
        element: (
          <ProtectedRoute>
            <CreateJobPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/candidates',
        element: (
          <ProtectedRoute>
            <CandidatesPage />
          </ProtectedRoute>
        ),
      },
      { path: '/jobs/:shareablelink', element: <JobPage /> },
      { path: '/jobs/:shareablelink/apply', element: <ApplicationPage /> },
      { path: '/', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);


export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
