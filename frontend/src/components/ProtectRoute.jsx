import { Navigate, Outlet, useLocation } from 'react-router';

export function ProtectRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  };

  return <Outlet />;
};

export function ProtectTwoFactorEnableRoute() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/" replace />;
  };

  if (user.twoFactorEnabled) {
    return <Navigate to="/setting" replace state={{ message: 'Two-factor authentication is already set up.' }} />;
  };

  return <Outlet />;
};

export function ProtectTwoFactorDisableRoute() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/" replace />;
  };

  if (!user.twoFactorEnabled) {
    return <Navigate to="/setting" replace state={{ message: 'You have not set up two-factor authentication yet.' }} />;
  };

  return <Outlet />;
};

export function ProtectTwoFactorLoginRoute() {
  const location = useLocation();
  if (!location.state?.twoFactorToken) {
    return <Navigate to='/' replace />;
  };

  return <Outlet />;
};