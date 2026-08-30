import { FormNav } from '../../components/FormNav';
import { NavLink } from 'react-router';
import 'animate.css';
import './SignedupPage.css';

export function SignedupPage() {
  return (
    <div className="signedup-page">
      <title>🎉 Successfully signed up</title>

      <FormNav />

      <div className="row-2 animate__animated animate__slideInRight">
        <p>
          <i className="bi bi-patch-check"></i> &nbsp;Thanks for your account
          registration
        </p>
        <NavLink className="click-btn" to="/">Click to log in</NavLink>
      </div>
    </div>
  );
};