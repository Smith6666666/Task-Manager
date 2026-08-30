import { NavLink, useNavigate } from 'react-router';
import LogoSm from '../assets/logo-sm.png';
import './Header.css';

export function Header() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const profileImage = user?.profile ? `/uploads/users/${user.profile}` : '/uploads/users/user-default.png';

  function logout() {
    const confirm = window.confirm('Do you want to log out?');
    if (!confirm) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="header-container">
      <NavLink to="/dashboard">
        <img className="logo" src={LogoSm} />
      </NavLink>

      <div className="profile-container">
        <NavLink className="image-container" to="/setting">
          <img src={profileImage} />
        </NavLink>
        <p>Welcome{user ? ',' : ''} {user?.name}</p>
      </div>

      <button className="logout-btn" onClick={logout}>
        <i className="bi bi-door-closed"></i>
        <p>Log out</p>
      </button>
    </div>
  );
};