import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  // Only protect main site routes
  if (!location.pathname.startsWith('/cadreBack') && !currentUser) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;