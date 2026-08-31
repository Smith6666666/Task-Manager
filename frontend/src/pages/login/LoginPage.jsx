import api from '../../utils/axios';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import './LoginPage.css';

export function LoginPage({ formError, setFormError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password
      });

      if (response.data.status === '2fa_required') {
        const twoFactorToken = response.data.data.twoFactorToken;

        setFormError('');

        navigate('/verify-login', {
          state: { twoFactorToken }
        });

        return;
      };

      const user = response.data.data.user;
      const token = response.data.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setFormError('');
      navigate('/dashboard');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-page">
      <title>Login to your account</title>

      <FormNav />

      <div className="form-container">
        <form onSubmit={login}>
          <h2>Login</h2>
          <div>
            <label>Email</label>
            <input type="text" value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <p className="err-message">{formError}</p>
          <button type="submit">Login</button>
        </form>

        <NavLink to="/signup" className="acc-create">Create an account</NavLink>
      </div>
    </div>
  );
};