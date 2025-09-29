import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './app/router/AppRouter';


export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <AppRouter />
      </Suspense>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
