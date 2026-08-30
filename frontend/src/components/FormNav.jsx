import { NavLink, useLocation } from 'react-router';
import LogoSm from '../assets/logo-sm.png';
import './FormNav.css';

export function FormNav() {
  const location = useLocation();

  return (
    <nav>
      <img src={LogoSm} />

      {location.pathname === '/' && (
        <NavLink to="/forgot-password" className="forgot-password">
          I forgot my password
        </NavLink>
      )}
    </nav>
  );
};