import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    let active = true;

    fetch('/api/auth/me', { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error('Unauthenticated');
        return response.json();
      })
      .then((data) => {
        if (active) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setState({ loading: false, authenticated: true });
        }
      })
      .catch(() => {
        if (active) setState({ loading: false, authenticated: false });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) return null;
  if (!state.authenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

export default ProtectedRoute;
