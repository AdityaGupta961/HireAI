import { Outlet, useNavigation } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function RootLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting';
  return (
    <>
      {isLoading && <LoadingSpinner />}
      <Outlet />
    </>
  );
}
