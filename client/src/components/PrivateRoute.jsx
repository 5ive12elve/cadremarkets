import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const isBackOfficeRoute = location.pathname.startsWith('/cadreBack');
  const hasBackOfficeAccess = localStorage.getItem('cadreAccessGranted') === 'true';

  // For back office routes
  if (isBackOfficeRoute) {
    return hasBackOfficeAccess ? (
      <Outlet />
    ) : (
      <Navigate to="/cadreBack" state={{ from: location.pathname }} replace />
    );
  }

  // For main site routes
  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
  );
}
